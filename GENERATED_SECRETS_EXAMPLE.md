# 生成的安全密钥示例

⚠️ **重要提示**：
- 这些密钥仅作示例使用
- 生产环境请重新生成新的密钥
- 不要将此文件提交到版本控制

---

## 生成的密钥 (示例)

```env
# JWT配置
JWT_SECRET=9f942fc4052ec28ea238ae2adfa7d6ed22ccfeb0bb4dd8f07786b8faada7cc65
JWT_EXPIRES_IN=1h

JWT_REFRESH_SECRET=1286798064a71e1549c53bd78d9a330752f3598cb509a7c8dce6a51e476b8db
JWT_REFRESH_EXPIRES_IN=7d

# 支付回调验证密钥
PAYMENT_CALLBACK_SECRET=b4605b1b7c6e34477932dcb8057d77cf24a0450317297d69c84e8216d23bbf19

# 管理员模拟支付密钥 (仅开发环境)
ADMIN_SIMULATION_KEY=
```

---

## 如何重新生成密钥

### PowerShell 5 (兼容旧版)

```powershell
# 生成单个密钥
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
$rng.GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
```

### PowerShell 7+

```powershell
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes(32) | ForEach-Object { $_.ToString("x2") } | Join-String
```

### Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 密钥安全最佳实践

1. **每个环境使用不同的密钥**：开发、测试、生产环境分别生成
2. **定期轮换**：建议每3-6个月更换一次密钥
3. **使用密钥管理工具**：生产环境考虑使用 HashiCorp Vault、AWS Secrets Manager 等
4. **不要提交到 Git**：确保 .env 文件在 .gitignore 中
5. **最小权限访问**：限制对密钥文件的访问权限
