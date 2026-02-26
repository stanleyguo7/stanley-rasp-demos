# Shared Components for Demos

本目录包含可复用的样式和工具函数，供所有 demo 使用。

## 使用方式

### 1. 基础样式 (base.css)

在新 demo 的 `<head>` 中添加：

```html
<link rel="stylesheet" href="../_shared/base.css">
```

提供：
- 统一的颜色变量（`--primary`, `--bg`, `--card` 等）
- 基础按钮样式（`.btn-primary`, `.btn-secondary`, `.btn-danger`）
- 响应式布局支持
- 表单元素样式

### 2. 工具函数 (utils.js)

在页面底部添加：

```html
<script src="../_shared/utils.js"></script>
```

提供：
- `DemoUtils.shuffle(arr)` - 数组随机打乱
- `DemoUtils.formatTime(seconds)` - 秒数格式化为 MM:SS
- `DemoUtils.createTimer(onTick)` - 创建计时器
- `DemoUtils.storage` - localStorage 封装
- `DemoUtils.createWrongSet(key)` - 错题本追踪器
- `DemoUtils.toast(msg)` - 简单提示框

## 示例用法

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>My Demo</title>
  <link rel="stylesheet" href="../_shared/base.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app">
    <h1>🎮 My Demo</h1>
    <div class="panel">
      <button class="btn-primary" id="startBtn">开始</button>
    </div>
  </main>
  
  <script src="../_shared/utils.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

```javascript
// script.js
const { shuffle, formatTime, createTimer, toast } = DemoUtils;

// 使用计时器
const timer = createTimer(s => {
  document.getElementById('time').textContent = formatTime(s);
});
timer.start();

// 使用提示
toast('游戏开始！');
```

## 设计原则

1. **轻量** - 无依赖，纯原生 JS/CSS
2. **移动优先** - 响应式设计，触控友好
3. **可覆盖** - 使用 CSS 变量，demo 可自行覆盖
4. **向后兼容** - 现有 demo 不受影响，可选择性采用
