# 网络检查脚本
# 运行频率：每周五下午执行

# 设置输出文件路径
$outputFile = "C:\项目开发\游戏商店平台项目开发\NETWORK_CHECK_RESULTS_$(Get-Date -Format "yyyyMMdd_HHmmss").txt"

# 开始测试
Write-Output "网络检查报告 - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")" | Out-File -FilePath $outputFile
Write-Output "===========================================" | Out-File -FilePath $outputFile -Append

# 1. 网关连通性测试
Write-Output "\n1. 网关连通性测试" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append
try {
    $gatewayTest = Test-Connection -ComputerName "192.168.1.1" -Count 4 -Quiet -ErrorAction Stop
    Write-Output "网关连通性测试结果：$gatewayTest" | Out-File -FilePath $outputFile -Append
    
    # 获取详细信息
    $gatewayDetails = Test-Connection -ComputerName "192.168.1.1" -Count 4 -ErrorAction Stop
    Write-Output "平均延迟：$($gatewayDetails.Average.Latency) ms" | Out-File -FilePath $outputFile -Append
    Write-Output "最小延迟：$($gatewayDetails.Minimum.Latency) ms" | Out-File -FilePath $outputFile -Append
    Write-Output "最大延迟：$($gatewayDetails.Maximum.Latency) ms" | Out-File -FilePath $outputFile -Append
    
    # 计算丢包率
    $successCount = ($gatewayDetails | Where-Object {$_.StatusCode -eq 0}).Count
    $packetLoss = [math]::Round((1 - ($successCount / $gatewayDetails.Count)) * 100, 2)
    Write-Output "丢包率：$packetLoss%" | Out-File -FilePath $outputFile -Append
} catch {
    Write-Output "网关连通性测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 2. 外部网站访问测试
$websites = @(
    @{ Name = "GitHub"; URL = "github.com" }
    @{ Name = "Google"; URL = "google.com" }
    @{ Name = "百度"; URL = "baidu.com" }
)

Write-Output "\n2. 外部网站访问测试" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append

foreach ($website in $websites) {
    Write-Output "\n$($website.Name) ($($website.URL)):" | Out-File -FilePath $outputFile -Append
    Write-Output "---------------------" | Out-File -FilePath $outputFile -Append
    
    # Ping测试
    try {
        $pingResult = Test-Connection -ComputerName $website.URL -Count 4 -Quiet -ErrorAction Stop
        Write-Output "Ping测试结果：$pingResult" | Out-File -FilePath $outputFile -Append
        
        # 获取详细信息
        $pingDetails = Test-Connection -ComputerName $website.URL -Count 4 -ErrorAction Stop
        Write-Output "平均延迟：$($pingDetails.Average.Latency) ms" | Out-File -FilePath $outputFile -Append
        Write-Output "最小延迟：$($pingDetails.Minimum.Latency) ms" | Out-File -FilePath $outputFile -Append
        Write-Output "最大延迟：$($pingDetails.Maximum.Latency) ms" | Out-File -FilePath $outputFile -Append
        
        # 计算丢包率
        $successCount = ($pingDetails | Where-Object {$_.StatusCode -eq 0}).Count
        $packetLoss = [math]::Round((1 - ($successCount / $pingDetails.Count)) * 100, 2)
        Write-Output "丢包率：$packetLoss%" | Out-File -FilePath $outputFile -Append
    } catch {
        Write-Output "Ping测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
    
    # TCP端口测试
    try {
        $tcpResult = Test-NetConnection -ComputerName $website.URL -Port 443 -ErrorAction Stop
        Write-Output "TCP 443端口测试结果：$($tcpResult.TcpTestSucceeded)" | Out-File -FilePath $outputFile -Append
    } catch {
        Write-Output "TCP端口测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
}

# 3. 分段网络测试
Write-Output "\n3. 分段网络测试" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append
try {
    $tracertResult = tracert -d github.com
    Write-Output "GitHub分段网络测试结果：" | Out-File -FilePath $outputFile -Append
    $tracertResult | Out-File -FilePath $outputFile -Append
} catch {
    Write-Output "分段网络测试失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 4. DNS解析测试
Write-Output "\n4. DNS解析测试" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append

foreach ($website in $websites) {
    try {
        $dnsResult = Resolve-DnsName -Name $website.URL -Type A -ErrorAction Stop
        Write-Output "$($website.Name) DNS解析结果：" | Out-File -FilePath $outputFile -Append
        foreach ($ip in $dnsResult.IPAddress) {
            Write-Output "  $ip" | Out-File -FilePath $outputFile -Append
        }
    } catch {
        Write-Output "$($website.Name) DNS解析失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
    }
}

# 5. 网络适配器状态
Write-Output "\n5. 网络适配器状态" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append
try {
    $adapter = Get-NetAdapter -Name "WLAN" -ErrorAction Stop
    Write-Output "适配器名称：$($adapter.Name)" | Out-File -FilePath $outputFile -Append
    Write-Output "适配器状态：$($adapter.Status)" | Out-File -FilePath $outputFile -Append
    Write-Output "连接速度：$($adapter.LinkSpeed)" | Out-File -FilePath $outputFile -Append
    Write-Output "MAC地址：$($adapter.MacAddress)" | Out-File -FilePath $outputFile -Append
} catch {
    Write-Output "获取网络适配器状态失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 6. 网络配置信息
Write-Output "\n6. 网络配置信息" | Out-File -FilePath $outputFile -Append
Write-Output "--------------------" | Out-File -FilePath $outputFile -Append
try {
    $ipConfig = Get-NetIPConfiguration -InterfaceAlias "WLAN" -ErrorAction Stop
    Write-Output "IPv4地址：$($ipConfig.IPv4Address.IPAddress)" | Out-File -FilePath $outputFile -Append
    Write-Output "子网掩码：$($ipConfig.IPv4Address.PrefixLength)" | Out-File -FilePath $outputFile -Append
    Write-Output "默认网关：$($ipConfig.IPv4DefaultGateway.NextHop)" | Out-File -FilePath $outputFile -Append
    Write-Output "DHCP服务器：$($ipConfig.DhcpServer.IpAddress)" | Out-File -FilePath $outputFile -Append
    Write-Output "DNS服务器：" | Out-File -FilePath $outputFile -Append
    foreach ($dns in $ipConfig.DNSServer.ServerAddresses) {
        Write-Output "  $dns" | Out-File -FilePath $outputFile -Append
    }
} catch {
    Write-Output "获取网络配置信息失败：$($_.Exception.Message)" | Out-File -FilePath $outputFile -Append
}

# 测试完成
Write-Output "\n===========================================" | Out-File -FilePath $outputFile -Append
Write-Output "网络检查测试完成。结果已保存到：$outputFile" | Out-File -FilePath $outputFile -Append
Write-Output "===========================================" | Out-File -FilePath $outputFile -Append

# 显示结果
Write-Output "网络检查测试已完成！"
Write-Output "结果已保存到：$outputFile"
Write-Output "\n测试摘要："
Write-Output "1. 网关连通性测试：完成"
Write-Output "2. 外部网站访问测试：完成"
Write-Output "3. 分段网络测试：完成"
Write-Output "4. DNS解析测试：完成"
Write-Output "5. 网络适配器状态：完成"
Write-Output "6. 网络配置信息：完成"

# 打开结果文件
Invoke-Item $outputFile