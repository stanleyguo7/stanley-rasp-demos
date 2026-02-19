const animals = [
  { name: '猫', emoji: '🐱' }, { name: '狗', emoji: '🐶' }, { name: '兔子', emoji: '🐰' },
  { name: '猴子', emoji: '🐵' }, { name: '老虎', emoji: '🐯' }, { name: '狮子', emoji: '🦁' },
  { name: '大象', emoji: '🐘' }, { name: '长颈鹿', emoji: '🦒' }, { name: '熊猫', emoji: '🐼' },
  { name: '青蛙', emoji: '🐸' }, { name: '小鸡', emoji: '🐥' }, { name: '鸭子', emoji: '🦆' },
  { name: '海豚', emoji: '🐬' }, { name: '鲨鱼', emoji: '🦈' }, { name: '乌龟', emoji: '🐢' },
  { name: '蛇', emoji: '🐍' }, { name: '马', emoji: '🐴' }, { name: '猪', emoji: '🐷' },
  { name: '羊', emoji: '🐑' }, { name: '奶牛', emoji: '🐮' }, { name: '企鹅', emoji: '🐧' }
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
