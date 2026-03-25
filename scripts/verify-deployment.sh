#!/bin/bash

echo "=========================================="
echo "  云幕游戏商店平台 - 部署验证脚本"
echo "=========================================="

ERRORS=0

echo ""
echo "1. 检查 Docker 服务..."
if docker info > /dev/null 2>&1; then
    echo "   ✓ Docker 服务正常运行"
else
    echo "   ✗ Docker 服务未运行"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "2. 检查 Docker Compose..."
if docker-compose --version > /dev/null 2>&1; then
    echo "   ✓ Docker Compose 已安装"
else
    echo "   ✗ Docker Compose 未安装"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "3. 检查环境变量文件..."
if [ -f ".env" ]; then
    echo "   ✓ .env 文件存在"
    
    if grep -q "your-super-secret" .env; then
        echo "   ⚠ 警告: 请修改默认的 JWT 密钥"
    fi
else
    echo "   ✗ .env 文件不存在，请从 .env.example 复制"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "4. 检查容器状态..."
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo "   ✓ 容器正在运行"
    docker-compose ps
else
    echo "   ⚠ 没有运行中的容器"
fi

echo ""
echo "5. 检查端口占用..."
check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        echo "   ✓ 端口 $1 正在监听"
    else
        echo "   ⚠ 端口 $1 未监听"
    fi
}

check_port 80
check_port 3000
check_port 5432
check_port 6379

echo ""
echo "6. 检查服务健康状态..."

check_health() {
    local url=$1
    local name=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "   ✓ $name 服务正常"
    else
        echo "   ✗ $name 服务异常"
        ERRORS=$((ERRORS + 1))
    fi
}

check_health "http://localhost/api/health" "后端API"
check_health "http://localhost/" "前端服务"

echo ""
echo "7. 检查数据库连接..."
if docker-compose exec -T postgres pg_isready -U yunmu 2>/dev/null; then
    echo "   ✓ PostgreSQL 连接正常"
else
    echo "   ⚠ PostgreSQL 连接失败或服务未启动"
fi

echo ""
echo "8. 检查 Redis 连接..."
if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "   ✓ Redis 连接正常"
else
    echo "   ⚠ Redis 连接失败或服务未启动"
fi

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "  ✓ 部署验证通过"
else
    echo "  ✗ 发现 $ERRORS 个问题需要处理"
fi
echo "=========================================="

exit $ERRORS
