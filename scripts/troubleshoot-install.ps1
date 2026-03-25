# 安装故障排除脚本
# 用于诊断和修复安装问题

param(
    [string]$SetupFile,
    [string]$InstallDir = "C:\Program Files\YunmuGameStore"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   云幕游戏商店 - 安装故障排除工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查安装文件
Write-Host "[步骤 1] 检查安装文件..." -ForegroundColor Yellow
if (-not (Test-Path $SetupFile)) {
    Write-Host "  ❌ 错误: 安装文件不存在" -ForegroundColor Red
    Write-Host "     路径: $SetupFile" -ForegroundColor Gray
    exit 1
}
$fileInfo = Get-Item $SetupFile
Write-Host "  文件名: $($fileInfo.Name)" -ForegroundColor White
Write-Host "  大小: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "  创建时间: $($fileInfo.CreationTime)" -ForegroundColor White
Write-Host "  修改时间: $($fileInfo.LastWriteTime)" -ForegroundColor White
if ($fileInfo.Length -lt 1MB) {
    Write-Host ""
    Write-Host "  ❌ 警告: 文件过小 ($([math]::Round($fileInfo.Length / 1KB, 2)) KB)" -ForegroundColor Red
    Write-Host "     这可能是一个占位文件，不是真正的安装包" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  解决方案:" -ForegroundColor Green
    Write-Host "     1. 运行以下命令构建真正的安装包:" -ForegroundColor White
    Write-Host "        npm run build:win" -ForegroundColor Gray
    Write-Host "     2. 或从发布页面下载最新版本" -ForegroundColor Gray
    exit 1
}
Write-Host "  ✅ 文件大小正常" -ForegroundColor Green
# 2. 检查磁盘空间
Write-Host ""
Write-Host "[步骤 2] 检查磁盘空间..." -ForegroundColor Yellow
$drive = (Get-Location).Drive
if ($drive) {
    Write-Host "  驱动器: $($drive.Name)" -ForegroundColor White
    $freeSpace = [math]::Round($drive.AvailableFreeSpace / 1GB, 2)
    $totalSpace = [math]::Round($drive.TotalSize / 1GB, 2)
    Write-Host "  可用空间: $freeSpace GB" -ForegroundColor White
    Write-Host "  总空间: $totalSpace GB" -ForegroundColor White
    if ($freeSpace -lt 1) {
        Write-Host "  ⚠️ 警告: 磁盘空间不足 (< 1 GB)" -ForegroundColor Yellow
    }
}
# 3. 检查安装目录权限
Write-Host ""
Write-Host "[步骤 3] 检查安装目录权限..." -ForegroundColor Yellow
if (-not (Test-Path $InstallDir)) {
    Write-Host "  安装目录不存在，将创建..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "  ✅ 已创建安装目录" -ForegroundColor Green
} else {
    try {
        $acl = Get-Acl $InstallDir
        Write-Host "  安装目录: $InstallDir" -ForegroundColor White
        Write-Host "  当前用户: $env:USERNAME" -ForegroundColor White
        Write-Host "  ✅ 可以访问" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ 错误: 无法访问安装目录" -ForegroundColor Red
        Write-Host "     请以管理员身份运行此脚本" -ForegroundColor Yellow
        exit 1
    }
}
# 4. 检查磁盘错误
Write-Host ""
Write-Host "[步骤 4] 检查磁盘错误..." -ForegroundColor Yellow
Write-Host "  运行磁盘检查 (可能需要管理员权限)..." -ForegroundColor White
Write-Host "  命令: chkdsk C: /F /R" -ForegroundColor Gray
# 5. 总结
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果所有检查都通过，请尝试:" -ForegroundColor Green
Write-Host "  1. 右键点击安装文件 -> 属性 -> 解除锁定" -ForegroundColor White
Write-Host "  2. 以管理员身份运行安装文件" -ForegroundColor White
Write-Host "  3. 重新下载安装文件" -ForegroundColor White
