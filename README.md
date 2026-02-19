# stanley-rasp-demos

用于生成和存储各种小程序（demo）。

## 目录结构

- `demos/<demo-name>/`：每个小程序一个独立目录
- 每个 demo 建议包含：
  - `README.md`：说明用途与运行方法
  - `main.py` / `main.js`：入口文件（按技术栈选择）
  - `requirements.txt` / `package.json`：依赖声明（可选）

## 快速开始

```bash
cd demos
mkdir hello-demo
cd hello-demo
# 在这里写你的代码
```


## 主页入口

- 根目录 `index.html` 为欢迎主页，可跳转到所有 demos。
