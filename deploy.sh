#!/bin/bash

# 游戏商店平台部署脚本

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 木鱼游戏平台部署脚本 ===${NC}"
echo ""

# 检查 Node.js 和 npm 是否安装
if ! command -v node &> /dev/null
then
    echo -e "${RED}错误: Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null
then
    echo -e "${RED}错误: npm 未安装，请先安装 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 和 npm 已安装${NC}"
echo ""

# 部署后端服务
echo -e "${YELLOW}=== 部署后端服务 ===${NC}"
cd backend

# 安装依赖
echo "安装后端依赖..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 后端依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 后端依赖安装成功${NC}"

# 运行迁移和种子数据
echo "运行数据库迁移..."
npm run migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 数据库迁移失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库迁移成功${NC}"

echo "运行种子数据..."
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}警告: 种子数据运行失败，但不影响部署${NC}"
fi

# 启动后端服务
echo "启动后端服务..."
npm start &
BACKEND_PID=$!
echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
echo ""

# 部署前端服务
echo -e "${YELLOW}=== 部署前端服务 ===${NC}"
cd ../frontend

# 安装依赖
echo "安装前端依赖..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 前端依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端依赖安装成功${NC}"

# 构建前端项目
echo "构建前端项目..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 前端构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端构建成功${NC}"

# 启动前端服务
echo "启动前端服务..."
npm run preview &
FRONTEND_PID=$!
echo -e "${GREEN}✓ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
echo ""

# 显示部署完成信息
echo -e "${GREEN}=== 部署完成 ===${NC}"
echo -e "${YELLOW}后端服务:${NC} http://localhost:5000"
echo -e "${YELLOW}前端服务:${NC} http://localhost:3000"
echo -e "${YELLOW}健康检查:${NC} http://localhost:5000/api/v1/health"
echo ""
echo -e "${YELLOW}注意事项:${NC}"
echo "1. 请确保数据库服务已启动"
echo "2. 请确保 Redis 服务已启动（如果使用）"
echo "3. 生产环境请使用 PM2 或其他进程管理工具"
echo "4. 生产环境请配置正确的环境变量"
echo ""
echo -e "${GREEN}部署脚本执行完成！${NC}"