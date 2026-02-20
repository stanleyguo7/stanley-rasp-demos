const metaEl = document.getElementById('meta');
const scoreEl = document.getElementById('score');
const emojiEl = document.getElementById('emoji');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');

let bank = [];
let current = null;
let score = 0;

const pickOne = () => bank[Math.floor(Math.random() * bank.length)];

function newQuestion() {
  if (!bank.length) return;
  current = pickOne();
  emojiEl.textContent = current.emoji;
  answerInput.value = '';
  resultEl.classList.add('hidden');
  answerInput.focus();
}

function normalize(s) {
  return (s || '').replace(/[\s，。；、,.!?！？]/g, '').trim();
}

function submitAnswer() {
  if (!current) return;
  const user = normalize(answerInput.value);
  if (!user) return;

  const correct = normalize(current.answer);
  const ok = user === correct;
  if (ok) score += 1;
  scoreEl.textContent = `累计答对：${score}`;

  resultEl.innerHTML = ok
    ? `✅ 回答正确：${current.answer}`
    : `❌ 回答错误。正确答案：${current.answer}`;
  resultEl.classList.remove('hidden');
}

submitBtn.onclick = submitAnswer;
nextBtn.onclick = newQuestion;
answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitAnswer();
});

(async function init() {
  const res = await fetch('./assets/questions.json');
  const data = await res.json();
  bank = data.questions || [];
  metaEl.textContent = `已收集 ${data.meta?.count || bank.length} 道 Emoji 猜成语题（随机单题模式）`;
  newQuestion();
})();
