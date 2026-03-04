/**
 * sdk/token.js
 * 轻量 JWT 工具（HS256，无第三方依赖）
 */
'use strict';

const crypto = require('crypto');

/** base64url 编码 */
function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** base64url 解码 */
function b64urlDecode(str) {
  return Buffer.from(
    str.replace(/-/g, '+').replace(/_/g, '/'),
    'base64'
  ).toString('utf8');
}

const HEADER = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

/**
 * 签发 Token
 * @param {object} payload  - 自定义载荷（请勿放密码等敏感字段）
 * @param {string} secret   - HMAC 密钥
 * @param {number} ttl      - 有效期（秒），默认 7 天
 * @returns {string}        - JWT 字符串
 */
function sign(payload, secret, ttl = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + ttl
  };
  const p = b64url(JSON.stringify(claims));
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${HEADER}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${HEADER}.${p}.${sig}`;
}

/**
 * 验证 Token
 * @param {string} token  - JWT 字符串
 * @param {string} secret - HMAC 密钥
 * @returns {object|null} - 验证通过返回 payload，否则返回 null
 */
function verify(token, secret) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [h, p, sig] = parts;

  // 验签
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${h}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }

  // 解析 payload
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(p));
  } catch {
    return null;
  }

  // 检查过期
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

/**
 * 解析 Token（不验签，仅读取 payload，用于调试/日志）
 * @param {string} token
 * @returns {object|null}
 */
function decode(token) {
  try {
    const [, p] = token.split('.');
    return JSON.parse(b64urlDecode(p));
  } catch {
    return null;
  }
}

module.exports = { sign, verify, decode };
