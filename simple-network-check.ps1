# 简单网络检查脚本
# 运行频率：每周五下午执行

# 设置输出文件路径
$outputFile = "C:\项目开发\游戏商店平台项目开发\NETWORK_CHECK_RESULTS_$(Get-Date -Format "yyyyMMdd_HHmmss").txt"

# 开始测试
Write-Host "网络检查报告 - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")" | Out-File -FilePath $outputFile
Write-Host "===========================================" | Out-File -FilePath $outputFile -Append

# 1. 网关连通性测试
Write-Host "
1. 网关连通性测试" | Out-File -FilePath $outputFile -Append
Write-Host "--------------------" | Out-File -FilePath $outputFile -Append
try {
    Write-Host "运行命令：Test-Connection -ComputerName 192.168.1.1 -Count 4" | Out-File -FilePath $outputFile -Append
    $gatewayResult = Test-Connection -ComputerName "192.168.1.1" -Count 4
    $gatewayResult | Out-File -FilePath $outputFile -Append
    
    # 计算丢包率
    $successCount = ($gatewayResult | Where-Object {$_.StatusCode -eq 0}).Count
    $packetLoss = [math]::Round((1 - ($successCount / $gatewayResult.Count)) * 100, 2)
    Write-Host "丢包率：$packetLoss%" | Out-File -FilePath $outputFile -Append
} catch {
    Write-Host "网关连通性测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 2. 外部网站ping测试
Write-Host "
2. 外部网站ping测试" | Out-File -FilePath $outputFile -Append
Write-Host "--------------------" | Out-File -FilePath $outputFile -Append

$websites = @("github.com", "google.com", "baidu.com")

foreach ($website in $websites) {
    Write-Host "
$website ping测试：" | Out-File -FilePath $outputFile -Append
    Write-Host "---------------------" | Out-File -FilePath $outputFile -Append
    try {
        Write-Host "运行命令：Test-Connection -ComputerName $website -Count 4" | Out-File -FilePath $outputFile -Append
        $pingResult = Test-Connection -ComputerName $website -Count 4 -ErrorAction Stop
        $pingResult | Out-File -FilePath $outputFile -Append
        
        # 计算丢包率
        $successCount = ($pingResult | Where-Object {$_.StatusCode -eq 0}).Count
        $packetLoss = [math]::Round((1 - ($successCount / $pingResult.Count)) * 100, 2)
        Write-Host "丢包率：$packetLoss%" | Out-File -FilePath $outputFile -Append
    } catch {
        Write-Host "$website ping测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
}

# 3. TCP端口测试
Write-Host "
3. TCP端口测试" | Out-File -FilePath $outputFile -Append
Write-Host "--------------------" | Out-File -FilePath $outputFile -Append

foreach ($website in $websites) {
    Write-Host "
$website TCP 443端口测试：" | Out-File -FilePath $outputFile -Append
    Write-Host "---------------------" | Out-File -FilePath $outputFile -Append
    try {
        Write-Host "运行命令：Test-NetConnection -ComputerName $website -Port 443" | Out-File -FilePath $outputFile -Append
        $tcpResult = Test-NetConnection -ComputerName $website -Port 443 -ErrorAction Stop
        $tcpResult | Out-File -FilePath $outputFile -Append
    } catch {
        Write-Host "$website TCP端口测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
}

# 4. 分段网络测试
Write-Host "
4. 分段网络测试" | Out-File -FilePath $outputFile -Append
Write-Host "--------------------" | Out-File -FilePath $outputFile -Append
try {
    Write-Host "运行命令：tracert -d github.com" | Out-File -FilePath $outputFile -Append
    $tracertResult = tracert -d github.com
    $tracertResult | Out-File -FilePath $outputFile -Append
} catch {
    Write-Host "分段网络测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 5. DNS解析测试
Write-Host "
5. DNS解析测试" | Out-File -FilePath $outputFile -Append
Write-Host "--------------------" | Out-File -FilePath $outputFile -Append

foreach ($website in $websites) {
    Write-Host "
$website DNS解析测试：" | Out-File -FilePath $outputFile -Append
    Write-Host "---------------------" | Out-File -FilePath $outputFile -Append
    try {
        Write-Host "运行命令：Resolve-DnsName -Name $website -Type A" | Out-File -FilePath $outputFile -Append
        $dnsResult = Resolve-DnsName -Name $website -Type A -ErrorAction Stop
        $dnsResult | Out-File -FilePath $outputFile -Append
    } catch {
        Write-Host "$website DNS解析测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
}

# 测试完成
Write-Host "
===========================================" | Out-File -FilePath $outputFile -Append
Write-Host "网络检查测试完成。结果已保存到：$outputFile" | Out-File -FilePath $outputFile -Append
Write-Host "===========================================" | Out-File -FilePath $outputFile -Append

# 显示结果
Write-Host "网络检查测试已完成！"
Write-Host "结果已保存到：$outputFile"
Write-Host "
测试摘要："
Write-Host "1. 网关连通性测试：完成"
Write-Host "2. 外部网站ping测试：完成"
Write-Host "3. TCP端口测试：完成"
Write-Host "4. 分段网络测试：完成"
Write-Host "5. DNS解析测试：完成"

# 打开结果文件
# Invoke-Item $outputFile