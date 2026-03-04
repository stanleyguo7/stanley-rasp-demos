# unified-auth SDK

给 `stanley-rasp-demos` 各小程序复用的统一账户模块。

## 架构

```
unified-auth/
├── sdk/                  # 服务端 SDK（Node.js，无第三方依赖）
│   ├── token.js          # JWT 签发 / 验签（HS256）
│   ├── password.js       # PBKDF2 密码哈希
│   ├── store.js          # JSON 文件存储层（可替换为数据库）
│   ├── auth.js           # Auth 核心业务逻辑
│   └── index.js          # 统一导出入口
├── client/
│   └── auth-client.js    # 浏览器端 SDK（ES Module）
├── server.js             # HTTP 薄层（REST API）
└── data/
    └── users.json        # 数据文件（自动创建）
```

---

## 服务端 SDK 直接调用

适合其他 Node.js demo 直接 `require`，**无需 HTTP 请求**。

```js
const { createAuthService } = require('../unified-auth/sdk');

const auth = createAuthService();

// 注册
const r = auth.register('alice', 'password123');
// { ok: true, token: '...', user: { id, username, role, createdAt } }

// 登录
const r = auth.login('alice', 'password123');

// 访客登录
const r = auth.guest('Stanley');
// { ok: true, token: '...', user: { id, role: 'guest', guestName } }

// 验证 token
const r = auth.verify(token);
// { ok: true, valid: true, payload: { sub, role, username, exp, ... } }

// 获取当前用户
const r = auth.me(token);
// { ok: true, user: { id, role, username, guestName } }
```

所有方法均为**同步调用**，返回统一结构：

| 字段 | 说明 |
|------|------|
| `ok` | 是否成功 |
| `token` | 登录/注册成功时返回 |
| `user` | 用户信息 |
| `error` | 失败时的错误描述 |
| `code` | 失败时的建议 HTTP 状态码 |

### 手动实例化（完全控制配置）

```js
const { AuthService, JsonStore } = require('../unified-auth/sdk');

const auth = new AuthService({
  secret:   'my-strong-random-secret',
  ttl:      3600,                         // token 有效期（秒）
  dataFile: '/data/my-app/users.json',    // 自定义数据文件路径
  // store: myCustomDbStore,              // 自定义存储后端
});
```

---

## 浏览器端 SDK

适合前端 demo，对 auth server 的 HTTP API 做了一层封装，并自动管理 token。

```html
<script type="module">
  import { createAuthClient } from './client/auth-client.js';

  const auth = createAuthClient('http://localhost:8787');

  // 监听登录状态
  auth.onStateChange(user => {
    console.log('当前用户:', user); // null 表示已退出
  });

  // 注册
  const r = await auth.register('alice', 'password123');

  // 登录
  const r = await auth.login('alice', 'password123');

  // 访客登录
  const r = await auth.guest('Stanley');

  // 获取本地缓存用户（无请求）
  const user = auth.currentUser();

  // 服务端验证 token
  const r = await auth.verifyToken();

  // 退出
  auth.logout();
</script>
```

---

## HTTP Server（REST API）

```bash
# 启动
AUTH_SECRET='your-secret' PORT=8787 npm start

# 开发模式（已预设 secret）
npm run dev
```

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/guest` | 访客登录 |
| GET | `/api/auth/me` | 获取当前用户（需 Bearer token）|
| POST | `/api/auth/verify` | 验证 token 有效性 |

---

## 其他小程序接入方式

### 方式一：直接调用 SDK（推荐，性能最高）

```js
const { createAuthService } = require('../unified-auth/sdk');
const auth = createAuthService();

// 在业务逻辑中直接调用
function requireAuth(token) {
  const result = auth.verify(token);
  if (!result.valid) throw new Error('Unauthorized');
  return result.payload;
}
```

### 方式二：HTTP 验签（适合跨语言场景）

```bash
POST http://localhost:8787/api/auth/verify
Content-Type: application/json

{ "token": "<jwt>" }
```

### 方式三：本地验签（性能最高，适合高频场景）

```js
const { token } = require('../unified-auth/sdk');
const payload = token.verify(tok, process.env.AUTH_SECRET);
if (!payload) return res.status(401).json({ error: 'Unauthorized' });
```

---

## 安全说明

- 密码：PBKDF2 + 随机 salt（120,000 次迭代）
- Token：HS256 签名，含过期时间
- 使用 `crypto.timingSafeEqual` 防止时序攻击
- 生产环境请务必设置强随机 `AUTH_SECRET`

---

## 后续可扩展

- [ ] Refresh token 机制
- [ ] Logout token 黑名单（Redis/内存）
- [ ] 邮箱 / 验证码登录
- [ ] OAuth（微信 / Google）
- [ ] 将 `JsonStore` 替换为 SQLite / MongoDB 适配器
