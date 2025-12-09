import fs from 'fs';
import path from 'path';
import Game from '../models/Game.js';
import GameVersion from '../models/GameVersion.js';
import GameLibrary from '../models/GameLibrary.js';
import logger from '../config/logger.js';

// 生成游戏下载链接
export const generateDownloadLink = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved', // 只允许下载已通过审核的游戏
      },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或不可下载',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法下载',
      });
    }

    // 获取最新版本
    const latestVersion = await GameVersion.findOne({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'file_url', 'file_size', 'platform'],
    });

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: '游戏暂无可用版本',
      });
    }

    // 生成临时下载链接（实际项目中应该生成带签名的临时链接）
    const downloadLink = {
      url: latestVersion.file_url,
      version: latestVersion.version_number,
      fileSize: latestVersion.file_size,
      platform: latestVersion.platform,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 链接1小时后过期
    };

    return res.status(200).json({
      success: true,
      message: '下载链接生成成功',
      data: downloadLink,
    });
  } catch (error) {
    logger.error('生成下载链接错误:', error);
    return res.status(500).json({
      success: false,
      message: '生成下载链接失败',
      error: error.message,
    });
  }
};

// 获取特定版本下载链接
export const getVersionDownloadLink = async (req, res) => {
  try {
    const { gameId, versionId } = req.params;
    const userId = req.user.id;

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved',
      },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或不可下载',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法下载',
      });
    }

    // 获取指定版本
    const version = await GameVersion.findByPk(versionId, {
      where: { game_id: gameId },
      attributes: ['id', 'version_number', 'file_url', 'file_size', 'platform'],
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        message: '指定版本不存在',
      });
    }

    // 生成临时下载链接
    const downloadLink = {
      url: version.file_url,
      version: version.version_number,
      fileSize: version.file_size,
      platform: version.platform,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: '下载链接生成成功',
      data: downloadLink,
    });
  } catch (error) {
    logger.error('生成特定版本下载链接错误:', error);
    return res.status(500).json({
      success: false,
      message: '生成下载链接失败',
      error: error.message,
    });
  }
};

// 获取游戏可用版本列表
export const getGameVersions = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved',
      },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法查看版本信息',
      });
    }

    // 获取所有版本
    const versions = await GameVersion.findAll({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'release_date', 'changelog', 'file_size', 'platform'],
    });

    return res.status(200).json({
      success: true,
      message: '获取游戏版本列表成功',
      data: versions,
    });
  } catch (error) {
    logger.error('获取游戏版本列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏版本列表失败',
      error: error.message,
    });
  }
};

// 更新游戏游玩时间
export const updatePlaytime = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { playtime, lastPlayedAt } = req.body;

    // 验证必填字段
    if (playtime === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供游玩时间',
      });
    }

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法更新游玩时间',
      });
    }

    // 更新游玩时间
    await gameLibrary.update({
      playtime: Math.max(0, playtime), // 确保游玩时间不为负数
      last_played_at: lastPlayedAt || new Date(),
    });

    return res.status(200).json({
      success: true,
      message: '游玩时间更新成功',
      data: gameLibrary,
    });
  } catch (error) {
    logger.error('更新游玩时间错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新游玩时间失败',
      error: error.message,
    });
  }
};

// 检查游戏更新
export const checkGameUpdate = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { currentVersion } = req.body;
    const userId = req.user.id;

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved',
      },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法检查更新',
      });
    }

    // 获取最新版本
    const latestVersion = await GameVersion.findOne({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'release_date', 'changelog', 'file_size', 'platform', 'file_url'],
    });

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: '游戏暂无可用版本',
      });
    }

    // 检查是否有新版本
    const hasUpdate = currentVersion !== latestVersion.version_number;

    return res.status(200).json({
      success: true,
      message: '检查更新成功',
      data: {
        hasUpdate,
        latestVersion: hasUpdate ? latestVersion : null,
      },
    });
  } catch (error) {
    logger.error('检查游戏更新错误:', error);
    return res.status(500).json({
      success: false,
      message: '检查更新失败',
      error: error.message,
    });
  }
};

// 处理文件下载（支持断点续传）
export const downloadFile = async (req, res) => {
  try {
    const { versionId, platform } = req.params;
    const userId = req.user.id;

    // 获取指定版本
    const version = await GameVersion.findByPk(versionId, {
      include: [{
        model: Game,
        where: {
          status: 'approved',
        },
      }],
    });

    if (!version) {
      logger.error(`[DOWNLOAD ERROR] Version not found: ${versionId} for user: ${userId}`);
      return res.status(404).json({
        success: false,
        message: '指定版本不存在或不可下载',
      });
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: version.game_id,
      },
    });

    if (!gameLibrary) {
      logger.error(`[DOWNLOAD ERROR] Unauthorized download attempt: user ${userId} for game ${version.game_id}`);
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法下载',
      });
    }

    // 构建实际文件路径
    const basePath = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads');
    const filePath = path.join(basePath, `${version.game_id}_${platform}_v${version.version_number}.${platform === 'windows' ? 'exe' : platform === 'mac' ? 'dmg' : platform === 'linux' ? 'deb' : 'apk'}`);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      logger.error(`[DOWNLOAD ERROR] File not found: ${filePath} for version ${versionId}`);
      return res.status(404).json({
        success: false,
        message: '下载文件不存在',
      });
    }

    // 获取文件信息
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    const { range } = req.headers;

    // 记录下载开始日志
    const downloadId = `${userId}_${Date.now()}`;
    logger.info(`[DOWNLOAD START] ID: ${downloadId}, User: ${userId}, Game: ${version.game_id}, Version: ${version.version_number}, Platform: ${platform}, IP: ${req.ip}`);

    // 处理断点续传
    if (range) {
      // 解析Range头
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      // 设置响应头
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${version.game.title}_v${version.version_number}_${platform}.${platform === 'windows' ? 'exe' : platform === 'mac' ? 'dmg' : platform === 'linux' ? 'deb' : 'apk'}"`,
        'X-Download-Id': downloadId,
        'X-Game-Id': version.game_id,
        'X-Version': version.version_number,
      });

      // 创建可读流并发送文件块
      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);

      // 监听流事件
      fileStream.on('end', () => {
        logger.info(`[DOWNLOAD COMPLETE] ID: ${downloadId}, User: ${userId}, Game: ${version.game_id}, Bytes: ${chunkSize}`);
      });

      fileStream.on('error', (err) => {
        logger.error(`[DOWNLOAD ERROR] ID: ${downloadId}, User: ${userId}, Error: ${err.message}`);
        res.status(500).end();
      });
    } else {
      // 完整文件下载
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${version.game.title}_v${version.version_number}_${platform}.${platform === 'windows' ? 'exe' : platform === 'mac' ? 'dmg' : platform === 'linux' ? 'deb' : 'apk'}"`,
        'Accept-Ranges': 'bytes',
        'X-Download-Id': downloadId,
        'X-Game-Id': version.game_id,
        'X-Version': version.version_number,
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        logger.info(`[DOWNLOAD COMPLETE] ID: ${downloadId}, User: ${userId}, Game: ${version.game_id}, Bytes: ${fileSize}`);
      });

      fileStream.on('error', (err) => {
        logger.error(`[DOWNLOAD ERROR] ID: ${downloadId}, User: ${userId}, Error: ${err.message}`);
        res.status(500).end();
      });
    }
  } catch (error) {
    logger.error(`[DOWNLOAD ERROR] General error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '下载过程中发生错误',
    });
  }
};

// 获取客户端下载信息
export const getClientDownloadInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // 准备多平台客户端下载信息
    const clientDownloads = [
      {
        platform: 'windows',
        version: '1.0.0',
        size: '50.2 MB',
        downloadUrl: '/api/v1/download/client/windows',
        filename: 'GameStore_Client_Windows.exe',
        minOsVersion: '8.0',
        recommended: true,
      },
      {
        platform: 'mac',
        version: '1.0.0',
        size: '45.7 MB',
        downloadUrl: '/api/v1/download/client/mac',
        filename: 'GameStore_Client_Mac.dmg',
        minOsVersion: '13.0',
      },
      {
        platform: 'linux',
        version: '1.0.0',
        size: '38.5 MB',
        downloadUrl: '/api/v1/download/client/linux',
        filename: 'GameStore_Client_Linux.deb',
        minOsVersion: 'Ubuntu 20.04',
      },
      {
        platform: 'android',
        version: '1.0.0',
        size: '25.3 MB',
        downloadUrl: '/api/v1/download/client/android',
        filename: 'GameStore_Client_Android.apk',
        minOsVersion: '8.0',
      },
      {
        platform: 'ios',
        version: '1.0.0',
        size: '32.8 MB',
        downloadUrl: 'https://apps.apple.com/app/gamestore-client/id123456789',
        filename: 'GameStore_Client_iOS.ipa',
        minOsVersion: '13.0',
        directDownload: false,
      },
    ];

    logger.info(`[CLIENT DOWNLOAD INFO] User: ${userId}, Requested download info`);

    return res.status(200).json({
      success: true,
      message: '获取客户端下载信息成功',
      data: clientDownloads,
    });
  } catch (error) {
    logger.error(`[CLIENT DOWNLOAD ERROR] Failed to get download info: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '获取客户端下载信息失败',
      error: error.message,
    });
  }
};

// 处理客户端下载
export const downloadClient = async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user?.id || 'anonymous';

    // 支持的平台
    const supportedPlatforms = ['windows', 'mac', 'linux', 'android'];
    if (!supportedPlatforms.includes(platform)) {
      logger.error(`[CLIENT DOWNLOAD ERROR] Invalid platform: ${platform} requested by ${userId}`);
      return res.status(400).json({
        success: false,
        message: '不支持的平台',
      });
    }

    // 构建客户端文件路径
    const basePath = process.env.CLIENT_DOWNLOAD_PATH || path.join(process.cwd(), 'client-downloads');
    const filePath = path.join(basePath, `GameStore_Client_${platform === 'windows' ? 'Windows.exe' : platform === 'mac' ? 'Mac.dmg' : platform === 'linux' ? 'Linux.deb' : 'Android.apk'}`);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      logger.error(`[CLIENT DOWNLOAD ERROR] Client file not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: '客户端安装包不存在',
      });
    }

    // 获取文件信息
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    const { range } = req.headers;

    // 记录下载日志
    const downloadId = `${userId}_client_${Date.now()}`;
    logger.info(`[CLIENT DOWNLOAD START] ID: ${downloadId}, User: ${userId}, Platform: ${platform}, IP: ${req.ip}`);

    // 处理断点续传
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="GameStore_Client_${platform === 'windows' ? 'Windows.exe' : platform === 'mac' ? 'Mac.dmg' : platform === 'linux' ? 'Linux.deb' : 'Android.apk'}"`,
        'X-Download-Id': downloadId,
        'X-Platform': platform,
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);

      fileStream.on('end', () => {
        logger.info(`[CLIENT DOWNLOAD COMPLETE] ID: ${downloadId}, User: ${userId}, Platform: ${platform}, Bytes: ${chunkSize}`);
      });

      fileStream.on('error', (err) => {
        logger.error(`[CLIENT DOWNLOAD ERROR] ID: ${downloadId}, User: ${userId}, Error: ${err.message}`);
        res.status(500).end();
      });
    } else {
      // 完整文件下载
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="GameStore_Client_${platform === 'windows' ? 'Windows.exe' : platform === 'mac' ? 'Mac.dmg' : platform === 'linux' ? 'Linux.deb' : 'Android.apk'}"`,
        'Accept-Ranges': 'bytes',
        'X-Download-Id': downloadId,
        'X-Platform': platform,
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        logger.info(`[CLIENT DOWNLOAD COMPLETE] ID: ${downloadId}, User: ${userId}, Platform: ${platform}, Bytes: ${fileSize}`);
      });

      fileStream.on('error', (err) => {
        logger.error(`[CLIENT DOWNLOAD ERROR] ID: ${downloadId}, User: ${userId}, Error: ${err.message}`);
        res.status(500).end();
      });
    }
  } catch (error) {
    logger.error(`[CLIENT DOWNLOAD ERROR] General error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '客户端下载失败',
      error: error.message,
    });
  }
};
