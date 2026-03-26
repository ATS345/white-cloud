# 163邮箱邮件通知配置指南

**文档版本**: v1.0  
**最后更新**: 2026-03-26**

---

## 概述

本指南详细说明如何配置163邮箱作为云幕游戏商店平台的告警邮件发件箱。

---

## 1. 163邮箱SMTP配置参数

| 参数 | 值 | 说明 |
|------|-----|------|
| SMTP服务器 | smtp.163.com | 163邮箱官方SMTP服务器 |
| SMTP端口 | 465 | SSL加密端口 |
| 加密方式 | SSL/TLS | 必须启用加密 |
| 发件人邮箱 | sftaccf@163.com | 您的163邮箱账号 |

---

## 2. 获取163邮箱授权码

### 重要提醒

⚠️ **163邮箱使用**授权码**而非登录密码！

不要使用邮箱登录密码，必须使用专门的授权码。

### 获取步骤

1. **登录163邮箱网页版

   访问：https://mail.163.com

2. **进入设置页面

   - 点击右上角「设置」
   - 选择「POP3/SMTP/IMAP」选项

3. **开启SMTP服务**

   - 找到「POP3/SMTP服务」
   - 点击「开启」按钮」
   - 按照提示完成验证（通常需要手机验证码）

4. **获取授权码**

   - 开启成功后，会显示**授权码**
   - **复制保存此授权码（注意：只显示一次，请妥善保存）
   - 如果忘记授权码可以重新生成

---

## 3. 配置Alertmanager

### 步骤1：复制配置模板

```bash
cd c:\项目开发\云幕游戏商店平台
cp monitoring\alertmanager.163.example.yml monitoring\alertmanager.yml
```

### 步骤2：填入授权码

用您的文本编辑器打开 `monitoring\alertmanager.yml`，找到所有：

```yaml
smtp_auth_password: 'YOUR_163_AUTHORIZATION_CODE'
```

将 `YOUR_163_AUTHORIZATION_CODE` 替换为您实际获取的**授权码。

### 步骤3：确认其他参数

确保以下参数已正确配置：

```yaml
global:
  smtp_smarthost: 'smtp.163.com:465'
  smtp_from: 'sftaccf@163.com'
  smtp_auth_username: 'sftaccf@163.com'
  smtp_auth_password: '您的授权码'
  smtp_require_tls: true
```

---

## 4. 应用配置并重启服务

### 步骤1：确保Docker运行

```bash
# 检查Docker状态
docker ps
```

### 步骤2：重启Alertmanager

```bash
# 重启Alertmanager容器
docker restart yunmu-alertmanager

# 查看Alertmanager日志
docker logs yunmu-alertmanager --tail 50
```

### 步骤3：验证配置

访问 Alertmanager UI：http://localhost:9093

---

## 5. 测试邮件发送

### 方法1：通过Prometheus触发测试告警

1. 访问 Prometheus UI：http://localhost:9090
2. 进入「Alerts」页面
3. 可以临时修改某个告警阈值来触发测试

### 方法2：模拟服务故障

```bash
# 停止某个服务来触发告警
docker stop yunmu-backend

# 等待1-2分钟
# 访问 http://localhost:9093 查看告警状态

# 恢复服务
docker start yunmu-backend
```

### 验证邮件接收

检查收件箱是否收到告警邮件，确认：
- [ ] 邮件成功发送
- [ ] 发件人显示为：sftaccf@163.com
- [ ] 邮件主题正确
- [ ] 邮件内容完整

---

## 6. 常见问题排查

### 问题1：认证失败

**错误信息**：535 Authentication failed

**解决方案**：
- 确认使用的是**授权码**，不是登录密码
- 确认授权码没有过期（重新生成新的授权码）
- 确认账号密码正确

### 问题2：连接超时

**错误信息**：connection timeout

**解决方案**：
- 确认SMTP服务器地址：smtp.163.com
- 确认端口：465
- 检查网络连接

### 问题3：SSL错误

**错误信息**：SSL/TLS handshake failed

**解决方案**：
- 确认 smtp_require_tls 设置为 true
- 确认使用465端口

---

## 7. 安全注意事项

1. **保护授权码安全**
   - 不要将包含授权码的 alertmanager.yml 提交到Git
   - 确保 alertmanager.yml 在 .gitignore 中
   - 定期更换授权码

2. **Git忽略配置**
   确保 .gitignore 包含：
   ```
   monitoring/alertmanager.yml
   *.env
   *.env.local
   ```

---

## 8. 相关文件

- `monitoring/alertmanager.163.example.yml - 163邮箱配置模板
- `monitoring/alertmanager.yml - 实际配置文件（需自己创建）
- `docs/operations/163_EMAIL_SETUP_GUIDE.md` - 本文档

---

**配置完成后，请按照上述步骤进行测试验证！
