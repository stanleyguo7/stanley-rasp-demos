const ADULT_QA = [
  ["为什么超人总把内裤穿在外面？", "因为穿在里面没人看得见（梗）"],
  ["什么东西你删掉之后反而会更快乐？", "无效社交群"],
  ["什么东西看起来是休息，实际上更累？", "无脑刷短视频"],
  ["什么东西看起来便宜，用起来最贵？", "拖延"],
  ["什么东西最公平，但最不讲人情？", "截止日期"],
  ["什么东西越想睡早，越容易被它偷走时间？", "手机"],
  ["什么东西最像‘成年人试卷’？", "每月账单"],
  ["什么东西最会制造‘幻觉效率’？", "整理待办而不执行"],
  ["什么东西最像开盲盒？", "甲方需求"],
  ["什么东西最怕你认真看配料表？", "零食"],
  ["什么东西最会让你秒懂人生？", "体检报告"],
  ["什么东西最会在关键时刻掉链子？", "打印机"],
  ["什么东西最容易引发家庭辩论赛？", "今晚吃什么"],
  ["什么东西最会让人‘我懂了但我不会’？", "教程视频"],
  ["什么东西最像‘现代迷宫’？", "商场停车场"],
  ["什么东西最像‘成年人的鬼故事’？", "群里@全体成员"],
  ["什么东西最会让你‘我马上到’？", "刚起床"],
  ["什么东西最会让你判断失误？", "再看一集就睡"],
  ["什么东西最像‘人生补丁’？", "周末补觉"],
  ["什么东西最像‘终极脑洞’？", "换个角度看同一件事"],
];

const KID_QA = [
  ["什么门永远关不上？", "球门"],
  ["什么东西越洗越脏？", "水"],
  ["什么猫不抓老鼠？", "熊猫"],
  ["什么鱼不能吃？", "木鱼"],
  ["什么牛不会耕田？", "蜗牛"],
  ["什么瓜不能吃？", "傻瓜"],
  ["什么蛋不能吃？", "脸蛋"],
  ["什么杯不能喝水？", "奖杯"],
  ["什么桥最难走？", "独木桥"],
  ["什么河没有水？", "银河"],
  ["什么东西有牙齿却咬不动？", "梳子"],
  ["什么东西有头有尾却没有身体？", "硬币"],
  ["什么东西有脚却不会走路？", "桌子"],
  ["什么东西会响却没有嘴？", "闹钟"],
  ["什么东西会说话却没有舌头？", "电话"],
  ["什么东西你对它笑，它也会对你笑？", "镜子"],
  ["什么东西可以装满房间却不占空间？", "光"],
  ["什么东西总在你前面却追不上？", "明天"],
  ["什么东西掉了你会高兴？", "烦恼"],
  ["什么动物最会学人说话？", "鹦鹉"],
  ["什么动物早上四条腿，中午两条腿，晚上三条腿？", "人"],
  ["什么布剪不断？", "瀑布"],
  ["什么线看得见摸不着？", "光线"],
  ["什么字人人都会念错？", "错"],
  ["什么时候太阳会从西边出来？", "在地图上"],
  ["什么时候4减1等于5？", "算错的时候"],
  ["什么东西越分享越多？", "快乐"],
  ["什么东西明明是你的，别人却用得更多？", "你的名字"],
  ["什么东西不用时朝下，用时朝上？", "雨伞"],
  ["什么东西越用越少？", "橡皮"],
  ["什么东西天天见却摸不着？", "彩虹"],
  ["什么东西有时候是圆的，有时候是弯的？", "月亮"],
  ["什么东西可以打破却不能修补？", "纪录"],
  ["什么东西看起来会飞，其实一直在原地？", "电风扇"],
  ["什么东西最听话，你说什么它就说什么？", "回声"],
  ["什么东西白天短，晚上长？", "影子（脑洞题）"],
  ["什么东西借给别人很难拿回来？", "时间"],
  ["什么东西每天都在变却看不见？", "年龄"],
  ["什么东西有方向却没有腿？", "指南针"],
  ["什么东西最公平，每个人每天都有一样多？", "时间"],
];

const totalEl = document.getElementById('total');
const roundEl = document.getElementById('round');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const historyEl = document.getElementById('history');
const nextBtn = document.getElementById('nextBtn');
const showBtn = document.getElementById('showBtn');
const modeSelect = document.getElementById('modeSelect');

let bag = [];
let current = null;
let round = 1;

function getBank() {
  return modeSelect.value === 'kid' ? KID_QA : ADULT_QA;
}

function refreshMeta() {
  totalEl.textContent = String(getBank().length);
}

function refillBag() {
  const bank = getBank();
  bag = bank.map((_, i) => i);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function pickOne() {
  const bank = getBank();
  if (bag.length === 0) refillBag();
  current = bank[bag.pop()];
  questionEl.textContent = current[0];
  answerEl.textContent = `答案：${current[1]}`;
  answerEl.classList.add('hidden');
}

function addHistory(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyEl.prepend(li);
}

nextBtn.addEventListener('click', () => {
  if (current) addHistory(`第 ${round} 轮：${current[0]}`);
  pickOne();
  roundEl.textContent = String(round);
  round += 1;
});

showBtn.addEventListener('click', () => {
  if (!current) return;
  answerEl.classList.remove('hidden');
  addHistory(`揭晓：${current[1]}`);
});

modeSelect.addEventListener('change', () => {
  round = 1;
  roundEl.textContent = '1';
  current = null;
  questionEl.textContent = '已切换题库，点击“下一题”开始';
  answerEl.classList.add('hidden');
  answerEl.textContent = '答案会显示在这里';
  historyEl.innerHTML = '';
  refillBag();
  refreshMeta();
});

refillBag();
refreshMeta();
