@echo off
chcp 65001 >nul
echo ==========================================
echo   云幕游戏商店平台 - 部署验证脚本
echo ==========================================

set ERRORS=0

echo.
echo 1. 检查 Docker 服务...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Docker 服务正常运行
) else (
    echo    ✗ Docker 服务未运行
    set /a ERRORS+=1
)

echo.
echo 2. 检查 Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Docker Compose 已安装
) else (
    echo    ✗ Docker Compose 未安装
    set /a ERRORS+=1
)

echo.
echo 3. 检查环境变量文件...
if exist ".env" (
    echo    ✓ .env 文件存在
) else (
    echo    ✗ .env 文件不存在，请从 .env.example 复制
    set /a ERRORS+=1
)

echo.
echo 4. 检查容器状态...
docker-compose ps 2>nul | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo    ✓ 容器正在运行
    docker-compose ps
) else (
    echo    ⚠ 没有运行中的容器
)

echo.
echo 5. 检查服务健康状态...
curl -sf http://localhost/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ 后端API服务正常
) else (
    echo    ✗ 后端API服务异常
    set /a ERRORS+=1
)

curl -sf http://localhost/ >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ 前端服务正常
) else (
    echo    ✗ 前端服务异常
    set /a ERRORS+=1
)

echo.
echo ==========================================
if %ERRORS% equ 0 (
    echo   ✓ 部署验证通过
) else (
    echo   ✗ 发现 %ERRORS% 个问题需要处理
)
echo ==========================================

exit /b %ERRORS%
