const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async function(configuration) {
  const certPath = process.env.CSC_LINK || './certs/code-signing.pfx';
  const certPassword = process.env.CSC_KEY_PASSWORD;
  
  if (!certPassword) {
    console.warn('⚠️ Warning: No signing certificate password provided');
    console.warn('⚠️ Application will be built without code signing');
    return;
  }

  if (!fs.existsSync(path.resolve(certPath))) {
    console.warn('⚠️ Warning: Certificate file not found at:', certPath);
    console.warn('⚠️ Application will be built without code signing');
    return;
  }

  const args = [
    'sign',
    '/fd', 'sha256',
    '/td', 'sha256',
    '/tr', 'http://timestamp.digicert.com',
    '/f', path.resolve(certPath),
    '/p', certPassword,
    configuration.path
  ];

  try {
    execSync(`signtool ${args.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Code signing successful');
  } catch (error) {
    console.error('❌ Code signing failed:', error.message);
    console.error('');
    console.error('Please ensure:');
    console.error('1. Windows SDK is installed (includes signtool.exe)');
    console.error('2. Certificate file exists and is valid');
    console.error('3. Certificate password is correct');
    throw error;
  }
};
