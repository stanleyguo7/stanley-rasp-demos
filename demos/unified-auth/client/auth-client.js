/**
 * client/auth-client.js
 * 浏览器端 Auth SDK（ES Module）
 *
 * 功能：
 *   - 封装对 unified-auth HTTP API 的 fetch 调用
 *   - 自动管理 localStorage 中的 token
 *   - 提供响应式 onStateChange 回调
 *
 * 使用示例（HTML）：
 *   <script type="module">
 *     import { AuthClient } from './auth-client.js';
 *
 *     const auth = new AuthClient({ baseUrl: 'http://localhost:8787' });
 *
 *     auth.onStateChange(user => {
 *       console.log('当前用户:', user); // null 表示未登录
 *     });
 *
 *     // 注册
 *     const r = await auth.register('alice', 'password123');
 *
 *     // 登录
 *     const r = await auth.login('alice', 'password123');
 *
 *     // 访客
 *     const r = await auth.guest('Stanley');
 *
 *     // 获取当前用户（读缓存，无网络请求）
 *     const user = auth.currentUser();
 *
 *     // 退出
 *     auth.logout();
 *   </script>
 */

const TOKEN_KEY = 'unified_auth_token';
const USER_KEY  = 'unified_auth_user';

export class AuthClient {
  /**
   * @param {object} config
   * @param {string}   config.baseUrl         - auth server 地址，如 'http://localhost:8787'
   * @param {string}  [config.tokenKey]       - localStorage key（默认 'unified_auth_token'）
   * @param {number}  [config.fetchTimeout]   - 请求超时毫秒（默认 8000）
   */
  constructor(config = {}) {
    if (!config.baseUrl) throw new Error('[AuthClient] config.baseUrl is required');
    this._base    = config.baseUrl.replace(/\/$/, '');
    this._tKey    = config.tokenKey ?? TOKEN_KEY;
    this._uKey    = USER_KEY;
    this._timeout = config.fetchTimeout ?? 8000;
    this._listeners = [];
  }

  // ─── 内部工具 ──────────────────────────────────────────────

  async _fetch(path, opts = {}) {
    const ctrl   = new AbortController();
    const timer  = setTimeout(() => ctrl.abort(), this._timeout);
    const token  = this.getToken();

    const headers = { 'Content-Type': 'application/json', ...(opts.headers ?? {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res  = await fetch(`${this._base}${path}`, {
        ...opts,
        headers,
        signal: ctrl.signal
      });
      const data = await res.json();
      return { status: res.status, ...data };
    } catch (err) {
      if (err.name === 'AbortError') return { ok: false, error: '请求超时' };
      return { ok: false, error: err.message };
    } finally {
      clearTimeout(timer);
    }
  }

  _save(token, user) {
    localStorage.setItem(this._tKey, token);
    localStorage.setItem(this._uKey, JSON.stringify(user));
    this._notify(user);
  }

  _clear() {
    localStorage.removeItem(this._tKey);
    localStorage.removeItem(this._uKey);
    this._notify(null);
  }

  _notify(user) {
    this._listeners.forEach(fn => {
      try { fn(user); } catch (_) { /* ignore */ }
    });
  }

  // ─── 状态订阅 ──────────────────────────────────────────────

  /**
   * 监听登录状态变化
   * @param {(user: object|null) => void} fn
   * @returns {() => void} 取消订阅函数
   */
  onStateChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  // ─── Token & 用户缓存 ──────────────────────────────────────

  /** 获取本地存储的 token */
  getToken() {
    return localStorage.getItem(this._tKey) ?? null;
  }

  /** 获取本地缓存的用户信息（不发网络请求） */
  currentUser() {
    try {
      const raw = localStorage.getItem(this._uKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** 是否已登录 */
  isLoggedIn() {
    return Boolean(this.getToken());
  }

  // ─── 核心方法 ──────────────────────────────────────────────

  /**
   * 注册
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ ok, token?, user?, error? }>}
   */
  async register(username, password) {
    const res = await this._fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) this._save(res.token, res.user);
    return res;
  }

  /**
   * 登录
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ ok, token?, user?, error? }>}
   */
  async login(username, password) {
    const res = await this._fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) this._save(res.token, res.user);
    return res;
  }

  /**
   * 访客登录
   * @param {string} [guestName]
   * @returns {Promise<{ ok, token?, user?, error? }>}
   */
  async guest(guestName) {
    const res = await this._fetch('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ guestName })
    });
    if (res.ok) this._save(res.token, res.user);
    return res;
  }

  /**
   * 从服务端获取当前用户信息（会发网络请求）
   * @returns {Promise<{ ok, user?, error? }>}
   */
  async fetchMe() {
    const res = await this._fetch('/api/auth/me');
    if (res.ok) {
      localStorage.setItem(this._uKey, JSON.stringify(res.user));
    }
    return res;
  }

  /**
   * 验证 token 是否有效（服务端验签）
   * @param {string} [tok] - 不传则使用本地存储的 token
   * @returns {Promise<{ ok, valid, payload?, error? }>}
   */
  async verifyToken(tok) {
    const tokenToVerify = tok ?? this.getToken();
    if (!tokenToVerify) return { ok: false, valid: false, error: 'no token' };
    return this._fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token: tokenToVerify })
    });
  }

  /**
   * 退出登录（清除本地 token）
   */
  logout() {
    this._clear();
  }

  /**
   * 健康检查
   * @returns {Promise<{ ok, ts? }>}
   */
  async ping() {
    return this._fetch('/api/health');
  }
}

/**
 * 默认单例工厂（适合大多数 demo 快速接入）
 * @param {string} baseUrl
 * @returns {AuthClient}
 */
export function createAuthClient(baseUrl) {
  return new AuthClient({ baseUrl });
}
