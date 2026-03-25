# Docker Monitoring Auto-Deploy Script
# Automatically deploys monitoring stack when Docker Desktop is ready

param(
    [int]$MaxRetries = 30,
    [int]$RetryInterval = 10,
    [string]$ProjectRoot = $PSScriptRoot
)

$ErrorActionPreference = "Continue"
$LogFile = Join-Path $ProjectRoot "logs\deploy-monitoring.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Ensure log directory exists
    $logDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $LogFile -Value $logEntry
    
    # Console output with colors
    switch ($Level) {
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        default { Write-Host $logEntry -ForegroundColor Cyan }
    }
}

function Test-DockerDesktop {
    <#
    .SYNOPSIS
    Tests if Docker Desktop is fully operational
    #>
    
    # Test 1: Check if docker command exists
    try {
        $null = docker --version 2>&1
    } catch {
        return @{ Ready = $false; Reason = "Docker command not found" }
    }
    
    # Test 2: Check if Docker daemon is running
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            return @{ Ready = $false; Reason = "Docker daemon not running" }
        }
    } catch {
        return @{ Ready = $false; Reason = "Cannot connect to Docker daemon" }
    }
    
    # Test 3: Check Docker API responsiveness
    try {
        $null = docker version --format '{{.Server.Version}}' 2>&1
        if ($LASTEXITCODE -ne 0) {
            return @{ Ready = $false; Reason = "Docker API not responding" }
        }
    } catch {
        return @{ Ready = $false; Reason = "Docker API error" }
    }
    
    # Test 4: Check if basic container operations work
    try {
        # Pull and run hello-world to verify full functionality
        $pullResult = docker pull hello-world 2>&1
        if ($LASTEXITCODE -ne 0) {
            return @{ Ready = $false; Reason = "Cannot pull images - registry issue" }
        }
    } catch {
        return @{ Ready = $false; Reason = "Container pull failed" }
    }
    
    # Test 5: Check Docker Compose availability
    try {
        $null = docker-compose --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            return @{ Ready = $false; Reason = "Docker Compose not available" }
        }
    } catch {
        return @{ Ready = $false; Reason = "Docker Compose not installed" }
    }
    
    return @{ Ready = $true; Reason = "Docker Desktop is fully operational" }
}

function Wait-ForDockerDesktop {
    <#
    .SYNOPSIS
    Waits for Docker Desktop to be fully ready
    #>
    
    Write-Log "Waiting for Docker Desktop to be ready..." "INFO"
    Write-Log "Max retries: $MaxRetries, Interval: ${RetryInterval}s" "INFO"
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        $status = Test-DockerDesktop
        
        if ($status.Ready) {
            Write-Log "Docker Desktop is ready! ($i/$MaxRetries)" "SUCCESS"
            return $true
        }
        
        Write-Log "Attempt $i/$MaxRetries - Docker not ready: $($status.Reason)" "WARNING"
        
        if ($i -lt $MaxRetries) {
            Start-Sleep -Seconds $RetryInterval
        }
    }
    
    Write-Log "Docker Desktop failed to become ready after $MaxRetries attempts" "ERROR"
    return $false
}

function Deploy-MonitoringStack {
    <#
    .SYNOPSIS
    Deploys the monitoring stack using Docker Compose
    #>
    
    $composeFile = Join-Path $ProjectRoot "docker-compose.monitoring.yml"
    
    if (-not (Test-Path $composeFile)) {
        Write-Log "Docker compose file not found: $composeFile" "ERROR"
        return $false
    }
    
    Write-Log "Starting monitoring stack deployment..." "INFO"
    
    # Create necessary directories
    $monitoringDir = Join-Path $ProjectRoot "monitoring"
    $dirs = @(
        "$monitoringDir\prometheus\data",
        "$monitoringDir\grafana\data",
        "$monitoringDir\alertmanager\data"
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Created directory: $dir" "INFO"
        }
    }
    
    # Pull images first
    Write-Log "Pulling monitoring images..." "INFO"
    $pullResult = docker-compose -f $composeFile pull 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Warning: Some images may not have been pulled" "WARNING"
    }
    
    # Deploy stack
    Write-Log "Deploying monitoring containers..." "INFO"
    $deployResult = docker-compose -f $composeFile up -d 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Monitoring stack deployed successfully!" "SUCCESS"
        return $true
    } else {
        Write-Log "Failed to deploy monitoring stack: $deployResult" "ERROR"
        return $false
    }
}

function Test-MonitoringHealth {
    <#
    .SYNOPSIS
    Verifies monitoring services are healthy
    #>
    
    Write-Log "Checking monitoring services health..." "INFO"
    
    $services = @(
        @{ Name = "Prometheus"; Port = 9090; Path = "/-/healthy" },
        @{ Name = "Grafana"; Port = 3001; Path = "/api/health" },
        @{ Name = "Alertmanager"; Port = 9093; Path = "/-/healthy" }
    )
    
    $allHealthy = $true
    
    foreach ($service in $services) {
        $url = "http://localhost:$($service.Port)$($service.Path)"
        try {
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Log "$($service.Name) is healthy" "SUCCESS"
            } else {
                Write-Log "$($service.Name) returned status $($response.StatusCode)" "WARNING"
                $allHealthy = $false
            }
        } catch {
            Write-Log "$($service.Name) health check failed: $($_.Exception.Message)" "WARNING"
            $allHealthy = $false
        }
    }
    
    return $allHealthy
}

function Show-DeploymentSummary {
    <#
    .SYNOPSIS
    Displays deployment summary and access information
    #>
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   MONITORING DEPLOYMENT SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Services:" -ForegroundColor White
    Write-Host "  Prometheus:    http://localhost:9090" -ForegroundColor Gray
    Write-Host "  Grafana:       http://localhost:3001" -ForegroundColor Gray
    Write-Host "                 (admin / admin123)" -ForegroundColor DarkGray
    Write-Host "  Alertmanager:  http://localhost:9093" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Metrics Endpoint:" -ForegroundColor White
    Write-Host "  Backend:       http://localhost:3000/metrics" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Log File: $LogFile" -ForegroundColor DarkGray
    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker Monitoring Auto-Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Wait for Docker Desktop
if (-not (Wait-ForDockerDesktop)) {
    Write-Log "Deployment aborted - Docker Desktop not ready" "ERROR"
    Write-Host ""
    Write-Host "Please ensure Docker Desktop is running and try again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Deploy monitoring stack
if (-not (Deploy-MonitoringStack)) {
    Write-Log "Deployment failed" "ERROR"
    exit 1
}

# Step 3: Wait for services to start
Write-Log "Waiting for services to initialize..." "INFO"
Start-Sleep -Seconds 15

# Step 4: Verify health
$healthy = Test-MonitoringHealth

# Step 5: Show summary
Show-DeploymentSummary

if ($healthy) {
    Write-Log "Deployment completed successfully!" "SUCCESS"
    exit 0
} else {
    Write-Log "Deployment completed with warnings" "WARNING"
    exit 0
}
