// 测试脚本，直接调用 syncModels 函数
import { syncModels } from './models/index.js'

console.log('Testing syncModels function...')

syncModels()
  .then(() => {
    console.log('syncModels executed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error executing syncModels:', error)
    console.error('Error stack:', error.stack)
    process.exit(1)
  })
