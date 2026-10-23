const fs=require('fs'),vm=require('vm'),path=require('path');const els={};const ctx=new Proxy({},{get:()=>()=>{}});function el(){return{textContent:'',innerHTML:'',classList:{add(){},remove(){}},getContext(){return ctx},addEventListener(){},setAttribute(){}}}const sandbox={window:{addEventListener(){}},clearTimeout,clearInterval,setTimeout,setInterval,document:{getElementById:id=>els[id]??=el(),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){},console};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../game.js'),'utf8')+`
function check(v,msg){if(!v)throw Error(msg)}
$('ai-toggle').onclick();check(aiEnabled&&state==='playing','AI starts game');
const before=piece.x;action('left');check(piece.x===before,'Manual movement blocked while AI enabled');
let placed=0,steps=0;while(placed<150&&state==='playing'&&steps<10000){const old=piece;aiStep();steps++;check(!collide(piece)||state==='over','AI pose must be legal');if(old!==piece)placed++}
check(placed===150,'AI should survive 150 pieces');check(lines>20,'AI should clear lines');console.log('PASS: AI played',placed,'pieces, cleared',lines,'lines in',steps,'moves');
pause();const x=piece.x;frame(1000);check(state==='paused'&&piece.x===x,'AI respects pause');
$('ai-toggle').onclick();check(!aiEnabled&&state==='paused','Toggle off preserves pause');pause();check(state==='playing','Resume manually');
$('ai-toggle').onclick();start();check(aiEnabled&&!aiPlan,'Restart preserves AI and clears plan');
grid=Array.from({length:20},()=>Array(10).fill(0));grid[19]=[1,1,1,1,0,0,1,1,1,1];grid[18]=[1,1,1,1,0,0,1,1,1,1];piece={m:[[1,1],[1,1]],type:1,x:3,y:0};next={m:[[1,1],[1,1]],type:1,x:3,y:0};const path=aiChoose();for(const move of path)action(move,true);check(lines===2,'AI should choose double line clear');console.log('PASS: pause, takeover, restart, targeted double clear');
`,sandbox);
