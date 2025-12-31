# Basic Network Check Script
# Run frequency: Every Friday afternoon

# Set output file path to current directory
$outputFile = ".\NETWORK_CHECK_RESULTS_$(Get-Date -Format "yyyyMMdd_HHmmss").txt"

# Start test
Write-Host "Network Check Report - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")" > $outputFile
Write-Host "===========================================" >> $outputFile

# 1. Gateway connectivity test
Write-Host "" >> $outputFile
Write-Host "1. Gateway Connectivity Test" >> $outputFile
Write-Host "--------------------" >> $outputFile
Write-Host "Running: ping -n 4 192.168.1.1" >> $outputFile
ping -n 4 192.168.1.1 >> $outputFile 2>&1

# 2. External website ping test
Write-Host "" >> $outputFile
Write-Host "2. External Website Ping Test" >> $outputFile
Write-Host "--------------------" >> $outputFile

$websites = @("github.com", "google.com", "baidu.com")

foreach ($website in $websites) {
    Write-Host "" >> $outputFile
    Write-Host "$website Ping Test:" >> $outputFile
    Write-Host "---------------------" >> $outputFile
    Write-Host "Running: ping -n 4 $website" >> $outputFile
    ping -n 4 $website >> $outputFile 2>&1
}

# 3. TCP port test
Write-Host "" >> $outputFile
Write-Host "3. TCP Port Test" >> $outputFile
Write-Host "--------------------" >> $outputFile

foreach ($website in $websites) {
    Write-Host "" >> $outputFile
    Write-Host "$website TCP 443 Port Test:" >> $outputFile
    Write-Host "---------------------" >> $outputFile
    Write-Host "Running: Test-NetConnection $website -Port 443" >> $outputFile
    Test-NetConnection -ComputerName $website -Port 443 >> $outputFile 2>&1
}

# 4. Traceroute test
Write-Host "" >> $outputFile
Write-Host "4. Traceroute Test" >> $outputFile
Write-Host "--------------------" >> $outputFile
Write-Host "Running: tracert -d github.com" >> $outputFile
tracert -d github.com >> $outputFile 2>&1

# 5. DNS resolution test
Write-Host "" >> $outputFile
Write-Host "5. DNS Resolution Test" >> $outputFile
Write-Host "--------------------" >> $outputFile

foreach ($website in $websites) {
    Write-Host "" >> $outputFile
    Write-Host "$website DNS Resolution:" >> $outputFile
    Write-Host "---------------------" >> $outputFile
    Write-Host "Running: nslookup $website" >> $outputFile
    nslookup $website >> $outputFile 2>&1
}

# Test completed
Write-Host "" >> $outputFile
Write-Host "===========================================" >> $outputFile
Write-Host "Network Check Test Completed. Results saved to: $outputFile" >> $outputFile
Write-Host "===========================================" >> $outputFile

# Display result summary
Write-Host "Network Check Test Completed!"
Write-Host "Results saved to: $outputFile"
Write-Host ""
Write-Host "Test Summary:" 
Write-Host "1. Gateway Connectivity Test: Completed"
Write-Host "2. External Website Ping Test: Completed"
Write-Host "3. TCP Port Test: Completed"
Write-Host "4. Traceroute Test: Completed"
Write-Host "5. DNS Resolution Test: Completed"