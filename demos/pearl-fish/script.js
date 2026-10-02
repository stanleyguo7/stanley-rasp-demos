(() => {
  'use strict';
  const canvas=document.querySelector('#sea'),ctx=canvas.getContext('2d');
  const modal=document.querySelector('#modal'),modalTitle=document.querySelector('#modalTitle'),modalText=document.querySelector('#modalText'),modalIcon=document.querySelector('#modalIcon'),actionBtn=document.querySelector('#actionBtn');
  const levelText=document.querySelector('#levelText'),fishText=document.querySelector('#fishText'),scoreText=document.querySelector('#scoreText'),statusText=document.querySelector('#statusText'),subText=document.querySelector('#subText'),timerText=document.querySelector('#timerText'),barFill=document.querySelector('#barFill');
  const TOTAL=6,REVEAL=3.2;
  let level=0,score=0,state='menu',fishes=[],targetId=0,slots=[],viewW=1000,viewH=540,dpr=1;
  let phaseStart=0,shufflePlan=[],swapIndex=0,activeSwap=null,resultUntil=0,chosenId=null,bubbles=[];
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const ease=t=>t*t*(3-2*t);
  function gridCols(n){return viewW<600?Math.ceil(n/2):(n===5?5:Math.ceil(n/2));}
  function fishSize(){return clamp(viewW/(gridCols(fishes.length)+1)*.7,38,72);}
  function resize(){
    const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);viewW=r.width;viewH=r.height;
    canvas.width=Math.round(viewW*dpr);canvas.height=Math.round(viewH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=5+level,cols=gridCols(n),rows=Math.ceil(n/cols);slots=[];
    for(let row=0;row<rows;row++){
      const count=Math.min(cols,n-row*cols);
      for(let col=0;col<count;col++)slots.push({x:viewW*(col+1)/(count+1),y:viewH*(rows===1?0.55:row===0?0.38:0.69)});
    }
  }
  function show(title,text,icon,button,callback){
    state='modal';modalTitle.textContent=title;modalText.textContent=text;modalIcon.textContent=icon;actionBtn.textContent=button;actionBtn.onclick=callback;modal.hidden=false;
  }
  function updateHud(){levelText.textContent=`第 ${level+1} / ${TOTAL} 关`;fishText.textContent=`🐟 ${5+level} 只鱼`;scoreText.textContent=`🦪 ${score} 颗珍珠`;}
  function setStatus(main,detail,timer='',fraction=1){statusText.textContent=main;subText.textContent=detail;timerText.textContent=timer;barFill.style.width=`${clamp(fraction,0,1)*100}%`;}
  function planSwaps(n){
    const swaps=8+level*2,plan=[];
    for(let i=0;i<swaps;i++){
      let a,b;
      if(i%3===0){a=targetId;b=Math.floor(Math.random()*(n-1));if(b>=a)b++;}
      else{a=Math.floor(Math.random()*n);b=Math.floor(Math.random()*(n-1));if(b>=a)b++;}
      plan.push([a,b]);
    }
    return plan;
  }
  function startLevel(){
    const n=5+level;fishes=Array.from({length:n},(_,id)=>({id,slot:id}));targetId=Math.floor(Math.random()*n);
    resize();shufflePlan=planSwaps(n);swapIndex=0;activeSwap=null;chosenId=null;bubbles=[];
    modal.hidden=true;state='reveal';phaseStart=performance.now();updateHud();
    setStatus('记住这只藏珍珠的小鱼！','珍珠亮起后，它会和伙伴们一起游动。',`3 秒`,1);
  }
  function startSwap(now){
    if(swapIndex>=shufflePlan.length){state='choose';phaseStart=now;setStatus('珍珠藏在哪只小鱼里？','点一下你认为正确的小鱼。',`${chooseSeconds()} 秒`,1);return;}
    const [a,b]=shufflePlan[swapIndex],fa=fishes[a],fb=fishes[b];
    activeSwap={a,b,fromA:fa.slot,fromB:fb.slot,start:now,duration:Math.max(640,940-level*40),arc:Math.min(65,viewH*.11)};
  }
  function chooseSeconds(){return Math.max(9,15-level);}
  function finishChoice(id,now){
    if(state!=='choose')return;
    chosenId=id;resultUntil=now+1500;state='result';
    if(id===targetId){score++;updateHud();setStatus('找对啦！珍珠闪闪发亮 ✨','小鱼开心地吐出一串泡泡。','成功',1);}
    else setStatus(id===null?'时间到！':'哎呀，珍珠在另一只小鱼里','亮起来的是正确的小鱼，再试一次吧。','再试',0);
    for(let i=0;i<18;i++)bubbles.push({x:slots[fishes[targetId].slot].x+rand(-22,22),y:slots[fishes[targetId].slot].y,vx:rand(-22,22),vy:rand(-85,-35),r:rand(3,9),life:rand(.8,1.8)});
  }
  function completeResult(){
    if(chosenId===targetId){
      if(level===TOTAL-1)show('珍珠观察大师！',`你闯过了 ${TOTAL} 关，找到了 ${score} 颗珍珠！`,'🏆','再玩一次',()=>{level=0;score=0;startLevel();});
      else show('成功过关！',`下一关有 ${6+level} 只小鱼，准备好继续盯紧珍珠了吗？`,'🦪','进入下一关',()=>{level++;startLevel();});
    }else show('再观察一次吧','这关的小鱼会重新游动，仔细记住藏珍珠的那一只。','🐟','重试本关',startLevel);
  }
  function update(now,dt){
    if(state==='reveal'){
      const remain=REVEAL-(now-phaseStart)/1000;
      setStatus('记住这只藏珍珠的小鱼！','珍珠亮起后，它会和伙伴们一起游动。',`${Math.max(1,Math.min(3,Math.ceil(remain)))} 秒`,remain/REVEAL);
      if(remain<=0){state='shuffle';phaseStart=now;startSwap(now);}
    }else if(state==='shuffle'){
      if(activeSwap){
        const t=(now-activeSwap.start)/activeSwap.duration;
        if(t>=1){const a=fishes[activeSwap.a],b=fishes[activeSwap.b];[a.slot,b.slot]=[b.slot,a.slot];activeSwap=null;swapIndex++;phaseStart=now;}
      }else if(now-phaseStart>165)startSwap(now);
      if(state==='shuffle')setStatus('盯紧小鱼，别跟丢！',`正在游动：${Math.min(swapIndex+1,shufflePlan.length)} / ${shufflePlan.length}`, '👀',swapIndex/shufflePlan.length);
    }else if(state==='choose'){
      const remain=chooseSeconds()-(now-phaseStart)/1000;
      setStatus('珍珠藏在哪只小鱼里？','点一下你认为正确的小鱼。',`${Math.max(0,Math.ceil(remain))} 秒`,remain/chooseSeconds());
      if(remain<=0)finishChoice(null,now);
    }else if(state==='result'&&now>=resultUntil)completeResult();
    for(const b of bubbles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;}bubbles=bubbles.filter(b=>b.life>0);
  }
  function fishPosition(fish,now){
    let {x,y}=slots[fish.slot];
    if(activeSwap&&(fish.id===activeSwap.a||fish.id===activeSwap.b)){
      const first=fish.id===activeSwap.a,from=slots[first?activeSwap.fromA:activeSwap.fromB],to=slots[first?activeSwap.fromB:activeSwap.fromA];
      const t=clamp((now-activeSwap.start)/activeSwap.duration,0,1),e=ease(t);
      x=from.x+(to.x-from.x)*e;y=from.y+(to.y-from.y)*e+Math.sin(Math.PI*t)*activeSwap.arc*(first?-1:1);
    }
    return {x,y};
  }
  function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function drawSea(now){
    const g=ctx.createLinearGradient(0,0,0,viewH);g.addColorStop(0,'#a5edf0');g.addColorStop(.5,'#62cbd5');g.addColorStop(1,'#269cbb');ctx.fillStyle=g;ctx.fillRect(0,0,viewW,viewH);
    ctx.fillStyle='#fff8dd42';ctx.beginPath();ctx.moveTo(viewW*.12,0);ctx.lineTo(viewW*.36,0);ctx.lineTo(viewW*.62,viewH);ctx.lineTo(viewW*.45,viewH);ctx.fill();
    ctx.beginPath();ctx.moveTo(viewW*.68,0);ctx.lineTo(viewW*.79,0);ctx.lineTo(viewW*.97,viewH);ctx.lineTo(viewW*.88,viewH);ctx.fill();
    const sand=ctx.createLinearGradient(0,viewH*.88,0,viewH);sand.addColorStop(0,'#f8e8b0');sand.addColorStop(1,'#e9c993');ctx.fillStyle=sand;ctx.beginPath();ctx.moveTo(0,viewH*.91);ctx.quadraticCurveTo(viewW*.45,viewH*.85,viewW,viewH*.92);ctx.lineTo(viewW,viewH);ctx.lineTo(0,viewH);ctx.fill();
    for(let i=0;i<13;i++){
      const x=(i+.25)*viewW/13,h=20+(i%3)*12;
      ctx.strokeStyle=i%2?'#58bda1':'#65cda7';ctx.lineWidth=5;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x,viewH*.95);ctx.quadraticCurveTo(x+Math.sin(now/900+i)*10,viewH*.95-h*.6,x+Math.sin(now/900+i)*13,viewH*.95-h);ctx.stroke();
    }
    for(let i=0;i<18;i++){
      const x=(i*71.7+26)%viewW,y=(viewH*.83+i*37.3)%viewH;
      ellipse(x,y,2+(i%3),2+(i%3),'#e8ffff80');
    }
    for(let i=0;i<9;i++){
      const x=((i*117+now*(.009+i%3*.006))%(viewW+80))-40,y=viewH*(.13+(i*31%65)/100);
      ctx.strokeStyle='#ffffff70';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,5+(i%3)*3,0,Math.PI*2);ctx.stroke();
    }
  }
  function drawFish(fish,now){
    const pos=fishPosition(fish,now),size=fishSize(),bob=Math.sin(now/240+fish.id)*2;
    const x=pos.x,y=pos.y+bob;
    if(state==='result'&&fish.id===targetId){ellipse(x,y,size*.82,size*.68,'#fff4b181');}
    if(state==='result'&&fish.id===chosenId&&chosenId!==targetId){ellipse(x,y,size*.75,size*.6,'#ff8c9477');}
    ctx.save();ctx.translate(x,y);const flap=Math.sin(now/145+fish.id)*.12;ctx.rotate(flap);
    ctx.fillStyle='#f07c64';ctx.beginPath();ctx.moveTo(-size*.38,0);ctx.lineTo(-size*.83,-size*.38);ctx.lineTo(-size*.83,size*.38);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffbe79';ctx.beginPath();ctx.moveTo(-size*.16,-size*.18);ctx.lineTo(-size*.32,-size*.56);ctx.lineTo(size*.14,-size*.30);ctx.closePath();ctx.fill();
    ellipse(0,0,size*.48,size*.34,'#ff9f74');ellipse(size*.12,size*.12,size*.31,size*.15,'#ffc394');
    ellipse(size*.25,-size*.08,size*.065,size*.08,'#473e4b');ellipse(size*.27,-size*.105,size*.02,size*.025,'#fff');
    ellipse(size*.37,size*.12,size*.08,size*.045,'#f07875');
    ctx.strokeStyle='#e27d70';ctx.lineWidth=Math.max(1.5,size*.028);ctx.beginPath();ctx.arc(size*.36,size*.04,size*.09,.2,1.8);ctx.stroke();ctx.restore();
    const pearl=(state==='reveal'||state==='result')&&fish.id===targetId;
    if(pearl){const py=y-size*.78+Math.sin(now/180)*3;ellipse(x,py,size*.16,size*.16,'#fffbe7');ellipse(x-size*.045,py-size*.045,size*.045,size*.045,'#fff');ctx.strokeStyle='#fffbe7aa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,py,size*.24,0,Math.PI*2);ctx.stroke();ellipse(x-size*.06,y+size*.08,size*.105,size*.105,'#fffbe7');ellipse(x-size*.09,y+size*.045,size*.026,size*.026,'#fff');}
  }
  function render(now){ctx.clearRect(0,0,viewW,viewH);drawSea(now);for(const f of fishes)drawFish(f,now);for(const b of bubbles){ctx.globalAlpha=clamp(b.life,0,1);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
  let last=0;function frame(now){const dt=Math.min((now-last)/1000||0,.05);last=now;update(now,dt);render(now);requestAnimationFrame(frame);}
  canvas.addEventListener('pointerdown',e=>{
    if(state!=='choose')return;
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const size=fishSize();
    let picked=null,nearest=Infinity;
    for(const fish of fishes){const p=fishPosition(fish,performance.now()),distance=Math.hypot(p.x-x,p.y-y);if(distance<size*.78&&distance<nearest){nearest=distance;picked=fish.id;}}
    if(picked!==null)finishChoice(picked,performance.now());
  });
  document.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('resize',resize);
  actionBtn.onclick=()=>{level=0;score=0;startLevel();};updateHud();resize();requestAnimationFrame(frame);
})();
