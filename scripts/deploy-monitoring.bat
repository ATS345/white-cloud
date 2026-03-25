@echo off
REM ========================================
REM 云幕游戏商店平台 - 监控系统部署脚本 (Windows)
REM ========================================

setlocal enabledelayedexpansion

REM 颜色定义（Windows不支持颜色，使用前缀代替）
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM 检查Docker和Docker Compose
:check_prerequisites
echo %INFO% 检查系统环境...

where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %ERROR% Docker未安装，请先安装Docker Desktop
    exit /b 1
)

where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %ERROR% Docker Compose未安装，请先安装Docker Compose
    exit /b 1
)

echo %SUCCESS% 系统环境检查通过

REM 创建必要的目录
:create_directories
echo %INFO% 创建监控数据目录...

if not exist "monitoring\prometheus\rules" mkdir monitoring\prometheus\rules
if not exist "monitoring\alertmanager" mkdir monitoring\alertmanager
if not exist "monitoring\grafana\provisioning\dashboards\json" mkdir monitoring\grafana\provisioning\dashboards\json
if not exist "monitoring\grafana\provisioning\datasources" mkdir monitoring\grafana\provisioning\datasources
if not exist "monitoring\postgres-exporter" mkdir monitoring\postgres-exporter

echo %SUCCESS% 目录创建完成

REM 创建环境变量文件
:create_env_file
echo %INFO% 创建环境变量文件...

if not exist ".env.monitoring" (
    (
        echo # 监控系统环境变量配置
        echo.
        echo # Grafana配置
        echo GRAFANA_ADMIN_USER=admin
        echo GRAFANA_ADMIN_PASSWORD=admin123
        echo GRAFANA_ROOT_URL=http://localhost:3001
        echo GRAFANA_DOMAIN=localhost
        echo.
        echo # Prometheus配置
        echo PROMETHEUS_PORT=9090
        echo.
        echo # Alertmanager配置
        echo ALERTMANAGER_PORT=9093
        echo ALERTMANAGER_URL=http://localhost:9093
        echo.
        echo # Exporter端口配置
        echo NODE_EXPORTER_PORT=9100
        echo POSTGRES_EXPORTER_PORT=9187
        echo REDIS_EXPORTER_PORT=9121
        echo ES_EXPORTER_PORT=9114
        echo CADVISOR_PORT=8081
        echo.
        echo # 数据库配置
        echo DB_USER=yunmu
        echo DB_PASSWORD=yunmu123
        echo DB_NAME=yunmu_game_store
        echo.
        echo # Redis配置
        echo REDIS_PASSWORD=redis123
        echo.
        echo # 告警通知配置
        echo SMTP_HOST=smtp.example.com
        echo SMTP_PORT=587
        echo SMTP_FROM=alert@yunmu.com
        echo SMTP_USER=alert@yunmu.com
        echo SMTP_PASSWORD=your_smtp_password
        echo.
        echo EMERGENCY_EMAIL=emergency@yunmu.com
        echo CRITICAL_EMAIL=critical@yunmu.com
        echo WARNING_EMAIL=warning@yunmu.com
        echo INFO_EMAIL=info@yunmu.com
        echo.
        echo WEBHOOK_URL=https://your-webhook-url.com/alert
        echo EMERGENCY_WEBHOOK_URL=https://your-webhook-url.com/emergency
        echo CRITICAL_WEBHOOK_URL=https://your-webhook-url.com/critical
    ) > .env.monitoring
    echo %SUCCESS% 环境变量文件 .env.monitoring 已创建
) else (
    echo %WARNING% 环境变量文件 .env.monitoring 已存在，跳过创建
)

REM 拉取Docker镜像
:pull_images
echo %INFO% 拉取监控组件Docker镜像...

docker pull prom/prometheus:v2.45.0
docker pull grafana/grafana:10.0.0
docker pull prom/alertmanager:v0.25.0
docker pull prom/node-exporter:v1.6.0
docker pull prometheuscommunity/postgres-exporter:v0.12.0
docker pull oliver006/redis_exporter:v1.50.0
docker pull quay.io/prometheuscommunity/elasticsearch-exporter:v1.6.0

echo %SUCCESS% 镜像拉取完成

REM 启动监控系统
:start_monitoring
echo %INFO% 启动监控系统...

REM 加载环境变量
if exist ".env.monitoring" (
    for /f "usebackq tokens=1,* delims==" %%a in (".env.monitoring") do (
        set "line=%%a"
        if "!line:~0,1!" neq "#" (
            set "%%a=%%b"
        )
    )
)

REM 启动监控服务
docker-compose -f docker-compose.monitoring.yml up -d

echo %SUCCESS% 监控系统启动完成

REM 等待服务就绪
:wait_for_services
echo %INFO% 等待监控服务就绪...

echo %INFO% 等待Prometheus启动...
:wait_prometheus
curl -s http://localhost:9090/-/healthy >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_prometheus
)
echo %SUCCESS% Prometheus已就绪

echo %INFO% 等待Grafana启动...
:wait_grafana
curl -s http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_grafana
)
echo %SUCCESS% Grafana已就绪

echo %INFO% 等待Alertmanager启动...
:wait_alertmanager
curl -s http://localhost:9093/-/healthy >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_alertmanager
)
echo %SUCCESS% Alertmanager已就绪

REM 显示访问信息
:show_info
echo.
echo ==========================================
echo    监控系统部署成功！
echo ==========================================
echo.
echo 访问地址:
echo   Prometheus:    http://localhost:9090
echo   Grafana:       http://localhost:3001
echo                    用户名: admin
echo                    密码: admin123
echo   Alertmanager:  http://localhost:9093
echo.
echo 常用命令:
echo   查看日志:   docker-compose -f docker-compose.monitoring.yml logs -f
echo   停止服务:   docker-compose -f docker-compose.monitoring.yml down
echo   重启服务:   docker-compose -f docker-compose.monitoring.yml restart
echo.

endlocal
