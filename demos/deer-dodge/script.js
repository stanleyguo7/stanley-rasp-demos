(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const title = document.querySelector('#modalTitle');
  const detail = document.querySelector('#modalText');
  const icon = document.querySelector('#modalIcon');
  const action = document.querySelector('#actionBtn');
  const levelText = document.querySelector('#levelText');
  const starsText = document.querySelector('#starsText');
  const heartsText = document.querySelector('#heartsText');
  const pauseBtn = document.querySelector('#pauseBtn');
  const W = 1000, H = 620, TAU = Math.PI * 2;
  let viewW=W, cameraX=0;
  const palettes = [
    {ground:'#a9df86', path:'#e6d5a8', edge:'#81c76f', sky:'#f9efb1', name:'阳光森林'},
    {ground:'#9cdbad', path:'#e9dbb9', edge:'#69ba9b', sky:'#d8f2e6', name:'花香草地'},
    {ground:'#a8d9d0', path:'#e8d3a9', edge:'#71c1b7', sky:'#d4f3fa', name:'萤火溪谷'}
  ];
  const layouts = [
    {stars:[[320,275],[580,410],[805,240]], logs:[[455,235,445,1.5]], bees:[[665,205,445,1.7]], flowers:18},
    {stars:[[300,410],[540,220],[800,390]], logs:[[380,185,455,1.8],[685,195,455,2.1]], bees:[[535,210,445,2.2]], flowers:24},
    {stars:[[290,245],[555,415],[780,260]], logs:[[390,195,445,2.1],[685,195,445,2.4]], bees:[[520,220,450,2.4],[815,190,450,2.7]], flowers:30}
  ];
  let level=0, hearts=3, stars=0, state='menu', last=0, time=0, invincible=0, celebration=0, player={x:120,y:320,r:21}, items=[], logs=[], bees=[], sparkles=[];
  const keys=new Set(); let touchTarget=null; let pointerDown=false;
  const rand=(n)=>{ const v=Math.sin(n*128.83+level*734.23)*43758.5453; return v-Math.floor(v); };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function roundRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function ellipse(x,y,rx,ry,fill,rotation=0){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,TAU);ctx.fill();}
  function line(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke();}
  function flower(x,y,s,c){ctx.save();ctx.translate(x,y);for(let i=0;i<5;i++){let a=i*TAU/5;ellipse(Math.cos(a)*s*.55,Math.sin(a)*s*.55,s*.43,s*.43,c);}ellipse(0,0,s*.35,s*.35,'#ffe273');ctx.restore();}
  function starShape(x,y,r,color,rot=0){ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){let a=rot+i*Math.PI/5-Math.PI/2,rr=i%2?r*.48:r;ctx[i?'lineTo':'moveTo'](x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  function makeLevel(){
    const d=layouts[level]; player={x:115,y:320,r:21}; hearts=3; stars=0; time=0; invincible=0; sparkles=[];
    items=d.stars.map(([x,y])=>({x,y,taken:false}));
    logs=d.logs.map(([x,min,max,speed],i)=>({x,y:min+(max-min)*.5,min,max,speed,phase:i*1.7,r:28}));
    bees=d.bees.map(([x,min,max,speed],i)=>({x,y:min+(max-min)*.5,min,max,speed,phase:i*2+1,r:24}));
    updateHud();
  }
  function updateHud(){levelText.textContent=`第 ${level+1} 关 · ${palettes[level].name}`; starsText.textContent=`⭐ ${stars} / 3`; heartsText.textContent='❤️'.repeat(hearts)+'🤍'.repeat(3-hearts);}
  function resize(){viewW=matchMedia('(max-width:650px) and (orientation:portrait)').matches?520:W;canvas.width=viewW;canvas.height=H;cameraX=clamp(player.x-viewW*.42,0,W-viewW);}
  function show(t,txt,emoji,button,fn){state='modal';title.textContent=t;detail.textContent=txt;icon.textContent=emoji;action.textContent=button;action.onclick=fn;overlay.hidden=false;}
  function hide(){overlay.hidden=true;state='playing';last=performance.now();}
  function start(){level=0;makeLevel();hide();}
  function win(){state='celebrate';celebration=0;sparkles=[];for(let i=0;i<24;i++)sparkles.push({x:player.x,y:player.y,vx:(rand(i+50)-.5)*260,vy:(rand(i+87)-.8)*250,life:1,color:['#ffd95d','#ff9a9e','#fff','#95d5ff'][i%4]});}
  function finishCelebration(){
    if(level===layouts.length-1) show('森林小英雄！','小鹿跳起来转了个圈！三关全部完成，星星都找齐啦。','🏆','再玩一次',start);
    else show('过关啦！','小鹿开心地跳起来转圈圈！下一片森林正等着你。','🦌','进入下一关',()=>{level++;makeLevel();hide();});
  }
  function hurt(){if(invincible>0||state!=='playing')return;hearts--;invincible=1.5;player.x=clamp(player.x-85,75,885);sparkles=[];for(let i=0;i<9;i++)sparkles.push({x:player.x,y:player.y,vx:(rand(i+300)-.5)*190,vy:(rand(i+200)-.5)*190,life:.55,color:'#fff'});updateHud();if(hearts===0)show('再试一次吧','小鹿休息一下，重新收集星星，穿过森林！','💛','重试本关',()=>{makeLevel();hide();});}
  function update(dt){
    if(state!=='playing'&&state!=='celebrate')return;
    time+=dt;
    if(state==='playing'){
      let dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));
      let dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
      if(touchTarget){let tx=touchTarget.x-player.x,ty=touchTarget.y-player.y,dd=Math.hypot(tx,ty);if(dd>9){dx+=tx/dd;dy+=ty/dd;}}
      const len=Math.hypot(dx,dy);if(len>0){player.x+=dx/len*255*dt;player.y+=dy/len*255*dt;}
      player.x=clamp(player.x,65,927);player.y=clamp(player.y,187,512);
      if(touchTarget&&dist(player,touchTarget)<12)touchTarget=null;
      invincible=Math.max(0,invincible-dt);
      for(const item of items){if(!item.taken&&dist(player,item)<41){item.taken=true;stars++;updateHud();for(let j=0;j<7;j++)sparkles.push({x:item.x,y:item.y,vx:(rand(j+stars*40)-.5)*180,vy:(rand(j+stars*70)-.5)*180,life:.7,color:'#fff6a6'});}}
      for(const log of logs){log.y=(log.min+log.max)/2+Math.sin(time*log.speed+log.phase)*(log.max-log.min)/2;if(dist(player,log)<player.r+log.r-6)hurt();}
      for(const bee of bees){bee.y=(bee.min+bee.max)/2+Math.sin(time*bee.speed+bee.phase)*(bee.max-bee.min)/2;if(dist(player,bee)<player.r+bee.r-4)hurt();}
      if(stars===3&&player.x>890&&player.y>255&&player.y<395)win();
    } else {celebration+=dt;if(celebration>1.6)finishCelebration();}
    for(const p of sparkles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=220*dt;p.life-=dt;}sparkles=sparkles.filter(p=>p.life>0);
  }
  function drawBackground(){
    const p=palettes[level];const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,p.sky);g.addColorStop(.52,p.ground);g.addColorStop(1,p.edge);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ellipse(150,80,115,115,'#fff8c888');
    for(let i=0;i<12;i++){const x=i*100-25,y=121+(i%3)*17;ellipse(x,y,100,55,'#81bb78');ellipse(x+25,y-14,87,53,'#92cd85');}
    ctx.fillStyle=p.path;ctx.beginPath();ctx.moveTo(0,190);ctx.bezierCurveTo(235,160,395,215,610,180);ctx.bezierCurveTo(780,155,900,185,1000,190);ctx.lineTo(1000,480);ctx.bezierCurveTo(820,455,690,490,500,470);ctx.bezierCurveTo(280,445,130,475,0,460);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#fff8db80';ctx.lineWidth=9;ctx.setLineDash([10,18]);ctx.beginPath();ctx.moveTo(0,330);ctx.bezierCurveTo(230,300,420,365,600,325);ctx.bezierCurveTo(785,295,910,332,1000,325);ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<layouts[level].flowers;i++){const x=30+rand(i+3)*935,y=477+rand(i+42)*125;flower(x,y,4+rand(i+5)*3,i%3?'#fff4ee':'#ffd1d7');}
    for(let i=0;i<12;i++){const x=35+rand(i+90)*920,y=115+rand(i+95)*63;flower(x,y,3,'#f6f2c9');}
    for(let i=0;i<5;i++){let x=45+i*220,y=557+(i%2)*19;ellipse(x,y+18,45,11,'#63ad6880');ellipse(x,y,38,24,'#72be77');ellipse(x-10,y-15,24,22,'#8bd28a');ellipse(x+20,y-15,25,20,'#8bd28a');}
  }
  function drawGate(){
    const open=stars===3,x=940,y=318;ctx.save();ctx.translate(x,y);ctx.globalAlpha=open?1:.68;
    for(let i=0;i<5;i++){ctx.strokeStyle=['#f58994','#ffc869','#ffec9a','#91d8af','#8dbcf6'][i];ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,45-i*9,Math.PI,0);ctx.stroke();}
    ellipse(0,36,48,15,'#fff8d6');roundRect(-43,4,13,71,8,'#fff3cb');roundRect(30,4,13,71,8,'#fff3cb');
    if(!open){roundRect(-38,-4,76,55,12,'#d8e7bfcc');ctx.fillStyle='#628663';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('🔒',0,30);}else{starShape(0,-62,15,'#fff4a0',time);}
    ctx.restore();
  }
  function drawLog(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(time*o.speed+o.phase)*.16);ellipse(0,16,30,9,'#6a9c6870');roundRect(-31,-22,62,44,15,'#a16d4b');roundRect(-25,-18,50,36,12,'#bd865c');for(let j=-1;j<=1;j++){ctx.strokeStyle='#d69b6b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-25,j*10);ctx.bezierCurveTo(-5,j*10+7,10,j*10-6,25,j*10);ctx.stroke();}ellipse(-25,0,9,18,'#8c5d42');ellipse(25,0,9,18,'#dca675');ellipse(25,0,5,12,'#bb8157');ctx.restore();}
  function drawBee(o){ctx.save();ctx.translate(o.x,o.y);const flap=Math.sin(time*30)*.25;ellipse(0,22,19,6,'#6a9c6870');ctx.save();ctx.rotate(flap);ellipse(-13,-17,16,10,'#fffefaaf',-.45);ellipse(12,-17,16,10,'#fffefaaf',.45);ctx.restore();ellipse(0,0,23,18,'#ffd562');roundRect(-12,-15,7,29,3,'#7d6041');roundRect(5,-15,7,29,3,'#7d6041');ellipse(-5,-2,2,3,'#614b40');ellipse(8,-2,2,3,'#614b40');ctx.strokeStyle='#614b40';ctx.lineWidth=2;ctx.beginPath();ctx.arc(2,4,5,0,Math.PI);ctx.stroke();ellipse(-18,5,4,3,'#f39c92');ellipse(18,5,4,3,'#f39c92');ctx.restore();}
  function drawDeer(){
    ctx.save();ctx.translate(player.x,player.y);
    const hop=state==='celebrate'?Math.abs(Math.sin(celebration*5))*42:Math.abs(Math.sin(time*10))*3;
    ellipse(0,25,25-hop*.2,7,'#689f6870');ctx.translate(0,-hop);
    if(state==='celebrate')ctx.rotate(celebration*TAU*1.25);
    if(invincible>0&&Math.floor(invincible*12)%2===0)ctx.globalAlpha=.45;
    line([[-10,-22],[-17,-44],[-27,-50]],'#8c613f',5);line([[-17,-42],[-7,-50]],'#8c613f',4);line([[10,-22],[17,-44],[27,-50]],'#8c613f',5);line([[17,-42],[7,-50]],'#8c613f',4);
    ellipse(-18,-22,10,17,'#a97550',-.5);ellipse(18,-22,10,17,'#a97550',.5);ellipse(-18,-23,5,10,'#eeb9ac',-.5);ellipse(18,-23,5,10,'#eeb9ac',.5);
    ellipse(0,5,20,25,'#bb8055');ellipse(0,9,13,18,'#f5e3c4');
    ellipse(-15,22,7,5,'#805b45');ellipse(15,22,7,5,'#805b45');ellipse(0,-15,23,23,'#c48b5f');ellipse(0,-7,15,12,'#f6e7cd');
    ellipse(-9,-17,2.6,3.3,'#473b39');ellipse(9,-17,2.6,3.3,'#473b39');ellipse(0,-10,4,3,'#6e4b46');ellipse(-15,-8,5,3,'#efaaa6');ellipse(15,-8,5,3,'#efaaa6');
    ctx.strokeStyle='#815a4b';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(0,-7,6,0,Math.PI);ctx.stroke();ctx.restore();
  }
  function render(){cameraX=clamp(player.x-viewW*.42,0,W-viewW);ctx.clearRect(0,0,viewW,H);ctx.save();ctx.translate(-cameraX,0);drawBackground();drawGate();for(const item of items){if(item.taken)continue;const bob=Math.sin(time*4+item.x)*5;ellipse(item.x,item.y+26,21,7,'#679a6760');starShape(item.x,item.y+bob,20,'#fff3b7',time*.8);starShape(item.x,item.y+bob,15,'#ffd457',time*.8);}for(const log of logs)drawLog(log);for(const bee of bees)drawBee(bee);drawDeer();for(const p of sparkles){ctx.globalAlpha=clamp(p.life,0,1);ellipse(p.x,p.y,4,4,p.color);}ctx.globalAlpha=1;
    if(state==='playing'&&stars===3){ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillStyle='#46775b';ctx.fillText('彩虹门打开啦！ →',775,120);}
    ctx.restore();
  }
  function frame(now){const dt=Math.min((now-last)/1000||0,.04);last=now;update(dt);render();requestAnimationFrame(frame);}
  function togglePause(){if(state==='playing'){show('休息一下','准备好继续带小鹿穿过森林了吗？','🌿','继续游戏',hide);}else if(state==='modal'&&title.textContent==='休息一下')hide();}
  window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','a','s','d'].includes(k))e.preventDefault();if(k===' '){togglePause();return;}keys.add(k);});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();touchTarget=null;});
  canvas.addEventListener('pointerdown',e=>{if(state!=='playing')return;pointerDown=true;canvas.setPointerCapture(e.pointerId);setTarget(e);});
  canvas.addEventListener('pointermove',e=>{if(pointerDown)setTarget(e);});
  canvas.addEventListener('pointerup',()=>{pointerDown=false;touchTarget=null;});canvas.addEventListener('pointercancel',()=>{pointerDown=false;touchTarget=null;});
  function setTarget(e){const r=canvas.getBoundingClientRect();touchTarget={x:(e.clientX-r.left)/r.width*viewW+cameraX,y:(e.clientY-r.top)/r.height*H};}
  document.querySelectorAll('[data-dir]').forEach(b=>{const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'},k=map[b.dataset.dir];b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(k);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(k));});
  pauseBtn.addEventListener('click',togglePause);action.onclick=start;makeLevel();resize();window.addEventListener('resize',resize);requestAnimationFrame(frame);
})();
