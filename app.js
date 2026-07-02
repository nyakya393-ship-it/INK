/* ============================
   Ink Log
   app.js Part 1（元コードそのまま）
============================ */

let battles = JSON.parse(localStorage.getItem("battles")) || [];

/*==============================
  マスターデータ
==============================*/

const battleTypes = [
"レギュラーマッチ",
"バンカラマッチ（オープン）",
"バンカラマッチ（チャレンジ）",
"Xマッチ",
"イベントマッチ",
"フェスマッチ（オープン）",
"フェスマッチ（チャレンジ）",
"トリカラバトル（攻撃）",
"トリカラバトル（守備）",
"プライベートマッチ"
];

const rules = [
"ナワバリバトル",
"ガチエリア",
"ガチヤグラ",
"ガチホコバトル",
"ガチアサリ"
];

const weapons = [
"スプラシューター",
"わかばシューター",
".52ガロン",
"スシコラ",
"ボールドマーカー"
];

const stages = [
"ユノハナ大渓谷",
"ゴンズイ地区",
"ヤガラ市場",
"マテガイ放水路",
"マサバ海峡大橋"
];

/*==============================
  初期化
==============================*/

window.addEventListener("load", () => {

    fillSelect("battleType", battleTypes);
    fillSelect("rule", rules);
    fillSelect("weapon", weapons);
    fillSelect("stage", stages);

    setupTabs();

    document.getElementById("saveButton").addEventListener("click", saveBattle);
    document.getElementById("resetButton").addEventListener("click", clearInputs);

    renderBattleList();
    renderAnalysis();
});

/*==============================
  セレクト生成
==============================*/

function fillSelect(id,list){

    const select=document.getElementById(id);

    select.innerHTML="";

    list.forEach(item=>{

        const option=document.createElement("option");

        option.value=item;

        option.textContent=item;

        select.appendChild(option);

    });

}

/*==============================
  タブ
==============================*/

function setupTabs(){

    const tabs=document.querySelectorAll(".tab");

    tabs.forEach(tab=>{

        tab.onclick=()=>{

            document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
            document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

            tab.classList.add("active");

            document.getElementById(tab.dataset.page).classList.add("active");
        };
    });
}

/*==============================
  保存
==============================*/

function saveBattle(){

    const battle={

        battleType:value("battleType"),
        rule:value("rule"),
        weapon:value("weapon"),
        stage:value("stage"),
        result:value("result"),
        kill:number("kill"),
        assist:number("assist"),
        death:number("death"),
        special:number("special"),
        paint:number("paint"),
        memo:document.getElementById("memo").value.trim(),
        date:new Date().toLocaleString("ja-JP")
    };

    battles.unshift(battle);

    localStorage.setItem("battles",JSON.stringify(battles));

    clearInputs();

    renderBattleList();
    renderAnalysis();

    showToast("保存しました！");
}

/*==============================
  入力クリア
==============================*/

function clearInputs(){

    ["kill","assist","death","special","paint","memo"].forEach(id=>{
        document.getElementById(id).value="";
    });
}

/*==============================
  Toast
==============================*/

function showToast(text){

    const toast=document.getElementById("toast");

    toast.textContent=text;
    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },2000);
}

/*==============================
  ヘルパー
==============================*/

function value(id){
    return document.getElementById(id).value;
}

function number(id){
    return Number(document.getElementById(id).value || 0);
}

/*==============================
  戦績一覧
==============================*/

function renderBattleList(){

    const list=document.getElementById("battleList");
    if(!list) return;

    list.innerHTML="";

    battles.forEach((battle,index)=>{

        const card=document.createElement("div");
        card.className="battleCard";

        card.innerHTML=`

        <span class="badge ${battle.result}">
            ${resultText(battle.result)}
        </span>

        <h3>${battle.weapon}</h3>
        <div>${battle.stage}</div>
        <div>${battle.rule}</div>
        <div>${battle.battleType}</div>

        <br>

        <b>KAD ${battle.kill} / ${battle.assist} / ${battle.death}</b>

        <br>
        塗り ${battle.paint}p
        <br>
        SP ${battle.special}

        <br><br>

        <button class="deleteBtn" onclick="deleteBattle(${index})">
            削除
        </button>
        `;

        card.onclick=(e)=>{
            if(e.target.classList.contains("deleteBtn")) return;
            openBattle(index);
        };

        list.appendChild(card);
    });
}

/*==============================
  削除
==============================*/

function deleteBattle(index){

    if(!confirm("削除しますか？")) return;

    battles.splice(index,1);

    localStorage.setItem("battles",JSON.stringify(battles));

    renderBattleList();
    renderAnalysis();

    showToast("削除しました");
}

/*==============================
  分析（元のまま）
==============================*/

function renderAnalysis(){

    const summary=document.getElementById("summary");
    if(!summary) return;

    if(battles.length===0){
        summary.innerHTML=`<div class="card">戦績がありません</div>`;
        return;
    }

    const valid=battles.filter(b=>b.result==="win"||b.result==="lose");
    const wins=valid.filter(b=>b.result==="win").length;

    const kd=total("death")===0
        ? total("kill")
        : total("kill")/total("death");

    summary.innerHTML=`
    <div class="statGrid">

        <div class="statBox"><div class="statValue">${battles.length}</div><div class="statLabel">試合数</div></div>
        <div class="statBox"><div class="statValue">${valid.length?(wins/valid.length*100).toFixed(1):0}%</div><div class="statLabel">勝率</div></div>
        <div class="statBox"><div class="statValue">${kd.toFixed(2)}</div><div class="statLabel">K/D</div></div>

    </div>
    `;

    renderWeaponRanking();
    renderStageRanking();
    renderRuleRanking();
    renderBattleTypeRanking();
    drawWinChart();
}

/*==============================
  集計
==============================*/

function total(key){
    return battles.reduce((s,b)=>s+(Number(b[key])||0),0);
}

/*==============================
  ランキング（元のまま）
==============================*/

function renderWeaponRanking(){ranking("weapon","weaponRanking");}
function renderStageRanking(){ranking("stage","stageRanking");}
function renderRuleRanking(){ranking("rule","ruleRanking");}
function renderBattleTypeRanking(){ranking("battleType","battleTypeRanking");}

function ranking(key,id){

    const box=document.getElementById(id);
    if(!box) return;

    box.innerHTML="";

    const map={};

    battles.forEach(b=>{

        if(b.result!=="win" && b.result!=="lose") return;

        if(!map[b[key]]) map[b[key]]={total:0,win:0};

        map[b[key]].total++;
        if(b.result==="win") map[b[key]].win++;
    });

    Object.entries(map).forEach(([name,data],i)=>{

        const rate=(data.win/data.total*100).toFixed(1);

        box.innerHTML+=`
        <div class="rankItem">
            ${i+1}. ${name} ${rate}% (${data.win}/${data.total})
        </div>`;
    });
}

/*==============================
  グラフ（元のまま）
==============================*/

function drawWinChart(){

    const canvas=document.getElementById("winChart");
    if(!canvas) return;

    const ctx=canvas.getContext("2d");

    const w=canvas.width=canvas.offsetWidth;
    const h=canvas.height=220;

    ctx.clearRect(0,0,w,h);

    const history=[];
    let win=0,total=0;

    battles.slice().reverse().forEach(b=>{

        if(b.result!=="win" && b.result!=="lose") return;

        total++;
        if(b.result==="win") win++;

        history.push(win/total);
    });

    ctx.beginPath();
    ctx.strokeStyle="#c6ff00";
    ctx.lineWidth=3;

    history.forEach((r,i)=>{

        const x=i*(w-20)/(history.length-1)+10;
        const y=h-20-r*(h-40);

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });

    ctx.stroke();
}

/*==============================
  追加：モーダル（ここだけ新規）
==============================*/

function openBattle(index){

    const b=battles[index];

    document.getElementById("modalBody").innerHTML=`

        <h2>${b.weapon}</h2>
        <hr>

        勝敗：${resultText(b.result)}<br>
        バトル：${b.battleType}<br>
        ルール：${b.rule}<br>
        ステージ：${b.stage}<br><br>

        KAD：${b.kill}/${b.assist}/${b.death}<br>
        塗り：${b.paint}<br>
        SP：${b.special}<br><br>

        メモ：${b.memo||"なし"}<br>
        ${b.date}
    `;

    document.getElementById("battleModal").classList.remove("hidden");
}

function closeModal(){
    document.getElementById("battleModal").classList.add("hidden");
}

function resultText(r){
    return r==="win"?"WIN":
           r==="lose"?"LOSE":
           r==="disconnect"?"通信切断":
           r==="invalid"?"無効試合":r;
}
