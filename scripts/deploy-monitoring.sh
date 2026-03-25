#!/bin/bash

# ========================================
# 云幕游戏商店平台 - 监控系统部署脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker和Docker Compose
check_prerequisites() {
    log_info "检查系统环境..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "系统环境检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建监控数据目录..."
    
    mkdir -p monitoring/prometheus/rules
    mkdir -p monitoring/alertmanager
    mkdir -p monitoring/grafana/provisioning/dashboards/json
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/postgres-exporter
    
    log_success "目录创建完成"
}

# 创建环境变量文件
create_env_file() {
    log_info "创建环境变量文件..."
    
    if [ ! -f .env.monitoring ]; then
        cat > .env.monitoring << EOF
# 监控系统环境变量配置

# Grafana配置
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin123
GRAFANA_ROOT_URL=http://localhost:3001
GRAFANA_DOMAIN=localhost

# Prometheus配置
PROMETHEUS_PORT=9090

# Alertmanager配置
ALERTMANAGER_PORT=9093
ALERTMANAGER_URL=http://localhost:9093

# Exporter端口配置
NODE_EXPORTER_PORT=9100
POSTGRES_EXPORTER_PORT=9187
REDIS_EXPORTER_PORT=9121
ES_EXPORTER_PORT=9114
CADVISOR_PORT=8081

# 数据库配置
DB_USER=yunmu
DB_PASSWORD=yunmu123
DB_NAME=yunmu_game_store

# Redis配置
REDIS_PASSWORD=redis123

# 告警通知配置
# SMTP配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_FROM=alert@yunmu.com
SMTP_USER=alert@yunmu.com
SMTP_PASSWORD=your_smtp_password

# 告警接收邮箱
EMERGENCY_EMAIL=emergency@yunmu.com
CRITICAL_EMAIL=critical@yunmu.com
WARNING_EMAIL=warning@yunmu.com
INFO_EMAIL=info@yunmu.com

# Webhook配置
WEBHOOK_URL=https://your-webhook-url.com/alert
EMERGENCY_WEBHOOK_URL=https://your-webhook-url.com/emergency
CRITICAL_WEBHOOK_URL=https://your-webhook-url.com/critical
EOF
        log_success "环境变量文件 .env.monitoring 已创建"
    else
        log_warning "环境变量文件 .env.monitoring 已存在，跳过创建"
    fi
}

# 拉取Docker镜像
pull_images() {
    log_info "拉取监控组件Docker镜像..."
    
    docker pull prom/prometheus:v2.45.0
    docker pull grafana/grafana:10.0.0
    docker pull prom/alertmanager:v0.25.0
    docker pull prom/node-exporter:v1.6.0
    docker pull prometheuscommunity/postgres-exporter:v0.12.0
    docker pull oliver006/redis_exporter:v1.50.0
    docker pull quay.io/prometheuscommunity/elasticsearch-exporter:v1.6.0
    docker pull gcr.io/cadvisor/cadvisor:v0.47.0
    
    log_success "镜像拉取完成"
}

# 启动监控系统
start_monitoring() {
    log_info "启动监控系统..."
    
    # 加载环境变量
    if [ -f .env.monitoring ]; then
        export $(cat .env.monitoring | grep -v '^#' | xargs)
    fi
    
    # 启动监控服务
    docker-compose -f docker-compose.monitoring.yml up -d
    
    log_success "监控系统启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待监控服务就绪..."
    
    # 等待Prometheus
    log_info "等待Prometheus启动..."
    until curl -s http://localhost:9090/-/healthy > /dev/null; do
        sleep 2
    done
    log_success "Prometheus已就绪"
    
    # 等待Grafana
    log_info "等待Grafana启动..."
    until curl -s http://localhost:3001/api/health > /dev/null; do
        sleep 2
    done
    log_success "Grafana已就绪"
    
    # 等待Alertmanager
    log_info "等待Alertmanager启动..."
    until curl -s http://localhost:9093/-/healthy > /dev/null; do
        sleep 2
    done
    log_success "Alertmanager已就绪"
}

# 验证部署
verify_deployment() {
    log_info "验证监控部署..."
    
    # 检查Prometheus目标
    log_info "检查Prometheus抓取目标..."
    TARGETS=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets | length')
    log_info "活跃抓取目标数量: $TARGETS"
    
    # 检查告警规则
    log_info "检查告警规则..."
    RULES=$(curl -s http://localhost:9090/api/v1/rules | jq -r '.data.groups | length')
    log_info "告警规则组数量: $RULES"
    
    # 检查Grafana数据源
    log_info "检查Grafana数据源..."
    DATASOURCES=$(curl -s -u admin:admin123 http://localhost:3001/api/datasources | jq -r 'length')
    log_info "数据源数量: $DATASOURCES"
    
    log_success "部署验证完成"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    echo "   监控系统部署成功！"
    echo "=========================================="
    echo ""
    echo "访问地址:"
    echo "  Prometheus:    http://localhost:9090"
    echo "  Grafana:       http://localhost:3001"
    echo "                   用户名: admin"
    echo "                   密码: admin123"
    echo "  Alertmanager:  http://localhost:9093"
    echo ""
    echo "指标端点:"
    echo "  Node Exporter:        http://localhost:9100/metrics"
    echo "  PostgreSQL Exporter:  http://localhost:9187/metrics"
    echo "  Redis Exporter:       http://localhost:9121/metrics"
    echo "  Elasticsearch Exporter: http://localhost:9114/metrics"
    echo "  cAdvisor:             http://localhost:8081/metrics"
    echo ""
    echo "常用命令:"
    echo "  查看日志:   docker-compose -f docker-compose.monitoring.yml logs -f"
    echo "  停止服务:   docker-compose -f docker-compose.monitoring.yml down"
    echo "  重启服务:   docker-compose -f docker-compose.monitoring.yml restart"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "  云幕游戏商店平台 - 监控系统部署"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    create_directories
    create_env_file
    pull_images
    start_monitoring
    wait_for_services
    verify_deployment
    show_access_info
}

# 执行主函数
main "$@"
