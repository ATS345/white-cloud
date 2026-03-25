# 下载文件目录

请将实际的安装包文件放置在此目录中：

- `yunmu-game-store-setup.exe` - Windows 安装包
- `yunmu-game-store.dmg` - macOS 安装包  
- `yunmu-game-store.apk` - Android 安装包

## 构建安装包

运行以下命令构建安装包：

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 注意事项

1. 安装包文件较大，不应提交到 Git 仓库
2. 建议使用 CDN 分发安装包
3. 生产环境应配置正确的下载服务器
