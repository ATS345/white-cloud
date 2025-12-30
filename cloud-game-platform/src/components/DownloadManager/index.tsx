import { useState, useEffect } from 'react';
import { Modal, List, Progress, Button, Tag, Tooltip } from 'antd';
import { 
  DownloadOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import './index.css';

interface DownloadItem {
  id: number;
  name: string;
  gameId: number;
  progress: number;
  speed: string;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';
  size: string;
  downloaded: string;
  eta: string;
  image: string;
}

interface DownloadManagerProps {
  visible: boolean;
  onClose: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ visible, onClose }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: 1,
      name: '原神',
      gameId: 1,
      progress: 65,
      speed: '1.2 MB/s',
      status: 'downloading',
      size: '30 GB',
      downloaded: '19.5 GB',
      eta: '1小时20分钟',
      image: 'https://picsum.photos/seed/game1/100/60',
    },
    {
      id: 2,
      name: '赛博朋克2077',
      gameId: 2,
      progress: 100,
      speed: '0 KB/s',
      status: 'completed',
      size: '70 GB',
      downloaded: '70 GB',
      eta: '0分钟',
      image: 'https://picsum.photos/seed/game2/100/60',
    },
    {
      id: 3,
      name: '艾尔登法环',
      gameId: 3,
      progress: 30,
      speed: '0 KB/s',
      status: 'paused',
      size: '50 GB',
      downloaded: '15 GB',
      eta: '2小时30分钟',
      image: 'https://picsum.photos/seed/game3/100/60',
    },
  ]);

  // 模拟下载进度更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible) {
      interval = setInterval(() => {
        setDownloads(prevDownloads =>
          prevDownloads.map(download => {
            if (download.status === 'downloading') {
              const newProgress = Math.min(download.progress + 1, 100);
              const newDownloaded = (parseFloat(download.size) * (newProgress / 100)).toFixed(1);
              const newSpeed = `${(Math.random() * 2 + 0.5).toFixed(1)} MB/s`;
              const newEta = `${Math.max(Math.floor((100 - newProgress) / 0.5), 0)}分钟`;
              
              return {
                ...download,
                progress: newProgress,
                downloaded: `${newDownloaded} GB`,
                speed: newSpeed,
                eta: newEta,
                status: newProgress === 100 ? 'completed' : 'downloading',
              };
            }
            return download;
          })
        );
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [visible]);

  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="blue">等待中</Tag>;
      case 'downloading':
        return <Tag color="green">下载中</Tag>;
      case 'paused':
        return <Tag color="orange">已暂停</Tag>;
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      case 'failed':
        return <Tag color="error">下载失败</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  // 获取操作按钮
  const getActionButton = (download: DownloadItem) => {
    switch (download.status) {
      case 'downloading':
        return (
          <Tooltip title="暂停下载">
            <Button 
              type="text" 
              icon={<PauseCircleOutlined />} 
              onClick={() => pauseDownload(download.id)}
            />
          </Tooltip>
        );
      case 'paused':
        return (
          <Tooltip title="继续下载">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => resumeDownload(download.id)}
            />
          </Tooltip>
        );
      case 'completed':
        return (
          <Tooltip title="开始游戏">
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              onClick={() => playGame(download.gameId)}
            >
              开始游戏
            </Button>
          </Tooltip>
        );
      case 'pending':
        return (
          <Tooltip title="开始下载">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => startDownload(download.id)}
            />
          </Tooltip>
        );
      case 'failed':
        return (
          <Tooltip title="重新下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => retryDownload(download.id)}
            />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // 开始下载
  const startDownload = (id: number) => {
    setDownloads(prevDownloads =>
      prevDownloads.map(download =>
        download.id === id ? { ...download, status: 'downloading' } : download
      )
    );
  };

  // 暂停下载
  const pauseDownload = (id: number) => {
    setDownloads(prevDownloads =>
      prevDownloads.map(download =>
        download.id === id ? { ...download, status: 'paused' } : download
      )
    );
  };

  // 继续下载
  const resumeDownload = (id: number) => {
    setDownloads(prevDownloads =>
      prevDownloads.map(download =>
        download.id === id ? { ...download, status: 'downloading' } : download
      )
    );
  };

  // 重试下载
  const retryDownload = (id: number) => {
    setDownloads(prevDownloads =>
      prevDownloads.map(download =>
        download.id === id ? { ...download, status: 'downloading', progress: 0 } : download
      )
    );
  };

  // 删除下载
  const deleteDownload = (id: number) => {
    setDownloads(prevDownloads => prevDownloads.filter(download => download.id !== id));
  };

  // 开始游戏
  const playGame = (gameId: number) => {
    console.log(`开始游戏: ${gameId}`);
    // 实际实现中，这里会调用游戏启动程序
  };

  return (
    <Modal
      title="下载管理"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="download-manager-modal"
    >
      <List
        dataSource={downloads}
        renderItem={(download) => (
          <List.Item
            key={download.id}
            className="download-item"
            actions={[
              getActionButton(download),
              <Tooltip title="删除下载">
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  onClick={() => deleteDownload(download.id)}
                  danger
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={<img src={download.image} alt={download.name} className="download-item-image" />}
              title={download.name}
              description={
                <>
                  <div className="download-item-progress">
                    <Progress 
                      percent={download.progress} 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }} 
                      showInfo={false}
                    />
                    <span className="progress-text">{download.progress}%</span>
                  </div>
                  <div className="download-item-info">
                    <span className="download-status">{getStatusTag(download.status)}</span>
                    <span className="download-speed">速度: {download.speed}</span>
                    <span className="download-size">{download.downloaded} / {download.size}</span>
                    <span className="download-eta">预计剩余: {download.eta}</span>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
      {downloads.length === 0 && (
        <div className="empty-downloads">
          <CheckCircleOutlined className="empty-icon" />
          <p>暂无下载任务</p>
        </div>
      )}
    </Modal>
  );
};

export default DownloadManager;
