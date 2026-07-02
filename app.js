/* ============================
   Ink Log - FINAL VERSION
   Phase2〜5統合版
============================ */

let battles = JSON.parse(localStorage.getItem("battles")) || [];

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
  モーダル
==============================*/

function openBattle(index){

    const b = battles[index];

    document.getElementById("modalBody").innerHTML = `

        <h2>${b.weapon}</h2>
        <hr>

        <p>勝敗：${resultText(b.result)}</p>
        <p>バトル：${b.battleType}</p>
        <p>ルール：${b.rule}</p>
        <p>ステージ：${b.stage}</p>

        <hr>

        <p><b>KAD</b>：${b.kill} / ${b.assist} / ${b.death}</p>
        <p>塗り：${b.paint}</p>
        <p>SP：${b.special}</p>

        <hr>

        <p>${b.memo || "なし"}</p>
        <p>${b.date}</p>
    `;

    document.getElementById("battleModal").classList.remove("hidden");
}

function closeModal(){
    document.getElementById("battleModal").classList.add("hidden");
}

/*==============================
  戦績保存
==============================*/

function saveBattle(){

    const battle = {
        battleType: value("battleType"),
        rule: value("rule"),
        weapon: value("weapon"),
        stage: value("stage"),
        result: value("result"),
        kill: number("kill"),
        assist: number("assist"),
        death: number("death"),
        special: number("special"),
        paint: number("paint"),
        memo: document.getElementById("memo").value.trim(),
        date: new Date().toLocaleString("ja-JP")
    };

    battles.unshift(battle);

    localStorage.setItem("battles", JSON.stringify(battles));

    clearInputs();

    renderBattleList();
    renderAnalysis();

    showToast("保存しました！");
}

/*==============================
  戦績一覧
==============================*/

function renderBattleList(){

    const list = document.getElementById("battleList");

    if(!list) return;

    list.innerHTML = "";

    battles.forEach((b, index) => {

        const card = document.createElement("div");
        card.className = "battleCard";

        card.innerHTML = `

            <span class="badge ${b.result}">
                ${resultText(b.result)}
            </span>

            <h3>${b.weapon}</h3>

            <div>${b.stage}</div>
            <div>${b.rule}</div>
            <div>${b.battleType}</div>

            <br>

            <b>KAD ${b.kill} / ${b.assist} / ${b.death}</b>

            <br>
            塗り ${b.paint}p
            <br>
            SP ${b.special}

            <br><br>

            <button class="deleteBtn" onclick="deleteBattle(${index})">
                削除
            </button>
        `;

        card.onclick = (e) => {
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

    localStorage.setItem("battles", JSON.stringify(battles));

    renderBattleList();
    renderAnalysis();

    showToast("削除しました");
}

/*==============================
  分析
==============================*/

function renderAnalysis(){

    const summary = document.getElementById("summary");
    if(!summary) return;

    if(battles.length === 0){

        summary.innerHTML = `<div class="card">戦績がありません</div>`;

        return;
    }

    const valid = battles.filter(b => b.result === "win" || b.result === "lose");

    const wins = valid.filter(b => b.result === "win").length;

    const kd = total("death") === 0
        ? total("kill")
        : total("kill") / total("death");

    summary.innerHTML = `

    <div class="statGrid">

        <div class="statBox"><div class="statValue">${battles.length}</div><div class="statLabel">試合数</div></div>

        <div class="statBox"><div class="statValue">${valid.length ? (wins/valid.length*100).toFixed(1) : 0}%</div><div class="statLabel">勝率</div></div>

        <div class="statBox"><div class="statValue">${kd.toFixed(2)}</div><div class="statLabel">K/D</div></div>

        <div class="statBox"><div class="statValue">${avg("kill").toFixed(2)}</div><div class="statLabel">平均キル</div></div>

        <div class="statBox"><div class="statValue">${avg("assist").toFixed(2)}</div><div class="statLabel">平均アシスト</div></div>

        <div class="statBox"><div class="statValue">${avg("death").toFixed(2)}</div><div class="statLabel">平均デス</div></div>

        <div class="statBox"><div class="statValue">${avg("paint").toFixed(1)}</div><div class="statLabel">平均塗り</div></div>

        <div class="statBox"><div class="statValue">${avg("special").toFixed(2)}</div><div class="statLabel">平均SP</div></div>

    </div>

    <br>

    勝ち：${battles.filter(b=>b.result==="win").length}<br>
    負け：${battles.filter(b=>b.result==="lose").length}<br>

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

function avg(key){
    return battles.length === 0 ? 0 : total(key)/battles.length;
}

/*==============================
  ランキング
==============================*/

function renderWeaponRanking(){ ranking("weapon","weaponRanking"); }
function renderStageRanking(){ ranking("stage","stageRanking"); }
function renderRuleRanking(){ ranking("rule","ruleRanking"); }
function renderBattleTypeRanking(){ ranking("battleType","battleTypeRanking"); }

function ranking(key,id){

    const box = document.getElementById(id);
    if(!box) return;

    box.replaceChildren();

    const map = {};

    battles.forEach(b => {

        if(b.result !== "win" && b.result !== "lose") return;

        if(!map[b[key]]) map[b[key]] = { total:0, win:0 };

        map[b[key]].total++;

        if(b.result === "win") map[b[key]].win++;
    });

    const list = Object.entries(map);

    if(list.length === 0){
        box.innerHTML = "<div>データなし</div>";
        return;
    }

    list.sort((a,b) => (b[1].win/b[1].total) - (a[1].win/a[1].total));

    list.forEach(([name,data],i) => {

        const rate = (data.win/data.total*100).toFixed(1);

        box.innerHTML += `
        <div class="rankItem">
            ${i+1}. ${name} ${rate}% (${data.win}/${data.total})
        </div>`;
    });
}

/*==============================
  グラフ
==============================*/

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

    battles.slice().reverse().forEach(b => {

        if(b.result !== "win" && b.result !== "lose") return;

        total++;
        if(b.result === "win") win++;

        history.push(win/total);
    });

    if(history.length === 0) return;

    ctx.strokeStyle = "#c6ff00";
    ctx.lineWidth = 3;

    ctx.beginPath();

    history.forEach((r,i) => {

        const x = i*(w-20)/(history.length-1)+10;
        const y = h-20 - r*(h-40);

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });

    ctx.stroke();
}

/*==============================
  ヘルパー
==============================*/

function value(id){ return document.getElementById(id).value; }
function number(id){ return Number(document.getElementById(id).value || 0); }

function showToast(text){
    const t = document.getElementById("toast");
    t.textContent = text;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),2000);
}

function resultText(r){
    return r==="win" ? "WIN"
        : r==="lose" ? "LOSE"
        : r==="disconnect" ? "通信切断"
        : r==="invalid" ? "無効試合"
        : r;
}
