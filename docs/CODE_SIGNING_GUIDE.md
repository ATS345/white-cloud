# Windows SmartScreen 安全警告解决方案

## 问题说明

当用户运行未签名的应用程序时，Windows SmartScreen 显示警告：
> "Windows 已保护你的电脑，阻止了无法识别的应用启动"

---

## 解决方案概述

### 方案一：获取代码签名证书（推荐生产环境）

#### 1. 购买代码签名证书

| 证书类型 | 价格范围 | 验证级别 | SmartScreen 信誉 |
|---------|---------|---------|-----------------|
| 标准代码签名证书 | $200-400/年 | 组织验证 | 需积累信誉 |
| EV 代码签名证书 | $400-800/年 | 扩展验证 | 立即受信任 |

**推荐供应商：**
- [DigiCert](https://www.digicert.com/signing/code-signing-certificates)
- [Sectigo](https://sectigo.com/ssl-certificates-tls/code-signing)
- [GlobalSign](https://www.globalsign.com/en/code-signing-certificate)
- [SSL.com](https://www.ssl.com/certificates/code-signing/)

#### 2. 申请流程

```
1. 选择证书类型并购买
2. 提交组织验证材料
   - 营业执照
   - 组织电话验证
   - 域名验证
3. 审核通过后下载证书 (.pfx 文件)
4. 将证书放入 certs/ 目录
```

#### 3. 配置环境变量

```powershell
# 设置证书路径
$env:CSC_LINK = "C:\path\to\certs\code-signing.pfx"

# 设置证书密码
$env:CSC_KEY_PASSWORD = "YourCertificatePassword"

# 或永久设置
[Environment]::SetEnvironmentVariable("CSC_LINK", "C:\path\to\certs\code-signing.pfx", "User")
[Environment]::SetEnvironmentVariable("CSC_KEY_PASSWORD", "YourPassword", "User")
```

#### 4. 构建签名版本

```bash
# 构建签名后的安装包
npm run build:win

# 验证签名
signtool verify /pa /all "release/云幕游戏商店-1.0.0-x64-setup.exe"
```

---

### 方案二：自签名证书（仅限测试）

适用于内部测试，不适用于公开发布。

```powershell
# 以管理员身份运行 PowerShell

# 创建自签名证书
$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject "CN=Yunmu Game Store" `
    -CertStoreLocation Cert:\CurrentUser\My `
    -FriendlyName "Yunmu Game Store Code Signing" `
    -NotAfter (Get-Date).AddYears(3)

# 导出证书
$pwd = ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "certs\code-signing.pfx" -Password $pwd

# 将证书添加到受信任的发布者（仅本机）
Export-Certificate -Cert $cert -FilePath "certs\code-signing.cer"
CertUtil -AddStore "TrustedPublisher" "certs\code-signing.cer"
```

---

### 方案三：用户端临时解决方案

如果暂时无法获取签名证书，用户可以通过以下方式绕过警告：

#### 方法一：点击"更多信息"

```
1. 点击 SmartScreen 警告框中的"更多信息"
2. 点击"仍要运行"
3. 在 UAC 提示中点击"是"
```

#### 方法二：右键属性解除阻止

```
1. 右键点击安装包 → 属性
2. 在"常规"选项卡底部勾选"解除锁定"
3. 点击"应用" → "确定"
4. 再次运行安装包
```

#### 方法三：PowerShell 解除阻止

```powershell
Unblock-File -Path "C:\path\to\yunmu-game-store-setup.exe"
```

---

## 项目签名配置

### electron-builder.json 已配置

```json
{
  "win": {
    "certificateFile": "${env.CSC_LINK}",
    "certificatePassword": "${env.CSC_KEY_PASSWORD}",
    "signingHashAlgorithms": ["sha256"],
    "signDlls": true,
    "rfc3161TimeStampServer": "http://timestamp.digicert.com"
  }
}
```

### 签名脚本

签名脚本位于：`scripts/sign.js`

---

## SmartScreen 信誉积累

即使获得代码签名证书，新应用仍需积累信誉：

### 加速信誉建立

1. **加入 Microsoft 开发者计划**
   - 注册 [Microsoft Partner Center](https://partner.microsoft.com/)
   - 提交应用进行认证

2. **分发到可信平台**
   - Microsoft Store
   - Steam
   - 其他知名下载平台

3. **使用 EV 证书**
   - EV 代码签名证书可立即获得 SmartScreen 信任
   - 无需积累信誉

---

## 检查清单

- [ ] 购买代码签名证书
- [ ] 完成组织验证
- [ ] 将证书放入 `certs/` 目录
- [ ] 设置环境变量 `CSC_LINK`
- [ ] 设置环境变量 `CSC_KEY_PASSWORD`
- [ ] 运行 `npm run build:win`
- [ ] 验证签名有效性
- [ ] 测试安装流程

---

## 常见问题

### Q: 签名后仍然显示警告？
A: 标准代码签名证书需要积累下载信誉。使用 EV 证书可立即受信任。

### Q: 证书过期后应用还能运行吗？
A: 可以。签名时间戳确保应用在证书过期后仍可验证。

### Q: 自签名证书可以用于发布吗？
A: 不可以。自签名证书仅用于开发测试，用户设备不会信任。

### Q: 构建时提示找不到 signtool？
A: 安装 Windows SDK，或将 signtool.exe 添加到系统 PATH。

---

## 相关资源

- [Microsoft 代码签名要求](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [electron-builder 代码签名文档](https://www.electron.build/code-signing)
- [DigiCert 代码签名指南](https://www.digicert.com/code-signing/sign-executables)
