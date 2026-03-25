/**
 * Jest测试设置文件
 * 处理Node.js弃用警告和其他测试配置
 */

// 禁用弃用警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  // 忽略url.parse弃用警告
  if (warning.name === 'DeprecationWarning' && warning.message.includes('url.parse')) {
    return;
  }
  console.warn(warning);
});

// 设置测试超时
jest.setTimeout(30000);

// 全局清理
afterAll(async () => {
  // 确保所有异步操作完成
  await new Promise(resolve => setTimeout(resolve, 500));
});
