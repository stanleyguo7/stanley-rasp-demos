const animals = [
  { name: '小鸡', emoji: '🐤' },
  { name: '小鸭', emoji: '🦆' },
  { name: '老鹰', emoji: '🦅' },
  { name: '猫头鹰', emoji: '🦉' },
  { name: '鸽子', emoji: '🕊️' },
  { name: '孔雀', emoji: '🦚' },
  { name: '鹦鹉', emoji: '🦜' },
  { name: '火烈鸟', emoji: '🦩' },
  { name: '天鹅', emoji: '🦢' },
  { name: '渡渡鸟', emoji: '🦤' },

  { name: '青蛙', emoji: '🐸' },
  { name: '乌龟', emoji: '🐢' },
  { name: '蜥蜴', emoji: '🦎' },
  { name: '蛇', emoji: '🐍' },
  { name: '龙', emoji: '🐉' },
  { name: '恐龙', emoji: '🦕' },
  { name: '霸王龙', emoji: '🦖' },

  { name: '鲸鱼', emoji: '🐋' },
  { name: '海豚', emoji: '🐬' },
  { name: '鲨鱼', emoji: '🦈' },
  { name: '章鱼', emoji: '🐙' },
  { name: '海豹', emoji: '🦭' },
  { name: '热带鱼', emoji: '🐠' },
  { name: '小鱼', emoji: '🐟' },
  { name: '河豚', emoji: '🐡' },
  { name: '螃蟹', emoji: '🦀' },
  { name: '龙虾', emoji: '🦞' },
  { name: '虾', emoji: '🦐' },
  { name: '乌贼', emoji: '🦑' },
  { name: '贝壳', emoji: '🐚' },

  { name: '蜗牛', emoji: '🐌' },
  { name: '蝴蝶', emoji: '🦋' },
  { name: '蜜蜂', emoji: '🐝' },
  { name: '蚂蚁', emoji: '🐜' },
  { name: '蚊子', emoji: '🦟' },
  { name: '苍蝇', emoji: '🪰' },
  { name: '甲虫', emoji: '🪲' },
  { name: '蟑螂', emoji: '🪳' },
  { name: '蜘蛛', emoji: '🕷️' },
  { name: '蜘蛛网', emoji: '🕸️' },
  { name: '蝎子', emoji: '🦂' },
  { name: '蚯蚓', emoji: '🪱' },
  { name: '微生物', emoji: '🦠' },

  { name: '老鼠', emoji: '🐭' },
  { name: '仓鼠', emoji: '🐹' },
  { name: '兔子', emoji: '🐰' },
  { name: '狐狸', emoji: '🦊' },
  { name: '熊', emoji: '🐻' },
  { name: '北极熊', emoji: '🐻‍❄️' },
  { name: '熊猫', emoji: '🐼' },
  { name: '考拉', emoji: '🐨' },
  { name: '老虎', emoji: '🐯' },
  { name: '狮子', emoji: '🦁' },
  { name: '豹子', emoji: '🐆' },
  { name: '狼', emoji: '🐺' },
  { name: '猴子', emoji: '🐵' },
  { name: '猩猩', emoji: '🦍' },
  { name: '猩猩（长臂）', emoji: '🦧' },

  { name: '猫', emoji: '🐱' },
  { name: '狗', emoji: '🐶' },
  { name: '马', emoji: '🐴' },
  { name: '独角兽', emoji: '🦄' },
  { name: '斑马', emoji: '🦓' },
  { name: '鹿', emoji: '🦌' },
  { name: '牛', emoji: '🐮' },
  { name: '水牛', emoji: '🐃' },
  { name: '公牛', emoji: '🐂' },
  { name: '猪', emoji: '🐷' },
  { name: '野猪', emoji: '🐗' },
  { name: '绵羊', emoji: '🐑' },
  { name: '山羊', emoji: '🐐' },
  { name: '骆驼', emoji: '🐪' },
  { name: '双峰骆驼', emoji: '🐫' },
  { name: '羊驼', emoji: '🦙' },
  { name: '长颈鹿', emoji: '🦒' },
  { name: '大象', emoji: '🐘' },
  { name: '猛犸象', emoji: '🦣' },
  { name: '犀牛', emoji: '🦏' },
  { name: '河马', emoji: '🦛' },
  { name: '袋鼠', emoji: '🦘' },
  { name: '树懒', emoji: '🦥' },
  { name: '水獭', emoji: '🦦' },
  { name: '臭鼬', emoji: '🦨' },
  { name: '獾', emoji: '🦡' },
  { name: '海狸', emoji: '🦫' },
  { name: '脚印', emoji: '🐾' }
];

const roundEl = document.getElementById('round');
const cardEl = document.getElementById('animalCard');
const nameEl = document.getElementById('animalName');
const emojiEl = document.getElementById('animalEmoji');
const hintEl = document.getElementById('hint');
const historyEl = document.getElementById('history');

const drawBtn = document.getElementById('drawBtn');
const hideBtn = document.getElementById('hideBtn');
const nextBtn = document.getElementById('nextBtn');

let round = 1;
let current = null;

function pickAnimal() {
  const idx = Math.floor(Math.random() * animals.length);
  return animals[idx];
}

function renderCard(animal) {
  nameEl.textContent = animal.name;
  emojiEl.textContent = animal.emoji;
  emojiEl.classList.remove('hidden');

  cardEl.classList.remove('hidden');
  hintEl.textContent = '请模仿这个动物，让其他人猜。';
}

function addHistory(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyEl.prepend(li);
}

drawBtn.addEventListener('click', () => {
  current = pickAnimal();
  renderCard(current);
  addHistory(`第 ${round} 轮：翻到一张新动物卡`);
});

hideBtn.addEventListener('click', () => {
  if (!current) {
    hintEl.textContent = '请先翻卡。';
    return;
  }
  cardEl.classList.add('hidden');
  hintEl.textContent = '卡片已隐藏，请把手机给其他人猜！';
});

nextBtn.addEventListener('click', () => {
  if (!current) {
    hintEl.textContent = '请先翻卡。';
    return;
  }
  addHistory(`第 ${round} 轮：已猜对（答案：${current.name}${current.emoji}）`);
  round += 1;
  roundEl.textContent = String(round);
  current = pickAnimal();
  renderCard(current);
  addHistory(`第 ${round} 轮：翻到一张新动物卡`);
});