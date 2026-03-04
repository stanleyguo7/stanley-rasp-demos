/**
 * sdk/password.js
 * 密码哈希工具（PBKDF2 + 随机 salt）
 */
'use strict';

const crypto = require('crypto');

const ITERATIONS = 120_000;
const KEY_LEN    = 32;
const DIGEST     = 'sha256';

/**
 * 对密码进行哈希
 * @param {string} password
 * @param {string} [salt]   - 十六进制字符串；不传则随机生成
 * @returns {{ hash: string, salt: string }}
 */
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST)
    .toString('hex');
  return { hash: derived, salt };
}

/**
 * 验证密码是否匹配
 * @param {string} password   - 明文密码
 * @param {string} storedHash - 存储的哈希值
 * @param {string} salt       - 对应的 salt
 * @returns {boolean}
 */
function verify(password, storedHash, salt) {
  const { hash: derived } = hash(password, salt);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(derived, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
}

module.exports = { hash, verify };
