#!/usr/bin/env node
/**
 * server.js
 * HTTP 薄层 —— 将 SDK 暴露为 REST API
 * 业务逻辑全部在 sdk/ 中，此文件只负责解析请求 / 序列化响应
 */
'use strict';

const http = require('http');
const { createAuthService } = require('./sdk');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

// 初始化 SDK 实例（自动读取环境变量）
const auth = createAuthService();

// ─── 工具函数 ──────────────────────────────────────────────────────────────

function send(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 512 * 1024) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function extractBearer(req) {
  const v = req.headers.authorization || '';
  return v.startsWith('Bearer ') ? v.slice(7).trim() : '';
}

// SDK 结果 → HTTP 状态码映射
function sdkCodeToHttp(sdkCode, fallback = 200) {
  return sdkCode ?? fallback;
}

// ─── 路由表 ────────────────────────────────────────────────────────────────

const routes = [
  // 健康检查
  {
    method: 'GET',
    path: '/api/health',
    async handle(_req, _body) {
      return [200, { ok: true, service: 'unified-auth', ts: Date.now() }];
    }
  },

  // 注册
  {
    method: 'POST',
    path: '/api/auth/register',
    async handle(_req, body) {
      const result = auth.register(body.username, body.password);
      return [result.ok ? 201 : sdkCodeToHttp(result.code, 400), result];
    }
  },

  // 登录
  {
    method: 'POST',
    path: '/api/auth/login',
    async handle(_req, body) {
      const result = auth.login(body.username, body.password);
      return [result.ok ? 200 : sdkCodeToHttp(result.code, 401), result];
    }
  },

  // 访客登录
  {
    method: 'POST',
    path: '/api/auth/guest',
    async handle(_req, body) {
      const result = auth.guest(body.guestName);
      return [201, result];
    }
  },

  // 获取当前身份（需 Bearer token）
  {
    method: 'GET',
    path: '/api/auth/me',
    async handle(req, _body) {
      const result = auth.me(extractBearer(req));
      return [result.ok ? 200 : 401, result];
    }
  },

  // Token 验签（供其他服务端调用）
  {
    method: 'POST',
    path: '/api/auth/verify',
    async handle(req, body) {
      const tok    = body.token || extractBearer(req);
      const result = auth.verify(tok);
      return [result.ok ? 200 : 401, result];
    }
  }
];

// ─── HTTP Server ───────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS 预检
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = routes.find(r => r.method === req.method && r.path === url.pathname);

  if (!route) return send(res, 404, { ok: false, error: 'not found' });

  try {
    const body         = req.method === 'POST' ? await parseBody(req) : {};
    const [code, data] = await route.handle(req, body);
    send(res, code, data);
  } catch (err) {
    send(res, 500, { ok: false, error: err.message || 'internal error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[unified-auth] listening → http://${HOST}:${PORT}`);
  console.log(`[unified-auth] routes:`);
  routes.forEach(r => console.log(`  ${r.method.padEnd(6)} ${r.path}`));
});
