# igb-practice

IGB（International Geography Bee）手机端刷题练习系统。

## 已完成
- 从 IGB 官方 Resources 页面抓取历年题目文件（PDF/DOCX）
- 基于真题 ORQE 解析为标准选择题（A/B/C/D）并匹配答案键
- 将题干与选项翻译为中文（保留英文原文）
- 提供移动端友好的答题练习界面
- 支持按年份、轮次筛选；支持 10/20/50/不限题量

## 题库文件
- `assets/questions_zh_mcq.json`：前端当前加载的“中英双语选择题”题库
- `assets/questions.json`：早期抽取的原始题库（不全是选择题）
- `data/raw/`：原始下载文件
- `data/text/`：抽取后的文本

## 构建题库（可选）
```bash
cd demos/igb-practice
python3 tools/build_question_bank.py
```

## 运行
直接打开 `index.html`，或在仓库根目录启动静态服务后访问：
- `/demos/igb-practice/`
