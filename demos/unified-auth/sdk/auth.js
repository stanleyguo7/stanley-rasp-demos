/**
 * sdk/auth.js
 * Auth 核心业务逻辑 —— 与 HTTP / 框架无关，可直接 require 后调用
 *
 * 所有方法均返回统一结构：
 *   成功：{ ok: true,  ...data }
 *   失败：{ ok: false, error: string, code: number }
 */
'use strict';

const crypto   = require('crypto');
const token    = require('./token');
const password = require('./password');
const { JsonStore } = require('./store');

class AuthService {
  /**
   * @param {object} config
   * @param {string}    config.secret     - HMAC 签名密钥（必填，生产环境请用强随机值）
   * @param {number}   [config.ttl]       - Token 有效期（秒），默认 7 天
   * @param {string}   [config.dataFile]  - users.json 路径，默认同目录下 data/users.json
   * @param {object}   [config.store]     - 自定义存储后端（需实现 store 接口）
   */
  constructor(config = {}) {
    if (!config.secret) throw new Error('[AuthService] config.secret is required');
    this._secret = config.secret;
    this._ttl    = config.ttl ?? 60 * 60 * 24 * 7; // 7 天
    this._store  = config.store ?? new JsonStore(
      config.dataFile ?? require('path').join(__dirname, '..', 'data', 'users.json')
    );
  }

  // ---------- 内部工具 ----------

  _issueToken(claims) {
    return token.sign(claims, this._secret, this._ttl);
  }

  _safeUser(u) {
    return { id: u.id, username: u.username, role: 'user', createdAt: u.createdAt };
  }

  _err(code, error) {
    return { ok: false, code, error };
  }

  // ---------- 公共 API ----------

  /**
   * 注册新用户
   * @param {string} username
   * @param {string} passwd
   * @returns {{ ok, token, user } | { ok, code, error }}
   */
  register(username, passwd) {
    username = String(username || '').trim().toLowerCase();
    passwd   = String(passwd || '');

    if (!username || username.length < 3) {
      return this._err(400, 'username must be at least 3 characters');
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return this._err(400, 'username may only contain letters, digits, _ and -');
    }
    if (!passwd || passwd.length < 6) {
      return this._err(400, 'password must be at least 6 characters');
    }

    if (this._store.findUser(username)) {
      return this._err(409, 'username already exists');
    }

    const id = crypto.randomUUID();
    const { hash, salt } = password.hash(passwd);
    const user = this._store.createUser({
      id,
      username,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    });

    const tok = this._issueToken({ sub: id, role: 'user', username });
    return { ok: true, token: tok, user: this._safeUser(user) };
  }

  /**
   * 用户名密码登录
   * @param {string} username
   * @param {string} passwd
   * @returns {{ ok, token, user } | { ok, code, error }}
   */
  login(username, passwd) {
    username = String(username || '').trim().toLowerCase();
    passwd   = String(passwd || '');

    const user = this._store.findUser(username);
    if (!user) return this._err(401, 'invalid credentials');

    if (!password.verify(passwd, user.passwordHash, user.salt)) {
      return this._err(401, 'invalid credentials');
    }

    const tok = this._issueToken({ sub: user.id, role: 'user', username: user.username });
    return { ok: true, token: tok, user: this._safeUser(user) };
  }

  /**
   * 访客登录（免注册，token 有效期内可持续使用）
   * @param {string} [guestName] - 不传则自动生成
   * @returns {{ ok, token, user }}
   */
  guest(guestName) {
    const name = String(guestName || '').trim() || `guest-${Date.now().toString().slice(-6)}`;
    const id   = `guest_${crypto.randomUUID()}`;

    this._store.createGuest({ id, guestName: name, createdAt: new Date().toISOString() });

    const tok = this._issueToken({ sub: id, role: 'guest', guestName: name });
    return { ok: true, token: tok, user: { id, role: 'guest', guestName: name } };
  }

  /**
   * 验证 token 有效性
   * @param {string} tok
   * @returns {{ ok, valid, payload } | { ok, valid, error }}
   */
  verify(tok) {
    const payload = token.verify(tok, this._secret);
    if (!payload) return { ok: false, valid: false, error: 'invalid or expired token' };
    return {
      ok: true,
      valid: true,
      payload: {
        sub:       payload.sub,
        role:      payload.role,
        username:  payload.username,
        guestName: payload.guestName,
        exp:       payload.exp,
        iat:       payload.iat
      }
    };
  }

  /**
   * 从 token 获取当前用户信息
   * @param {string} tok
   * @returns {{ ok, user } | { ok, code, error }}
   */
  me(tok) {
    const result = this.verify(tok);
    if (!result.ok) return this._err(401, result.error);
    const { payload } = result;
    return {
      ok: true,
      user: {
        id:        payload.sub,
        role:      payload.role,
        username:  payload.username,
        guestName: payload.guestName
      }
    };
  }
}

module.exports = { AuthService };
