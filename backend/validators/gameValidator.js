import { body, param, query } from 'express-validator'

// 游戏创建验证
export const validateCreateGame = [
  body('title')
    .notEmpty().withMessage('标题不能为空')
    .isString().withMessage('标题必须是字符串')
    .isLength({ max: 255 }).withMessage('标题长度不能超过255个字符'),
  
  body('description')
    .notEmpty().withMessage('描述不能为空')
    .isString().withMessage('描述必须是字符串'),
  
  body('price')
    .notEmpty().withMessage('价格不能为空')
    .isNumeric().withMessage('价格必须是数字')
    .isFloat({ min: 0 }).withMessage('价格不能小于0'),
  
  body('discount_price')
    .optional()
    .isNumeric().withMessage('折扣价必须是数字')
    .isFloat({ min: 0 }).withMessage('折扣价不能小于0'),
  
  body('release_date')
    .notEmpty().withMessage('发布日期不能为空')
    .isISO8601().withMessage('发布日期必须是有效的ISO 8601格式'),
  
  body('main_image_url')
    .notEmpty().withMessage('主图URL不能为空')
    .isURL().withMessage('主图URL必须是有效的URL地址'),
  
  body('cover_image')
    .optional()
    .isURL().withMessage('封面图URL必须是有效的URL地址'),
  
  body('categories')
    .optional()
    .isArray().withMessage('分类必须是数组'),
  
  body('tags')
    .optional()
    .isArray().withMessage('标签必须是数组'),
  
  body('executable_path')
    .optional()
    .isString().withMessage('可执行文件路径必须是字符串'),
  
  body('launch_parameters')
    .optional()
    .isString().withMessage('启动参数必须是字符串'),
  
  body('latest_version')
    .optional()
    .isString().withMessage('最新版本必须是字符串')
]

// 游戏更新验证
export const validateUpdateGame = [
  param('gameId')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字'),
  
  body('title')
    .optional()
    .isString().withMessage('标题必须是字符串')
    .isLength({ max: 255 }).withMessage('标题长度不能超过255个字符'),
  
  body('description')
    .optional()
    .isString().withMessage('描述必须是字符串'),
  
  body('price')
    .optional()
    .isNumeric().withMessage('价格必须是数字')
    .isFloat({ min: 0 }).withMessage('价格不能小于0'),
  
  body('discount_price')
    .optional()
    .isNumeric().withMessage('折扣价必须是数字')
    .isFloat({ min: 0 }).withMessage('折扣价不能小于0'),
  
  body('release_date')
    .optional()
    .isISO8601().withMessage('发布日期必须是有效的ISO 8601格式'),
  
  body('main_image_url')
    .optional()
    .isURL().withMessage('主图URL必须是有效的URL地址'),
  
  body('cover_image')
    .optional()
    .isURL().withMessage('封面图URL必须是有效的URL地址'),
  
  body('categories')
    .optional()
    .isArray().withMessage('分类必须是数组'),
  
  body('tags')
    .optional()
    .isArray().withMessage('标签必须是数组')
]

// 游戏版本创建验证
export const validateCreateGameVersion = [
  param('gameId')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字'),
  
  body('version_number')
    .notEmpty().withMessage('版本号不能为空')
    .isString().withMessage('版本号必须是字符串'),
  
  body('file_url')
    .notEmpty().withMessage('文件URL不能为空')
    .isURL().withMessage('文件URL必须是有效的URL地址'),
  
  body('file_size')
    .notEmpty().withMessage('文件大小不能为空')
    .isNumeric().withMessage('文件大小必须是数字')
    .isFloat({ min: 0 }).withMessage('文件大小不能小于0'),
  
  body('platform')
    .notEmpty().withMessage('平台不能为空')
    .isString().withMessage('平台必须是字符串')
    .isIn(['windows', 'mac', 'linux']).withMessage('平台必须是windows、mac或linux'),
  
  body('changelog')
    .optional()
    .isString().withMessage('更新日志必须是字符串')
]

// 系统需求创建验证
export const validateCreateSystemRequirement = [
  param('gameId')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字'),
  
  body('os')
    .notEmpty().withMessage('操作系统不能为空')
    .isString().withMessage('操作系统必须是字符串'),
  
  body('processor')
    .notEmpty().withMessage('处理器不能为空')
    .isString().withMessage('处理器必须是字符串'),
  
  body('memory')
    .notEmpty().withMessage('内存不能为空')
    .isString().withMessage('内存必须是字符串'),
  
  body('graphics')
    .notEmpty().withMessage('显卡不能为空')
    .isString().withMessage('显卡必须是字符串'),
  
  body('storage')
    .notEmpty().withMessage('存储不能为空')
    .isString().withMessage('存储必须是字符串'),
  
  body('type')
    .optional()
    .isString().withMessage('需求类型必须是字符串')
    .isIn(['minimum', 'recommended']).withMessage('需求类型必须是minimum或recommended')
]

// 游戏数据同步验证
export const validateSyncGameData = [
  param('gameId')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字'),
  
  body('data_type')
    .optional()
    .isString().withMessage('数据类型必须是字符串')
    .isIn(['save_data', 'settings', 'progress']).withMessage('数据类型必须是save_data、settings或progress'),
  
  body('data_name')
    .optional()
    .isString().withMessage('数据名称必须是字符串'),
  
  body('data_content')
    .notEmpty().withMessage('同步数据不能为空')
    .isObject().withMessage('同步数据必须是对象')
]

// 系统需求检测验证
export const validateCheckSystemRequirements = [
  param('gameId')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字'),
  
  body('os')
    .optional()
    .isString().withMessage('操作系统必须是字符串'),
  
  body('processor')
    .optional()
    .isString().withMessage('处理器必须是字符串'),
  
  body('memory')
    .optional()
    .isString().withMessage('内存必须是字符串'),
  
  body('graphics')
    .optional()
    .isString().withMessage('显卡必须是字符串'),
  
  body('storage')
    .optional()
    .isString().withMessage('存储必须是字符串')
]

// 游戏列表查询验证
export const validateGetGames = [
  query('page')
    .optional()
    .isNumeric().withMessage('页码必须是数字')
    .isInt({ min: 1 }).withMessage('页码不能小于1'),
  
  query('limit')
    .optional()
    .isNumeric().withMessage('每页数量必须是数字')
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  
  query('search')
    .optional()
    .isString().withMessage('搜索关键词必须是字符串'),
  
  query('categories')
    .optional()
    .isString().withMessage('分类必须是字符串'),
  
  query('tags')
    .optional()
    .isString().withMessage('标签必须是字符串'),
  
  query('minPrice')
    .optional()
    .isNumeric().withMessage('最低价格必须是数字')
    .isFloat({ min: 0 }).withMessage('最低价格不能小于0'),
  
  query('maxPrice')
    .optional()
    .isNumeric().withMessage('最高价格必须是数字')
    .isFloat({ min: 0 }).withMessage('最高价格不能小于0'),
  
  query('sortBy')
    .optional()
    .isString().withMessage('排序字段必须是字符串')
    .isIn(['release_date', 'price', 'title', 'rating']).withMessage('排序字段必须是release_date、price、title或rating'),
  
  query('sortOrder')
    .optional()
    .isString().withMessage('排序方向必须是字符串')
    .isIn(['asc', 'desc']).withMessage('排序方向必须是asc或desc')
]

// 游戏ID验证
export const validateGameId = [
  param('id')
    .notEmpty().withMessage('游戏ID不能为空')
    .isNumeric().withMessage('游戏ID必须是数字')
]

// 安装状态查询验证
export const validateInstallationStatus = [
  param('installationId')
    .notEmpty().withMessage('安装ID不能为空')
    .isString().withMessage('安装ID必须是字符串')
]