// 下载管理器工具

/**
 * 下载管理器类
 * 用于管理下载任务，支持开始、暂停、恢复、取消等操作
 */
export class DownloadManager {
  constructor() {
    this.tasks = new Map(); // 存储所有下载任务
    this.onProgress = null; // 进度回调
    this.onStatusChange = null; // 状态变化回调
  }

  /**
   * 开始下载文件
   * @param {Object} options 下载选项
   * @param {string} options.url 下载URL
   * @param {string} options.filename 文件名
   * @param {Function} options.onProgress 进度回调
   * @param {Function} options.onStatusChange 状态变化回调
   * @returns {string} 下载任务ID
   */
  startDownload(options) {
    const { url, filename, onProgress, onStatusChange } = options;
    const taskId = `download_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 创建下载任务
    const task = {
      id: taskId,
      url,
      filename,
      status: 'pending', // pending, downloading, paused, completed, failed
      progress: 0,
      speed: 0,
      size: 0,
      downloaded: 0,
      remainingTime: null,
      startTime: null,
      endTime: null,
      xhr: null,
      onProgress,
      onStatusChange
    };

    this.tasks.set(taskId, task);
    this._startDownloadTask(task);
    
    return taskId;
  }

  /**
   * 开始下载任务
   * @private
   */
  _startDownloadTask(task) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', task.url, true);
    xhr.responseType = 'blob';
    
    // 用于计算下载速度
    let lastDownloaded = 0;
    let lastTime = 0;
    
    xhr.addEventListener('loadstart', () => {
      task.status = 'downloading';
      task.startTime = Date.now();
      lastTime = task.startTime;
      this._updateTaskStatus(task);
    });
    
    xhr.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        task.size = event.total;
        task.downloaded = event.loaded;
        task.progress = Math.round((event.loaded / event.total) * 100);
        
        // 计算下载速度
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTime;
        const downloadedDiff = event.loaded - lastDownloaded;
        
        if (timeDiff > 0) {
          // 速度（字节/秒）
          task.speed = downloadedDiff / (timeDiff / 1000);
          // 剩余时间（秒）
          const remainingBytes = event.total - event.loaded;
          task.remainingTime = Math.round(remainingBytes / task.speed);
        }
        
        lastDownloaded = event.loaded;
        lastTime = currentTime;
        
        this._updateTaskProgress(task);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        task.status = 'completed';
        task.endTime = Date.now();
        this._updateTaskStatus(task);
        this._saveFile(xhr.response, task.filename);
      } else {
        task.status = 'failed';
        task.error = `HTTP Error ${xhr.status}`;
        this._updateTaskStatus(task);
      }
    });
    
    xhr.addEventListener('error', () => {
      task.status = 'failed';
      task.error = 'Network Error';
      this._updateTaskStatus(task);
    });
    
    xhr.addEventListener('abort', () => {
      task.status = 'paused';
      this._updateTaskStatus(task);
    });
    
    task.xhr = xhr;
    xhr.send();
  }

  /**
   * 暂停下载任务
   * @param {string} taskId 任务ID
   */
  pauseDownload(taskId) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'downloading') {
      task.xhr.abort();
      task.status = 'paused';
      this._updateTaskStatus(task);
    }
  }

  /**
   * 恢复下载任务
   * @param {string} taskId 任务ID
   */
  resumeDownload(taskId) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      this._startDownloadTask(task);
    }
  }

  /**
   * 取消下载任务
   * @param {string} taskId 任务ID
   */
  cancelDownload(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      if (task.xhr && (task.status === 'downloading' || task.status === 'paused')) {
        task.xhr.abort();
      }
      this.tasks.delete(taskId);
      this._updateTaskStatus(task, true);
    }
  }

  /**
   * 获取下载任务状态
   * @param {string} taskId 任务ID
   * @returns {Object|null} 任务状态对象
   */
  getTaskStatus(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * 获取所有下载任务
   * @returns {Array} 所有任务列表
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * 更新任务进度
   * @private
   */
  _updateTaskProgress(task) {
    if (task.onProgress) {
      task.onProgress({
        id: task.id,
        progress: task.progress,
        speed: this._formatSpeed(task.speed),
        remainingTime: this._formatTime(task.remainingTime),
        size: this._formatSize(task.size),
        downloaded: this._formatSize(task.downloaded)
      });
    }
    
    if (this.onProgress) {
      this.onProgress({
        id: task.id,
        progress: task.progress,
        speed: this._formatSpeed(task.speed),
        remainingTime: this._formatTime(task.remainingTime),
        size: this._formatSize(task.size),
        downloaded: this._formatSize(task.downloaded)
      });
    }
  }

  /**
   * 更新任务状态
   * @private
   */
  _updateTaskStatus(task, isRemoved = false) {
    const statusUpdate = {
      id: task.id,
      status: task.status,
      isRemoved
    };
    
    if (task.onStatusChange) {
      task.onStatusChange(statusUpdate);
    }
    
    if (this.onStatusChange) {
      this.onStatusChange(statusUpdate);
    }
  }

  /**
   * 保存文件到本地
   * @private
   */
  _saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * 格式化文件大小
   * @private
   */
  _formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化下载速度
   * @private
   */
  _formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化时间
   * @private
   */
  _formatTime(seconds) {
    if (!seconds || seconds < 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// 创建单例实例
export const downloadManager = new DownloadManager();
