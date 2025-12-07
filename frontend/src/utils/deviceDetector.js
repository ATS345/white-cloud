// 设备检测工具函数

/**
 * 检测用户设备类型和操作系统
 * @returns {Object} 设备信息对象
 */
export const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  let deviceInfo = {
    platform: 'unknown',
    os_version: 'unknown',
    browser: 'unknown',
    browser_version: 'unknown',
    is_mobile: false
  };

  // 检测操作系统
  if (platform.includes('win')) {
    deviceInfo.platform = 'windows';
    // 检测Windows版本
    if (userAgent.includes('windows nt 11')) {
      deviceInfo.os_version = '11.0';
    } else if (userAgent.includes('windows nt 10')) {
      deviceInfo.os_version = '10.0';
    } else if (userAgent.includes('windows nt 6.3')) {
      deviceInfo.os_version = '8.1';
    } else if (userAgent.includes('windows nt 6.2')) {
      deviceInfo.os_version = '8.0';
    } else if (userAgent.includes('windows nt 6.1')) {
      deviceInfo.os_version = '7.0';
    }
  } else if (platform.includes('mac')) {
    deviceInfo.platform = 'mac';
    // 检测macOS版本
    const macVersionMatch = userAgent.match(/mac os x (\d+)_(\d+)_(\d+)/);
    if (macVersionMatch) {
      deviceInfo.os_version = `${macVersionMatch[1]}.${macVersionMatch[2]}`;
    }
  } else if (platform.includes('linux')) {
    deviceInfo.platform = 'linux';
    // Linux版本检测较为复杂，这里简化处理
    deviceInfo.os_version = 'unknown';
  } else if (platform.includes('android') || userAgent.includes('android')) {
    deviceInfo.platform = 'android';
    deviceInfo.is_mobile = true;
    // 检测Android版本
    const androidVersionMatch = userAgent.match(/android (\d+)\.(\d+)/);
    if (androidVersionMatch) {
      deviceInfo.os_version = `${androidVersionMatch[1]}.${androidVersionMatch[2]}`;
    }
  } else if (platform.includes('iphone') || platform.includes('ipad') || platform.includes('ipod')) {
    deviceInfo.platform = 'ios';
    deviceInfo.is_mobile = true;
    // 检测iOS版本
    const iosVersionMatch = userAgent.match(/os (\d+)_(\d+)/);
    if (iosVersionMatch) {
      deviceInfo.os_version = `${iosVersionMatch[1]}.${iosVersionMatch[2]}`;
    }
  }

  // 检测浏览器
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
    deviceInfo.browser = 'chrome';
    const chromeVersionMatch = userAgent.match(/chrome\/(\d+)\./);
    if (chromeVersionMatch) {
      deviceInfo.browser_version = chromeVersionMatch[1];
    }
  } else if (userAgent.includes('firefox')) {
    deviceInfo.browser = 'firefox';
    const firefoxVersionMatch = userAgent.match(/firefox\/(\d+)\./);
    if (firefoxVersionMatch) {
      deviceInfo.browser_version = firefoxVersionMatch[1];
    }
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    deviceInfo.browser = 'safari';
    const safariVersionMatch = userAgent.match(/version\/(\d+)\./);
    if (safariVersionMatch) {
      deviceInfo.browser_version = safariVersionMatch[1];
    }
  } else if (userAgent.includes('edge')) {
    deviceInfo.browser = 'edge';
    const edgeVersionMatch = userAgent.match(/edge\/(\d+)\./);
    if (edgeVersionMatch) {
      deviceInfo.browser_version = edgeVersionMatch[1];
    }
  }

  return deviceInfo;
};

/**
 * 检测设备是否满足最低系统要求
 * @param {Object} deviceInfo 设备信息
 * @param {Object} requirements 系统要求
 * @returns {Boolean} 是否满足要求
 */
export const checkSystemRequirements = (deviceInfo, requirements) => {
  if (!requirements) {
    return true;
  }

  // 检查操作系统版本
  if (requirements.min_os_version) {
    const [minMajor, minMinor] = requirements.min_os_version.split('.').map(Number);
    const [deviceMajor, deviceMinor] = deviceInfo.os_version.split('.').map(Number);
    
    if (deviceMajor < minMajor || (deviceMajor === minMajor && deviceMinor < minMinor)) {
      return false;
    }
  }

  // 可以添加更多检查，如CPU、内存等（需要更多设备信息）
  return true;
};
