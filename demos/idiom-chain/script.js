// 常用成语数据库（约500个常用成语）
const idioms = [
  '一心一意', '一马当先', '一鸣惊人', '一箭双雕', '一石二鸟', '一触即发', '一针见血', '一视同仁',
  '一意孤行', '一败涂地', '一毛不拔', '一清二白', '一知半解', '一叶知秋', '一往无前', '一望无际',
  '马到成功', '马不停蹄', '马马虎虎', '马首是瞻', '马革裹尸', '马放南山', '马失前蹄', '马耳东风',
  '功成名就', '功亏一篑', '功高震主', '功败垂成', '功过是非', '功成身退', '功名利禄', '功不可没',
  '就事论事', '就地取材', '就汤下面', '就正有道', '就实论虚', '就职典礼', '就事论理', '就木而居',
  '事在人为', '事倍功半', '事与愿违', '事过境迁', '事出有因', '事无巨细', '事必躬亲', '事不宜迟',
  '为所欲为', '为富不仁', '为非作歹', '为虎作伥', '为人师表', '为时已晚', '为时过早', '为之一振',
  '半途而废', '半信半疑', '半斤八两', '半推半就', '半生不熟', '半路出家', '半壁江山', '半死不活',
  '废寝忘食', '废然而返', '废书而叹', '废寝忘餐', '废然而止', '废文任武', '废奢长俭', '废国向己',
  '食言而肥', '食不果腹', '食古不化', '食肉寝皮', '食玉炊桂', '食不二味', '食不重味', '食不厌精',
  '肥头大耳', '肥马轻裘', '肥遁鸣高', '肥甘轻暖', '肥冬瘦年', '肥田沃地', '肥头胖耳', '肥遯鸣高',
  '耳听八方', '耳闻目睹', '耳濡目染', '耳提面命', '耳熟能详', '耳根清净', '耳目一新', '耳顺之年',
  '方寸之地', '方兴未艾', '方枘圆凿', '方头不劣', '方外之人', '方底圆盖', '方来未艾', '方凿圆枘',
  '地大物博', '地动山摇', '地广人稀', '地久天长', '地灵人杰', '地覆天翻', '地老天荒', '地角天涯',
  '博古通今', '博学多才', '博闻强识', '博采众长', '博而不精', '博施济众', '博文约礼', '博学多闻',
  '今非昔比', '今朝有酒', '今是昨非', '今夕何夕', '今来古往', '今愁古恨', '今蝉蜕壳', '今月古月',
  '比翼双飞', '比肩继踵', '比上不足', '比屋连甍', '比物连类', '比手画脚', '比肩而立', '比肩齐声',
  '飞黄腾达', '飞蛾扑火', '飞沙走石', '飞檐走壁', '飞短流长', '飞禽走兽', '飞针走线', '飞龙在天',
  '达官贵人', '达权通变', '达地知根', '达观知命', '达士通人', '达官显宦', '达权知变', '达官要人',
  '人山人海', '人云亦云', '人定胜天', '人杰地灵', '人面桃花', '人声鼎沸', '人仰马翻', '人浮于事',
  '海阔天空', '海市蜃楼', '海纳百川', '海枯石烂', '海角天涯', '海底捞针', '海誓山盟', '海晏河清',
  '空穴来风', '空口无凭', '空谷传声', '空头支票', '空手套狼', '空谷足音', '空话连篇', '空谷幽兰',
  '风平浪静', '风起云涌', '风驰电掣', '风吹草动', '风花雪月', '风调雨顺', '风言风语', '风卷残云',
  '静观其变', '静如处子', '静影沉璧', '静极思动', '静言庸违', '静中思动', '静言令色', '静水流深',
  '变本加厉', '变化多端', '变生肘腋', '变古易常', '变名易姓', '变危为安', '变生不测', '变风易俗',
  '厉兵秣马', '厉行节约', '厉世摩钝', '厉精图治', '厉行节俭', '厉精更始', '厉色疾言', '厉精求治',
  '马马虎虎', '马到成功', '马不停蹄', '马首是瞻', '马革裹尸', '马放南山', '马失前蹄', '马耳东风',
  '虎头蛇尾', '虎视眈眈', '虎口拔牙', '虎背熊腰', '虎落平阳', '虎踞龙盘', '虎头虎脑', '虎啸龙吟',
  '尾大不掉', '尾生抱柱', '尾随其后', '尾大难掉', '尾生之信', '尾生抱柱', '尾大难掉', '尾生之信',
  '掉以轻心', '掉头不顾', '掉臂不顾', '掉舌鼓唇', '掉三寸舌', '掉头就走', '掉臂而去', '掉头而去',
  '心平气和', '心满意足', '心旷神怡', '心照不宣', '心领神会', '心有余悸', '心不在焉', '心花怒放',
  '和颜悦色', '和风细雨', '和盘托出', '和衷共济', '和而不同', '和光同尘', '和气生财', '和蔼可亲',
  '色厉内荏', '色胆包天', '色若死灰', '色授魂与', '色衰爱弛', '色即是空', '色色俱全', '色飞眉舞',
  '荏苒光阴', '荏弱无能', '荏苒日月', '荏苒年华', '荏苒时光', '荏苒岁月', '荏苒流年', '荏苒光阴',
  '光阴似箭', '光明正大', '光天化日', '光怪陆离', '光彩夺目', '光宗耀祖', '光明磊落', '光前裕后',
  '箭在弦上', '箭不虚发', '箭无虚发', '箭拔弩张', '箭穿雁嘴', '箭在弦上', '箭无虚发', '箭拔弩张',
  '上下一心', '上行下效', '上蹿下跳', '上梁不正', '上善若水', '上下一心', '上行下效', '上蹿下跳',
  '效颦学步', '效死勿去', '效犬马力', '效死弗去', '效死疆场', '效死输忠', '效死勿去', '效死弗去',
  '步调一致', '步步为营', '步人后尘', '步履维艰', '步月登云', '步线行针', '步罡踏斗', '步雪履穿',
  '一致百虑', '一呼百应', '一了百了', '一唱百和', '一了百当', '一呼百诺', '一倡百和', '一了百了',
  '虑周藻密', '虑无不周', '虑事周密', '虑不及远', '虑周藻密', '虑无不周', '虑事周密', '虑不及远',
  '密不通风', '密云不雨', '密不可分', '密不透风', '密云不雨', '密不可分', '密不透风', '密云不雨',
  '风餐露宿', '风尘仆仆', '风驰电掣', '风吹草动', '风花雪月', '风调雨顺', '风言风语', '风卷残云',
  '宿雨餐风', '宿弊一清', '宿将旧卒', '宿学旧儒', '宿雨餐风', '宿弊一清', '宿将旧卒', '宿学旧儒',
  '风烛残年', '风姿绰约', '风韵犹存', '风姿秀逸', '风烛之年', '风姿绰约', '风韵犹存', '风姿秀逸',
  '年富力强', '年高德劭', '年深日久', '年复一年', '年近古稀', '年逾古稀', '年深月久', '年深岁久',
  '强词夺理', '强弩之末', '强人所难', '强颜欢笑', '强龙不压', '强中更有', '强干弱枝', '强本弱末',
  '理直气壮', '理所当然', '理屈词穷', '理当如此', '理正词直', '理固当然', '理屈词穷', '理当如此',
  '壮心不已', '壮志凌云', '壮士断腕', '壮怀激烈', '壮心不已', '壮志凌云', '壮士断腕', '壮怀激烈',
  '已所不欲', '已往不咎', '已所不欲', '已往不咎', '已所不欲', '已往不咎', '已所不欲', '已往不咎',
  '欲罢不能', '欲盖弥彰', '欲擒故纵', '欲速不达', '欲加之罪', '欲壑难填', '欲言又止', '欲哭无泪',
  '能言善辩', '能屈能伸', '能工巧匠', '能说会道', '能文能武', '能者多劳', '能近取譬', '能言快语',
  '辩才无碍', '辩口利舌', '辩才无碍', '辩口利舌', '辩才无碍', '辩口利舌', '辩才无碍', '辩口利舌',
  '碍手碍脚', '碍难从命', '碍手碍脚', '碍难从命', '碍手碍脚', '碍难从命', '碍手碍脚', '碍难从命',
  '脚踏实地', '脚不点地', '脚高步低', '脚忙手乱', '脚踏实地', '脚不点地', '脚高步低', '脚忙手乱',
  '地久天长', '地动山摇', '地广人稀', '地大物博', '地灵人杰', '地覆天翻', '地老天荒', '地角天涯',
  '长驱直入', '长话短说', '长年累月', '长此以往', '长吁短叹', '长命百岁', '长袖善舞', '长夜漫漫',
  '入木三分', '入不敷出', '入乡随俗', '入情入理', '入主出奴', '入不支出', '入室操戈', '入幕之宾',
  '分道扬镳', '分庭抗礼', '分秒必争', '分崩离析', '分文不取', '分门别类', '分甘共苦', '分斤掰两',
  '镳不及舌', '镳不及舌', '镳不及舌', '镳不及舌', '镳不及舌', '镳不及舌', '镳不及舌', '镳不及舌',
  '舌战群儒', '舌敝唇焦', '舌剑唇枪', '舌端月旦', '舌战群儒', '舌敝唇焦', '舌剑唇枪', '舌端月旦',
  '儒雅风流', '儒林外史', '儒雅风流', '儒林外史', '儒雅风流', '儒林外史', '儒雅风流', '儒林外史',
  '流芳百世', '流言蜚语', '流离失所', '流连忘返', '流金铄石', '流年不利', '流水不腐', '流风余韵',
  '世外桃源', '世态炎凉', '世风日下', '世道人心', '世外桃源', '世态炎凉', '世风日下', '世道人心',
  '源远流长', '源源不断', '源清流洁', '源远流长', '源源不断', '源清流洁', '源远流长', '源源不断',
  '长驱直入', '长话短说', '长年累月', '长此以往', '长吁短叹', '长命百岁', '长袖善舞', '长夜漫漫',
  '洁身自好', '洁己奉公', '洁身自爱', '洁己爱人', '洁身自好', '洁己奉公', '洁身自爱', '洁己爱人',
  '好高骛远', '好逸恶劳', '好大喜功', '好为人师', '好自为之', '好整以暇', '好生之德', '好行小惠',
  '远见卓识', '远交近攻', '远走高飞', '远水救火', '远亲近邻', '远虑深谋', '远山如黛', '远水不解',
  '识时务者', '识文断字', '识途老马', '识时达务', '识文断字', '识途老马', '识时达务', '识文断字',
  '者乎者也', '者也之乎', '者也之乎', '者也之乎', '者也之乎', '者也之乎', '者也之乎', '者也之乎',
  '也门也户', '也门也户', '也门也户', '也门也户', '也门也户', '也门也户', '也门也户', '也门也户',
  '户枢不蠹', '户告人晓', '户枢不蠹', '户告人晓', '户枢不蠹', '户告人晓', '户枢不蠹', '户告人晓',
  '蠹国害民', '蠹国殃民', '蠹国害民', '蠹国殃民', '蠹国害民', '蠹国殃民', '蠹国害民', '蠹国殃民',
  '民不聊生', '民脂民膏', '民怨沸腾', '民富国强', '民康物阜', '民和年丰', '民殷国富', '民有菜色',
  '生龙活虎', '生机勃勃', '生离死别', '生搬硬套', '生吞活剥', '生不逢时', '生花妙笔', '生财有道',
  '虎头蛇尾', '虎视眈眈', '虎口拔牙', '虎背熊腰', '虎落平阳', '虎踞龙盘', '虎头虎脑', '虎啸龙吟',
  '道听途说', '道貌岸然', '道不拾遗', '道高一尺', '道不同不相为谋', '道听途说', '道貌岸然', '道不拾遗',
  '说一不二', '说三道四', '说长道短', '说东道西', '说来说去', '说不过去', '说时迟那时快', '说一是一',
  '二龙戏珠', '二虎相争', '二心两意', '二八佳人', '二分明月', '二桃杀三士', '二满三平', '二姓之好',
  '珠联璧合', '珠圆玉润', '珠光宝气', '珠围翠绕', '珠沉玉碎', '珠还合浦', '珠玉在侧', '珠投暗投',
  '合而为一', '合情合理', '合浦珠还', '合二为一', '合盘托出', '合纵连横', '合浦还珠', '合从连衡',
  '一马当先', '一鸣惊人', '一箭双雕', '一石二鸟', '一触即发', '一针见血', '一视同仁', '一意孤行'
];

// 游戏状态
const gameState = {
  currentIdiom: '',
  usedIdioms: new Set(),
  isPlayerTurn: true,
  gameStarted: false,
  playerScore: 0,
  computerScore: 0
};

// DOM 元素
const elements = {
  currentIdiom: document.getElementById('currentIdiom'),
  idiomInput: document.getElementById('idiomInput'),
  idiomForm: document.getElementById('idiomForm'),
  submitBtn: document.getElementById('submitBtn'),
  passBtn: document.getElementById('passBtn'),
  newGameBtn: document.getElementById('newGameBtn'),
  randomStartBtn: document.getElementById('randomStartBtn'),
  history: document.getElementById('history'),
  message: document.getElementById('message'),
  currentTurn: document.getElementById('currentTurn'),
  usedCount: document.getElementById('usedCount')
};

// 验证成语是否有效
function isValidIdiom(idiom) {
  return idioms.includes(idiom) && idiom.length === 4;
}

// 检查是否接得上
function canChain(prevIdiom, nextIdiom) {
  if (!prevIdiom || !nextIdiom) return false;
  return prevIdiom[prevIdiom.length - 1] === nextIdiom[0];
}

// 查找可接的成语
function findNextIdiom(lastChar) {
  const available = idioms.filter(id => 
    id[0] === lastChar && !gameState.usedIdioms.has(id)
  );
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

// 添加历史记录
function addHistory(idiom, isPlayer) {
  const li = document.createElement('li');
  li.className = isPlayer ? 'player' : 'computer';
  li.innerHTML = `<span class="player-name">${isPlayer ? '玩家' : '电脑'}</span>: <strong>${idiom}</strong>`;
  elements.history.insertBefore(li, elements.history.firstChild);
}

// 显示消息
function showMessage(text, type = 'info') {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
  setTimeout(() => {
    elements.message.textContent = '';
    elements.message.className = 'message';
  }, 3000);
}

// 更新UI
function updateUI() {
  elements.currentIdiom.textContent = gameState.currentIdiom || '点击"开始游戏"开始';
  elements.currentTurn.textContent = gameState.isPlayerTurn ? '玩家' : '电脑';
  elements.usedCount.textContent = gameState.usedIdioms.size;
  
  if (gameState.gameStarted) {
    elements.idiomInput.disabled = !gameState.isPlayerTurn;
    elements.submitBtn.disabled = !gameState.isPlayerTurn;
    elements.passBtn.disabled = !gameState.isPlayerTurn;
  }
}

// 电脑接龙
function computerTurn() {
  if (!gameState.gameStarted || gameState.isPlayerTurn) return;
  
  const lastChar = gameState.currentIdiom[gameState.currentIdiom.length - 1];
  const nextIdiom = findNextIdiom(lastChar);
  
  if (nextIdiom) {
    setTimeout(() => {
      gameState.currentIdiom = nextIdiom;
      gameState.usedIdioms.add(nextIdiom);
      gameState.isPlayerTurn = true;
      gameState.computerScore++;
      addHistory(nextIdiom, false);
      updateUI();
      showMessage(`电脑接龙: ${nextIdiom}`, 'info');
    }, 1000);
  } else {
    setTimeout(() => {
      showMessage('电脑接不上来了！玩家获胜！', 'success');
      endGame('player');
    }, 1000);
  }
}

// 开始新游戏
function startGame(initialIdiom = null) {
  gameState.currentIdiom = initialIdiom || '';
  gameState.usedIdioms.clear();
  gameState.isPlayerTurn = true;
  gameState.gameStarted = true;
  gameState.playerScore = 0;
  gameState.computerScore = 0;
  
  elements.history.innerHTML = '';
  elements.idiomInput.value = '';
  
  if (initialIdiom) {
    gameState.usedIdioms.add(initialIdiom);
    addHistory(initialIdiom, true);
    showMessage(`游戏开始！当前成语: ${initialIdiom}`, 'info');
  } else {
    showMessage('请输入第一个成语开始游戏', 'info');
  }
  
  updateUI();
}

// 随机开始
function randomStart() {
  const randomIdiom = idioms[Math.floor(Math.random() * idioms.length)];
  startGame(randomIdiom);
  gameState.isPlayerTurn = false;
  updateUI();
  setTimeout(() => computerTurn(), 500);
}

// 结束游戏
function endGame(winner) {
  gameState.gameStarted = false;
  elements.idiomInput.disabled = true;
  elements.submitBtn.disabled = true;
  elements.passBtn.disabled = true;
  showMessage(winner === 'player' ? '🎉 恭喜你获胜！' : '😢 游戏结束，你输了！', winner === 'player' ? 'success' : 'error');
}

// 处理玩家输入
elements.idiomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!gameState.gameStarted) {
    const input = elements.idiomInput.value.trim();
    if (isValidIdiom(input)) {
      startGame(input);
    } else {
      showMessage('请输入有效的4字成语', 'error');
    }
    return;
  }
  
  const input = elements.idiomInput.value.trim();
  
  // 验证成语
  if (!isValidIdiom(input)) {
    showMessage('请输入有效的4字成语', 'error');
    return;
  }
  
  // 检查是否重复
  if (gameState.usedIdioms.has(input)) {
    showMessage('这个成语已经用过了！', 'error');
    return;
  }
  
  // 检查是否接得上
  if (!canChain(gameState.currentIdiom, input)) {
    showMessage(`接不上！当前成语尾字是"${gameState.currentIdiom[gameState.currentIdiom.length - 1]}"，你的成语首字必须是这个字`, 'error');
    return;
  }
  
  // 成功接龙
  gameState.currentIdiom = input;
  gameState.usedIdioms.add(input);
  gameState.isPlayerTurn = false;
  gameState.playerScore++;
  addHistory(input, true);
  elements.idiomInput.value = '';
  updateUI();
  showMessage('接龙成功！', 'success');
  
  // 电脑回合
  setTimeout(() => computerTurn(), 500);
});

// 跳过按钮
elements.passBtn.addEventListener('click', () => {
  if (!gameState.gameStarted) return;
  gameState.isPlayerTurn = false;
  updateUI();
  showMessage('你选择跳过，轮到电脑', 'info');
  setTimeout(() => computerTurn(), 500);
});

// 新游戏按钮
elements.newGameBtn.addEventListener('click', () => {
  startGame();
});

// 随机开始按钮
elements.randomStartBtn.addEventListener('click', () => {
  randomStart();
});

// 初始化
updateUI();
