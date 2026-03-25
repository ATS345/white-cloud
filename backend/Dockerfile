# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npx prisma generate

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# 创建数据目录
RUN mkdir -p /app/data && mkdir -p /app/uploads && mkdir -p /app/logs

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/prod.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
