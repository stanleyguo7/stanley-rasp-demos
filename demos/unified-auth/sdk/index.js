/**
 * sdk/index.js
 * unified-auth SDK 统一导出入口
 *
 * 使用方式（Node.js 服务端直接调用）：
 *
 *   const { createAuthService, AuthService } = require('../unified-auth/sdk');
 *
 *   // 方式一：工厂函数（推荐，自动读取环境变量）
 *   const auth = createAuthService();
 *   const result = auth.register('alice', 'password123');
 *
 *   // 方式二：手动实例化（完全控制配置）
 *   const auth = new AuthService({
 *     secret:   'my-super-secret',
 *     ttl:      3600,
 *     dataFile: '/path/to/users.json'
 *   });
 */
'use strict';

const { AuthService } = require('./auth');
const token           = require('./token');
const password        = require('./password');
const { JsonStore }   = require('./store');
const path            = require('path');

/**
 * 工厂函数 —— 从环境变量读取配置并返回 AuthService 实例
 * @param {object} [overrides] - 可选覆盖项
 * @returns {AuthService}
 */
function createAuthService(overrides = {}) {
  return new AuthService({
    secret:   process.env.AUTH_SECRET || 'change-me-in-production',
    ttl:      Number(process.env.TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7),
    dataFile: process.env.AUTH_DATA_FILE ||
              path.join(__dirname, '..', 'data', 'users.json'),
    ...overrides
  });
}

module.exports = {
  // 核心类
  AuthService,
  JsonStore,

  // 工厂函数
  createAuthService,

  // 底层工具（供需要精细控制的场景使用）
  token,
  password
};
