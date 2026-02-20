const metaEl = document.getElementById('meta');
const scoreEl = document.getElementById('score');
const emojiEl = document.getElementById('emoji');
const showBtn = document.getElementById('showBtn');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');

let bank = [];
let current = null;
let viewed = 0;

const pickOne = () => bank[Math.floor(Math.random() * bank.length)];

function newQuestion() {
  if (!bank.length) return;
  current = pickOne();
  emojiEl.textContent = current.emoji;
  resultEl.classList.add('hidden');
}

function showAnswer() {
  if (!current) return;
  viewed += 1;
  scoreEl.textContent = `已看答案：${viewed}`;
  resultEl.innerHTML = `答案：${current.answer}`;
  resultEl.classList.remove('hidden');
}

showBtn.onclick = showAnswer;
nextBtn.onclick = newQuestion;

(async function init() {
  const res = await fetch('./assets/questions.json');
  const data = await res.json();
  bank = data.questions || [];
  metaEl.textContent = `已收集 ${data.meta?.count || bank.length} 道 Emoji 猜成语题（随机单题模式）`;
  scoreEl.textContent = '已看答案：0';
  newQuestion();
})();
