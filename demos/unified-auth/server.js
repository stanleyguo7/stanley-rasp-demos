#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me-in-production';
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7); // 7d

ensureDataFiles();

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(
      USERS_FILE,
      JSON.stringify({ users: [], guests: [] }, null, 2),
      'utf8'
    );
  }
}

function readDb() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function json(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${h}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${h}.${p}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expected = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${h}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return { hash, salt };
}

function safeUserView(u) {
  return {
    id: u.id,
    username: u.username,
    role: 'user',
    createdAt: u.createdAt
  };
}

function issueToken({ sub, role, username, guestName }) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    sub,
    role,
    username,
    guestName,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  });
}

function extractBearer(req) {
  const v = req.headers.authorization || '';
  if (!v.startsWith('Bearer ')) return '';
  return v.slice(7).trim();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { ok: true, service: 'unified-auth', ts: Date.now() });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!username || username.length < 3) {
        return json(res, 400, { ok: false, error: 'username must be >=3 chars' });
      }
      if (!password || password.length < 6) {
        return json(res, 400, { ok: false, error: 'password must be >=6 chars' });
      }

      const db = readDb();
      if (db.users.some(u => u.username === username)) {
        return json(res, 409, { ok: false, error: 'username already exists' });
      }

      const id = crypto.randomUUID();
      const { hash, salt } = hashPassword(password);
      const user = {
        id,
        username,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDb(db);

      const token = issueToken({ sub: id, role: 'user', username });
      return json(res, 201, { ok: true, token, user: safeUserView(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');

      const db = readDb();
      const user = db.users.find(u => u.username === username);
      if (!user) return json(res, 401, { ok: false, error: 'invalid credentials' });

      const { hash } = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return json(res, 401, { ok: false, error: 'invalid credentials' });
      }

      const token = issueToken({ sub: user.id, role: 'user', username: user.username });
      return json(res, 200, { ok: true, token, user: safeUserView(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/guest') {
      const body = await parseBody(req);
      const guestName = String(body.guestName || '').trim() || `guest-${Date.now().toString().slice(-6)}`;
      const guestId = `guest_${crypto.randomUUID()}`;

      const db = readDb();
      db.guests.push({ id: guestId, guestName, createdAt: new Date().toISOString() });
      writeDb(db);

      const token = issueToken({ sub: guestId, role: 'guest', guestName });
      return json(res, 201, { ok: true, token, user: { id: guestId, role: 'guest', guestName } });
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const payload = verifyToken(extractBearer(req));
      if (!payload) return json(res, 401, { ok: false, error: 'invalid token' });
      return json(res, 200, {
        ok: true,
        user: {
          id: payload.sub,
          role: payload.role,
          username: payload.username,
          guestName: payload.guestName
        }
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/verify') {
      const body = await parseBody(req);
      const token = body.token || extractBearer(req);
      const payload = verifyToken(token);
      if (!payload) return json(res, 401, { ok: false, valid: false });
      return json(res, 200, {
        ok: true,
        valid: true,
        payload: {
          sub: payload.sub,
          role: payload.role,
          username: payload.username,
          guestName: payload.guestName,
          exp: payload.exp
        }
      });
    }

    return json(res, 404, { ok: false, error: 'not found' });
  } catch (err) {
    return json(res, 500, { ok: false, error: err.message || 'internal error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[unified-auth] listening on http://${HOST}:${PORT}`);
});
