const metaEl = document.getElementById('meta');
const yearFilter = document.getElementById('yearFilter');
const roundFilter = document.getElementById('roundFilter');
const countFilter = document.getElementById('countFilter');
const startBtn = document.getElementById('startBtn');
const quizEl = document.getElementById('quiz');
const resultEl = document.getElementById('result');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const answerEl = document.getElementById('answer');
const showBtn = document.getElementById('showBtn');
const rightBtn = document.getElementById('rightBtn');
const wrongBtn = document.getElementById('wrongBtn');
const nextBtn = document.getElementById('nextBtn');

let bank = [];
let current = [];
let idx = 0;
let score = 0;
let wrongList = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillSelect(select, values) {
  values.sort().forEach(v => {
    const op = document.createElement('option');
    op.value = v;
    op.textContent = v;
    select.appendChild(op);
  });
}

function renderQuestion() {
  const q = current[idx];
  progressEl.textContent = `${idx + 1} / ${current.length}`;
  scoreEl.textContent = `得分：${score}`;
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';
  (q.options || []).forEach(o => {
    const div = document.createElement('div');
    div.className = 'option';
    div.textContent = `${o.label}. ${o.text}`;
    optionsEl.appendChild(div);
  });
  answerEl.classList.add('hidden');
  answerEl.textContent = q.answer ? `答案：${q.answer}` : `来源：${q.sourceFile}（该题暂无结构化答案）`;
}

function finish() {
  quizEl.classList.add('hidden');
  resultEl.classList.remove('hidden');
  const rate = current.length ? Math.round((score / current.length) * 100) : 0;
  resultEl.innerHTML = `
    <h3>本轮完成 ✅</h3>
    <p>总题数：${current.length}</p>
    <p>得分：${score}</p>
    <p>正确率：${rate}%</p>
    <p>错题：${wrongList.length}</p>
    <button id="restartBtn">再来一轮</button>
  `;
  document.getElementById('restartBtn').onclick = () => startBtn.click();
}

function next() {
  idx += 1;
  if (idx >= current.length) return finish();
  renderQuestion();
}

async function init() {
  const res = await fetch('./assets/questions.json');
  const data = await res.json();
  bank = data.questions || [];
  metaEl.textContent = `题库：${data.meta?.questionCount || bank.length} 题，来源文件 ${data.meta?.fileCount || '-'} 个`;

  const years = [...new Set(bank.map(x => x.year).filter(Boolean))];
  const rounds = [...new Set(bank.map(x => x.round).filter(Boolean))];
  fillSelect(yearFilter, years);
  fillSelect(roundFilter, rounds);
}

startBtn.addEventListener('click', () => {
  const year = yearFilter.value;
  const round = roundFilter.value;
  const cnt = parseInt(countFilter.value, 10);

  let pool = bank.filter(x => (year === 'all' || x.year === year) && (round === 'all' || x.round === round));
  if (!pool.length) {
    alert('筛选后没有题目，请调整条件');
    return;
  }

  pool = shuffle(pool);
  current = cnt >= 9999 ? pool : pool.slice(0, cnt);
  idx = 0;
  score = 0;
  wrongList = [];

  resultEl.classList.add('hidden');
  quizEl.classList.remove('hidden');
  renderQuestion();
});

showBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
rightBtn.addEventListener('click', () => { score += 1; next(); });
wrongBtn.addEventListener('click', () => { wrongList.push(current[idx]); next(); });
nextBtn.addEventListener('click', () => next());

init().catch(err => {
  console.error(err);
  metaEl.textContent = '题库加载失败';
});
