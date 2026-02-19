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
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = digits.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, 4).join('');
}

function scoreGuess(guess, target) {
  let bulls = 0; // 数字+位置都对
  let cows = 0;  // 数字对位置错

  for (let i = 0; i < 4; i += 1) {
    if (guess[i] === target[i]) {
      bulls += 1;
    } else if (target.includes(guess[i])) {
      cows += 1;
    }
  }

  return { bulls, cows };
}

function addHistoryItem({ round, guess, bulls, cows, isWin = false }) {
  const li = document.createElement('li');
  if (isWin) li.classList.add('win');

  li.innerHTML = `
    <div class="line-top">
      <span class="guess">#${round} · ${guess}</span>
      <span class="badge">${isWin ? '🎉 命中' : '进行中'}</span>
    </div>
    <div class="line-hint" aria-label="结果提示">
      <span class="dot hit"></span><span class="num">${bulls}</span>
      <span class="sep">|</span>
      <span class="dot near"></span><span class="num">${cows}</span>
    </div>
  `;

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
  setHint('规则：4位且不重复。🟢=数字+位置都对，🔵=数字对但位置错。');
  guessInput.value = '';
  guessInput.disabled = false;
  guessInput.focus();
}

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (finished) return;

  const guess = guessInput.value.trim();
  if (!/^\d{4}$/.test(guess)) {
    setHint('请输入恰好 4 位数字。', true);
    return;
  }

  if (new Set(guess).size !== 4) {
    setHint('经典模式：4 位数字不能重复。', true);
    return;
  }

  round += 1;
  roundEl.textContent = String(round);

  const { bulls, cows } = scoreGuess(guess, secret);

  if (bulls === 4) {
    finished = true;
    statusEl.textContent = '已通关 🎉';
    addHistoryItem({ round, guess, bulls, cows, isWin: true });
    setHint(`恭喜！${round} 轮猜中，答案 ${secret}。`);
    guessInput.disabled = true;
  } else {
    addHistoryItem({ round, guess, bulls, cows });
    setHint('继续猜！');
  }

  guessInput.value = '';
  guessInput.focus();
});

newGameBtn.addEventListener('click', startGame);

startGame();
