const animals = [
  // 常见 emoji 动物
  { name: '猫', emoji: '🐱' }, { name: '狗', emoji: '🐶' }, { name: '兔子', emoji: '🐰' },
  { name: '猴子', emoji: '🐵' }, { name: '老虎', emoji: '🐯' }, { name: '狮子', emoji: '🦁' },
  { name: '大象', emoji: '🐘' }, { name: '长颈鹿', emoji: '🦒' }, { name: '熊猫', emoji: '🐼' },
  { name: '青蛙', emoji: '🐸' }, { name: '小鸡', emoji: '🐥' }, { name: '鸭子', emoji: '🦆' },
  { name: '海豚', emoji: '🐬' }, { name: '鲨鱼', emoji: '🦈' }, { name: '乌龟', emoji: '🐢' },
  { name: '蛇', emoji: '🐍' }, { name: '马', emoji: '🐴' }, { name: '猪', emoji: '🐷' },
  { name: '羊', emoji: '🐑' }, { name: '奶牛', emoji: '🐮' }, { name: '企鹅', emoji: '🐧' },
  { name: '狐狸', emoji: '🦊' }, { name: '狼', emoji: '🐺' }, { name: '河马', emoji: '🦛' },
  { name: '犀牛', emoji: '🦏' }, { name: '斑马', emoji: '🦓' }, { name: '树懒', emoji: '🦥' },
  { name: '水獭', emoji: '🦦' }, { name: '火烈鸟', emoji: '🦩' }, { name: '孔雀', emoji: '🦚' },
  { name: '鹦鹉', emoji: '🦜' }, { name: '海豹', emoji: '🦭' }, { name: '章鱼', emoji: '🐙' },
  { name: '螃蟹', emoji: '🦀' }, { name: '龙虾', emoji: '🦞' }, { name: '蜗牛', emoji: '🐌' },
  { name: '蝴蝶', emoji: '🦋' }, { name: '蜜蜂', emoji: '🐝' }, { name: '蚂蚁', emoji: '🐜' },
  { name: '瓢虫', emoji: '🐞' },

  // 无对应 emoji 的动物，使用网上抓图（Unsplash Source）
  { name: '水豚', image: 'https://source.unsplash.com/featured/?capybara' },
  { name: '红熊猫', image: 'https://source.unsplash.com/featured/?red-panda' },
  { name: '考拉熊', image: 'https://source.unsplash.com/featured/?koala' },
  { name: '土拨鼠', image: 'https://source.unsplash.com/featured/?marmot' },
  { name: '雪豹', image: 'https://source.unsplash.com/featured/?snow-leopard' },
  { name: '海獭', image: 'https://source.unsplash.com/featured/?sea-otter' },
  { name: '鸵鸟', image: 'https://source.unsplash.com/featured/?ostrich' },
  { name: '鹈鹕', image: 'https://source.unsplash.com/featured/?pelican' },
  { name: '猫头鹰', image: 'https://source.unsplash.com/featured/?owl' },
  { name: '蜂鸟', image: 'https://source.unsplash.com/featured/?hummingbird' },
  { name: '穿山甲', image: 'https://source.unsplash.com/featured/?pangolin' },
  { name: '儒艮', image: 'https://source.unsplash.com/featured/?dugong' },
  { name: '抹香鲸', image: 'https://source.unsplash.com/featured/?sperm-whale' },
  { name: '旗鱼', image: 'https://source.unsplash.com/featured/?sailfish' },
  { name: '翻车鱼', image: 'https://source.unsplash.com/featured/?sunfish' }
];

const roundEl = document.getElementById('round');
const cardEl = document.getElementById('animalCard');
const nameEl = document.getElementById('animalName');
const emojiEl = document.getElementById('animalEmoji');
const imageEl = document.getElementById('animalImage');
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

  if (animal.emoji) {
    emojiEl.textContent = animal.emoji;
    emojiEl.classList.remove('hidden');
    imageEl.classList.add('hidden');
    imageEl.removeAttribute('src');
  } else if (animal.image) {
    emojiEl.classList.add('hidden');
    imageEl.src = `${animal.image}&sig=${Date.now()}`;
    imageEl.classList.remove('hidden');
  } else {
    emojiEl.textContent = '❓';
    emojiEl.classList.remove('hidden');
    imageEl.classList.add('hidden');
    imageEl.removeAttribute('src');
  }

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
  const shown = current.emoji || '🖼️';
  addHistory(`第 ${round} 轮：已猜对（答案：${current.name}${shown}）`);
  round += 1;
  roundEl.textContent = String(round);
  current = pickAnimal();
  renderCard(current);
  addHistory(`第 ${round} 轮：翻到一张新动物卡`);
});