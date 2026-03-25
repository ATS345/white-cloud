#!/bin/bash
# 数据库备份脚本 - Linux/macOS
# 云幕游戏商店平台 v1.0.0

set -e

BACKUP_TYPE="${1:-full}"
RETENTION_DAYS=30

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backup"
DB_PATH="$PROJECT_ROOT/backend/prisma/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

log() {
    local level="${2:-INFO}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $1" | tee -a "$LOG_FILE"
}

main() {
    log "========== 开始备份 =========="
    log "备份类型: $BACKUP_TYPE"
    
    mkdir -p "$BACKUP_DIR"
    
    if [ ! -f "$DB_PATH" ]; then
        log "数据库文件不存在: $DB_PATH" "ERROR"
        exit 1
    fi
    
    BACKUP_FILE="$BACKUP_DIR/dev_$DATE.db"
    
    log "备份源: $DB_PATH"
    log "备份目标: $BACKUP_FILE"
    
    cp "$DB_PATH" "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ]; then
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "备份成功! 文件大小: $FILE_SIZE"
    else
        log "备份文件创建失败" "ERROR"
        exit 1
    fi
    
    find "$BACKUP_DIR" -name "*.db" -mtime +$RETENTION_DAYS -delete
    
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)
    log "当前备份数量: $BACKUP_COUNT"
    
    log "========== 备份完成 =========="
}

main
