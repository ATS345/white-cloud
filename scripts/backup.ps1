# 数据库备份脚本 - Windows PowerShell
# 云幕游戏商店平台 v1.0.0

param(
    [string]$BackupType = "full",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectRoot "backup"
$DbPath = Join-Path $ProjectRoot "backend\prisma\dev.db"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $BackupDir "backup.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

try {
    Write-Log "========== 开始备份 =========="
    Write-Log "备份类型: $BackupType"
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "创建备份目录: $BackupDir"
    }
    
    if (-not (Test-Path $DbPath)) {
        throw "数据库文件不存在: $DbPath"
    }
    
    $BackupFile = Join-Path $BackupDir "dev_$Date.db"
    
    Write-Log "备份源: $DbPath"
    Write-Log "备份目标: $BackupFile"
    
    Copy-Item $DbPath $BackupFile -Force
    
    if (Test-Path $BackupFile) {
        $FileSize = (Get-Item $BackupFile).Length / 1KB
        Write-Log "备份成功! 文件大小: $([math]::Round($FileSize, 2)) KB"
    } else {
        throw "备份文件创建失败"
    }
    
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $OldBackups = Get-ChildItem $BackupDir -Filter "*.db" | 
        Where-Object { $_.LastWriteTime -lt $CutoffDate }
    
    foreach ($Backup in $OldBackups) {
        Remove-Item $Backup.FullName -Force
        Write-Log "删除旧备份: $($Backup.Name)"
    }
    
    $CurrentBackups = Get-ChildItem $BackupDir -Filter "*.db"
    Write-Log "当前备份数量: $($CurrentBackups.Count)"
    
    Write-Log "========== 备份完成 =========="
    
} catch {
    Write-Log "备份失败: $_" -Level "ERROR"
    exit 1
}
