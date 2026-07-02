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

            document
            .querySelectorAll(".tab")
            .forEach(t=>t.classList.remove("active"));

            document
            .querySelectorAll(".page")
            .forEach(p=>p.classList.remove("active"));

            tab.classList.add("active");

            document
            .getElementById(tab.dataset.page)
            .classList.add("active");

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

        memo:document
        .getElementById("memo")
        .value
        .trim(),

        date:new Date().toLocaleString("ja-JP")

    };

    battles.unshift(battle);

    localStorage.setItem(
        "battles",
        JSON.stringify(battles)
    );

    clearInputs();

    renderBattleList();

    renderAnalysis();

    showToast("保存しました！");

}

/*==============================
  入力クリア
==============================*/

function clearInputs(){

    [
        "kill",
        "assist",
        "death",
        "special",
        "paint",
        "memo"
    ].forEach(id=>{

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

    return Number(
        document.getElementById(id).value || 0
    );

}

/*==============================
  戦績一覧
==============================*/

function renderBattleList(){

    const list=document.getElementById("battleList");

    if(!list) return;

    if(battles.length===0){

        list.innerHTML=`
        <div class="card">
        まだ戦績がありません
        </div>
        `;

        return;

    }

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

        <b>
        ${battle.kill}K /
        ${battle.assist}A /
        ${battle.death}D
        </b>

        <br>

        塗り ${battle.paint}p

        <br>

        SP ${battle.special}

        <br><br>

        <button
        class="deleteBtn"
        onclick="deleteBattle(${index})">

        削除

        </button>

        `;

        card.onclick=(e)=>{

            if(e.target.classList.contains("deleteBtn"))
            return;

            openBattle(index);

        };

        list.appendChild(card);

    });

}

/*==============================
  勝敗表示
==============================*/

function resultText(result){

    switch(result){

        case "win":
            return "WIN";

        case "lose":
            return "LOSE";

        case "disconnect":
            return "通信切断";

        case "invalid":
            return "無効試合";

        default:
            return result;

    }

}

/*==============================
  削除
==============================*/

function deleteBattle(index){

    if(!confirm("削除しますか？"))
    return;

    battles.splice(index,1);

    localStorage.setItem(
        "battles",
        JSON.stringify(battles)
    );

    renderBattleList();

renderAnalysis();

localStorage.setItem(
    "battles",
    JSON.stringify(battles)
);

showToast("削除しました");

}

/*==============================
  詳細画面
==============================*/

function openBattle(index){

    const battle=battles[index];

    document
    .querySelectorAll(".page")
    .forEach(p=>p.classList.remove("active"));

    document
    .getElementById("detailPage")
    .classList.add("active");

    document
    .getElementById("battleDetail")
    .innerHTML=`

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

    メモ<br>

    ${battle.memo || "なし"}<br><br>

    記録日時<br>

    ${battle.date}

    `;

}

/*==============================
  戻る
==============================*/

document.addEventListener("click",(e)=>{

    if(e.target.id==="backButton"){

        document
        .querySelectorAll(".page")
        .forEach(p=>p.classList.remove("active"));

        document
        .getElementById("battlePage")
        .classList.add("active");

    }

});

/*==============================
  分析
==============================*/

function renderAnalysis(){

    const summary=document.getElementById("summary");
    if(!summary) return;

    if(battles.length===0){

        summary.innerHTML=`
        <div class="card">
        戦績がありません
        </div>
        `;
document.getElementById("weaponRanking").innerHTML="";
document.getElementById("stageRanking").innerHTML="";
document.getElementById("ruleRanking").innerHTML="";
document.getElementById("battleTypeRanking").innerHTML="";

drawWinChart();
        return;

    }

    const valid=battles.filter(b=>
        b.result==="win"||
        b.result==="lose"
    );

    const wins=valid.filter(b=>
        b.result==="win"
    ).length;

    const kd=
    total("death")==0
    ?total("kill")
    :total("kill")/total("death");

    summary.innerHTML=`

    <div class="statGrid">

        <div class="statBox">
            <div class="statValue">
            ${battles.length}
            </div>
            <div class="statLabel">
            試合数
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${
            valid.length
            ?
            (wins/valid.length*100).toFixed(1)
            :
            "0"
            }%
            </div>
            <div class="statLabel">
            勝率
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${kd.toFixed(2)}
            </div>
            <div class="statLabel">
            K/D
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${avg("kill").toFixed(2)}
            </div>
            <div class="statLabel">
            平均キル
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${avg("assist").toFixed(2)}
            </div>
            <div class="statLabel">
            平均アシスト
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${avg("death").toFixed(2)}
            </div>
            <div class="statLabel">
            平均デス
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${avg("paint").toFixed(1)}
            </div>
            <div class="statLabel">
            平均塗り
            </div>
        </div>

        <div class="statBox">
            <div class="statValue">
            ${avg("special").toFixed(2)}
            </div>
            <div class="statLabel">
            平均SP
            </div>
        </div>

    </div>

    <br>

    勝ち：${battles.filter(b=>b.result==="win").length}<br>

    負け：${battles.filter(b=>b.result==="lose").length}<br>

    通信切断：${battles.filter(b=>b.result==="disconnect").length}<br>

    無効試合：${battles.filter(b=>b.result==="invalid").length}

    `;

    renderWeaponRanking();
    renderStageRanking();
    renderRuleRanking();
    renderBattleTypeRanking();
summary.innerHTML += `

<br><hr><br>

<b>プレイスタイル</b><br>
${playerStyle()}<br><br>

<b>現在ランク</b><br>
${playerRank()}<br>

`;

drawWinChart();
}

/*==============================
  合計
==============================*/

function total(key){

    return battles.reduce(
        (sum,b)=>sum+(Number(b[key])||0),
        0
    );

}

/*==============================
  平均
==============================*/

function avg(key){

    if(battles.length===0)
        return 0;

    return total(key)/battles.length;

}

/*==============================
  武器ランキング
==============================*/

function renderWeaponRanking(){

    ranking(
        "weapon",
        "weaponRanking"
    );

}

/*==============================
  ステージランキング
==============================*/

function renderStageRanking(){

    ranking(
        "stage",
        "stageRanking"
    );

}

/*==============================
  ルールランキング
==============================*/

function renderRuleRanking(){

    ranking(
        "rule",
        "ruleRanking"
    );

}

/*==============================
  バトル種類ランキング
==============================*/

function renderBattleTypeRanking(){

    ranking(
        "battleType",
        "battleTypeRanking"
    );

}

/*==============================
  ランキング共通
==============================*/

function ranking(key,id){

    const box=document.getElementById(id);

    if(!box) return;

    // 毎回完全リセット
    box.replaceChildren();

    const map={};

    battles.forEach(b=>{

        // 通信切断・無効試合はランキング対象外
        if(b.result!=="win" && b.result!=="lose"){
            return;
        }

        if(!map[b[key]]){

            map[b[key]]={
                total:0,
                win:0
            };

        }

        map[b[key]].total++;

        if(b.result==="win"){
            map[b[key]].win++;
        }

    });

    const list=Object.entries(map);

    if(list.length===0){
        box.innerHTML="<div class='rankItem'>データなし</div>";
        return;
    }

    list.sort((a,b)=>{

        const rateA=a[1].win/a[1].total;
        const rateB=b[1].win/b[1].total;

        if(rateB!==rateA){
            return rateB-rateA;
        }

        return b[1].total-a[1].total;

    });

    list.forEach(([name,data],i)=>{

        const rate=(data.win/data.total*100).toFixed(1);

        box.innerHTML+=`
        <div class="rankItem">
            <span class="rankName">
                ${i+1}. ${name}
            </span>

            <span class="rankRate">
                ${rate}% (${data.win}/${data.total})
            </span>
        </div>
        `;
    });

}
/*==============================
  勝率推移グラフ（簡易版）
==============================*/

function drawWinChart(){

    const canvas=document.getElementById("winChart");

    if(!canvas) return;

    const ctx=canvas.getContext("2d");

    const w=canvas.width=canvas.offsetWidth;
    const h=canvas.height=220;

    ctx.clearRect(0,0,w,h);

    if(battles.length===0){

        ctx.fillStyle="#999";
        ctx.font="18px sans-serif";
        ctx.fillText("データなし",20,40);

        return;

    }

    const history=[];

    let win=0;
    let total=0;

    battles
    .slice()
    .reverse()
    .forEach(b=>{

        if(
            b.result==="win"||
            b.result==="lose"
        ){

            total++;

            if(b.result==="win")
                win++;

            history.push(win/total);

        }

    });

    if(history.length===0) return;

    ctx.strokeStyle="#c6ff00";
    ctx.lineWidth=4;

    ctx.beginPath();

    history.forEach((rate,i)=>{

        const x=i*(w-20)/(history.length-1)+10;

        const y=h-20-rate*(h-40);

        if(i===0)
            ctx.moveTo(x,y);
        else
            ctx.lineTo(x,y);

    });

    ctx.stroke();

}

/*==============================
  プレイスタイル
==============================*/

function playerStyle(){

    const k=avg("kill");
    const p=avg("paint");
    const s=avg("special");

    if(k>=10)
        return "⚔️ アタッカー";

    if(p>=1000)
        return "🎨 塗り重視";

    if(s>=5)
        return "💥 スペシャル重視";

    return "⚖️ バランス型";

}

/*==============================
  レート
==============================*/

function playerRank(){

    const valid=battles.filter(b=>

        b.result==="win"||
        b.result==="lose"

    );

    if(valid.length===0)
        return "C";

    const rate=

    valid.filter(b=>

        b.result==="win"

    ).length

    /

    valid.length

    *

    100;

    if(rate>=80)
        return "S+";

    if(rate>=70)
        return "S";

    if(rate>=60)
        return "A";

    if(rate>=50)
        return "B";

    return "C";

}


/*==============================
  武器詳細分析
==============================*/

function weaponAnalysis(name){

    const data=battles.filter(b=>b.weapon===name);

    if(data.length===0) return null;

    const win=data.filter(b=>b.result==="win").length;

    return{

        count:data.length,

        winrate:(win/data.length*100).toFixed(1),

        kill:(data.reduce((a,b)=>a+b.kill,0)/data.length).toFixed(2),

        assist:(data.reduce((a,b)=>a+b.assist,0)/data.length).toFixed(2),

        death:(data.reduce((a,b)=>a+b.death,0)/data.length).toFixed(2),

        paint:(data.reduce((a,b)=>a+b.paint,0)/data.length).toFixed(0),

        special:(data.reduce((a,b)=>a+b.special,0)/data.length).toFixed(2)

    };

}

/*==============================
  JSON保存
==============================*/

function exportJSON(){

    const blob=new Blob(

        [JSON.stringify(battles,null,2)],

        {type:"application/json"}

    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="inklog.json";

    a.click();

}

/*==============================
  JSON読込
==============================*/

function importJSON(file){

    const reader=new FileReader();

    reader.onload=e=>{

        battles=JSON.parse(e.target.result);

        localStorage.setItem(

            "battles",

            JSON.stringify(battles)

        );

        renderBattleList();

        renderAnalysis();

        showToast("読み込み完了");

    };

    reader.readAsText(file);

}

/*==============================
  全削除
==============================*/

function clearAllBattles(){

    if(!confirm("すべて削除しますか？"))
        return;

    battles=[];

    localStorage.removeItem("battles");

    renderBattleList();

    renderAnalysis();

    showToast("削除しました");

}

/*==============================
  編集
==============================*/

function editBattle(index){

    const b=battles[index];

    document.getElementById("battleType").value=b.battleType;

    document.getElementById("rule").value=b.rule;

    document.getElementById("weapon").value=b.weapon;

    document.getElementById("stage").value=b.stage;

    document.getElementById("result").value=b.result;

    document.getElementById("kill").value=b.kill;

    document.getElementById("assist").value=b.assist;

    document.getElementById("death").value=b.death;

    document.getElementById("paint").value=b.paint;

    document.getElementById("special").value=b.special;

    document.getElementById("memo").value=b.memo;

    battles.splice(index,1);

    localStorage.setItem(

        "battles",

        JSON.stringify(battles)

    );

    renderBattleList();

    renderAnalysis();

    document.querySelectorAll(".page")
    .forEach(p=>p.classList.remove("active"));

    document.getElementById("inputPage")
    .classList.add("active");

}

/*==============================
  検索
==============================*/

function searchBattle(word){

    word=word.toLowerCase();

    return battles.filter(b=>

        b.weapon.toLowerCase().includes(word)||

        b.stage.toLowerCase().includes(word)||

        b.rule.toLowerCase().includes(word)

    );

}
