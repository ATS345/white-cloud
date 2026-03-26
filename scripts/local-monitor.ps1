# Yunmu Game Store Platform - Local Monitor Script
# Purpose: Monitor locally running application services

param(
    [int]$CheckInterval = 30,
    [switch]$Continuous
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $ScriptDir "..\logs"
$MonitorLog = Join-Path $LogDir "monitor.log"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $MonitorLog -Value $LogMessage
}

function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $Response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -UseBasicParsing
        if ($Response.StatusCode -eq 200) {
            Write-Log "$ServiceName service healthy - Status: $($Response.StatusCode)" "INFO"
            return $true
        } else {
            Write-Log "$ServiceName service warning - Status: $($Response.StatusCode)" "WARNING"
            return $false
        }
    } catch {
        Write-Log "$ServiceName service unreachable - $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-SystemMetrics {
    try {
        $CPU = Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
        $Memory = Get-CimInstance -ClassName Win32_OperatingSystem
        $TotalMemory = $Memory.TotalVisibleMemorySize / 1MB
        $FreeMemory = $Memory.FreePhysicalMemory / 1MB
        $MemoryUsage = [math]::Round((($TotalMemory - $FreeMemory) / $TotalMemory) * 100, 2)
        
        Write-Log "System resources - CPU: $([math]::Round($CPU, 2))%, Memory: $MemoryUsage%" "INFO"
        return @{
            CPU = $CPU
            MemoryUsage = $MemoryUsage
            TotalMemoryGB = [math]::Round($TotalMemory, 2)
            FreeMemoryGB = [math]::Round($FreeMemory, 2)
        }
    } catch {
        Write-Log "Failed to get system metrics - $($_.Exception.Message)" "WARNING"
        return $null
    }
}

function Monitor-Loop {
    Write-Log "Starting continuous monitoring, check interval: ${CheckInterval}s" "INFO"
    
    while ($true) {
        Write-Log "`n=== Monitoring check start ===" "INFO"
        
        $BackendHealth = Test-ServiceHealth -Url "http://localhost:3000/health" -ServiceName "Backend API"
        $FrontendHealth = Test-ServiceHealth -Url "http://localhost:8080" -ServiceName "Frontend App"
        $Metrics = Get-SystemMetrics
        
        Write-Log "=== Monitoring check end ===`n" "INFO"
        
        Start-Sleep -Seconds $CheckInterval
    }
}

Write-Log "========================================" "INFO"
Write-Log "Yunmu Game Store Platform - Local Monitor" "INFO"
Write-Log "========================================" "INFO"

Write-Log "Checking backend: http://localhost:3000/health" "INFO"
Write-Log "Checking frontend: http://localhost:8080" "INFO"

if ($Continuous) {
    Monitor-Loop
} else {
    Write-Log "Performing single check..." "INFO"
    $BackendHealth = Test-ServiceHealth -Url "http://localhost:3000/health" -ServiceName "Backend API"
    $FrontendHealth = Test-ServiceHealth -Url "http://localhost:8080" -ServiceName "Frontend App"
    $Metrics = Get-SystemMetrics
    
    Write-Log "`nSingle check complete!" "INFO"
    $BackendStatus = if ($BackendHealth) { "OK" } else { "ERROR" }
    $FrontendStatus = if ($FrontendHealth) { "OK" } else { "ERROR" }
    Write-Log "Backend status: $BackendStatus" "INFO"
    Write-Log "Frontend status: $FrontendStatus" "INFO"
}
