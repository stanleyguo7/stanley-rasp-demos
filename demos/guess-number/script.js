const roundEl = document.getElementById('round');
const statusEl = document.getElementById('status');
const historyEl = document.getElementById('history');
const guessForm = document.getElementById('guessForm');
const guessInput = document.getElementById('guessInput');
const newGameBtn = document.getElementById('newGameBtn');
const hintEl = document.getElementById('hint');

let secret = '';
let round = 0;
let finished = false;

function generateSecret() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
}

function countDigits(s) {
  const map = new Map();
  for (const ch of s) {
    map.set(ch, (map.get(ch) || 0) + 1);
  }
  return map;
}

function scoreGuess(guess, target) {
  let exact = 0;
  for (let i = 0; i < 4; i += 1) {
    if (guess[i] === target[i]) exact += 1;
  }

  const gMap = countDigits(guess);
  const tMap = countDigits(target);
  let totalMatchedDigits = 0;

  for (const [digit, gCount] of gMap.entries()) {
    const tCount = tMap.get(digit) || 0;
    totalMatchedDigits += Math.min(gCount, tCount);
  }

  const misplaced = totalMatchedDigits - exact;
  return { exact, misplaced };
}

function addHistoryItem(text, isWin = false) {
  const li = document.createElement('li');
  li.textContent = text;
  if (isWin) li.classList.add('win');
  historyEl.prepend(li);
}

function setHint(text, isError = false) {
  hintEl.textContent = text;
  hintEl.classList.toggle('error', isError);
}

function startGame() {
  secret = generateSecret();
  round = 0;
  finished = false;
  historyEl.innerHTML = '';
  roundEl.textContent = '0';
  statusEl.textContent = '进行中';
  setHint('规则：每次会告诉你“位置和数字都对”的个数，以及“数字对但位置错”的个数。');
  guessInput.value = '';
  guessInput.disabled = false;
  guessInput.focus();
}

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (finished) return;

  const guess = guessInput.value.trim();
  if (!/^\d{4}$/.test(guess)) {
    setHint('请输入恰好 4 位数字（0-9）。', true);
    return;
  }

  round += 1;
  roundEl.textContent = String(round);

  const { exact, misplaced } = scoreGuess(guess, secret);
  const line = `第 ${round} 轮：你猜 ${guess} → 位置+数字全对 ${exact} 个，数字对但位置错 ${misplaced} 个`;

  if (exact === 4) {
    finished = true;
    statusEl.textContent = '已通关 🎉';
    addHistoryItem(`${line}（完全猜中！共 ${round} 轮）`, true);
    setHint(`恭喜！你用了 ${round} 轮完全猜中。答案是 ${secret}。`);
    guessInput.disabled = true;
  } else {
    addHistoryItem(line);
    setHint('继续加油！');
  }

  guessInput.value = '';
  guessInput.focus();
});

newGameBtn.addEventListener('click', startGame);

startGame();
