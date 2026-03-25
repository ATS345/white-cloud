# Docker Desktop Status Monitor Service
# Runs as a background service to monitor Docker Desktop status

param(
    [string]$Action = "monitor",
    [int]$CheckInterval = 30,
    [string]$StatusFile = "$PSScriptRoot\..\logs\docker-status.json",
    [string]$DeployScript = "$PSScriptRoot\auto-deploy-monitoring.ps1"
)

$ErrorActionPreference = "Continue"

function Write-StatusLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    $logDir = Split-Path $StatusFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path (Join-Path $logDir "docker-monitor.log") -Value $logEntry
    
    switch ($Level) {
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        default { Write-Host $logEntry -ForegroundColor Cyan }
    }
}

function Get-DockerStatus {
    <#
    .SYNOPSIS
    Gets comprehensive Docker Desktop status
    #>
    
    $status = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        DockerInstalled = $false
        DockerRunning = $false
        DockerReady = $false
        ComposeAvailable = $false
        ContainerRuntime = $false
        RegistryAccessible = $false
        Version = $null
        Containers = 0
        Images = 0
        Error = $null
    }
    
    # Check Docker installation
    try {
        $versionOutput = docker --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.DockerInstalled = $true
            if ($versionOutput -match "Docker version ([\d.]+)") {
                $status.Version = $matches[1]
            }
        }
    } catch {
        $status.Error = "Docker not installed"
        return $status
    }
    
    # Check Docker daemon
    try {
        $info = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.DockerRunning = $true
        }
    } catch {
        $status.Error = "Docker daemon not running"
        return $status
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.ComposeAvailable = $true
        }
    } catch {
        $status.Error = "Docker Compose not available"
    }
    
    # Check container runtime
    try {
        $containers = docker ps -q 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.ContainerRuntime = $true
            $status.Containers = ($containers | Where-Object { $_ -ne "" }).Count
        }
    } catch {
        $status.Error = "Container runtime error"
    }
    
    # Check registry access
    try {
        $null = docker pull hello-world 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.RegistryAccessible = $true
        }
    } catch {
        $status.Error = "Registry not accessible"
    }
    
    # Count images
    try {
        $images = docker images -q 2>&1
        if ($LASTEXITCODE -eq 0) {
            $status.Images = ($images | Where-Object { $_ -ne "" }).Count
        }
    } catch {}
    
    # Determine overall readiness
    $status.DockerReady = $status.DockerInstalled -and 
                          $status.DockerRunning -and 
                          $status.ComposeAvailable -and 
                          $status.ContainerRuntime
    
    return $status
}

function Save-Status {
    param([hashtable]$Status)
    
    $statusDir = Split-Path $StatusFile -Parent
    if (-not (Test-Path $statusDir)) {
        New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
    }
    
    $Status | ConvertTo-Json -Depth 3 | Set-Content -Path $StatusFile
}

function Test-DeployTrigger {
    param([hashtable]$CurrentStatus, [hashtable]$PreviousStatus)
    
    # Trigger deployment if:
    # 1. Docker just became ready (was not ready before)
    # 2. Monitoring stack is not deployed
    
    if (-not $PreviousStatus) {
        if ($CurrentStatus.DockerReady) {
            Write-StatusLog "Docker Desktop became ready, triggering deployment..." "INFO"
            return $true
        }
        return $false
    }
    
    # Check if Docker transitioned from not ready to ready
    if (-not $PreviousStatus.DockerReady -and $CurrentStatus.DockerReady) {
        Write-StatusLog "Docker Desktop transitioned to ready state" "SUCCESS"
        return $true
    }
    
    return $false
}

function Invoke-Deployment {
    Write-StatusLog "Starting monitoring stack deployment..." "INFO"
    
    try {
        $result = & $DeployScript
        Write-StatusLog "Deployment completed: $result" "SUCCESS"
        return $true
    } catch {
        Write-StatusLog "Deployment failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Start-Monitoring {
    Write-StatusLog "Starting Docker Desktop monitoring service..." "INFO"
    Write-StatusLog "Check interval: ${CheckInterval}s" "INFO"
    Write-StatusLog "Status file: $StatusFile" "INFO"
    
    $previousStatus = $null
    $deployed = $false
    
    while ($true) {
        $currentStatus = Get-DockerStatus
        Save-Status -Status $currentStatus
        
        # Log status
        if ($currentStatus.DockerReady) {
            Write-StatusLog "Docker Ready - Containers: $($currentStatus.Containers), Images: $($currentStatus.Images)" "SUCCESS"
        } else {
            Write-StatusLog "Docker Not Ready - $($currentStatus.Error)" "WARNING"
        }
        
        # Check deployment trigger
        if (-not $deployed -and (Test-DeployTrigger -CurrentStatus $currentStatus -PreviousStatus $previousStatus)) {
            $deployed = Invoke-Deployment
        }
        
        $previousStatus = $currentStatus
        Start-Sleep -Seconds $CheckInterval
    }
}

function Get-CurrentStatus {
    $status = Get-DockerStatus
    Save-Status -Status $status
    
    Write-Host ""
    Write-Host "Docker Desktop Status:" -ForegroundColor Cyan
    Write-Host "  Installed:       $($status.DockerInstalled)" -ForegroundColor $(if ($status.DockerInstalled) { "Green" } else { "Red" })
    Write-Host "  Running:         $($status.DockerRunning)" -ForegroundColor $(if ($status.DockerRunning) { "Green" } else { "Red" })
    Write-Host "  Ready:           $($status.DockerReady)" -ForegroundColor $(if ($status.DockerReady) { "Green" } else { "Red" })
    Write-Host "  Compose:         $($status.ComposeAvailable)" -ForegroundColor $(if ($status.ComposeAvailable) { "Green" } else { "Red" })
    Write-Host "  Registry:        $($status.RegistryAccessible)" -ForegroundColor $(if ($status.RegistryAccessible) { "Green" } else { "Red" })
    Write-Host "  Version:         $($status.Version)" -ForegroundColor Gray
    Write-Host "  Containers:      $($status.Containers)" -ForegroundColor Gray
    Write-Host "  Images:          $($status.Images)" -ForegroundColor Gray
    
    if ($status.Error) {
        Write-Host "  Error:           $($status.Error)" -ForegroundColor Red
    }
    Write-Host ""
    
    return $status
}

# Main execution
switch ($Action.ToLower()) {
    "monitor" {
        Start-Monitoring
    }
    "status" {
        Get-CurrentStatus
    }
    "deploy" {
        $status = Get-CurrentStatus
        if ($status.DockerReady) {
            Invoke-Deployment
        } else {
            Write-StatusLog "Docker Desktop is not ready. Cannot deploy." "ERROR"
            exit 1
        }
    }
    default {
        Write-Host "Usage: .\docker-monitor.ps1 -Action [monitor|status|deploy]"
        Write-Host "  monitor - Start continuous monitoring"
        Write-Host "  status  - Check current Docker status"
        Write-Host "  deploy  - Force deployment if Docker is ready"
    }
}
