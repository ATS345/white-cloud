// 安全相关工具函数

// 密码强度验证
export const validatePassword = (password: string): { isValid: boolean; message: string; strength: 'weak' | 'medium' | 'strong' } => {
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let strengthScore = 0;
  
  if (password.length < 8) {
    return { isValid: false, message: '密码长度必须至少8个字符', strength };
  }
  if (password.length > 20) {
    return { isValid: false, message: '密码长度不能超过20个字符', strength };
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    strengthScore++;
  } else {
    return { isValid: false, message: '密码必须包含至少一个小写字母', strength };
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    strengthScore++;
  } else {
    return { isValid: false, message: '密码必须包含至少一个大写字母', strength };
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    strengthScore++;
  } else {
    return { isValid: false, message: '密码必须包含至少一个数字', strength };
  }
  
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) {
    strengthScore++;
  } else {
    return { isValid: false, message: '密码必须包含至少一个特殊字符（如!@#$%^&*）', strength };
  }
  
  // 计算密码强度
  if (strengthScore >= 4 && password.length >= 10) {
    strength = 'strong';
  } else if (strengthScore >= 3 && password.length >= 8) {
    strength = 'medium';
  }
  
  return { isValid: true, message: '密码强度符合要求', strength };
};

// 邮箱验证
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 手机号验证
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// XSS防护：清理HTML，增强版
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // 1. 使用DOMPurify的核心思想，定义安全标签
  const safeTags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];
  
  // 2. 替换危险字符
  let sanitized = html
    // 替换HTML实体
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // 3. 允许特定的安全标签
  safeTags.forEach(tag => {
    const regex = new RegExp(`&lt;(${tag})([^&]*?)&gt;`, 'gi');
    sanitized = sanitized.replace(regex, '<$1$2>');
    sanitized = sanitized.replace(new RegExp(`&lt;/(${tag})&gt;`, 'gi'), '</$1>');
  });
  
  // 4. 移除所有脚本
  sanitized = sanitized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]+/gi, '');
  
  return sanitized;
};

// 密码哈希生成（使用Web Crypto API）
export const hashPassword = async (password: string, salt?: string): Promise<string> => {
  try {
    // 生成盐值
    let generatedSalt: string;
    if (salt) {
      generatedSalt = salt;
    } else {
      const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
      generatedSalt = Array.from(saltBuffer)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    
    // 将密码和盐值组合
    const passwordData = new TextEncoder().encode(password + generatedSalt);
    
    // 使用SHA-256哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b: number) => b.toString(16).padStart(2, '0'))
      .join('');
    
    // 返回盐值和哈希的组合
    return `${generatedSalt}:${hashHex}`;
  } catch (error) {
    console.error('密码哈希生成失败:', error);
    // 降级方案：使用简单哈希（仅用于开发环境，生产环境应使用Web Crypto API）
    const generatedSalt = salt || Math.random().toString(36).substring(2) + Date.now().toString(36);
    const simpleHash = btoa(password + generatedSalt);
    return `${generatedSalt}:${simpleHash}`;
  }
};

// 密码验证
export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    const [salt] = storedHash.split(':');
    const newHash = await hashPassword(password, salt);
    return newHash === storedHash;
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
};

// JWT令牌验证
export const verifyJwtToken = (token: string): boolean => {
  try {
    // 简单的JWT验证，检查格式和过期时间
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      return false;
    }
    
    // 解码payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // 检查过期时间
    if (decodedPayload.exp && Date.now() > decodedPayload.exp * 1000) {
      return false;
    }
    
    // 检查签发时间
    if (decodedPayload.iat && Date.now() < decodedPayload.iat * 1000) {
      return false;
    }
    
    // 这里可以添加更多验证，如签名验证等
    return true;
  } catch (error) {
    console.error('JWT验证失败:', error);
    return false;
  }
};

// 生成随机密码
export const generateRandomPassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// 敏感数据加密
export const encryptData = (data: string, key: string): string => {
  try {
    // 简单的加密算法，生产环境应使用更安全的加密方式
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  } catch (error) {
    console.error('数据加密失败:', error);
    return '';
  }
};

// 敏感数据解密
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const data = atob(encryptedData);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('数据解密失败:', error);
    return '';
  }
};

// IP地址验证
export const validateIpAddress = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

// 检查是否为内部IP地址
export const isInternalIp = (ip: string): boolean => {
  const internalIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
  return internalIpRegex.test(ip);
};

// 增强的防止原型污染
export const safeObject = <T extends object>(obj: unknown): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj as T;
  }
  
  // 检查是否为原型对象
  if (obj === Object.prototype || obj === Array.prototype) {
    return {} as T;
  }
  
  // 将obj断言为可以用字符串索引访问的对象
  const safeObj = obj as Record<string, unknown>;
  
  // 检查是否包含危险属性
  const dangerousProps = ['__proto__', 'constructor', 'prototype'];
  for (const prop of dangerousProps) {
    if (prop in safeObj) {
      delete safeObj[prop];
    }
  }
  
  // 递归检查嵌套对象
  for (const key in safeObj) {
    if (Object.prototype.hasOwnProperty.call(safeObj, key)) {
      const value = safeObj[key];
      if (value !== null && typeof value === 'object') {
        safeObj[key] = safeObject(value);
      }
    }
  }
  
  return safeObj as T;
};

// 防止CSRF攻击：生成CSRF令牌
export const generateCsrfToken = (): string => {
  // 生成一个随机字符串作为CSRF令牌
  const csrfToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  // 存储到本地存储
  localStorage.setItem('csrfToken', csrfToken);
  return csrfToken;
};

// 获取CSRF令牌
export const getCsrfToken = (): string => {
  let csrfToken = localStorage.getItem('csrfToken');
  // 如果本地存储中没有，生成一个新的
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
  }
  return csrfToken;
};

// 敏感数据脱敏
export const maskSensitiveData = (data: string, type: 'phone' | 'email' | 'idCard' | 'password'): string => {
  switch (type) {
    case 'phone':
      // 手机号脱敏：保留前3位和后4位
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'email':
      // 邮箱脱敏：保留用户名前两位和域名
      return data.replace(/(\w{2})\w+@(\w+\.\w+)/, '$1****@$2');
    case 'idCard':
      // 身份证号脱敏：保留前6位和后4位
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    case 'password':
      // 密码脱敏：全部替换为* 
      return '*'.repeat(data.length);
    default:
      return data;
  }
};

// 生成随机验证码
export const generateVerificationCode = (length: number = 6): string => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 检查是否为安全URL
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // 只允许http和https协议
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsedUrl.protocol);
  } catch {
    // 解析失败，不是有效的URL
    return false;
  }
};

// 安全的JSON解析，防止XSS和原型污染
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    // 检查是否包含__proto__或constructor.prototype，防止原型污染
    if (/\b__proto__\b|\bconstructor\b\s*\.\s*prototype\b/.test(jsonString)) {
      return defaultValue;
    }
    // 解析JSON
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    // 解析失败，返回默认值
    return defaultValue;
  }
};

// 安全地获取对象属性，防止原型链污染
export const safeGet = <T>(obj: unknown, path: string, defaultValue: T | undefined = undefined): T | undefined => {
  try {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
      // 防止访问原型链属性
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return defaultValue;
      }
      // 类型断言，确保可以安全访问属性
      result = (result as Record<string, unknown>)[key];
      if (result === undefined || result === null) {
        return defaultValue;
      }
    }
    return result as T;
  } catch {
    return defaultValue;
  }
};

// 安全地设置对象属性，防止原型链污染
export const safeSet = (obj: unknown, path: string, value: unknown): boolean => {
  try {
    const keys = path.split('.');
    let current = obj as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // 防止设置原型链属性
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return false;
      }
      if (current[key] === undefined) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    // 防止设置原型链属性
    if (lastKey === '__proto__' || lastKey === 'constructor' || lastKey === 'prototype') {
      return false;
    }
    current[lastKey] = value;
    return true;
  } catch {
    return false;
  }
};

// 检测是否为安全环境
export const isSecureEnvironment = (): boolean => {
  // 检查是否在HTTPS环境下
  const isHttps = window.location.protocol === 'https:';
  // 检查是否在iframe中（防止点击劫持）
  const isInIframe = window.self !== window.top;
  // 检查是否启用了CSP（Content Security Policy）
  const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
  
  return isHttps && !isInIframe && hasCSP;
};

// 防止点击劫持
export const preventClickjacking = () => {
  // 检查是否在iframe中，且window.top不为null
  if (window.self !== window.top && window.top) {
    // 在iframe中，尝试中断加载或重定向
    window.top.location.href = window.self.location.href;
  }
};
