# stanley-rasp-demos

Stanley 的树莓派小程序集合仓库，主要用于快速孵化和沉淀可直接运行的 Web Demo。

## 项目目标

- 快速实现“小而可用”的互动小程序
- 每个 demo 独立目录，便于迭代和复用
- 支持手机端访问与家庭场景使用

## 当前已包含 Demo

- `demos/guess-number/`：猜数字（4位不重复）
- `demos/number-bomb/`：数字炸弹（多人轮流）
- `demos/guess-animal/`：猜动物互动游戏
- `demos/brain-teasers/`：脑筋急转弯题库
- `demos/memory-flip/`：记忆翻牌
- `demos/igb-practice/`：International Geography Bee 真题练习（中英双语选择题）
- `demos/emoji-idiom/`：看 Emoji 猜成语（海量题库）

> 根目录 `index.html` 为统一入口页。

## 推荐目录规范

每个 demo 建议包含：

- `index.html`：页面入口
- `script.js`：业务逻辑
- `styles.css`：样式
- `README.md`：说明文档（用途、运行方式、后续计划）
- `assets/`（可选）：题库、图片、配置等静态资源

## 运行方式

### 方式一：直接打开

对于纯静态 demo，可直接浏览器打开 `demos/<demo-name>/index.html`。

### 方式二：本地静态服务（推荐）

在仓库根目录运行：

```bash
python3 -m http.server 8080
```

然后访问：

- 主页：`http://<你的设备IP>:8080/`
- 指定 demo：`http://<你的设备IP>:8080/demos/<demo-name>/`

## 开发约定

- 新增 demo 统一放在 `demos/<app-name>/`
- 优先移动端友好（响应式布局、触控交互）
- 题库类项目优先做数据清洗（去重、异常过滤、可追溯来源）
- 更新项目后默认同步推送 GitHub

## 后续方向

- 继续扩展 IGB 题库规模与质量（目标 1000+ 可练习题）
- 增加更多家庭互动/学习类小游戏
- 为题库类 demo 增加错题本、复习模式和进阶统计
