import * as THREE from 'three';

// 游戏状态
const gameState = {
  isPlaying: false,
  score: 0,
  lives: 3,
  level: 1,
  gameTime: 0
};

// 场景设置
let scene, camera, renderer;
let player;
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let keys = {};
let lastShotTime = 0;
let lastEnemySpawn = 0;
let lastEnemyShot = 0;

// 游戏参数
const PLAYER_SPEED = 0.3;
const BULLET_SPEED = 1.5;
const ENEMY_BULLET_SPEED = 0.8;
const PLAYER_SHOOT_COOLDOWN = 200; // 毫秒
const ENEMY_SHOOT_COOLDOWN = 2000; // 毫秒
const ENEMY_SPAWN_INTERVAL = 2000; // 毫秒

// 初始化场景
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000033);
  scene.fog = new THREE.Fog(0x000033, 0, 100);

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 渲染器
  const canvas = document.getElementById('gameCanvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // 添加星空背景
  createStarField();
}

// 创建星空背景
function createStarField() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
  const starsVertices = [];

  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

// 创建飞机纹理（使用 Canvas 绘制）
function createAirplaneTexture(color, isPlayer = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // 清空画布（透明背景）
  ctx.clearRect(0, 0, 128, 128);
  
  const centerX = 64;
  const centerY = 64;
  
  if (isPlayer) {
    // 玩家飞机（向上飞）
    // 绘制机翼（后）
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20);
    ctx.lineTo(centerX - 35, centerY + 45);
    ctx.lineTo(centerX - 25, centerY + 50);
    ctx.lineTo(centerX, centerY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20);
    ctx.lineTo(centerX + 35, centerY + 45);
    ctx.lineTo(centerX + 25, centerY + 50);
    ctx.lineTo(centerX, centerY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制飞机主体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 40);
    ctx.lineTo(centerX - 20, centerY + 20);
    ctx.lineTo(centerX, centerY + 15);
    ctx.lineTo(centerX + 20, centerY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制前机翼
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX - 25, centerY - 5);
    ctx.lineTo(centerX - 15, centerY);
    ctx.lineTo(centerX, centerY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX + 25, centerY - 5);
    ctx.lineTo(centerX + 15, centerY);
    ctx.lineTo(centerX, centerY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制驾驶舱
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  } else {
    // 敌机（向下飞）
    // 绘制机翼（后）
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX - 35, centerY - 45);
    ctx.lineTo(centerX - 25, centerY - 50);
    ctx.lineTo(centerX, centerY - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX + 35, centerY - 45);
    ctx.lineTo(centerX + 25, centerY - 50);
    ctx.lineTo(centerX, centerY - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制飞机主体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 40);
    ctx.lineTo(centerX - 20, centerY - 20);
    ctx.lineTo(centerX, centerY - 15);
    ctx.lineTo(centerX + 20, centerY - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制前机翼
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20);
    ctx.lineTo(centerX - 25, centerY + 5);
    ctx.lineTo(centerX - 15, centerY);
    ctx.lineTo(centerX, centerY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20);
    ctx.lineTo(centerX + 25, centerY + 5);
    ctx.lineTo(centerX + 15, centerY);
    ctx.lineTo(centerX, centerY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制驾驶舱
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 创建玩家飞机
function createPlayer() {
  const texture = createAirplaneTexture('#22c55e', true);
  const geometry = new THREE.PlaneGeometry(0.6, 0.8);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  player = new THREE.Mesh(geometry, material);
  player.position.set(0, -2, 0);
  scene.add(player);
}

// 创建子弹
function createBullet(position, isPlayerBullet = true) {
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshBasicMaterial({
    color: isPlayerBullet ? 0x22c55e : 0xef4444
  });
  const bullet = new THREE.Mesh(geometry, material);
  bullet.position.copy(position);
  bullet.userData = {
    isPlayerBullet,
    speed: isPlayerBullet ? BULLET_SPEED : ENEMY_BULLET_SPEED
  };
  scene.add(bullet);
  return bullet;
}

// 创建敌机
function createEnemy() {
  const texture = createAirplaneTexture('#ef4444', false);
  const geometry = new THREE.PlaneGeometry(0.5, 0.6);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const enemy = new THREE.Mesh(geometry, material);
  
  // 随机位置在屏幕上方
  enemy.position.set(
    (Math.random() - 0.5) * 8,
    3 + Math.random() * 2,
    0
  );
  
  enemy.userData = {
    speed: 0.05 + gameState.level * 0.01,
    health: 1
  };
  
  scene.add(enemy);
  return enemy;
}

// 玩家控制
function handlePlayerMovement() {
  if (!player || !gameState.isPlaying) return;

  const moveSpeed = PLAYER_SPEED;
  let moved = false;

  if (keys['w'] || keys['ArrowUp']) {
    player.position.y = Math.min(player.position.y + moveSpeed, 2.5);
    moved = true;
  }
  if (keys['s'] || keys['ArrowDown']) {
    player.position.y = Math.max(player.position.y - moveSpeed, -2.5);
    moved = true;
  }
  if (keys['a'] || keys['ArrowLeft']) {
    player.position.x = Math.max(player.position.x - moveSpeed, -4);
    moved = true;
  }
  if (keys['d'] || keys['ArrowRight']) {
    player.position.x = Math.min(player.position.x + moveSpeed, 4);
    moved = true;
  }

  // 发射子弹
  const now = Date.now();
  if ((keys[' '] || keys['Space']) && now - lastShotTime > PLAYER_SHOOT_COOLDOWN) {
    const bullet = createBullet(
      new THREE.Vector3(player.position.x, player.position.y + 0.5, player.position.z),
      true
    );
    playerBullets.push(bullet);
    lastShotTime = now;
  }
}

// 更新子弹
function updateBullets() {
  // 玩家子弹
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const bullet = playerBullets[i];
    bullet.position.y += bullet.userData.speed;
    
    // 移除超出屏幕的子弹
    if (bullet.position.y > 5) {
      scene.remove(bullet);
      bullet.geometry.dispose();
      bullet.material.dispose();
      playerBullets.splice(i, 1);
    }
  }

  // 敌机子弹
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.position.y -= bullet.userData.speed;
    
    // 移除超出屏幕的子弹
    if (bullet.position.y < -5) {
      scene.remove(bullet);
      bullet.geometry.dispose();
      bullet.material.dispose();
      enemyBullets.splice(i, 1);
    }
  }
}

// 更新敌机
function updateEnemies() {
  const now = Date.now();
  
  // 生成新敌机
  const spawnInterval = Math.max(500, ENEMY_SPAWN_INTERVAL - gameState.level * 100);
  if (now - lastEnemySpawn > spawnInterval) {
    enemies.push(createEnemy());
    lastEnemySpawn = now;
  }

  // 更新敌机位置和射击
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.position.y -= enemy.userData.speed;
    
    // 敌机射击
    if (now - lastEnemyShot > ENEMY_SHOOT_COOLDOWN && Math.random() < 0.3) {
      const bullet = createBullet(
        new THREE.Vector3(enemy.position.x, enemy.position.y - 0.3, enemy.position.z),
        false
      );
      enemyBullets.push(bullet);
      lastEnemyShot = now;
    }
    
    // 移除超出屏幕的敌机
    if (enemy.position.y < -5) {
      scene.remove(enemy);
      enemy.geometry.dispose();
      enemy.material.dispose();
      enemies.splice(i, 1);
    }
  }
}

// 碰撞检测
function checkCollisions() {
  // 玩家子弹 vs 敌机
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const bullet = playerBullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const distance = bullet.position.distanceTo(enemy.position);
      if (distance < 0.3) {
        // 击中敌机
        scene.remove(bullet);
        bullet.geometry.dispose();
        bullet.material.dispose();
        playerBullets.splice(i, 1);
        
        scene.remove(enemy);
        enemy.geometry.dispose();
        enemy.material.dispose();
        enemies.splice(j, 1);
        
        gameState.score += 10;
        updateUI();
        break;
      }
    }
  }

  // 敌机子弹 vs 玩家
  if (player) {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];
      const distance = bullet.position.distanceTo(player.position);
      if (distance < 0.4) {
        // 玩家被击中
        scene.remove(bullet);
        bullet.geometry.dispose();
        bullet.material.dispose();
        enemyBullets.splice(i, 1);
        
        gameState.lives--;
        updateUI();
        
        if (gameState.lives <= 0) {
          gameOver();
        }
        break;
      }
    }

    // 敌机 vs 玩家
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const distance = enemy.position.distanceTo(player.position);
      if (distance < 0.5) {
        // 碰撞
        scene.remove(enemy);
        enemy.geometry.dispose();
        enemy.material.dispose();
        enemies.splice(i, 1);
        
        gameState.lives--;
        updateUI();
        
        if (gameState.lives <= 0) {
          gameOver();
        }
        break;
      }
    }
  }
}

// 更新UI
function updateUI() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('lives').textContent = gameState.lives;
  
  // 更新等级（每100分升一级）
  const newLevel = Math.floor(gameState.score / 100) + 1;
  if (newLevel > gameState.level) {
    gameState.level = newLevel;
  }
  document.getElementById('level').textContent = gameState.level;
}

// 游戏循环
function animate() {
  requestAnimationFrame(animate);

  if (gameState.isPlaying) {
    gameState.gameTime += 16; // 假设60fps
    
    handlePlayerMovement();
    updateBullets();
    updateEnemies();
    checkCollisions();
  }

  renderer.render(scene, camera);
}

// 开始游戏
function startGame() {
  // 重置游戏状态
  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.lives = 3;
  gameState.level = 1;
  gameState.gameTime = 0;

  // 清理场景
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  playerBullets = [];
  enemies = [];
  enemyBullets = [];

  // 重新创建
  createStarField();
  createPlayer();
  
  // 隐藏开始界面，显示游戏
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameOver').classList.add('hidden');
  
  updateUI();
}

// 游戏结束
function gameOver() {
  gameState.isPlaying = false;
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('gameOver').classList.remove('hidden');
}

// 事件监听
function setupEventListeners() {
  // 键盘事件
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
      e.preventDefault();
      keys['Space'] = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === ' ') {
      keys['Space'] = false;
    }
  });

  // 窗口大小调整
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 按钮事件
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);
}

// 初始化
function init() {
  initScene();
  createPlayer();
  setupEventListeners();
  animate();
}

// 启动
init();
