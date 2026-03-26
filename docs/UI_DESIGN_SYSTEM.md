# 云幕游戏商店 - UI 设计系统 2.0

> 版本: 2.0 | 日期: 2026-03-21 | 状态: 全新设计方案

---

## 1. 设计理念与愿景

### 1.1 设计目标
创建一个**沉浸式、现代化**的游戏商店界面，让玩家在浏览游戏时感受到游戏的魅力与激情，同时保持极致的易用性。

### 1.2 设计关键词
- **沉浸感**: 游戏画面优先，让用户感受到游戏世界的魅力
- **速度感**: 快速响应、流畅过渡、高效导航
- **精致感**: 像素级细节、细腻的动效、高品质视觉
- **专业感**: 清晰的层次结构、符合用户习惯的交互

### 1.3 核心设计原则
1. **内容优先**: 游戏封面和画面是最重要的设计元素
2. **简洁高效**: 减少视觉噪音，让用户专注于游戏本身
3. **一致性**: 全平台统一的视觉语言和交互模式
4. **可访问性**: 符合 WCAG AA 标准，确保所有用户可用

---

## 2. 色彩系统

### 2.1 主色调方案 - "极光紫电"

**核心色彩**
| 用途 | 色值 | 说明 |
|------|------|------|
| Primary | `#6366F1` | 靛蓝紫，主色调，代表科技与神秘 |
| Primary-Light | `#818CF8` | 浅靛蓝，悬停状态 |
| Primary-Dark | `#4F46E5` | 深靛蓝，按下状态 |
| Secondary | `#EC4899` | 品红，强调色，代表激情与活力 |
| Accent | `#F59E0B` | 琥珀，价格、促销、高亮 |
| Success | `#10B981` | 翠绿，成功状态 |
| Warning | `#F59E0B` | 琥珀，警告状态 |
| Error | `#EF4444` | 红色，错误状态 |

### 2.2 完整色彩变量

```css
:root {
  /* 主色系 */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-300: #A5B4FC;
  --primary-400: #818CF8;
  --primary-500: #6366F1;
  --primary-600: #4F46E5;
  --primary-700: #4338CA;
  --primary-800: #3730A3;
  --primary-900: #312E81;

  /* 辅助色系 */
  --secondary-500: #EC4899;
  --secondary-600: #DB2777;

  /* 强调色 */
  --accent-500: #F59E0B;
  --accent-600: #D97706;

  /* 功能色 */
  --success-500: #10B981;
  --error-500: #EF4444;
  --warning-500: #F59E0B;
  --info-500: #3B82F6;

  /* 背景色 */
  --bg-base: #09090B;
  --bg-deep: #0F0F11;
  --bg-elevated: #18181B;
  --bg-overlay: #27272A;

  /* 文字色 */
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --text-disabled: #52525B;

  /* 边框色 */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.20);

  /* 发光效果 */
  --glow-primary: 0 0 20px rgba(99, 102, 241, 0.3);
  --glow-accent: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

### 2.3 语义色彩使用规范

| 使用场景 | 颜色变量 | 视觉效果 |
|---------|---------|---------|
| 主按钮、链接 | `--primary-500` | 靛蓝紫，科技神秘 |
| 促销折扣标签 | `--accent-500` | 琥珀，吸引注意 |
| 免费、成功 | `--success-500` | 翠绿，积极 |
| 热销标签 | `--secondary-500` | 品红，激情 |
| 错误提示 | `--error-500` | 红色，警示 |
| 页面底色 | `--bg-base` | 纯黑，深沉 |

---

## 3. 字体系统

### 3.1 字体家族
- **主字体**: Inter (现代、清晰、易读)
- **等宽字体**: JetBrains Mono (价格、数据)
- **备用**: 系统字体栈

### 3.2 字体变量

```css
:root {
  /* 标题尺寸 */
  --text-display: 3.5rem;   /* 56px */
  --text-h1: 3rem;           /* 48px */
  --text-h2: 2.25rem;        /* 36px */
  --text-h3: 1.875rem;       /* 30px */
  --text-h4: 1.5rem;         /* 24px */

  /* 正文字尺寸 */
  --text-xl: 1.25rem;        /* 20px */
  --text-lg: 1.125rem;       /* 18px */
  --text-base: 1rem;         /* 16px */
  --text-sm: 0.875rem;       /* 14px */
  --text-xs: 0.75rem;        /* 12px */
}
```

---

## 4. 间距系统

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

---

## 5. 圆角系统

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

---

## 6. 阴影系统

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  --shadow-primary: 0 4px 14px rgba(99, 102, 241, 0.25);
  --shadow-accent: 0 4px 14px rgba(245, 158, 11, 0.25);
}
```

---

## 7. 动效系统

### 7.1 过渡时间

```css
:root {
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.2 核心动画

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 8. 组件规范

### 8.1 按钮

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-400);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover {
  background: var(--bg-elevated);
  border-color: var(--border-strong);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}
```

### 8.2 游戏卡片

```css
.game-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-500);
  box-shadow: var(--shadow-xl), var(--shadow-primary);
}

.game-card__image {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.game-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.game-card:hover .game-card__image img {
  transform: scale(1.05);
}

.game-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: var(--accent-500);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.game-card__content {
  padding: 16px;
}

.game-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-card__price {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-400);
}

.game-card__price--free {
  color: var(--success-500);
}
```

### 8.3 输入框

```css
.input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-deep);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  transition: all var(--duration-fast) var(--ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.input::placeholder {
  color: var(--text-muted);
}
```

---

## 9. 页面布局规范

### 9.1 容器宽度

| 设备 | 最大宽度 | 边距 |
|-----|---------|------|
| 桌面 (>1280px) | 1400px | 48px |
| 笔记本 (1024-1280px) | 1200px | 32px |
| 平板 (768-1024px) | 100% | 24px |
| 手机 (<768px) | 100% | 16px |

### 9.2 网格系统

```css
.grid {
  display: grid;
  gap: 24px;
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-5 { grid-template-columns: repeat(5, 1fr); }

@media (max-width: 1280px) {
  .grid-cols-4, .grid-cols-5 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 1024px) {
  .grid-cols-3, .grid-cols-4, .grid-cols-5 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4, .grid-cols-5 { grid-template-columns: 1fr; }
}
```

---

## 10. 可访问性规范

### 10.1 色彩对比度

| 文字类型 | 最小对比度 | 适用场景 |
|---------|-----------|---------|
| 正常文字 | 4.5:1 | 正文、标签 |
| 大文字 | 3:1 | 标题、按钮文字 |
| UI组件 | 3:1 | 边框、图标 |

### 10.2 焦点状态

```css
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 10.3 触摸目标

- 最小尺寸: 44px × 44px
- 推荐间距: 8px

---

## 11. 品牌元素

### 11.1 Logo 使用

```
Logo 组合形式:
┌────────────────────────────────────────────┐
│  🎮 云幕游戏                               │
│     CloudScreen Games                      │
└────────────────────────────────────────────┘

仅图标:
┌────┐
│ 🎮 │
└────┘
```

### 11.2 品牌色彩组合

| 组合 | 背景 | 文字 | 用途 |
|-----|------|------|------|
| 深色主题 | `--bg-elevated` | `--text-primary` | 卡片、面板 |
| 强调背景 | `--primary-500` | `white` | 主按钮 |
| 次强调 | `--bg-deep` | `--primary-400` | 次要元素 |

---

## 12. 实现指南

### 12.1 CSS 变量文件结构

```css
/* src/styles/variables.css - 设计令牌 */
:root {
  /* 色彩 */
  --primary-500: #6366F1;
  /* ... */
}

/* src/styles/base.css - 基础样式 */
@import './variables.css';

/* src/styles/components.css - 组件样式 */
@import './components/button.css';
@import './components/card.css';
/* ... */

/* src/index.css - 主入口 */
@import './base.css';
@import './components.css';
```

### 12.2 Ant Design 主题覆盖

```css
/* Ant Design 5 深色主题定制 */
.ant-btn-primary {
  background: var(--primary-500) !important;
  border-color: var(--primary-500) !important;
}

.ant-btn-primary:hover {
  background: var(--primary-400) !important;
  box-shadow: var(--shadow-primary) !important;
}

.ant-input {
  background: var(--bg-deep) !important;
  border-color: var(--border-default) !important;
  color: var(--text-primary) !important;
}

.ant-input:focus {
  border-color: var(--primary-500) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
}

.ant-select-dropdown {
  background: var(--bg-overlay) !important;
}

.ant-card {
  background: var(--bg-elevated) !important;
  border-color: var(--border-subtle) !important;
}
```

---

**文档版本**: 2.0
**最后更新**: 2026-03-21
**维护者**: UI设计团队
