// 安全相关工具函数

// 密码强度验证
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: '密码长度必须至少6个字符' };
  }
  if (password.length > 20) {
    return { isValid: false, message: '密码长度不能超过20个字符' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个小写字母' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个大写字母' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个数字' };
  }
  // 可以添加更多验证规则，如特殊字符等
  return { isValid: true, message: '密码强度符合要求' };
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

// XSS防护：清理HTML
export const sanitizeHtml = (html: string): string => {
  // 创建一个临时DOM元素
  const tempElement = document.createElement('div');
  // 设置innerHTML会自动转义危险字符
  tempElement.innerHTML = html;
  // 获取转义后的文本
  const sanitizedText = tempElement.textContent || tempElement.innerText || '';
  return sanitizedText;
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
  } catch (error) {
    // 解析失败，不是有效的URL
    return false;
  }
};

// 安全的JSON解析，防止XSS和原型污染
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    // 检查是否包含__proto__或constructor.prototype，防止原型污染
    if (/__proto__|constructor\s*\.\s*prototype/.test(jsonString)) {
      return defaultValue;
    }
    // 解析JSON
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    // 解析失败，返回默认值
    return defaultValue;
  }
};

// 安全地获取对象属性，防止原型链污染
export const safeGet = (obj: any, path: string, defaultValue: any = undefined): any => {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      // 防止访问原型链属性
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return defaultValue;
      }
      result = result[key];
      if (result === undefined) {
        return defaultValue;
      }
    }
    return result;
  } catch (error) {
    return defaultValue;
  }
};

// 安全地设置对象属性，防止原型链污染
export const safeSet = (obj: any, path: string, value: any): boolean => {
  try {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // 防止设置原型链属性
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return false;
      }
      if (current[key] === undefined) {
        current[key] = {};
      }
      current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    // 防止设置原型链属性
    if (lastKey === '__proto__' || lastKey === 'constructor' || lastKey === 'prototype') {
      return false;
    }
    current[lastKey] = value;
    return true;
  } catch (error) {
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
