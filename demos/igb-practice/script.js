const metaEl = document.getElementById('meta');
const topEl = document.getElementById('top');
const setupEl = document.getElementById('setup');
const yearFilter = document.getElementById('yearFilter');
const roundFilter = document.getElementById('roundFilter');
const countFilter = document.getElementById('countFilter');
const modeFilter = document.getElementById('modeFilter');
const wrongCountEl = document.getElementById('wrongCount');
const clearWrongBtn = document.getElementById('clearWrongBtn');
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

const WRONG_KEY = 'igb_wrong_questions_v1';

let bank = [];
let current = [];
let idx = 0;
let score = 0;
let selected = null;
let answered = false;
let wrongSet = loadWrongSet();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadWrongSet() {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveWrongSet() {
  try {
    localStorage.setItem(WRONG_KEY, JSON.stringify([...wrongSet]));
  } catch (err) {
    console.warn('保存错题失败', err);
  }
  renderWrongCount();
}

function renderWrongCount() {
  wrongCountEl.textContent = String(wrongSet.size);
}

function qid(q) {
  return q.id || `${q.year || 'y'}-${q.round || 'r'}-${q.question}`;
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
  questionEl.textContent = `【中文】${q.questionZh || '（暂无翻译）'}\n\n【原文】${q.question}`;

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
    <p>当前错题本：${wrongSet.size} 题</p>
    <div class="actions">
      <button id="restartBtn">再来一轮</button>
      <button id="wrongBtn">只练错题</button>
      <button id="backBtn">返回设置页</button>
    </div>
  `;
  document.getElementById('restartBtn').onclick = () => startBtn.click();
  document.getElementById('wrongBtn').onclick = () => {
    modeFilter.value = 'wrong';
    startBtn.click();
  };
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
  renderWrongCount();
}

function renderExplanation(q, selectedLabel) {
  const correct = q.answer || '未知';
  const correctOpt = q.options.find(x => x.label === correct);
  const selectedOpt = q.options.find(x => x.label === selectedLabel);
  const correctTextZh = correctOpt ? (correctOpt.textZh || correctOpt.text) : '';
  const correctTextEn = correctOpt ? correctOpt.text : '';
  const selectedTextZh = selectedOpt ? (selectedOpt.textZh || selectedOpt.text) : '';
  const selectedTextEn = selectedOpt ? selectedOpt.text : '';

  const verdict = selectedLabel === correct ? '回答正确 ✅' : '回答错误 ❌';
  const clue = (q.questionZh || q.question)
    .replace(/\s+/g, ' ')
    .slice(0, 120);

  answerEl.innerHTML = `
    <div><strong>${verdict}</strong></div>
    <div>正确答案：${correct}${correctTextZh ? ` - ${correctTextZh}` : ''}${correctTextEn ? `（${correctTextEn}）` : ''}</div>
    ${selectedLabel ? `<div>你的答案：${selectedLabel}${selectedTextZh ? ` - ${selectedTextZh}` : ''}${selectedTextEn ? `（${selectedTextEn}）` : ''}</div>` : ''}
    <div>题干线索（节选）：${clue}${(q.questionZh || q.question).length > 120 ? '…' : ''}</div>
    <div>提示：先抓地名/地形/历史事件锚点，再排除干扰选项。</div>
  `;
  answerEl.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
  const year = yearFilter.value;
  const round = roundFilter.value;
  const cnt = parseInt(countFilter.value, 10);
  const mode = modeFilter.value;

  let pool = bank.filter(x => (year === 'all' || x.year === year) && (round === 'all' || x.round === round));

  if (mode === 'wrong') {
    pool = pool.filter(q => wrongSet.has(qid(q)));
  }

  if (!pool.length) {
    alert(mode === 'wrong' ? '当前筛选下没有错题，请先做几题再来。' : '筛选后没有题目，请调整条件');
    return;
  }

  pool = shuffle(pool);
  current = cnt >= 9999 ? pool : pool.slice(0, cnt);
  idx = 0;
  score = 0;

  showQuiz();
  renderQuestion();
});

clearWrongBtn.addEventListener('click', () => {
  if (!wrongSet.size) {
    alert('错题本已经是空的。');
    return;
  }
  if (!confirm(`确认清空错题本吗？当前共 ${wrongSet.size} 题。`)) return;
  wrongSet = new Set();
  saveWrongSet();
});

submitBtn.addEventListener('click', () => {
  const q = current[idx];
  if (answered) return alert('本题已作答，请点击下一题');
  if (!selected) return alert('请先选择一个选项');
  answered = true;
  submitBtn.disabled = true;
  nextBtn.disabled = false;

  const id = qid(q);
  if (selected === q.answer) {
    score += 1;
    wrongSet.delete(id);
  } else {
    wrongSet.add(id);
  }
  saveWrongSet();

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