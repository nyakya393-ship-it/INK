/* ============================
   Ink Log
   app.js Part 1
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

/* Part2で全武器・全ステージに差し替える */
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

    document
    .getElementById("saveButton")
    .addEventListener("click", saveBattle);

    document
    .getElementById("resetButton")
    .addEventListener("click", clearInputs);

    renderBattleList();
    renderAnalysis();

});
/* ============================
   Phase2: 詳細強化（追加）
============================ */

function resultText(result){

    switch(result){
        case "win": return "WIN";
        case "lose": return "LOSE";
        case "disconnect": return "通信切断";
        case "invalid": return "無効試合";
        default: return result;
    }
}

/* 詳細表示（既存openBattleを強化） */
function openBattle(index){

    const battle = battles[index];

    document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

    document.getElementById("detailPage").classList.add("active");

    document.getElementById("battleDetail").innerHTML = `
        <h2>${battle.weapon}</h2>
        <hr><br>

        勝敗：${resultText(battle.result)}<br>
        バトル：${battle.battleType}<br>
        ルール：${battle.rule}<br>
        ステージ：${battle.stage}<br><br>

        キル：${battle.kill}<br>
        アシスト：${battle.assist}<br>
        デス：${battle.death}<br>
        スペシャル：${battle.special}<br>
        塗り：${battle.paint}<br><br>

        メモ：${battle.memo || "なし"}<br><br>

        日時：${battle.date}
    `;
}
/* ============================
   Phase3: 分析強化
============================ */

function total(key){
    return battles.reduce((sum,b)=>sum+(Number(b[key])||0),0);
}

function avg(key){
    return battles.length ? total(key)/battles.length : 0;
}

function renderAnalysis(){

    const summary = document.getElementById("summary");
    if(!summary) return;

    if(battles.length===0){
        summary.innerHTML = `<div class="card">戦績がありません</div>`;
        return;
    }

    const valid = battles.filter(b=>b.result==="win"||b.result==="lose");
    const wins = valid.filter(b=>b.result==="win").length;

    const kd = total("death")===0 ? total("kill") : total("kill")/total("death");

    summary.innerHTML = `
    <div class="statGrid">

        <div class="statBox">
            <div class="statValue">${battles.length}</div>
            <div class="statLabel">試合数</div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${valid.length ? (wins/valid.length*100).toFixed(1) : 0}%
            </div>
            <div class="statLabel">勝率</div>
        </div>

        <div class="statBox">
            <div class="statValue">${kd.toFixed(2)}</div>
            <div class="statLabel">K/D</div>
        </div>

        <div class="statBox">
            <div class="statValue">${avg("kill").toFixed(2)}</div>
            <div class="statLabel">平均キル</div>
        </div>

        <div class="statBox">
            <div class="statValue">${avg("death").toFixed(2)}</div>
            <div class="statLabel">平均デス</div>
        </div>

        <div class="statBox">
            <div class="statValue">${avg("paint").toFixed(1)}</div>
            <div class="statLabel">平均塗り</div>
        </div>

        <div class="statBox">
            <div class="statValue">${avg("special").toFixed(2)}</div>
            <div class="statLabel">平均SP</div>
        </div>

    </div>
    `;

    renderWeaponRanking();
    renderStageRanking();
    renderRuleRanking();
    renderBattleTypeRanking();

    drawWinChart();
}
/* ============================
   Phase4: グラフ追加
============================ */

function drawWinChart(){

    const canvas = document.getElementById("winChart");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = 220;

    ctx.clearRect(0,0,w,h);

    const history = [];
    let win = 0;
    let total = 0;

    battles.slice().reverse().forEach(b=>{

        if(b.result!=="win" && b.result!=="lose") return;

        total++;
        if(b.result==="win") win++;

        history.push(win/total);
    });

    if(history.length===0) return;

    ctx.beginPath();
    ctx.strokeStyle="#c6ff00";
    ctx.lineWidth=3;

    history.forEach((r,i)=>{

        const x = i*(w-20)/(history.length-1)+10;
        const y = h-20 - r*(h-40);

        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });

    ctx.stroke();
}
function drawKillDeathCharts(){

    const keys = ["kill","death"];

    keys.forEach(key=>{

        const canvas = document.getElementById(key+"Chart");
        if(!canvas) return;

        const ctx = canvas.getContext("2d");

        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = 200;

        ctx.clearRect(0,0,w,h);

        const data = battles.map(b=>b[key]).reverse();

        if(data.length<2) return;

        ctx.beginPath();
        ctx.strokeStyle = key==="kill" ? "#c6ff00" : "#ff4d4d";

        data.forEach((v,i)=>{

            const x = i*(w/data.length);
            const y = h - v*8;

            i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });

        ctx.stroke();
    });
}

/* 既存グラフと一緒に呼ぶ */
const oldRender = renderAnalysis;
renderAnalysis = function(){
    oldRender();
    drawKillDeathCharts();
};
