import models from '../../models/index.js'
import logger from '../../config/logger.js'

// 从models中获取所有需要的模型
const { GameLibrary, GameData } = models

// 游戏数据同步API
export const syncGameData = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const syncData = req.body // 要同步的游戏数据

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法同步数据'
      })
    }

    // 2. 准备数据
    const { data_type = 'save_data', data_name = 'autosave', data_content } = syncData
    
    if (!data_content) {
      return res.status(400).json({
        success: false,
        message: '同步数据不能为空'
      })
    }

    // 3. 计算数据大小
    const dataSize = Buffer.byteLength(JSON.stringify(data_content), 'utf8')

    // 4. 保存或更新游戏数据
    const [gameData, created] = await GameData.findOrCreate({
      where: {
        user_id: userId,
        game_id: gameId,
        data_type,
        data_name
      },
      defaults: {
        data_content,
        data_size: dataSize,
        last_modified_at: new Date()
      }
    })

    // 如果数据已存在，则更新
    if (!created) {
      await gameData.update({
        data_content,
        data_size: dataSize,
        last_modified_at: new Date()
      })
    }

    // 5. 记录同步日志
    logger.info(`User ${userId} synced ${data_type} for game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: created ? '游戏数据同步成功' : '游戏数据更新成功',
      data: {
        gameId,
        syncTime: new Date().toISOString(),
        syncedData: {
          data_type,
          data_name,
          data_size: dataSize
        },
        isNew: created
      }
    })
  } catch (error) {
    logger.error('游戏数据同步错误:', error)
    res.status(500).json({
      success: false,
      message: '游戏数据同步失败',
      error: error.message
    })
  }
}

// 获取游戏数据API
export const getGameData = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const { data_type, data_name } = req.query

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法获取数据'
      })
    }

    // 2. 构建查询条件
    const whereConditions = {
      user_id: userId,
      game_id: gameId
    }

    if (data_type) {
      whereConditions.data_type = data_type
    }

    if (data_name) {
      whereConditions.data_name = data_name
    }

    // 3. 查询游戏数据
    const gameData = await GameData.findAll({
      where: whereConditions,
      order: [['last_modified_at', 'desc']]
    })

    res.status(200).json({
      success: true,
      message: '游戏数据获取成功',
      data: {
        gameId,
        data: gameData
      }
    })
  } catch (error) {
    logger.error('获取游戏数据错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏数据失败',
      error: error.message
    })
  }
}

// 删除游戏数据API
export const deleteGameData = async (req, res) => {
  try {
    const { gameId, dataId } = req.params
    const { userId } = req.user

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法删除数据'
      })
    }

    // 2. 删除游戏数据
    const deletedCount = await GameData.destroy({
      where: {
        id: dataId,
        user_id: userId,
        game_id: gameId
      }
    })

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏数据不存在或已被删除'
      })
    }

    // 3. 记录删除日志
    logger.info(`User ${userId} deleted game data ${dataId} for game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏数据删除成功',
      data: {
        gameId,
        dataId,
        deletedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('删除游戏数据错误:', error)
    res.status(500).json({
      success: false,
      message: '删除游戏数据失败',
      error: error.message
    })
  }
}