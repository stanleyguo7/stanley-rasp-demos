const animals = [
  { name: '猫', emoji: '🐱' }, { name: '狗', emoji: '🐶' }, { name: '兔子', emoji: '🐰' },
  { name: '猴子', emoji: '🐵' }, { name: '老虎', emoji: '🐯' }, { name: '狮子', emoji: '🦁' },
  { name: '大象', emoji: '🐘' }, { name: '长颈鹿', emoji: '🦒' }, { name: '熊猫', emoji: '🐼' },
  { name: '青蛙', emoji: '🐸' }, { name: '小鸡', emoji: '🐥' }, { name: '鸭子', emoji: '🦆' },
  { name: '海豚', emoji: '🐬' }, { name: '鲨鱼', emoji: '🦈' }, { name: '乌龟', emoji: '🐢' },
  { name: '蛇', emoji: '🐍' }, { name: '马', emoji: '🐴' }, { name: '猪', emoji: '🐷' },
  { name: '羊', emoji: '🐑' }, { name: '奶牛', emoji: '🐮' }, { name: '企鹅', emoji: '🐧' },
  { name: '考拉', emoji: '🐨' }, { name: '河马', emoji: '🦛' }, { name: '犀牛', emoji: '🦏' },
  { name: '章鱼', emoji: '🐙' }, { name: '鲸鱼', emoji: '🐋' }, { name: '火烈鸟', emoji: '🦩' },
  { name: '孔雀', query: 'Peafowl' }, { name: '袋鼠', query: 'Kangaroo' },
  { name: '骆驼', emoji: '🐫' }, { name: '北极熊', emoji: '🐻‍❄️' },
  { name: '海獭', query: 'Sea otter' }, { name: '树懒', query: 'Sloth' },
  { name: '水豚', query: 'Capybara' }, { name: '雪豹', query: 'Snow leopard' },
  { name: '狐獴', query: 'Meerkat' }, { name: '巨嘴鸟', query: 'Toucan' },
  { name: '鹦鹉', query: 'Parrot' }, { name: '蝾螈', query: 'Salamander' }
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
const imageCache = new Map();

function pickAnimal() {
  const idx = Math.floor(Math.random() * animals.length);
  return animals[idx];
}

async function fetchAnimalImage(animal) {
  const key = animal.query || animal.name;
  if (imageCache.has(key)) return imageCache.get(key);

  const q = encodeURIComponent(animal.query || animal.name);
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${q}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=360`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('fetch failed');
    const data = await resp.json();
    const pages = data?.query?.pages;
    const page = pages ? Object.values(pages)[0] : null;
    const thumb = page?.thumbnail?.source || '';
    imageCache.set(key, thumb);
    return thumb;
  } catch (_) {
    imageCache.set(key, '');
    return '';
  }
}

async function renderCard(animal) {
  nameEl.textContent = animal.name;
  cardEl.classList.remove('hidden');

  imageEl.classList.add('hidden');
  imageEl.removeAttribute('src');

  if (animal.emoji) {
    emojiEl.textContent = animal.emoji;
    emojiEl.classList.remove('hidden');
  } else {
    emojiEl.classList.add('hidden');
    emojiEl.textContent = '';
    hintEl.textContent = '正在尝试在线抓取动物图片…';
    const img = await fetchAnimalImage(animal);
    if (current !== animal) return;

    if (img) {
      imageEl.src = img;
      imageEl.alt = animal.name;
      imageEl.classList.remove('hidden');
    } else {
      emojiEl.textContent = '🐾';
      emojiEl.classList.remove('hidden');
    }
  }

  hintEl.textContent = '请模仿这个动物，让其他人猜。';
}

function addHistory(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyEl.prepend(li);
}

drawBtn.addEventListener('click', async () => {
  current = pickAnimal();
  await renderCard(current);
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

nextBtn.addEventListener('click', async () => {
  if (!current) {
    hintEl.textContent = '请先翻卡。';
    return;
  }
  addHistory(`第 ${round} 轮：已猜对（答案：${current.name}${current.emoji || ''}）`);
  round += 1;
  roundEl.textContent = String(round);
  current = pickAnimal();
  await renderCard(current);
  addHistory(`第 ${round} 轮：翻到一张新动物卡`);
});