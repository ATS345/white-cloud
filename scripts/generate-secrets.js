/**
 * 安全密钥生成工具
 * 用于生成生产环境的JWT密钥
 * 
 * 使用方法: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateStrongPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < 32; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

console.log('========================================');
console.log('  云幕游戏商店 - 安全密钥生成工具');
console.log('========================================\n');

console.log('JWT_SECRET (64字节):');
console.log(generateSecret(64));
console.log('\n');

console.log('JWT_REFRESH_SECRET (64字节):');
console.log(generateSecret(64));
console.log('\n');

console.log('强密码示例 (32字符):');
console.log(generateStrongPassword());
console.log('\n');

console.log('========================================');
console.log('  请将上述密钥复制到 .env.production 文件');
console.log('  注意: 密钥仅显示一次，请妥善保存');
console.log('========================================');
