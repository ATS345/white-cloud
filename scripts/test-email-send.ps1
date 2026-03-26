# 163邮箱邮件发送测试脚本
# 用于测试Alertmanager邮件配置是否正确

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "163邮箱邮件发送测试工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查Alertmanager容器状态
Write-Host "[1/5] 检查Alertmanager容器状态..." -ForegroundColor Yellow
$alertmanagerContainer = docker ps --filter "name=yunmu-alertmanager" --format "{{.Names}}"
if ($alertmanagerContainer) {
    Write-Host "✅ Alertmanager容器运行正常: $alertmanagerContainer" -ForegroundColor Green
} else {
    Write-Host "❌ Alertmanager容器未运行！请先启动容器。" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. 检查配置文件
Write-Host "[2/5] 检查配置文件..." -ForegroundColor Yellow
$configFile = "monitoring\alertmanager.yml"
if (Test-Path $configFile) {
    Write-Host "✅ 配置文件存在: $configFile" -ForegroundColor Green
    
    # 检查是否还有占位符
    $content = Get-Content $configFile -Raw
    if ($content -match "YOUR_163_AUTHORIZATION_CODE") {
        Write-Host "⚠️ 警告: 配置文件中仍有占位符，请先填写授权码！" -ForegroundColor Magenta
    } else {
        Write-Host "✅ 配置文件已填写授权码" -ForegroundColor Green
    }
} else {
    Write-Host "❌ 配置文件不存在: $configFile" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. 查看Alertmanager日志
Write-Host "[3/5] 查看Alertmanager最近日志..." -ForegroundColor Yellow
Write-Host "最近20条日志:" -ForegroundColor Gray
docker logs yunmu-alertmanager --tail 20
Write-Host ""

# 4. 测试配置重载
Write-Host "[4/5] 测试配置重载..." -ForegroundColor Yellow
Write-Host "提示: 如果修改了配置，需要重启Alertmanager" -ForegroundColor Gray
$restartChoice = Read-Host "是否重启Alertmanager? (y/n)"
if ($restartChoice -eq "y" -or $restartChoice -eq "Y") {
    Write-Host "正在重启Alertmanager..." -ForegroundColor Cyan
    docker restart yunmu-alertmanager
    Start-Sleep -Seconds 3
    Write-Host "✅ Alertmanager已重启" -ForegroundColor Green
}
Write-Host ""

# 5. 提供测试方法
Write-Host "[5/5] 邮件发送测试方法" -ForegroundColor Yellow
Write-Host ""
Write-Host "方法1: 通过Prometheus UI触发告警" -ForegroundColor White
Write-Host "  1. 访问 http://localhost:9090" -ForegroundColor Gray
Write-Host "  2. 进入 Alerts 页面" -ForegroundColor Gray
Write-Host "  3. 手动触发一个测试告警" -ForegroundColor Gray
Write-Host ""
Write-Host "方法2: 模拟服务故障" -ForegroundColor White
Write-Host "  1. 停止某个服务: docker stop yunmu-backend" -ForegroundColor Gray
Write-Host "  2. 等待1-2分钟让告警触发" -ForegroundColor Gray
Write-Host "  3. 检查邮箱是否收到告警邮件" -ForegroundColor Gray
Write-Host "  4. 恢复服务: docker start yunmu-backend" -ForegroundColor Gray
Write-Host ""
Write-Host "方法3: 检查Alertmanager状态" -ForegroundColor White
Write-Host "  访问 http://localhost:9093/#/status" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试准备完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
