const metaEl = document.getElementById('meta');
const countEl = document.getElementById('count');
const startBtn = document.getElementById('startBtn');
const quizEl = document.getElementById('quiz');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const emojiEl = document.getElementById('emoji');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');
const finalEl = document.getElementById('final');

let bank = [];
let round = [];
let i = 0;
let score = 0;
let locked = false;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function makeOptions(answer) {
  const pool = shuffle(bank.map(x => x.answer).filter(x => x !== answer)).slice(0, 3);
  return shuffle([answer, ...pool]);
}

function render() {
  locked = false;
  nextBtn.classList.add('hidden');
  resultEl.classList.add('hidden');
  const q = round[i];
  progressEl.textContent = `${i + 1}/${round.length}`;
  scoreEl.textContent = `答对：${score}`;
  emojiEl.textContent = q.emoji;
  optionsEl.innerHTML = '';
  for (const opt of makeOptions(q.answer)) {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => onChoose(btn, opt);
    optionsEl.appendChild(btn);
  }
}

function onChoose(btn, choice) {
  if (locked) return;
  locked = true;
  const q = round[i];
  const correct = q.answer;
  const all = [...optionsEl.children];
  all.forEach(b => {
    if (b.textContent === correct) b.classList.add('correct');
    if (b === btn && choice !== correct) b.classList.add('wrong');
    b.disabled = true;
  });
  if (choice === correct) score += 1;
  scoreEl.textContent = `答对：${score}`;
  resultEl.textContent = choice === correct ? `✅ 正确！答案是：${correct}` : `❌ 错了，正确答案：${correct}`;
  resultEl.classList.remove('hidden');
  nextBtn.classList.remove('hidden');
}

function finish() {
  quizEl.classList.add('hidden');
  finalEl.classList.remove('hidden');
  const rate = Math.round((score / round.length) * 100);
  finalEl.innerHTML = `<h3>本轮结束</h3><p>共 ${round.length} 题，答对 ${score} 题，正确率 ${rate}%</p><button id="restart">再来一轮</button>`;
  document.getElementById('restart').onclick = () => startBtn.click();
}

nextBtn.onclick = () => {
  i += 1;
  if (i >= round.length) return finish();
  render();
};

startBtn.onclick = () => {
  const cnt = parseInt(countEl.value, 10);
  round = shuffle(bank).slice(0, cnt);
  i = 0;
  score = 0;
  finalEl.classList.add('hidden');
  quizEl.classList.remove('hidden');
  render();
};

(async function init() {
  const res = await fetch('./assets/questions.json');
  const data = await res.json();
  bank = data.questions || [];
  metaEl.textContent = `已收集 ${data.meta?.count || bank.length} 道 Emoji 猜成语题（网络数据源）`;
})();
