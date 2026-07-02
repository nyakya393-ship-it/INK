let battles = JSON.parse(localStorage.getItem("battles")) || [];

const battleTypes=["レギュラー","バンカラ","X","イベント"];
const rules=["エリア","ヤグラ","ホコ","アサリ"];
const weapons=["スシ","52ガロン","わかば"];
const stages=["海女美","マサバ","ユノハナ"];

window.onload=()=>{

fill("battleType",battleTypes);
fill("rule",rules);
fill("weapon",weapons);
fill("stage",stages);

setupTabs();

saveButton.onclick=save;
resetButton.onclick=reset;

render();
analysis();
graphs();
};

function fill(id,list){
const el=document.getElementById(id);
list.forEach(v=>{
let o=document.createElement("option");
o.textContent=v;
o.value=v;
el.appendChild(o);
});
}

function setupTabs(){
document.querySelectorAll(".tab").forEach(t=>{
t.onclick=()=>{
document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
t.classList.add("active");
document.getElementById(t.dataset.page).classList.add("active");
};
});
}

function save(){
const b={
battleType:battleType.value,
rule:rule.value,
weapon:weapon.value,
stage:stage.value,
result:result.value,
kill:+kill.value,
assist:+assist.value,
death:+death.value,
special:+special.value,
paint:+paint.value,
memo:memo.value,
date:new Date().toLocaleString()
};
battles.unshift(b);
localStorage.setItem("battles",JSON.stringify(battles));
render();analysis();graphs();
}

function render(){
battleList.innerHTML="";
battles.forEach(b=>{
battleList.innerHTML+=`
<div class="battleCard">
<b>${b.weapon}</b><br>
${b.stage}<br>
${b.kill}/${b.assist}/${b.death}
</div>`;
});
}

function analysis(){}

function graphs(){
draw("winChart","kill");
draw("killChart","kill");
draw("deathChart","death");
}

function draw(id,key){
const c=document.getElementById(id);
if(!c) return;
const ctx=c.getContext("2d");
let w=c.width=c.offsetWidth;
let h=c.height=200;
ctx.clearRect(0,0,w,h);

let arr=battles.map(b=>b[key]).reverse();
if(arr.length<2) return;

ctx.beginPath();
ctx.strokeStyle="#c6ff00";
arr.forEach((v,i)=>{
let x=i*(w/arr.length);
let y=h-v*5;
i?ctx.lineTo(x,y):ctx.moveTo(x,y);
});
ctx.stroke();
}
