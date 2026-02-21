const TOTAL_ROUNDS = 100;
const WORDS_PER_ROUND = 10;

const PREFIX = [
  '快乐','安静','明亮','温暖','轻松','认真','勇敢','健康','简单','平稳',
  '清新','热情','友好','灵活','高效','耐心','真诚','专注','积极','从容',
  '清晰','踏实','舒适','平和','自由'
];

const NOUN = [
  '生活','学习','工作','计划','目标','习惯','方法','思路','交流','团队',
  '家庭','朋友','时间','状态','节奏','效率','创造','成长','行动','结果'
];

const WORD_POOL = PREFIX.flatMap((a) => NOUN.map((b) => `${a}${b}`)); // 25*20=500

const roundText = document.getElementById('roundText');
const hintText = document.getElementById('hintText');
const wordList = document.getElementById('wordList');
const hideBtn = document.getElementById('hideBtn');
const showBtn = document.getElementById('showBtn');
const nextBtn = document.getElementById('nextBtn');

let round = 1;
let words = [];
let hidden = false;
let ended = false;
let timerSec = 0;
let timerId = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWords() {
  return shuffle(WORD_POOL).slice(0, WORDS_PER_ROUND);
}

function render() {
  roundText.textContent = `第 ${round} / ${TOTAL_ROUNDS} 组`;
  if (!hidden) {
    hintText.textContent = '请先记住下面 10 个词';
  } else if (!ended) {
    hintText.textContent = `计时中：${timerSec} 秒（可点击单词翻转查看）`;
  } else {
    hintText.textContent = `本轮结束，用时 ${timerSec} 秒`;
  }

  wordList.innerHTML = '';
  words.forEach((word, idx) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'word-card';

    if (!hidden || ended) {
      btn.textContent = word;
      btn.disabled = true;
    } else {
      const isRevealed = btn.dataset.reveal === '1';
      btn.classList.add('flipable', 'hidden');
      btn.dataset.idx = String(idx);
      btn.dataset.reveal = '0';
      btn.textContent = '?';
      btn.addEventListener('click', () => {
        const revealed = btn.dataset.reveal === '1';
        btn.dataset.reveal = revealed ? '0' : '1';
        btn.textContent = revealed ? '?' : word;
        btn.classList.toggle('revealed', !revealed);
      });
    }

    li.appendChild(btn);
    wordList.appendChild(li);
  });

  hideBtn.disabled = hidden;
  showBtn.disabled = !hidden || ended;
  nextBtn.disabled = round >= TOTAL_ROUNDS;
}

function startRound() {
  stopTimer();
  timerSec = 0;
  words = pickWords();
  hidden = false;
  ended = false;
  render();
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    timerSec += 1;
    if (hidden && !ended) {
      hintText.textContent = `计时中：${timerSec} 秒（可点击单词翻转查看）`;
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

hideBtn.addEventListener('click', () => {
  hidden = true;
  ended = false;
  startTimer();
  render();
});

showBtn.textContent = '结束并查看答案';
showBtn.addEventListener('click', () => {
  ended = true;
  stopTimer();
  render();
});

nextBtn.addEventListener('click', () => {
  if (round >= TOTAL_ROUNDS) return;
  round += 1;
  startRound();
});

startRound();
