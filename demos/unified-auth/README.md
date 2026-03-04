# Unified Auth API (注册/登录/访客)

给 `stanley-rasp-demos` 里各个小程序复用的一套统一账户接口。

## 目标

- 支持普通用户注册/登录
- 支持访客模式（免注册）
- 提供 token 校验接口，便于其他小程序接入
- 无三方依赖，Node.js 内置模块即可运行

## 启动

```bash
cd demos/unified-auth
AUTH_SECRET='please-change-me' PORT=8787 npm start
```

## API 列表

### 1) 健康检查

`GET /api/health`

### 2) 注册

`POST /api/auth/register`

```json
{
  "username": "alice",
  "password": "12345678"
}
```

### 3) 登录

`POST /api/auth/login`

```json
{
  "username": "alice",
  "password": "12345678"
}
```

### 4) 访客登录

`POST /api/auth/guest`

```json
{
  "guestName": "StanleyGuest"
}
```

### 5) 获取当前身份

`GET /api/auth/me`

Header:

```text
Authorization: Bearer <token>
```

### 6) Token 校验（给其他小程序服务端调用）

`POST /api/auth/verify`

```json
{
  "token": "<token>"
}
```

## 返回示例（登录）

```json
{
  "ok": true,
  "token": "<jwt-like-token>",
  "user": {
    "id": "...",
    "username": "alice",
    "role": "user",
    "createdAt": "2026-03-04T..."
  }
}
```

## 数据存储

- 文件：`demos/unified-auth/data/users.json`
- 用户密码：PBKDF2 + salt 哈希存储

## 接入约定（给其他小程序）

前端统一保存 `token`，每次请求业务后端时附带：

```text
Authorization: Bearer <token>
```

业务后端可选两种方案：

1. 直接调用 `POST /api/auth/verify` 验证 token（最快接入）
2. 复用同一 `AUTH_SECRET` 在本地验签（性能更高）

---
下一步可以做：
- refresh token
- logout 黑名单
- 邮箱/手机验证码
- OAuth（微信/Google）
