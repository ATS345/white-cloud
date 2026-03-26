# 数据备份策略

## 备份概述

本文档定义了云幕游戏商店平台的数据备份策略，确保数据安全和业务连续性。

---

## 备份类型

| 类型 | 描述 | 频率 | 保留时间 |
|------|------|------|----------|
| 完整备份 | 备份整个数据库文件 | 每日 02:00 | 30 天 |
| 增量备份 | 备份变更数据 | 每小时 | 7 天 |
| 手动备份 | 发布前/重大变更前 | 按需 | 永久 |

---

## 备份脚本

### Windows PowerShell 脚本

```powershell
# backup.ps1 - 数据库备份脚本

param(
    [string]$BackupType = "full"
)

$ProjectRoot = "c:\项目开发\游戏商店平台项目开发"
$BackupDir = "$ProjectRoot\backup"
$DbPath = "$ProjectRoot\backend\prisma\dev.db"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"

# 确保备份目录存在
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force
}

# 备份文件名
$BackupFile = "$BackupDir\dev_$Date.db"

# 执行备份
Write-Host "开始备份: $BackupFile"
Copy-Item $DbPath $BackupFile -Force

# 验证备份
if (Test-Path $BackupFile) {
    $FileSize = (Get-Item $BackupFile).Length / 1KB
    Write-Host "备份成功! 文件大小: $FileSize KB"
} else {
    Write-Host "备份失败!" -ForegroundColor Red
    exit 1
}

# 清理旧备份 (保留最近30天)
$OldBackups = Get-ChildItem $BackupDir -Filter "*.db" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }

foreach ($Backup in $OldBackups) {
    Remove-Item $Backup.FullName -Force
    Write-Host "已删除旧备份: $($Backup.Name)"
}

Write-Host "备份完成!"
```

### Linux/macOS Shell 脚本

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

PROJECT_ROOT="/opt/yunmu-game-store"
BACKUP_DIR="$PROJECT_ROOT/backup"
DB_PATH="$PROJECT_ROOT/backend/prisma/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 确保备份目录存在
mkdir -p $BACKUP_DIR

# 备份文件名
BACKUP_FILE="$BACKUP_DIR/dev_$DATE.db"

# 执行备份
echo "开始备份: $BACKUP_FILE"
cp $DB_PATH $BACKUP_FILE

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "备份成功! 文件大小: $FILE_SIZE"
else
    echo "备份失败!"
    exit 1
fi

# 清理旧备份 (保留最近30天)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "备份完成!"
```

---

## 自动化配置

### Windows 任务计划

```powershell
# 创建每日备份任务
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File c:\项目开发\游戏商店平台项目开发\scripts\backup.ps1"

$Trigger = New-ScheduledTaskTrigger -Daily -At 2am

$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "YunmuGameStore_Backup" `
    -Action $Action -Trigger $Trigger -Settings $Settings `
    -Description "云幕游戏商店数据库每日备份"
```

### Linux Cron

```bash
# 添加到 crontab
# 每日 02:00 执行备份
0 2 * * * /opt/yunmu-game-store/scripts/backup.sh >> /var/log/yunmu-backup.log 2>&1
```

---

## 恢复流程

### 从备份恢复

```powershell
# Windows
$BackupFile = "backup\dev_20260319_020000.db"
Copy-Item $BackupFile "backend\prisma\dev.db" -Force

# 验证数据库
Set-Location backend
npx prisma db pull --print
```

```bash
# Linux/macOS
cp backup/dev_20260319_020000.db backend/prisma/dev.db

# 验证数据库
cd backend && npx prisma db pull --print
```

---

## 备份验证清单

- [ ] 备份文件已创建
- [ ] 备份文件大小正常 (>0 bytes)
- [ ] 备份文件可读取
- [ ] 旧备份已清理
- [ ] 备份日志已记录

---

## 监控告警

### 备份失败告警

- 检查备份文件是否存在
- 检查备份文件大小是否异常
- 检查备份任务执行状态

### 告警阈值

| 指标 | 阈值 | 动作 |
|------|------|------|
| 备份失败 | 1 次 | 发送通知 |
| 连续失败 | 3 次 | 发送紧急告警 |
| 磁盘空间 | < 10% | 发送警告 |
