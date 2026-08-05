/* =========================================
   1. データと状態管理
   ========================================= */
let userData = {
  name: "ゲスト",
  exp: 0,
  stamps: [],
  avatarIndex: 0
};

const avatars = ["👦", "👧", "👨", "👩", "🐻", "🐟"];

let bbsPosts = [
  { name: "村長", message: "神恵内村ディスカバリーへようこそ！楽しんでいってね。", date: "2026/03/30 10:00" },
  { name: "観光客A", message: "温泉が最高でした！また来たいです。", date: "2026/03/30 11:30" }
];

function initData() {
  const savedData = localStorage.getItem('kamoenaiUserData');
  if (savedData) userData = JSON.parse(savedData);
  const savedPosts = localStorage.getItem('kamoenaiBbsPosts');
  if (savedPosts) bbsPosts = JSON.parse(savedPosts);
  
  updateMyPage();
  renderStamps();
  renderBbs();
  renderQuiz();
}

function saveData() { localStorage.setItem('kamoenaiUserData', JSON.stringify(userData)); }
function saveBbs() { localStorage.setItem('kamoenaiBbsPosts', JSON.stringify(bbsPosts)); }

function addExp(amount) {
  userData.exp += amount;
  saveData();
  updateMyPage();
  showToast(`${amount} EXP を獲得しました！`);
}

/* =========================================
   2. SPAルーティング
   ========================================= */
function navigate(pageId) {
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`sec-${pageId}`).classList.add('active');
  document.querySelectorAll('#nav-menu a').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`#nav-menu a[onclick="navigate('${pageId}')"]`);
  if(activeLink) activeLink.classList.add('active');
  document.querySelector('nav').classList.remove('open');
  window.scrollTo(0,0);
}

function toggleMenu() { document.querySelector('nav').classList.toggle('open'); }

/* =========================================
   3. クイズ機能
   ========================================= */
const quizData = [
  { q: "神恵内村がかつて栄えた要因となった、代表的な漁業は？", options: ["サケ漁", "ニシン漁", "マグロ漁"], ans: 1, exp: 20 },
  { q: "神恵内村は北海道のどのエリア（振興局）にある？", options: ["後志（しりべし）", "渡島（おしま）", "宗谷（そうや）"], ans: 0, exp: 20 },
  { q: "神恵内村の特産品として有名な美味しい海産物は？", options: ["カニ・ホタテ", "ウニ・アワビ", "カキ・シジミ"], ans: 1, exp: 20 }
];
let currentQuizIndex = 0;

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (currentQuizIndex >= quizData.length) {
    container.innerHTML = `<div style="text-align:center;"><h3>全問クリア！</h3><button class="btn" onclick="currentQuizIndex=0; renderQuiz();">もう一度挑戦する</button></div>`;
    return;
  }
  const qData = quizData[currentQuizIndex];
  let optionsHtml = '';
  qData.options.forEach((opt, index) => {
    optionsHtml += `<button onclick="answerQuiz(${index})">${opt}</button>`;
  });
  container.innerHTML = `<div class="quiz-question">第 ${currentQuizIndex + 1} 問： ${qData.q}</div><div class="quiz-options">${optionsHtml}</div><div id="quiz-feedback" class="quiz-result"></div>`;
}

function answerQuiz(selectedIndex) {
  const qData = quizData[currentQuizIndex];
  const feedback = document.getElementById('quiz-feedback');
  if (selectedIndex === qData.ans) {
    feedback.textContent = "⭕ 正解！"; feedback.className = "quiz-result correct"; addExp(qData.exp);
  } else {
    feedback.textContent = `❌ 残念... 正解は「${qData.options[qData.ans]}」でした。`; feedback.className = "quiz-result wrong";
  }
  feedback.style.display = "block";
  document.querySelectorAll('.quiz-options button').forEach(btn => btn.disabled = true);
  setTimeout(() => { currentQuizIndex++; renderQuiz(); }, 2000);
}

/* =========================================
   4. スタンプラリー機能
   ========================================= */
const stampSpots = [
  { id: "s1", name: "道の駅 オスコイ！かもえない", desc: "村の玄関口。特産品をチェック！" },
  { id: "s2", name: "かもえない竜神温泉", desc: "旧998から生まれ変わった憩いの湯。" },
  { id: "s3", name: "神恵内青少年旅行村", desc: "大自然の中でキャンプやアクティビティを。" },
  { id: "s4", name: "郷土資料館", desc: "ニシン漁の歴史や文化を学ぼう。" }
];

function renderStamps() {
  const container = document.getElementById('stamp-spots');
  container.innerHTML = '';
  let count = 0;
  stampSpots.forEach(spot => {
    const isStamped = userData.stamps.includes(spot.id);
    if (isStamped) count++;
    const btnHtml = isStamped ? `<button class="btn btn-outline" disabled>獲得済み</button>` : `<button class="btn" onclick="getStamp('${spot.id}')">スタンプを押す</button>`;
    container.innerHTML += `<div class="card ${isStamped ? 'stamped' : ''}" style="position:relative;"><div class="stamp-mark">💮</div><h3>📍 ${spot.name}</h3><p>${spot.desc}</p>${btnHtml}</div>`;
  });
  document.getElementById('stamp-count').textContent = count;
  if (count === stampSpots.length) document.getElementById('complete-msg').classList.remove('hidden');
}

function getStamp(id) {
  if (!userData.stamps.includes(id)) {
    userData.stamps.push(id); saveData(); renderStamps(); addExp(50);
  }
}

/* =========================================
   5. マイページ
   ========================================= */
function getRankInfo(exp) {
  if (exp < 50) return { name: "見習い村民 🌱", progress: (exp / 50) * 100 };
  if (exp < 150) return { name: "たんけん隊 🎒", progress: ((exp - 50) / 100) * 100 };
  if (exp < 300) return { name: "村の語り部 📖", progress: ((exp - 150) / 150) * 100 };
  return { name: "神恵内マスター 👑", progress: 100 };
}

function updateMyPage() {
  document.getElementById('user-exp').textContent = userData.exp;
  document.getElementById('user-stamps').textContent = `${userData.stamps.length} 個`;
  document.getElementById('user-avatar').textContent = avatars[userData.avatarIndex];
  const rankInfo = getRankInfo(userData.exp);
  document.getElementById('user-rank').textContent = rankInfo.name;
  document.getElementById('exp-bar').style.width = `${Math.min(100, rankInfo.progress)}%`;
}

function changeAvatar() {
  userData.avatarIndex = (userData.avatarIndex + 1) % avatars.length; saveData(); updateMyPage();
}

/* =========================================
   6. 掲示板機能
   ========================================= */
function renderBbs() {
  const list = document.getElementById('bbs-list');
  list.innerHTML = '';
  [...bbsPosts].reverse().forEach(post => {
    list.innerHTML += `<div class="post-card"><div class="post-header"><span class="post-name">👤 ${post.name}</span><span class="post-date">${post.date}</span></div><div class="post-body">${escapeHTML(post.message).replace(/\n/g, '<br>')}</div></div>`;
  });
}

function submitPost() {
  const nameEl = document.getElementById('bbs-name');
  const msgEl = document.getElementById('bbs-message');
  const name = nameEl.value.trim() || '名無し村民';
  const message = msgEl.value.trim();
  if (!message) return alert("メッセージを入力してください。");
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  bbsPosts.push({ name, message, date: dateStr });
  saveBbs(); renderBbs(); msgEl.value = ''; addExp(5);
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* =========================================
   7. チャットボット (NotebookLM連携デモ)
   ========================================= */
function handleChatKeyPress(event) {
  if (event.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const inputEl = document.getElementById('chatbot-input-text');
  const text = inputEl.value.trim();
  if (!text) return;

  appendChatBubble(text, 'user');
  inputEl.value = '';

  // 擬似的な読み込み時間
  setTimeout(() => {
    const response = getBotResponse(text);
    appendChatBubble(response, 'bot');
  }, 600);
}

function appendChatBubble(text, sender) {
  const container = document.getElementById('chatbot-messages');
  container.innerHTML += `
    <div class="message ${sender}">
      <div class="msg-bubble">${text}</div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;
}

// 提供された資料に基づく回答ロジック
function getBotResponse(text) {
  if (text.includes("温泉")) {
    return "神恵内村にはかつて「リフレッシュプラザ温泉998」がありましたが閉館しました。現在は新しく「かもえない竜神温泉」として営業しており、地元の方や観光客に親しまれています！";
  } else if (text.includes("寿司") || text.includes("鮨") || text.includes("ウニ") || text.includes("うに") || text.includes("勝栄")) {
    return "お寿司なら、神恵内村にある老舗「勝栄鮨（かつえいずし）」がとても有名です。特に夏場の前浜で取れた朝取れの絶品ウニ丼は、わざわざ遠方から食べに来る人がいるほど大人気ですよ！";
  } else if (text.includes("選挙") || text.includes("村長") || text.includes("核") || text.includes("調査")) {
    return "2026年2月に行われた神恵内村長選挙では、現職の高橋村長が7期目の当選を果たしました。この選挙では、「核のごみ」最終処分地選定に向けた概要調査への移行の可否が大きな争点となりました。";
  } else if (text.includes("祭り") || text.includes("まつり") || text.includes("イベント") || text.includes("沖揚げ")) {
    return "夏には「かもえない沖揚げまつり」が開催されます！例年7月上旬に行われ、旬のウニがお得に購入できたり、限定のウニ丼（約600食など）が提供されたりする活気あるお祭りです。";
  } else if (text.includes("道の駅") || text.includes("オスコイ")) {
    return "「道の駅 オスコイ！かもえない」があります。村の玄関口として特産品や海産物を販売しており、ドライブの休憩にぴったりです。「どらごん太」のおやつなども探してみてくださいね。";
  } else {
    return "ご質問ありがとうございます。<br>現在デモ版のため、以下のトピックについてお答えできます。<br>・温泉について（竜神温泉）<br>・美味しいお寿司（勝栄鮨やウニ）<br>・夏のお祭り（沖揚げまつり）<br>・村長選挙の結果について<br>ぜひ聞いてみてくださいね！";
  }
}

/* =========================================
   8. モーダル・トースト制御 (ここを変更しました！)
   ========================================= */
function openModal(type) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  const modalContent = document.querySelector('.modal-content'); // モーダルの枠を取得

  // 他のモーダル用にいったんデフォルトのサイズにリセット
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  
  if (type === 'video') {
    body.innerHTML = `
      <div style="background:#000; display:flex; justify-content:center; align-items:center; height:60vh; border-radius:12px; overflow:hidden;">
        <video controls style="max-width:100%; max-height:100%; width:100%;">
          <source src="神恵内村ニシンの歴史1_五十嵐浩二さん.mp4" type="video/mp4">
          ブラウザが動画の再生に対応していません。
        </video>
      </div>`;
  } else if (type === 'game') {
    // 【修正箇所】ゲーム画面全体が表示されるようにモーダルの枠を画面いっぱいに広げる
    modalContent.style.maxWidth = '95vw';
    modalContent.style.width = '95vw';

    body.innerHTML = `
      <div style="height: 85vh; width: 100%; border-radius:12px; overflow:hidden; background:#10203d;">
        <iframe src="index.html.html" style="width:100%; height:100%; border:none; display:block;"></iframe>
      </div>`;
  } else if (type === 'pdf') {
    body.innerHTML = `
      <div class="pdf-container">
        <iframe src="カーボンニュートラルについて.pdf" style="width:100%; height:100%; border:none;"></iframe>
      </div>
      <div style="padding: 10px; text-align: center; color: var(--text-color); font-size: 0.9rem;">
        ※同じフォルダに「カーボンニュートラルについて.pdf」を配置してください。
      </div>`;
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.onload = () => {
  initData();
  navigate('home');
};
