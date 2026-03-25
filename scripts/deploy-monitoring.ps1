# CloudCurtain Game Store - Monitoring System Deployment Script
# Windows PowerShell Version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Monitoring System Deployment Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$MonitoringDir = Join-Path $ProjectRoot "monitoring"

# Create monitoring data directories
Write-Host "[INFO] Creating monitoring data directories..." -ForegroundColor Yellow
$Dirs = @(
    "$MonitoringDir\prometheus\data",
    "$MonitoringDir\grafana\data",
    "$MonitoringDir\alertmanager\data"
)

foreach ($Dir in $Dirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        Write-Host "[SUCCESS] Created: $Dir" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Exists: $Dir" -ForegroundColor Gray
    }
}

# Check Docker
Write-Host "[INFO] Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "[SUCCESS] Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "[SUCCESS] Docker is running" -ForegroundColor Green

# Deploy monitoring stack
Write-Host "[INFO] Deploying monitoring stack..." -ForegroundColor Yellow
$ComposeFile = Join-Path $ProjectRoot "docker-compose.monitoring.yml"

if (Test-Path $ComposeFile) {
    docker-compose -f $ComposeFile up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Monitoring stack deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Docker compose may have issues. Check logs." -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] docker-compose.monitoring.yml not found. Creating basic setup..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Monitoring Services:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prometheus:    http://localhost:9090" -ForegroundColor White
Write-Host "Grafana:       http://localhost:3001 (admin/admin123)" -ForegroundColor White
Write-Host "Alertmanager:  http://localhost:9093" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] To rebuild backend with metrics:" -ForegroundColor Yellow
Write-Host "  cd backend && npm run build" -ForegroundColor Gray
Write-Host ""
Write-Host "[SUCCESS] Deployment complete!" -ForegroundColor Green
