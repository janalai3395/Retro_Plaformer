// =======================
// 기본 설정
// =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// 키 입력
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === "r" || e.key === "R") {
    restartStage();  // 🔄 R키를 누르면 재시작
  }
});
document.addEventListener("keyup", (e) => keys[e.key] = false);


// 되감기 기록
let positionHistory = [];
const rewindFrames = 300; // 5초치 기록
rewindHistory = [];  // 되감기 히스토리 초기화

function showInstructions() {
  document.getElementById("instructions").style.display = "block";
}

function hideInstructions() {
  document.getElementById("instructions").style.display = "none";
}

// =======================
// 게임 상태
// =======================
let isPlaying = false;

// =======================
// 플레이어
// =======================
const player = {
  x: 0,
  y: 0,
  width: 30,
  height: 30,
  ySpeed: 0,
  gravity: 0.4,
  jumpPower: -8,
  grounded: false
};

// =======================
// 키 초기화 함수 
// =======================

function resetKeys() {
  for (let k in keys) {
    keys[k] = false;
  }
}

// =======================
// 스테이지 상태 초기화
// =======================
function resetStageState() {
  switchSequence = [];
  switches.forEach(sw => sw.activated = false);
  platforms.forEach(p => {
    if (p.originalRequiresSwitch !== undefined) {
      p.requiresSwitch = p.originalRequiresSwitch;
    }
  });
}

// =======================
// 스테이지 재시작
// =======================
function restartStage() {
  resetKeys();
  loadStage(currentStage);
  startTime = Date.now();
}
// =======================
// 스테이지 데이터
// =======================
const stages = [
  // Stage 1
   {
   platforms: [
    // ⬆️ 위로 올라가는 경로

    { x: 50, y: 350, width: 150, height: 15 },
    { x: 50,  y: 300, width: 150, height: 15 },
    { x: 50, y: 250, width: 150, height: 15 },
    { x: 50,  y: 200, width: 150, height: 15 },

    // 🟧 조건부 발판 (스위치 밟아야 등장)
    { x: 100, y: 130, width: 120, height: 15, requiresSwitch: true },

    // 🏁 골대
    { x: 120, y: 80, width: 160, height: 15, isGoal: true },

    // 🔽 아래쪽 돌아가기용 발판 (점프 불가 높이차)
    { x: 0, y: 570, width: 550, height: 15 }
    ],
    switches: [
      { x: 320, y: 560, width: 30, height: 10, activated: false }
    ],
    startX: 50,
    startY: 300
  },
  {
    platforms: [ // ✅ Stage 2
    // 점프해서 위로 올라가는 경로
    { x: 50, y: 500, width: 150, height: 15 },
    { x: 200, y: 440, width: 120, height: 15 },
    { x: 50, y: 380, width: 150, height: 15 },
    { x: 200, y: 320, width: 120, height: 15 },

    // 스위치를 밟은 후 등장할 발판 (조건부)
    { x: 120, y: 250, width: 140, height: 15, requiresSwitch: true },

    // 골대
    { x: 140, y: 180, width: 120, height: 15, isGoal: true },

    // 밑으로 빠지는 발판 (돌아가기용)
    { x: 0, y: 570, width: 550, height: 15 }
    ],
    switches: [
    { x: 320, y: 560, width: 30, height: 10, activated: false }
    ],
    startX: 70,
    startY: 460
  },

  // Stage 3
  {
    platforms: [
      // 시작 위치 근처
      { x: 0, y: 500, width: 120, height: 15 },  // 좌측 하단 스위치 아래
      { x: 300, y: 500, width: 120, height: 15 }, // 우측 하단 스위치 아래

      // 스위치 누를 때 막히는 영역 (조건부 벽)
      { x: 300, y: 460, width: 120, height: 15, requiresSwitch: 'blockLeft', active: false },  // 왼쪽 누르면 막힘
      { x: 0, y: 460, width: 120, height: 15, requiresSwitch: 'blockRight', active: false },  // 오른쪽 누르면 막힘

      // 중간 경로
      { x: 120, y: 400, width: 100, height: 15 },
      { x: 200, y: 350, width: 100, height: 15 },
      { x: 180, y: 300, width: 100, height: 15 },

      //맨 밑 발판
      { x: 0, y: 580, width: 400, height: 15 },

      // 조건부 발판 (스위치 두 개 다 눌려야 열림)
      { x: 160, y: 250, width: 100, height: 15, requiresSwitch: [0, 1], originalRequiresSwitch: [0, 1] },

      // 골대
      { x: 160, y: 180, width: 120, height: 15, isGoal: true }
    ],
    switches: [
      { x: 50, y: 490, width: 20, height: 10, activated: false, id: 'sw0' },   // 좌측 하단
      { x: 350, y: 490, width: 20, height: 10, activated: false, id: 'sw1' }   // 우측 하단
    ],
    startX: 180,
    startY: 330
  },

  // Stage 4
  {
    platforms: [  // ✅ Stage 4
    { x: 120, y: 550, width: 160, height: 15 },
    { x: 50,  y: 500, width: 130, height: 15 },
    { x: 250, y: 450, width: 140, height: 15 },
    { x: 80,  y: 395, width: 160, height: 15 },
    { x: 200, y: 340, width: 120, height: 15 },
    { x: 40,  y: 285, width: 150, height: 15 },
    { x: 230, y: 230, width: 130, height: 15 },
    { x: 100, y: 175, width: 150, height: 15 },
    { x: 180, y: 120, width: 140, height: 15 },
    { x: 110, y: 70, width: 160, height: 15, isGoal: true }
    ],
    switches: [],
    startX: 120,
    startY: 500
  }
];

// 스위치 상태
let switchSequence = [];

function checkSwitchActivation() {
  switches.forEach((sw, idx) => {
    const hit =
      player.x + player.width > sw.x &&
      player.x < sw.x + sw.width &&
      player.y + player.height > sw.y &&
      player.y < sw.y + sw.height;

    if (hit && !sw.activated) {
      sw.activated = true;
    }
  });

  // 조건부 벽 처리
  const blockLeft = platforms.find(p => p.requiresSwitch === 'blockLeft');
  const blockRight = platforms.find(p => p.requiresSwitch === 'blockRight');

  if (switches[0] && switches[0].activated && (!switches[1] || !switches[1].activated)) {
    if (blockRight) blockRight.active = true;
    if (blockLeft) blockLeft.active = false;
  } else if (switches[1] && switches[1].activated && (!switches[0] || !switches[0].activated)) {
    if (blockLeft) blockLeft.active = true;
    if (blockRight) blockRight.active = false;
  } else {
    if (blockLeft) blockLeft.active = false;
    if (blockRight) blockRight.active = false;
  }

  // 조건부 발판 처리
  platforms.forEach(p => {
    if (Array.isArray(p.requiresSwitch)) {
      const allActivated = p.requiresSwitch.every(idx => switches[idx]?.activated);
      p.active = allActivated;
    }
  });
}




// =======================
// 스테이지 해금
// =======================
let unlockedStage = 0;  

function loadUnlockedStage() {
  const saved = localStorage.getItem("unlockedStage");
  if (saved !== null) unlockedStage = Number(saved);
}
function saveUnlockedStage() {
  localStorage.setItem("unlockedStage", unlockedStage);
}

// =======================
let currentStage = 0;
let platforms = [];
let startTime = 0;
let rewindPressed = false;

// =======================
// 스테이지 불러오기
// =======================
function loadStage(index) {
  const stage = stages[index];
  platforms = stage.platforms;
  switches = stage.switches.map(sw => ({ ...sw, activated: false }));
  player.x = stage.startX;
  player.y = stage.startY;
  rewindHistory = [];
  positionHistory = [];

  // 💡 조건부 벽 초기화
  platforms.forEach(p => {
  if (p.requiresSwitch === 'blockLeft' || p.requiresSwitch === 'blockRight') {
    p.active = false;
  }
});

  // 💡 조건부 발판 리셋
  platforms.forEach(p => {
    if (p.originalRequiresSwitch !== undefined) {
      p.requiresSwitch = p.originalRequiresSwitch;
    }
  });
}

// =======================
// Retro 깃발
// =======================
function drawFlag(x, y) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "#ff3333";

  // 깃대
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 30);
  ctx.stroke();

  // 깃발
  ctx.beginPath();
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x + 20, y - 25);
  ctx.lineTo(x, y - 20);
  ctx.fill();
}

// =======================
// 플레이어 이동
// =======================
function updatePlayerMovement() {
  if (keys["ArrowLeft"]) player.x -= 3;
  if (keys["ArrowRight"]) player.x += 3;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;

  player.ySpeed += player.gravity;
  player.y += player.ySpeed;

  if (player.grounded && keys[" "]) {
    player.ySpeed = player.jumpPower;
    player.grounded = false;
  }
}

// =======================
// 충돌
// =======================
function checkPlatformCollision() {
  player.grounded = false;

  platforms.forEach(p => {
    const hor =
      player.x + player.width > p.x &&
      player.x < p.x + p.width;

    const prevBottom = player.y + player.height - player.ySpeed;
    const currBottom = player.y + player.height;

      const landing =
      hor &&
      prevBottom <= p.y &&
      currBottom >= p.y &&
      player.ySpeed > 0;

    if (
  landing &&
      (
        !p.requiresSwitch ||
        p.active === undefined ||
        p.active === true ||
        (Array.isArray(p.requiresSwitch) && p.requiresSwitch.every(idx => switches[idx]?.activated))
      )
    ) {
      player.y = p.y - player.height;
      player.ySpeed = 0;
      player.grounded = true;
    }
  });
}


// =======================
// 스테이지 클리어 (깃발 충돌)
// =======================
function checkStageClear() {
  const goal = platforms.find(p => p.isGoal);
  if (!goal) return;

  const flagX = goal.x + goal.width / 2 - 10;
  const flagY = goal.y - 30;
  const flagWidth = 20;
  const flagHeight = 30;

  const hit =
    player.x + player.width > flagX &&
    player.x < flagX + flagWidth &&
    player.y + player.height > flagY &&
    player.y < flagY + flagHeight;

  if (hit) {
    if (currentStage === unlockedStage && unlockedStage < stages.length - 1) {
      unlockedStage++;
      saveUnlockedStage();
    }

    resetKeys();
    isPlaying = false;
    showStageSelect();
  }
}

// =======================
// GameOver 처리
// =======================
function checkGameOver() {
  if (player.y > canvas.height) {
  alert("Game Over!");

  resetKeys();   // 🎯 여기가 핵심
  isPlaying = false;

  return;
  }
}

// =======================
// UI 표시
// =======================
function drawUI() {
  ctx.fillStyle = "#33ff66";
  ctx.font = "16px Courier";
  const time = ((Date.now() - startTime) / 1000).toFixed(1);
  ctx.fillText(`STAGE: ${currentStage + 1}`, 10, 20);
  ctx.fillText(`TIME : ${time}s`, 10, 40);
}

// =======================
// 그리기
// =======================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawShadows(); // 잔상 먼저

  // 플레이어
  ctx.fillStyle = "#3399ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  const blockLeft = platforms.find(p => p.requiresSwitch === 'blockLeft');
  const blockRight = platforms.find(p => p.requiresSwitch === 'blockRight');

  // 조건부 벽 상태 설정
  if (switches[0]?.activated && !switches[1]?.activated) {
    if (blockRight) blockRight.active = true;
    if (blockLeft) blockLeft.active = false;
  } else if (switches[1]?.activated && !switches[0]?.activated) {
    if (blockLeft) blockLeft.active = true;
    if (blockRight) blockRight.active = false;
  } else if (switches[0]?.activated && switches[1]?.activated) {
    if (blockLeft) blockLeft.active = true;
    if (blockRight) blockRight.active = true;
  } else {
    if (blockLeft) blockLeft.active = false;
    if (blockRight) blockRight.active = false;
  }

  // 플랫폼 렌더링
  platforms.forEach(p => {
    let shouldDisplay = true;

    if (Array.isArray(p.requiresSwitch)) {
      shouldDisplay = p.requiresSwitch.every(idx => switches[idx]?.activated);
    } else if (typeof p.requiresSwitch === 'number') {
      shouldDisplay = switches[p.requiresSwitch]?.activated;
    } else if (typeof p.requiresSwitch === 'string') {
      shouldDisplay = p.active;
    }

    ctx.globalAlpha = shouldDisplay ? 1.0 : 0.3;

    if (p.isGoal) {
      ctx.fillStyle = "#ffaa33";
      ctx.fillRect(p.x, p.y, p.width, p.height);
      drawFlag(p.x + p.width / 2, p.y);
    } else {
      ctx.fillStyle = "#33cc33";
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    ctx.globalAlpha = 1.0;
  });

  // 스위치 렌더링
  switches.forEach(sw => {
    ctx.fillStyle = sw.activated ? "#ffcc00" : "#888888";
    ctx.fillRect(sw.x, sw.y, sw.width, sw.height);
  });

  drawUI();
}



// =======================
// 메인 루프
// =======================
function update() {
  if (!isPlaying) return;

  if (isRewinding) {
    processRewind();
  } else {
    positionHistory.push({ x: player.x, y: player.y });
    if (positionHistory.length > rewindFrames)
      positionHistory.shift();
  }

if ((keys["z"] || keys["Z"]) && !rewindPressed) {
  isRewinding = true;
  rewindFrameCount = 180; // 3초치 되감기
  rewindPressed = true;
}
if (!keys["z"] && !keys["Z"]) rewindPressed = false;

  updatePlayerMovement();
  checkPlatformCollision();
  checkSwitchActivation();
  checkStageClear();
  checkGameOver();
  draw();

  requestAnimationFrame(update);
}


// =======================
// 스테이지 시작
// =======================
function startStage(i) {
  currentStage = i;
  isPlaying = true;   // 게임 시작!
  startTime = Date.now(); 
  document.getElementById("stageSelect").style.display = "none";
  document.getElementById("instructions").style.display = "none"; // 🔽 게임 방법 UI 닫기
  canvas.style.display = "block";
  loadStage(i);
  update();
}

// =======================
// 초기 시작
// =======================
loadUnlockedStage();





function drawShadows() {
  const count = 5;
  const maxShadowFrames = 180;
  const historyLength = Math.min(positionHistory.length, maxShadowFrames);
  if (historyLength < 2) return;

  const step = Math.floor(historyLength / count);
  for (let i = 1; i <= count; i++) {
    const index = positionHistory.length - i * step;
    const pos = positionHistory[index];
    if (pos) {
      ctx.fillStyle = `rgba(51, 153, 255, ${0.1 * (count - i + 1)})`;
      ctx.fillRect(pos.x, pos.y, player.width, player.height);
    }
  }
}

// 🔁 되감기 설정
let isRewinding = false;
let rewindFrameCount = 0;
const maxRewindFrames = 180;


function processRewind() {
  if (!isRewinding) return;
  if (rewindFrameCount > 0 && positionHistory.length > 0) {
    const pos = positionHistory.pop();
    player.x = pos.x;
    player.y = pos.y;
    player.ySpeed = 0;
    rewindFrameCount--;
  } else {
    isRewinding = false;
  }
}

function showStageSelect() {
  document.getElementById("stageSelect").style.display = "block";
  canvas.style.display = "none";
}

