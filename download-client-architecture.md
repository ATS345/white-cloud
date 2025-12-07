# 下载客户端架构设计

## 1. 整体架构

### 1.1 前端架构

- **设备检测模块**：检测用户设备类型和操作系统版本
- **下载按钮组件**：触发下载请求
- **下载管理器**：管理下载任务，包括开始、暂停、恢复、取消等操作
- **进度显示组件**：实时显示下载进度、速度、剩余时间等信息
- **状态管理**：使用Redux管理下载状态
- **下载完成处理**：显示安装指引，处理安装流程

### 1.2 后端架构

- **下载处理路由**：接收下载请求，返回下载链接或直接处理文件传输
- **设备检测API**：根据User-Agent检测设备类型
- **文件传输模块**：支持断点续传和多线程下载
- **下载验证机制**：防止非法下载请求
- **下载监控系统**：记录下载日志，统计下载成功率
- **安装包存储**：管理不同平台的安装包

## 2. 详细流程设计

### 2.1 用户点击下载按钮

1. 前端检测设备类型和操作系统版本
2. 前端发送下载请求到后端
3. 后端验证请求合法性
4. 后端返回适合的安装包下载链接或直接开始文件传输

### 2.2 文件传输流程

1. 前端发起文件下载请求，支持Range头用于断点续传
2. 后端检查Range头，支持断点续传
3. 后端使用多线程发送文件数据
4. 前端实时计算下载速度和剩余时间
5. 前端更新下载进度显示

### 2.3 下载状态管理

- **下载中**：显示下载进度条、速度、剩余时间
- **暂停**：显示暂停按钮，支持恢复下载
- **完成**：显示安装指引，引导用户安装
- **失败**：显示失败原因，支持重试

## 3. 技术实现方案

### 3.1 前端实现

- 使用React 18 + Vite
- Material-UI组件库
- Redux状态管理
- Axios用于HTTP请求
- Web Workers用于处理文件下载，避免阻塞主线程

### 3.2 后端实现

- Node.js + Express
- Sequelize ORM
- 支持Range头的文件传输
- 多线程文件读取和发送
- Redis用于缓存下载任务信息

## 4. 数据库设计

### 4.1 下载任务表

```sql
CREATE TABLE download_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  device_info JSON NOT NULL,
  file_id INT NOT NULL,
  status ENUM('pending', 'downloading', 'paused', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  progress INT NOT NULL DEFAULT 0,
  speed VARCHAR(20),
  remaining_time VARCHAR(20),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### 4.2 安装包信息表

```sql
CREATE TABLE install_packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform ENUM('windows', 'mac', 'linux', 'android', 'ios') NOT NULL,
  version VARCHAR(20) NOT NULL,
  file_name VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  download_url VARCHAR(255) NOT NULL,
  min_os_version VARCHAR(20),
  max_os_version VARCHAR(20),
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

## 5. API设计

### 5.1 下载请求API

```
POST /api/v1/download/client
Request Body:
{
  "device_info": {
    "platform": "windows",
    "os_version": "10.0",
    "browser": "chrome",
    "browser_version": "120.0"
  }
}

Response:
{
  "success": true,
  "message": "下载链接生成成功",
  "data": {
    "download_url": "http://localhost:5000/api/v1/download/file/1",
    "file_size": 50000000,
    "file_name": "muyu-client-windows-v1.0.0.exe",
    "version": "v1.0.0",
    "platform": "windows"
  }
}
```

### 5.2 文件下载API

```
GET /api/v1/download/file/:fileId
Headers:
Range: bytes=0-1023

Response:
Status: 206 Partial Content
Headers:
Content-Range: bytes 0-1023/50000000
Content-Length: 1024
Content-Type: application/octet-stream
Content-Disposition: attachment; filename=muyu-client-windows-v1.0.0.exe

Body: 文件数据
```

## 6. 监控和日志

### 6.1 日志记录

- 下载请求日志：记录用户ID、设备信息、文件信息等
- 下载过程日志：记录下载开始、暂停、恢复、完成、失败等事件
- 下载统计日志：统计下载成功率、失败原因等信息

### 6.2 统计指标

- 下载成功率：下载成功的次数 / 总下载请求次数
- 平均下载时间：总下载时间 / 下载成功次数
- 失败原因分布：不同失败原因的比例
- 设备分布：不同设备类型的下载比例

## 7. 安全性考虑

- 下载请求验证：使用Token验证用户身份
- 文件完整性验证：使用MD5或SHA256验证文件完整性
- 防止恶意下载：限制同一IP的下载频率
- 加密传输：使用HTTPS保证传输安全

## 8. 性能优化

- 断点续传：支持断点续传，避免网络中断导致重新下载
- 多线程下载：提高下载速度
- CDN加速：使用CDN加速文件传输
- 缓存机制：缓存安装包信息，减少数据库查询
- 异步处理：使用异步IO处理文件传输，提高并发处理能力

## 9. 兼容性考虑

- 支持主流浏览器：Chrome、Firefox、Safari、Edge
- 支持主流操作系统：Windows 8.0+、macOS 10.15+、Linux (Ubuntu 20.04+)
- 支持移动设备：Android 8.0+、iOS 13.0+
- 支持不同网络环境：弱网、网络切换等情况
