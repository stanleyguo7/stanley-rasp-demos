const ICONS = ['🍎','🍌','🍇','🍉','🍒','🍓','🥝','🍍','🥑','🥕','🍄','🌽','🍔','🍕','🍩','🍪','⚽','🏀','🎲','🎸'];
const configs = {
  easy: { cols: 4, rows: 3 },
  normal: { cols: 4, rows: 4 },
  hard: { cols: 6, rows: 4 }
};

const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const matchedEl = document.getElementById('matched');
const totalPairsEl = document.getElementById('totalPairs');
const statusEl = document.getElementById('status');
const difficultyEl = document.getElementById('difficulty');
const newGameBtn = document.getElementById('newGameBtn');

let cards = [];
let first = null;
let second = null;
let lock = false;
let moves = 0;
let matched = 0;
let totalPairs = 0;
let timer = null;
let seconds = 0;
let started = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    seconds += 1;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function resetStats() {
  stopTimer();
  moves = 0;
  matched = 0;
  seconds = 0;
  started = false;
  movesEl.textContent = '0';
  matchedEl.textContent = '0';
  timeEl.textContent = '00:00';
}

function createDeck(pairCount) {
  const chosen = ICONS.slice(0, pairCount);
  const deck = shuffle([...chosen, ...chosen]).map((icon, idx) => ({ id: idx + 1, icon, matched: false }));
  return deck;
}

function renderBoard() {
  boardEl.innerHTML = '';
  cards.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.dataset.id = c.id;
    btn.innerHTML = `
      <div class="inner">
        <div class="face back">?</div>
        <div class="face front">${c.icon}</div>
      </div>
    `;
    btn.addEventListener('click', onCardClick);
    boardEl.appendChild(btn);
  });
}

function refreshStats() {
  movesEl.textContent = String(moves);
  matchedEl.textContent = String(matched);
  totalPairsEl.textContent = String(totalPairs);
}

function newGame() {
  const cfg = configs[difficultyEl.value];
  const total = cfg.cols * cfg.rows;
  totalPairs = total / 2;
  cards = createDeck(totalPairs);
  boardEl.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
  first = null;
  second = null;
  lock = false;
  resetStats();
  renderBoard();
  refreshStats();
  statusEl.textContent = '点击卡牌开始游戏。';
}

function getCardById(id) {
  return cards.find(c => c.id === id);
}

function onCardClick(e) {
  if (lock) return;
  const btn = e.currentTarget;
  const id = Number(btn.dataset.id);
  const card = getCardById(id);
  if (!card || card.matched) return;
  if (first && first.id === card.id) return;

  if (!started) {
    started = true;
    startTimer();
  }

  btn.classList.add('flipped');

  if (!first) {
    first = { id: card.id, icon: card.icon, el: btn };
    return;
  }

  second = { id: card.id, icon: card.icon, el: btn };
  moves += 1;
  refreshStats();

  if (first.icon === second.icon) {
    const c1 = getCardById(first.id);
    const c2 = getCardById(second.id);
    c1.matched = true;
    c2.matched = true;
    first.el.classList.add('matched');
    second.el.classList.add('matched');
    matched += 1;
    refreshStats();
    statusEl.textContent = '匹配成功！';
    first = null;
    second = null;

    if (matched === totalPairs) {
      stopTimer();
      statusEl.textContent = `通关！共 ${moves} 步，用时 ${formatTime(seconds)}。`;
    }
  } else {
    lock = true;
    statusEl.textContent = '不匹配，再试一次。';
    setTimeout(() => {
      first.el.classList.remove('flipped');
      second.el.classList.remove('flipped');
      first = null;
      second = null;
      lock = false;
    }, 700);
  }
}

newGameBtn.addEventListener('click', newGame);
difficultyEl.addEventListener('change', newGame);

newGame();
