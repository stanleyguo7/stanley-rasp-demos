const metaEl = document.getElementById('meta');
const topEl = document.getElementById('top');
const setupEl = document.getElementById('setup');
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
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');

let bank = [];
let current = [];
let idx = 0;
let score = 0;
let selected = null;
let answered = false;

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

function showSetup() {
  topEl.classList.remove('hidden');
  setupEl.classList.remove('hidden');
  quizEl.classList.add('hidden');
  resultEl.classList.add('hidden');
}

function showQuiz() {
  topEl.classList.add('hidden');
  setupEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  quizEl.classList.remove('hidden');
}

function renderQuestion() {
  selected = null;
  answered = false;
  nextBtn.disabled = true;
  submitBtn.disabled = false;
  const q = current[idx];
  progressEl.textContent = `${idx + 1} / ${current.length}`;
  scoreEl.textContent = `得分：${score}`;
  questionEl.textContent = `【中文】${q.questionZh || q.question}\n\n【原文】${q.question}`;

  optionsEl.innerHTML = '';
  q.options.forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = `${o.label}. ${o.textZh || o.text}  (${o.text})`;
    btn.onclick = () => {
      selected = o.label;
      [...optionsEl.children].forEach(c => c.style.outline = 'none');
      btn.style.outline = '2px solid #22c55e';
    };
    optionsEl.appendChild(btn);
  });

  answerEl.classList.add('hidden');
  answerEl.textContent = '';
}

function finish() {
  quizEl.classList.add('hidden');
  topEl.classList.remove('hidden');
  resultEl.classList.remove('hidden');
  const rate = current.length ? Math.round((score / current.length) * 100) : 0;
  resultEl.innerHTML = `
    <h3>本轮完成 ✅</h3>
    <p>总题数：${current.length}</p>
    <p>得分：${score}</p>
    <p>正确率：${rate}%</p>
    <div class="actions">
      <button id="restartBtn">再来一轮</button>
      <button id="backBtn">返回设置页</button>
    </div>
  `;
  document.getElementById('restartBtn').onclick = () => startBtn.click();
  document.getElementById('backBtn').onclick = () => showSetup();
}

function next() {
  idx += 1;
  if (idx >= current.length) return finish();
  renderQuestion();
}

async function init() {
  const res = await fetch('./assets/questions_zh_mcq.json');
  const data = await res.json();
  bank = data.questions || [];
  metaEl.textContent = `真题选择题（中英双语）：${data.meta?.count || bank.length} 题`;

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

  showQuiz();
  renderQuestion();
});

function renderExplanation(q, selectedLabel) {
  const correct = q.answer || '未知';
  const correctOpt = q.options.find(x => x.label === correct);
  const selectedOpt = q.options.find(x => x.label === selectedLabel);
  const correctText = correctOpt ? (correctOpt.textZh || correctOpt.text) : '';
  const selectedText = selectedOpt ? (selectedOpt.textZh || selectedOpt.text) : '';

  const verdict = selectedLabel === correct ? '回答正确 ✅' : '回答错误 ❌';

  answerEl.innerHTML = `
    <div><strong>${verdict}</strong></div>
    <div>正确答案：${correct}${correctText ? ` - ${correctText}` : ''}</div>
    ${selectedLabel ? `<div>你的答案：${selectedLabel}${selectedText ? ` - ${selectedText}` : ''}</div>` : ''}
    <div>解析：本题考查地理知识点识别，关键线索对应选项 <strong>${correct}</strong>。</div>
  `;
  answerEl.classList.remove('hidden');
}

submitBtn.addEventListener('click', () => {
  const q = current[idx];
  if (answered) return alert('本题已作答，请点击下一题');
  if (!selected) return alert('请先选择一个选项');
  answered = true;
  submitBtn.disabled = true;
  nextBtn.disabled = false;
  if (selected === q.answer) score += 1;
  scoreEl.textContent = `得分：${score}`;
  renderExplanation(q, selected);
});

nextBtn.addEventListener('click', () => {
  if (!answered) return alert('请先提交答案');
  next();
});

showSetup();

init().catch(err => {
  console.error(err);
  metaEl.textContent = '题库加载失败';
});
