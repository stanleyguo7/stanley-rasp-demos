const TOTAL_ROUNDS = 100;
const WORDS_PER_ROUND = 10;

// 约 500 个常见中文词（生活中高频、易理解）
const WORD_POOL = [
  '苹果','香蕉','橙子','葡萄','西瓜','草莓','梨子','桃子','樱桃','柠檬',
  '芒果','菠萝','蓝莓','哈密瓜','石榴','椰子','荔枝','龙眼','柚子','杏子',
  '番茄','黄瓜','土豆','萝卜','白菜','菠菜','生菜','南瓜','茄子','洋葱',
  '大蒜','姜片','香菜','辣椒','玉米','蘑菇','豆腐','面条','米饭','包子',
  '馒头','水饺','面包','蛋糕','饼干','牛奶','酸奶','鸡蛋','香肠','火腿',
  '披萨','汉堡','薯条','可乐','果汁','茶叶','咖啡','蜂蜜','巧克力','冰淇淋',
  '飞机','火车','汽车','轮船','地铁','高铁','公交','出租车','单车','摩托',
  '卡车','校车','电梯','楼梯','马路','桥梁','隧道','车站','机场','港口',
  '红灯','绿灯','黄灯','方向盘','车门','车窗','轮胎','座椅','头盔','背包',
  '书包','铅笔','钢笔','橡皮','尺子','本子','课本','字典','电脑','平板',
  '手机','键盘','鼠标','耳机','音箱','相机','电池','充电器','网线','路由器',
  '屏幕','镜头','照片','视频','闹钟','手表','台灯','灯泡','插座','开关',
  '桌子','椅子','沙发','床铺','枕头','被子','窗帘','地毯','衣柜','书架',
  '门口','窗户','阳台','厨房','客厅','卧室','浴室','镜子','毛巾','牙刷',
  '牙膏','肥皂','洗发水','雨伞','水杯','水壶','饭碗','盘子','勺子','筷子',
  '锅子','刀具','剪刀','胶水','纸巾','垃圾桶','洗衣机','冰箱','空调','风扇',
  '老师','学生','同学','朋友','家人','爸爸','妈妈','爷爷','奶奶','哥哥',
  '姐姐','弟弟','妹妹','叔叔','阿姨','医生','护士','警察','司机','厨师',
  '工人','农民','画家','歌手','演员','作家','记者','教练','老板','店员',
  '邮差','律师','法官','工程师','程序员','设计师','科学家','宇航员','消防员','快递员',
  '学校','教室','操场','图书馆','医院','公园','商店','超市','银行','邮局',
  '餐厅','影院','剧院','广场','博物馆','动物园','植物园','游乐园','体育馆','游泳馆',
  '海边','沙滩','山顶','森林','草地','河流','湖泊','瀑布','田野','农场',
  '春天','夏天','秋天','冬天','早晨','中午','晚上','白天','黑夜','昨天',
  '今天','明天','星期一','星期二','星期三','星期四','星期五','星期六','星期天','节日',
  '春节','元宵','清明','端午','中秋','国庆','生日','礼物','卡片','蛋糕店',
  '太阳','月亮','星星','云朵','雨滴','雪花','彩虹','闪电','雷声','微风',
  '台风','雾气','露珠','天空','大海','高山','平原','沙漠','岛屿','峡谷',
  '熊猫','老虎','狮子','大象','长颈鹿','斑马','猴子','兔子','松鼠','海豚',
  '鲸鱼','鲨鱼','章鱼','海龟','金鱼','小鸟','鹦鹉','鸽子','鸭子','天鹅',
  '青蛙','乌龟','蜗牛','蝴蝶','蜜蜂','蚂蚁','蜻蜓','蚯蚓','小狗','小猫',
  '牛奶糖','棒棒糖','口香糖','棉花糖','瓜子','花生','核桃','杏仁','腰果','开心果',
  '篮球','足球','排球','乒乓球','羽毛球','网球','棒球','高尔夫','跳绳','滑板',
  '跑步','游泳','骑车','爬山','跳高','跳远','瑜伽','体操','健身','散步',
  '围棋','象棋','扑克','积木','拼图','魔方','风筝','气球','玩具车','玩偶',
  '画笔','颜料','画纸','铅笔盒','橡皮泥','口琴','吉他','钢琴','小提琴','鼓点',
  '故事','童话','诗歌','笑话','谜语','日记','信封','邮票','地图','地球仪',
  '红色','蓝色','黄色','绿色','白色','黑色','紫色','粉色','灰色','金色',
  '高兴','难过','紧张','轻松','勇敢','害怕','生气','安静','热闹','温柔',
  '聪明','努力','认真','诚实','友好','礼貌','耐心','整洁','干净','舒服',
  '清楚','明白','希望','梦想','目标','计划','办法','机会','问题','答案',
  '开始','结束','成功','失败','练习','复习','记忆','思考','观察','比较',
  '选择','决定','发现','理解','分享','合作','帮助','提醒','等待','坚持',
  '速度','方向','距离','高度','长度','重量','温度','声音','光线','影子',
  '数字','字母','词语','句子','段落','标题','目录','封面','页面','章节',
  '人民币','硬币','纸币','钱包','口袋','钥匙','门锁','证件','车票','机票',
  '地图册','指南针','望远镜','放大镜','手电筒','急救包','创可贴','口罩','手套','围巾',
  '外套','毛衣','衬衫','裤子','裙子','袜子','鞋子','帽子','眼镜','雨衣',
  '清水','热水','冰水','果茶','奶茶','豆浆','米粥','鸡汤','鱼汤','面汤',
  '清晨','黄昏','午夜','黎明','午后','傍晚','周末','假期','寒假','暑假',
  '城市','乡村','小镇','街道','巷子','路口','社区','花园','庭院','大门'
];

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
let revealState = [];

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
    hintText.textContent = `请先记住下面 10 个词（词库 ${WORD_POOL.length} 个）`;
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
      btn.classList.add('flipable', 'hidden');
      btn.textContent = revealState[idx] ? word : '?';
      btn.classList.toggle('revealed', !!revealState[idx]);
      btn.addEventListener('click', () => {
        revealState[idx] = !revealState[idx];
        render();
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
  revealState = Array(WORDS_PER_ROUND).fill(false);
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
