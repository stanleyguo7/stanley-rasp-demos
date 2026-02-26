# 优化进度跟踪

## P0 - 结构优化（已完成 ✅）

### IGB 数据分离
- [x] 添加 `.vercelignore` 排除构建原料
- [x] 更新 `.gitignore` 排除 candidates 中间文件
- [x] README 增补"运行时 vs 构建时"说明

### 题库翻译修复
- [x] Batch 1: 16 题（索引 190-205）
- [x] Batch 2: 65 题（索引 200-269）
- [x] Batch 3: 60 题（索引 156-269 补充）
- [x] Batch 4: 21 题（索引 270-290）
- [ ] 剩余待检查：约 100+ 题（后续批次继续）

## P1 - 产品体验（进行中 🚧）

### 学习闭环
- [x] IGB 错题本（localStorage）
- [x] 仅错题练习模式
- [x] 清空错题本功能
- [ ] 复习提醒（需 cron 配合）
- [ ] 进度统计（7 天正确率等）

### 共享组件
- [x] `demos/_shared/base.css` - 基础样式
- [x] `demos/_shared/utils.js` - 工具函数
- [x] `demos/_shared/README.md` - 使用说明
- [ ] 迁移现有 demo 使用共享组件
- [ ] 增加更多通用组件（toast、modal 等）

## P2 - 内容与可靠性（待开始 ⏳）

### 资源优化
- [ ] guess-animal 本地图片备份
- [ ] 题库 JSON 分片（按年份）
- [ ] 压缩部署（gzip/brotli）

### 质量提升
- [ ] JSON schema 校验脚本
- [ ] 基础 smoke test
- [ ] 可访问性改进（aria、键盘导航）

---

## 提交记录

| Commit | 内容 |
|--------|------|
| 07c75c7 | 错题本 + 第一批翻译修复 |
| 8176ae3 | 第二批翻译修复 (65 题) |
| 9b54b7a | 共享组件 base.css + utils.js |
| d863d08 | 第三批翻译修复 (60 题) |
| febd5a7 | 第四批翻译修复 (21 题) |
| 2e9bd35 | 共享组件文档 + .gitignore 更新 |

## Vercel 部署

当前地址：https://stanley-rasp-demos.vercel.app/
