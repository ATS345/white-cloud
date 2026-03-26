# Yunmu Game Store Platform - Automatic Backup Script
# Purpose: Automatically backup database and important configuration files

param(
    [switch]$Full,
    [switch]$Incremental,
    [switch]$Restore,
    [string]$RestoreFile,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Join-Path $ScriptDir ".."
$BackupDir = Join-Path $ProjectRoot "backups"
$LogDir = Join-Path $ProjectRoot "logs"
$BackupLog = Join-Path $LogDir "backup.log"

foreach ($Dir in ($BackupDir, $LogDir)) {
    if (!(Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $BackupLog -Value $LogMessage
}

function Get-BackupFileName {
    param([string]$Type)
    $Date = Get-Date -Format "yyyyMMdd_HHmmss"
    return "yunmu_backup_${Type}_${Date}.zip"
}

function Compress-Backup {
    param([string]$SourcePath, [string]$OutputFile)
    
    try {
        Write-Log "Compressing backup: $SourcePath -> $OutputFile" "INFO"
        
        if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
            Compress-Archive -Path $SourcePath -DestinationPath $OutputFile -Force
        } else {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::CreateFromDirectory($SourcePath, $OutputFile)
        }
        
        $Size = (Get-Item $OutputFile).Length / 1MB
        Write-Log "Backup compression complete: $([math]::Round($Size, 2)) MB" "INFO"
        return $true
    } catch {
        Write-Log "Backup compression failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Backup-Full {
    Write-Log "========================================" "INFO"
    Write-Log "Starting full backup" "INFO"
    Write-Log "========================================" "INFO"
    
    $TempDir = Join-Path $env:TEMP "yunmu_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    try {
        $Success = $true
        
        $DbPath = Join-Path $ProjectRoot "backend\prisma\dev.db"
        if (Test-Path $DbPath) {
            $DbBackupDir = Join-Path $TempDir "database"
            New-Item -ItemType Directory -Path $DbBackupDir -Force | Out-Null
            Copy-Item -Path $DbPath -Destination $DbBackupDir -Force
            Write-Log "Database backup complete" "INFO"
        }
        
        $ConfigBackupDir = Join-Path $TempDir "config"
        New-Item -ItemType Directory -Path $ConfigBackupDir -Force | Out-Null
        
        $ConfigFiles = @(
            ".env",
            "backend\.env.production"
        )
        
        foreach ($File in $ConfigFiles) {
            $FilePath = Join-Path $ProjectRoot $File
            if (Test-Path $FilePath) {
                Copy-Item -Path $FilePath -Destination $ConfigBackupDir -Force
                Write-Log "Config file backup complete: $File" "INFO"
            }
        }
        
        $UploadsPath = Join-Path $ProjectRoot "backend\uploads"
        if (Test-Path $UploadsPath) {
            $UploadsBackupDir = Join-Path $TempDir "uploads"
            Copy-Item -Path $UploadsPath -Destination $UploadsBackupDir -Recurse -Force
            Write-Log "Uploads backup complete" "INFO"
        }
        
        $BackupFile = Join-Path $BackupDir (Get-BackupFileName -Type "full")
        if (Compress-Backup -SourcePath $TempDir -OutputFile $BackupFile) {
            Write-Log "Full backup successful: $BackupFile" "INFO"
            return $BackupFile
        } else {
            $Success = $false
        }
        
    } finally {
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    if (-not $Success) {
        throw "Full backup failed"
    }
}

function Backup-Incremental {
    Write-Log "========================================" "INFO"
    Write-Log "Starting incremental backup" "INFO"
    Write-Log "========================================" "INFO"
    
    $TempDir = Join-Path $env:TEMP "yunmu_backup_inc_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    try {
        $DbPath = Join-Path $ProjectRoot "backend\prisma\dev.db"
        if (Test-Path $DbPath) {
            $DbBackupDir = Join-Path $TempDir "database"
            New-Item -ItemType Directory -Path $DbBackupDir -Force | Out-Null
            Copy-Item -Path $DbPath -Destination $DbBackupDir -Force
            Write-Log "Database backup complete" "INFO"
        }
        
        $BackupFile = Join-Path $BackupDir (Get-BackupFileName -Type "incremental")
        if (Compress-Backup -SourcePath $TempDir -OutputFile $BackupFile) {
            Write-Log "Incremental backup successful: $BackupFile" "INFO"
            return $BackupFile
        }
        
    } finally {
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Restore-Backup {
    param([string]$BackupFile)
    
    if ([string]::IsNullOrEmpty($BackupFile)) {
        $Backups = Get-ChildItem -Path $BackupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending
        if ($Backups.Count -eq 0) {
            throw "No backup files found"
        }
        $BackupFile = $Backups[0].FullName
    }
    
    if (!(Test-Path $BackupFile)) {
        throw "Backup file not found: $BackupFile"
    }
    
    Write-Log "========================================" "INFO"
    Write-Log "Starting backup restore: $BackupFile" "INFO"
    Write-Log "========================================" "INFO"
    
    $TempDir = Join-Path $env:TEMP "yunmu_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    try {
        Write-Log "Extracting backup file..." "INFO"
        Expand-Archive -Path $BackupFile -DestinationPath $TempDir -Force
        
        $DbBackupPath = Join-Path $TempDir "database\dev.db"
        if (Test-Path $DbBackupPath) {
            $DbTargetPath = Join-Path $ProjectRoot "backend\prisma\dev.db"
            Copy-Item -Path $DbBackupPath -Destination $DbTargetPath -Force
            Write-Log "Database restore complete" "INFO"
        }
        
        $ConfigBackupDir = Join-Path $TempDir "config"
        if (Test-Path $ConfigBackupDir) {
            Get-ChildItem -Path $ConfigBackupDir | ForEach-Object {
                $TargetPath = Join-Path $ProjectRoot $_.Name
                Copy-Item -Path $_.FullName -Destination $TargetPath -Force
                Write-Log "Config file restore complete: $($_.Name)" "INFO"
            }
        }
        
        Write-Log "Backup restore successful!" "INFO"
        
    } finally {
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Cleanup-OldBackups {
    $RetentionDays = 30
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    
    Write-Log "Cleaning up backups older than $RetentionDays days..." "INFO"
    
    $OldBackups = Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $CutoffDate }
    
    foreach ($Backup in $OldBackups) {
        Remove-Item -Path $Backup.FullName -Force
        Write-Log "Deleted old backup: $($Backup.Name)" "INFO"
    }
    
    Write-Log "Cleanup complete, deleted $($OldBackups.Count) old backups" "INFO"
}

Write-Log "========================================" "INFO"
Write-Log "Yunmu Game Store Platform - Backup Script" "INFO"
Write-Log "========================================" "INFO"

try {
    if ($Restore) {
        Restore-Backup -BackupFile $RestoreFile
    } elseif ($Test) {
        Write-Log "Test mode: creating test backup..." "INFO"
        $TestBackup = Backup-Full
        Write-Log "Test backup created: $TestBackup" "INFO"
    } elseif ($Incremental) {
        Backup-Incremental
        Cleanup-OldBackups
    } else {
        Backup-Full
        Cleanup-OldBackups
    }
    
    Write-Log "`nOperation completed successfully!" "INFO"
    exit 0
    
} catch {
    Write-Log "Operation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}
