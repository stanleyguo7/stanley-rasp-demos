/**
 * sdk/store.js
 * JSON 文件存储层 —— 生产环境可替换为数据库适配器
 *
 * 接口约定（任何存储后端都要实现这 5 个方法）：
 *   findUser(username)          → user | null
 *   findUserById(id)            → user | null
 *   createUser(user)            → user
 *   createGuest(guest)          → guest
 *   listUsers()                 → user[]
 */
'use strict';

const fs   = require('fs');
const path = require('path');

class JsonStore {
  /**
   * @param {string} filePath - 绝对路径，指向 users.json
   */
  constructor(filePath) {
    this._file = filePath;
    this._ensureFile();
  }

  // ---------- private ----------

  _ensureFile() {
    const dir = path.dirname(this._file);
    if (!fs.existsSync(dir))  fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this._file)) {
      fs.writeFileSync(this._file, JSON.stringify({ users: [], guests: [] }, null, 2), 'utf8');
    }
  }

  _read() {
    return JSON.parse(fs.readFileSync(this._file, 'utf8'));
  }

  _write(db) {
    fs.writeFileSync(this._file, JSON.stringify(db, null, 2), 'utf8');
  }

  // ---------- public ----------

  findUser(username) {
    const { users } = this._read();
    return users.find(u => u.username === username) ?? null;
  }

  findUserById(id) {
    const { users } = this._read();
    return users.find(u => u.id === id) ?? null;
  }

  createUser(user) {
    const db = this._read();
    db.users.push(user);
    this._write(db);
    return user;
  }

  createGuest(guest) {
    const db = this._read();
    db.guests.push(guest);
    this._write(db);
    return guest;
  }

  listUsers() {
    return this._read().users;
  }
}

module.exports = { JsonStore };
