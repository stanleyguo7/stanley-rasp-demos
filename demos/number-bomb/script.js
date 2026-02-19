const setupPanel = document.getElementById('setupPanel');
const gamePanel = document.getElementById('gamePanel');
const setupForm = document.getElementById('setupForm');
const guessForm = document.getElementById('guessForm');

const playerCountEl = document.getElementById('playerCount');
const maxNumberEl = document.getElementById('maxNumber');
const currentPlayerEl = document.getElementById('currentPlayer');
const roundEl = document.getElementById('round');
const rangeTextEl = document.getElementById('rangeText');
const guessInput = document.getElementById('guessInput');
const hintEl = document.getElementById('hint');
const historyEl = document.getElementById('history');
const restartBtn = document.getElementById('restartBtn');

let players = 3, maxNumber = 100, bomb = 0, low = 1, high = 100;
let currentPlayer = 1, round = 1, ended = false;

function resetState() {
  low = 1;
  high = maxNumber;
  bomb = Math.floor(Math.random() * maxNumber) + 1;
  currentPlayer = 1;
  round = 1;
  ended = false;
  historyEl.innerHTML = '';
  updateUI();
  hintEl.textContent = '开始吧！不要踩中炸弹。';
}

function updateUI() {
  currentPlayerEl.textContent = `P${currentPlayer}`;
  roundEl.textContent = String(round);
  rangeTextEl.textContent = `${low} - ${high}`;
  guessInput.min = low;
  guessInput.max = high;
}

function nextPlayer() {
  if (currentPlayer === players) {
    currentPlayer = 1;
    round += 1;
  } else {
    currentPlayer += 1;
  }
}

function addHistory(text, boom = false) {
  const li = document.createElement('li');
  li.textContent = text;
  if (boom) li.classList.add('boom');
  historyEl.prepend(li);
}

setupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  players = Number(playerCountEl.value);
  maxNumber = Number(maxNumberEl.value);
  if (players < 2 || players > 12) return;
  if (maxNumber < 20 || maxNumber > 999) return;

  setupPanel.hidden = true;
  gamePanel.hidden = false;
  resetState();
  guessInput.focus();
});

guessForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (ended) return;

  const n = Number(guessInput.value);
  if (!Number.isInteger(n) || n <= low || n >= high) {
    hintEl.textContent = `请输入范围内数字（严格在 ${low} 与 ${high} 之间）`;
    return;
  }

  if (n === bomb) {
    ended = true;
    addHistory(`💥 P${currentPlayer} 猜了 ${n}，踩中炸弹！`, true);
    hintEl.textContent = `游戏结束：P${currentPlayer} 失败。炸弹是 ${bomb}。`;
    return;
  }

  if (n < bomb) {
    low = n;
    addHistory(`P${currentPlayer} 猜 ${n}（偏小）→ 新范围 ${low}-${high}`);
  } else {
    high = n;
    addHistory(`P${currentPlayer} 猜 ${n}（偏大）→ 新范围 ${low}-${high}`);
  }

  nextPlayer();
  updateUI();
  hintEl.textContent = '下一个玩家继续。';
  guessInput.value = '';
  guessInput.focus();
});

restartBtn.addEventListener('click', () => {
  resetState();
  guessInput.value = '';
  guessInput.focus();
});
