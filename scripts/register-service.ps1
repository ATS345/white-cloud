# Register Docker Monitor as Windows Service
# This script creates a Windows service that monitors Docker Desktop and auto-deploys monitoring stack

param(
    [string]$ServiceName = "DockerMonitorService",
    [string]$DisplayName = "Docker Monitor Service",
    [string]$Description = "Monitors Docker Desktop status and auto-deploys monitoring stack",
    [string]$ScriptPath = "$PSScriptRoot\docker-monitor.ps1"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Log "This script must be run as Administrator" "ERROR"
    Write-Host "Please right-click and 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if NSSM (Non-Sucking Service Manager) is available
$nssmPath = "C:\Program Files\nssm\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Log "NSSM not found. Installing NSSM..." "WARNING"
    
    # Download and install NSSM
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $nssmZip = "$env:TEMP\nssm.zip"
    $nssmDir = "$env:TEMP\nssm"
    
    try {
        # Download
        Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip -UseBasicParsing
        Write-Log "Downloaded NSSM" "INFO"
        
        # Extract
        Expand-Archive -Path $nssmZip -DestinationPath $nssmDir -Force
        Write-Log "Extracted NSSM" "INFO"
        
        # Find nssm.exe
        $nssmExe = Get-ChildItem -Path $nssmDir -Filter "nssm.exe" -Recurse | Select-Object -First 1
        
        if ($nssmExe) {
            # Copy to Program Files
            $targetDir = "C:\Program Files\nssm"
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            Copy-Item -Path $nssmExe.FullName -Destination $targetDir -Force
            $nssmPath = Join-Path $targetDir "nssm.exe"
            Write-Log "Installed NSSM to $nssmPath" "SUCCESS"
        } else {
            throw "NSSM executable not found in archive"
        }
    } catch {
        Write-Log "Failed to install NSSM: $($_.Exception.Message)" "ERROR"
        Write-Host "Please install NSSM manually from https://nssm.cc/download" -ForegroundColor Yellow
        exit 1
    }
}

# Check if service already exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Log "Service '$ServiceName' already exists. Updating..." "WARNING"
    
    # Stop the service
    if ($existingService.Status -eq "Running") {
        Stop-Service -Name $ServiceName -Force
        Write-Log "Stopped existing service" "INFO"
    }
    
    # Remove the service
    & $nssmPath remove $ServiceName confirm
    Write-Log "Removed existing service" "INFO"
}

# Create the service
Write-Log "Creating service '$ServiceName'..." "INFO"

# PowerShell command to run
$psCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" -Action monitor"

# Create service using NSSM
& $nssmPath install $ServiceName "powershell.exe" "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" -Action monitor"
& $nssmPath set $ServiceName DisplayName $DisplayName
& $nssmPath set $ServiceName Description $Description
& $nssmPath set $ServiceName Start SERVICE_AUTO_START
& $nssmPath set $ServiceName AppStdout (Join-Path $PSScriptRoot "..\logs\docker-monitor-stdout.log")
& $nssmPath set $ServiceName AppStderr (Join-Path $PSScriptRoot "..\logs\docker-monitor-stderr.log")
& $nssmPath set $ServiceName AppRotateFiles 1
& $nssmPath set $ServiceName AppRotateBytes 1048576

Write-Log "Service created successfully!" "SUCCESS"

# Start the service
Write-Log "Starting service..." "INFO"
Start-Service -Name $ServiceName

# Verify
$service = Get-Service -Name $ServiceName
if ($service.Status -eq "Running") {
    Write-Log "Service is running!" "SUCCESS"
} else {
    Write-Log "Service failed to start. Status: $($service.Status)" "ERROR"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Management Commands" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Start:   Start-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Stop:    Stop-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Status:  Get-Service -Name $ServiceName" -ForegroundColor Gray
Write-Host "  Remove:  & `"$nssmPath`" remove $ServiceName" -ForegroundColor Gray
Write-Host ""
