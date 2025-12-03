import Game from '../models/Game.js'
import GameVersion from '../models/GameVersion.js'
import GameLibrary from '../models/GameLibrary.js'

// 生成游戏下载链接
export const generateDownloadLink = async (req, res) => {
  try {
    const { gameId } = req.params
    const userId = req.user.id

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved' // 只允许下载已通过审核的游戏
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或不可下载'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法下载'
      })
    }

    // 获取最新版本
    const latestVersion = await GameVersion.findOne({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'file_url', 'file_size', 'platform']
    })

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: '游戏暂无可用版本'
      })
    }

    // 生成临时下载链接（实际项目中应该生成带签名的临时链接）
    const downloadLink = {
      url: latestVersion.file_url,
      version: latestVersion.version_number,
      fileSize: latestVersion.file_size,
      platform: latestVersion.platform,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 链接1小时后过期
    }

    return res.status(200).json({
      success: true,
      message: '下载链接生成成功',
      data: downloadLink
    })
  } catch (error) {
    console.error('生成下载链接错误:', error)
    return res.status(500).json({
      success: false,
      message: '生成下载链接失败',
      error: error.message
    })
  }
}

// 获取特定版本下载链接
export const getVersionDownloadLink = async (req, res) => {
  try {
    const { gameId, versionId } = req.params
    const userId = req.user.id

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved'
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或不可下载'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法下载'
      })
    }

    // 获取指定版本
    const version = await GameVersion.findByPk(versionId, {
      where: { game_id: gameId },
      attributes: ['id', 'version_number', 'file_url', 'file_size', 'platform']
    })

    if (!version) {
      return res.status(404).json({
        success: false,
        message: '指定版本不存在'
      })
    }

    // 生成临时下载链接
    const downloadLink = {
      url: version.file_url,
      version: version.version_number,
      fileSize: version.file_size,
      platform: version.platform,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }

    return res.status(200).json({
      success: true,
      message: '下载链接生成成功',
      data: downloadLink
    })
  } catch (error) {
    console.error('生成特定版本下载链接错误:', error)
    return res.status(500).json({
      success: false,
      message: '生成下载链接失败',
      error: error.message
    })
  }
}

// 获取游戏可用版本列表
export const getGameVersions = async (req, res) => {
  try {
    const { gameId } = req.params
    const userId = req.user.id

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved'
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法查看版本信息'
      })
    }

    // 获取所有版本
    const versions = await GameVersion.findAll({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'release_date', 'changelog', 'file_size', 'platform']
    })

    return res.status(200).json({
      success: true,
      message: '获取游戏版本列表成功',
      data: versions
    })
  } catch (error) {
    console.error('获取游戏版本列表错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取游戏版本列表失败',
      error: error.message
    })
  }
}

// 更新游戏游玩时间
export const updatePlaytime = async (req, res) => {
  try {
    const { gameId } = req.params
    const userId = req.user.id
    const { playtime, lastPlayedAt } = req.body

    // 验证必填字段
    if (playtime === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供游玩时间'
      })
    }

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId)

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法更新游玩时间'
      })
    }

    // 更新游玩时间
    await gameLibrary.update({
      playtime: Math.max(0, playtime), // 确保游玩时间不为负数
      last_played_at: lastPlayedAt || new Date()
    })

    return res.status(200).json({
      success: true,
      message: '游玩时间更新成功',
      data: gameLibrary
    })
  } catch (error) {
    console.error('更新游玩时间错误:', error)
    return res.status(500).json({
      success: false,
      message: '更新游玩时间失败',
      error: error.message
    })
  }
}

// 检查游戏更新
export const checkGameUpdate = async (req, res) => {
  try {
    const { gameId } = req.params
    const { currentVersion } = req.body
    const userId = req.user.id

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved'
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法检查更新'
      })
    }

    // 获取最新版本
    const latestVersion = await GameVersion.findOne({
      where: { game_id: gameId },
      order: [['release_date', 'desc']],
      attributes: ['id', 'version_number', 'release_date', 'changelog', 'file_size', 'platform', 'file_url']
    })

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: '游戏暂无可用版本'
      })
    }

    // 检查是否有新版本
    const hasUpdate = currentVersion !== latestVersion.version_number

    return res.status(200).json({
      success: true,
      message: '检查更新成功',
      data: {
        hasUpdate,
        latestVersion: hasUpdate ? latestVersion : null
      }
    })
  } catch (error) {
    console.error('检查游戏更新错误:', error)
    return res.status(500).json({
      success: false,
      message: '检查更新失败',
      error: error.message
    })
  }
}