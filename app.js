/* =====================================================================
   クイズアプリの動き（ロジック）
   ※ふつうは編集しなくてOK。問題の追加は questions.js でできます。
   ===================================================================== */

// --- 画面の要素を取得 ---
const startScreen  = document.getElementById("start-screen");
const quizScreen   = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const categoryList = document.getElementById("category-list");
const progressEl   = document.getElementById("progress");
const scoreEl      = document.getElementById("score");
const barFill      = document.getElementById("bar-fill");
const questionEl   = document.getElementById("question");
const choicesEl    = document.getElementById("choices");
const feedbackEl   = document.getElementById("feedback");
const nextBtn      = document.getElementById("next-btn");

const resultEmoji  = document.getElementById("result-emoji");
const resultText   = document.getElementById("result-text");
const retryBtn     = document.getElementById("retry-btn");

// --- 状態 ---
let currentQuiz = [];   // 今あそんでいる問題のリスト
let index = 0;          // 何問目か
let score = 0;          // 正解数

// --- 配列をシャッフルする小さな関数 ---
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- スタート画面：カテゴリのボタンを作る ---
function buildCategoryButtons() {
  // カテゴリごとの問題数を数える
  const counts = {};
  QUESTIONS.forEach(q => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });

  categoryList.innerHTML = "";

  // 「ぜんぶ」ボタン
  addCategoryButton("ぜんぶ", QUESTIONS.length, null);

  // 各教科ボタン
  Object.keys(counts).forEach(cat => {
    addCategoryButton(cat, counts[cat], cat);
  });
}

function addCategoryButton(label, count, category) {
  const btn = document.createElement("button");
  btn.className = "category-btn";
  btn.innerHTML = `${label}<span class="count">${count}問</span>`;
  btn.addEventListener("click", () => startQuiz(category));
  categoryList.appendChild(btn);
}

// --- クイズ開始 ---
function startQuiz(category) {
  const pool = category
    ? QUESTIONS.filter(q => q.category === category)
    : QUESTIONS;

  currentQuiz = shuffle(pool);
  index = 0;
  score = 0;

  showScreen(quizScreen);
  showQuestion();
}

// --- 1問表示 ---
function showQuestion() {
  const item = currentQuiz[index];

  progressEl.textContent = `${index + 1} / ${currentQuiz.length}`;
  scoreEl.textContent = `${score}問正解`;
  barFill.style.width = `${(index / currentQuiz.length) * 100}%`;

  questionEl.textContent = item.q;
  feedbackEl.className = "feedback hidden";
  nextBtn.classList.add("hidden");

  // 選択肢を作る（順番もシャッフル）
  choicesEl.innerHTML = "";
  const order = shuffle(item.choices.map((c, i) => ({ text: c, isAnswer: i === item.answer })));

  order.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => selectAnswer(btn, opt.isAnswer, order));
    choicesEl.appendChild(btn);
  });
}

// --- 答えを選んだとき ---
function selectAnswer(btn, isAnswer, order) {
  const allBtns = choicesEl.querySelectorAll(".choice-btn");
  allBtns.forEach((b, i) => {
    b.disabled = true;
    if (order[i].isAnswer) b.classList.add("correct");
  });

  if (isAnswer) {
    score++;
    feedbackEl.textContent = "せいかい！ ⭕️";
    feedbackEl.className = "feedback ok";
  } else {
    btn.classList.add("wrong");
    feedbackEl.textContent = "ざんねん… ❌";
    feedbackEl.className = "feedback ng";
  }

  scoreEl.textContent = `${score}問正解`;
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = (index + 1 < currentQuiz.length) ? "つぎへ →" : "けっかを見る →";
}

// --- 次の問題へ ---
nextBtn.addEventListener("click", () => {
  index++;
  if (index < currentQuiz.length) {
    showQuestion();
  } else {
    showResult();
  }
});

// --- 結果表示 ---
function showResult() {
  showScreen(resultScreen);
  const total = currentQuiz.length;
  const rate = score / total;

  let emoji = "🎉";
  if (rate === 1)        emoji = "🏆";
  else if (rate >= 0.7)  emoji = "😄";
  else if (rate >= 0.4)  emoji = "🙂";
  else                   emoji = "💪";

  resultEmoji.textContent = emoji;
  resultText.innerHTML = `${total}問中 <strong>${score}問</strong> せいかい！`;
}

// --- もう一度 ---
retryBtn.addEventListener("click", () => {
  buildCategoryButtons();
  showScreen(startScreen);
});

// --- 画面の切りかえ ---
function showScreen(target) {
  [startScreen, quizScreen, resultScreen].forEach(s => s.classList.add("hidden"));
  target.classList.remove("hidden");
  window.scrollTo(0, 0);
}

// --- 起動 ---
buildCategoryButtons();
