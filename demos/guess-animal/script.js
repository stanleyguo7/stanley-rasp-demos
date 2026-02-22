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

  // 无对应 emoji 的动物，使用网上抓图（主用 loremflickr，备用 wikimedia）
  {
    name: '水豚',
    images: [
      'https://loremflickr.com/640/480/capybara',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Capybara_%28Hydrochoerus_hydrochaeris%29.JPG/640px-Capybara_%28Hydrochoerus_hydrochaeris%29.JPG'
    ]
  },
  {
    name: '红熊猫',
    images: [
      'https://loremflickr.com/640/480/red-panda',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Red_Panda_%28Ailurus_fulgens%29.jpg/640px-Red_Panda_%28Ailurus_fulgens%29.jpg'
    ]
  },
  {
    name: '考拉熊',
    images: [
      'https://loremflickr.com/640/480/koala',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Koala_climbing_tree.jpg/640px-Koala_climbing_tree.jpg'
    ]
  },
  { name: '土拨鼠', images: ['https://loremflickr.com/640/480/marmot'] },
  { name: '雪豹', images: ['https://loremflickr.com/640/480/snow-leopard'] },
  { name: '海獭', images: ['https://loremflickr.com/640/480/sea-otter'] },
  { name: '鸵鸟', images: ['https://loremflickr.com/640/480/ostrich'] },
  { name: '鹈鹕', images: ['https://loremflickr.com/640/480/pelican'] },
  { name: '猫头鹰', images: ['https://loremflickr.com/640/480/owl'] },
  { name: '蜂鸟', images: ['https://loremflickr.com/640/480/hummingbird'] },
  { name: '穿山甲', images: ['https://loremflickr.com/640/480/pangolin'] },
  { name: '儒艮', images: ['https://loremflickr.com/640/480/dugong'] },
  { name: '抹香鲸', images: ['https://loremflickr.com/640/480/sperm-whale'] },
  { name: '旗鱼', images: ['https://loremflickr.com/640/480/sailfish'] },
  { name: '翻车鱼', images: ['https://loremflickr.com/640/480/sunfish'] }
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

function withNoCache(url) {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}r=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function loadImageWithFallback(urls = []) {
  const candidates = urls.filter(Boolean);
  if (!candidates.length) {
    imageEl.classList.add('hidden');
    imageEl.removeAttribute('src');
    emojiEl.textContent = '🖼️';
    emojiEl.classList.remove('hidden');
    return;
  }

  let i = 0;
  const tryNext = () => {
    if (i >= candidates.length) {
      imageEl.classList.add('hidden');
      imageEl.removeAttribute('src');
      emojiEl.textContent = '🖼️';
      emojiEl.classList.remove('hidden');
      return;
    }
    const src = withNoCache(candidates[i]);
    i += 1;
    imageEl.onerror = tryNext;
    imageEl.onload = () => {
      imageEl.onerror = null;
      imageEl.onload = null;
    };
    imageEl.src = src;
  };

  tryNext();
}

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
  } else if (animal.images?.length) {
    emojiEl.classList.add('hidden');
    imageEl.classList.remove('hidden');
    loadImageWithFallback(animal.images);
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