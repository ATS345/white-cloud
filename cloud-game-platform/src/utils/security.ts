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
  const csrfToken = Math.random().