#!/bin/bash

# 游戏商店平台部署脚本

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 定义变量
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000
ENV="development" # 默认环境

# 显示帮助信息
show_help() {
    echo -e "${BLUE}=== 木鱼游戏平台部署脚本帮助 ===${NC}"
    echo ""
    echo "使用方法: bash deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help            显示帮助信息"
    echo "  -e, --env ENV         选择部署环境 (development/production, 默认: development)"
    echo "  -r, --rollback        执行回滚操作"
    echo "  -t, --test            测试部署流程，不实际启动服务"
    echo ""
    exit 0
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -e|--env)
            ENV=$2
            shift 2
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -t|--test)
            TEST_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}错误: 未知选项 $1${NC}"
            show_help
            ;;
    esac
done

echo -e "${GREEN}=== 木鱼游戏平台部署脚本 ===${NC}"
echo ""
echo -e "${BLUE}部署环境:${NC} $ENV"
echo -e "${BLUE}回滚模式:${NC} ${ROLLBACK:-false}"
echo -e "${BLUE}测试模式:${NC} ${TEST_ONLY:-false}"
echo ""

# 检查 Node.js 和 npm 是否安装
check_dependencies() {
    echo -e "${BLUE}=== 检查依赖 ===${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: Node.js 未安装，请先安装 Node.js${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: npm 未安装，请先安装 npm${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js 和 npm 已安装${NC}"
    echo -e "${BLUE}Node.js 版本:${NC} $(node --version)"
    echo -e "${BLUE}npm 版本:${NC} $(npm --version)"
    echo ""
}

# 回滚操作
rollback_deployment() {
    echo -e "${YELLOW}=== 执行回滚操作 ===${NC}"
    
    # 停止所有服务
    echo "停止后端服务..."
    pkill -f "node server.js" 2>/dev/null || echo -e "${YELLOW}警告: 后端服务未运行${NC}"
    
    echo "停止前端服务..."
    pkill -f "vite preview" 2>/dev/null || echo -e "${YELLOW}警告: 前端服务未运行${NC}"
    
    echo "清理临时文件..."
    rm -rf $BACKEND_DIR/node_modules $FRONTEND_DIR/node_modules 2>/dev/null
    rm -f $BACKEND_DIR/package-lock.json $FRONTEND_DIR/package-lock.json 2>/dev/null
    
    echo -e "${GREEN}✓ 回滚操作完成${NC}"
    echo ""
    exit 0
}

# 健康检查
health_check() {
    echo -e "${BLUE}=== 健康检查 ===${NC}"
    local url="http://localhost:$BACKEND_PORT/api/v1/health"
    local max_attempts=10
    local attempt=1
    
    echo "等待后端服务启动..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" $url | grep -q "200"; then
            echo -e "${GREEN}✓ 后端服务健康检查通过${NC}"
            echo -e "${BLUE}后端服务地址:${NC} http://localhost:$BACKEND_PORT"
            echo -e "${BLUE}健康检查地址:${NC} $url"
            echo ""
            return 0
        fi
        echo -e "${YELLOW}尝试 $attempt/$max_attempts: 后端服务未就绪...${NC}"
        attempt=$((attempt + 1))
        sleep 3
done
    
    echo -e "${RED}错误: 后端服务健康检查失败${NC}"
    return 1
}

# 部署后端服务
deploy_backend() {
    echo -e "${YELLOW}=== 部署后端服务 ===${NC}"
    cd $BACKEND_DIR
    
    # 复制环境变量文件
    if [ ! -f ".env" ]; then
        if [ -f ".env.$ENV" ]; then
            echo "使用 $ENV 环境变量配置..."
            cp .env.$ENV .env
        elif [ -f ".env.example" ]; then
            echo -e "${YELLOW}警告: 未找到 .env.$ENV，使用 .env.example${NC}"
            cp .env.example .env
        fi
    fi
    
    # 安装依赖
    echo "安装后端依赖..."
npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 后端依赖安装失败${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ 后端依赖安装成功${NC}"
    
    # 运行迁移和种子数据
    echo "运行数据库迁移..."
npm run migrate
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 数据库迁移失败${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ 数据库迁移成功${NC}"
    
    echo "运行种子数据..."
npm run seed
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}警告: 种子数据运行失败，但不影响部署${NC}"
    fi
    
    # 启动后端服务（非测试模式）
    if [ -z "$TEST_ONLY" ]; then
        echo "启动后端服务..."
        npm start &
        BACKEND_PID=$!
        echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}测试模式: 跳过后端服务启动${NC}"
    fi
    
    cd ..
    echo ""
    return 0
}

# 部署前端服务
deploy_frontend() {
    echo -e "${YELLOW}=== 部署前端服务 ===${NC}"
    cd $FRONTEND_DIR
    
    # 安装依赖
    echo "安装前端依赖..."
npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 前端依赖安装失败${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ 前端依赖安装成功${NC}"
    
    # 构建前端项目
    echo "构建前端项目..."
npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 前端构建失败${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ 前端构建成功${NC}"
    
    # 启动前端服务（非测试模式）
    if [ -z "$TEST_ONLY" ]; then
        echo "启动前端服务..."
        npm run preview &
        FRONTEND_PID=$!
        echo -e "${GREEN}✓ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}测试模式: 跳过前端服务启动${NC}"
    fi
    
    cd ..
    echo ""
    return 0
}

# 主流程
main() {
    # 检查依赖
    check_dependencies
    
    # 执行回滚（如果需要）
    if [ -n "$ROLLBACK" ]; then
        rollback_deployment
    fi
    
    # 部署后端
    if ! deploy_backend; then
        echo -e "${RED}错误: 后端部署失败${NC}"
        exit 1
    fi
    
    # 部署前端
    if ! deploy_frontend; then
        echo -e "${RED}错误: 前端部署失败${NC}"
        exit 1
    fi
    
    # 健康检查（非测试模式）
    if [ -z "$TEST_ONLY" ]; then
        if ! health_check; then
            echo -e "${RED}错误: 部署失败，健康检查未通过${NC}"
            exit 1
        fi
    fi
    
    # 部署完成
    echo -e "${GREEN}=== 部署完成 ===${NC}"
echo -e "${BLUE}部署环境:${NC} $ENV"
    if [ -z "$TEST_ONLY" ]; then
        echo -e "${YELLOW}后端服务:${NC} http://localhost:$BACKEND_PORT"
        echo -e "${YELLOW}前端服务:${NC} http://localhost:$FRONTEND_PORT"
        echo -e "${YELLOW}健康检查:${NC} http://localhost:$BACKEND_PORT/api/v1/health"
        echo ""
        echo -e "${YELLOW}注意事项:${NC}"
        echo "1. 生产环境建议使用 PM2 或其他进程管理工具"
        echo "2. 请确保数据库服务已正确配置"
        echo "3. 定期备份数据库数据"
        echo "4. 监控系统资源使用情况"
    else
        echo -e "${YELLOW}测试模式: 部署流程测试完成，服务未启动${NC}"
    fi
    echo ""
    echo -e "${GREEN}部署脚本执行完成！${NC}"
}

# 执行主流程
main