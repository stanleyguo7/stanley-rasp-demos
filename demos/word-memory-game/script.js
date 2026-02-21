const WORD_POOL = [
  "星空", "森林", "海浪", "火车", "窗台", "月亮", "书包", "铅笔", "风筝", "石桥",
  "咖啡", "面包", "樱桃", "西瓜", "柠檬", "雪山", "雨伞", "铃铛", "花园", "镜子",
  "灯塔", "沙滩", "跑道", "台阶", "钥匙", "邮票", "时钟", "地图", "帆船", "河流",
  "苹果", "葡萄", "芒果", "南瓜", "松树", "竹林", "湖泊", "冰川", "雾气", "雷声",
  "地铁", "巴士", "飞机", "轮船", "行李", "手套", "围巾", "帽子", "手表", "眼镜",
  "相机", "钢琴", "吉他", "鼓点", "舞台", "剧院", "书架", "纸张", "信封", "笔记",
  "操场", "教室", "黑板", "粉笔", "试卷", "奖牌", "拼图", "棋盘", "积木", "滑梯",
  "热气球", "烟花", "彩虹", "晨雾", "夕阳", "流星", "珊瑚", "海豚", "鲸鱼", "贝壳",
  "奶茶", "果汁", "米饭", "饺子", "汤面", "蛋糕", "巧克力", "饼干", "砂锅", "煎蛋",
  "枕头", "被子", "窗帘", "地毯", "衣柜", "台灯", "插座", "闹钟", "水壶", "茶杯",
  "电梯", "楼梯", "公园", "广场", "剧本", "画笔", "颜料", "雕塑", "画廊", "相册",
  "赛车", "球门", "羽毛", "篮筐", "球网", "口哨", "领奖台", "秒表", "地图册", "路线",
  "麦田", "稻谷", "菜园", "果园", "晨跑", "瑜伽", "露营", "篝火", "帐篷", "指南针",
  "望远镜", "显微镜", "试管", "公式", "电路", "齿轮", "机器", "机器人", "芯片", "代码",
  "快递", "收据", "发票", "订单", "货架", "商店", "餐厅", "影院", "车站", "港口"
];

const TOTAL_GROUPS = 100;
const WORDS_PER_GROUP = 10;

const roundText = document.getElementById("roundText");
const hintText = document.getElementById("hintText");
const wordList = document.getElementById("wordList");
const hideBtn = document.getElementById("hideBtn");
const showBtn = document.getElementById("showBtn");
const nextBtn = document.getElementById("nextBtn");

let groups = [];
let currentRound = 0;
let hidden = false;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateGroups() {
  const result = [];
  for (let i = 0; i < TOTAL_GROUPS; i++) {
    result.push(shuffle(WORD_POOL).slice(0, WORDS_PER_GROUP));
  }
  return result;
}

function renderWords(words, mask = false) {
  wordList.innerHTML = "";
  words.forEach((word, idx) => {
    const li = document.createElement("li");
    li.textContent = mask ? `${idx + 1}. ______` : `${idx + 1}. ${word}`;
    wordList.appendChild(li);
  });
}

function updateRound() {
  const words = groups[currentRound];
  roundText.textContent = `第 ${currentRound + 1} / ${TOTAL_GROUPS} 组`;
  renderWords(words, hidden);
}

hideBtn.addEventListener("click", () => {
  hidden = true;
  hintText.textContent = "已隐藏：试着回忆 10 个词，再点“查看答案”核对";
  updateRound();
});

showBtn.addEventListener("click", () => {
  hidden = false;
  hintText.textContent = "答案已显示：准备好后点“下一轮”";
  updateRound();
});

nextBtn.addEventListener("click", () => {
  currentRound += 1;
  if (currentRound >= TOTAL_GROUPS) {
    groups = generateGroups();
    currentRound = 0;
    hintText.textContent = "100 组已完成，已为你随机生成新的一轮 100 组";
  } else {
    hintText.textContent = "请先记住下面 10 个词";
  }
  hidden = false;
  updateRound();
});

groups = generateGroups();
updateRound();
