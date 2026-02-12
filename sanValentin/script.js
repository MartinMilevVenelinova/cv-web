// =======================
// CONFIG
// =======================
const FINAL_MESSAGE = "TE ELIJO A TI 💚\nHOY Y SIEMPRE."; // cámbialo aquí

const MISSIONS = [
  {
    img: "./img/foto1.jpg",
    title: "Misión 1",
    caption: "Si el tiempo tuviera memoria, sabría que desde el instante en que llegaste a mi vida todo empezó a tener otro color. Has sido y sigues siendo esa personita que me ha regalado experiencias, aprendizajes y horizontes que jamás imaginé recorrer. Contigo aprendí a superarme, a mirar la vida desde otra perspectiva, a sentir más profundo y a vivir con más conciencia. Gracias por enseñarme que amar también es crecer… Y si algo tengo claro desde que apareciste en mi historia es que QUIERO que todo lo que venga me encuentre a tu lado. 💗 "
  },
  {
    img: "./img/foto2.jpg",
    title: "Misión 2",
    caption: "Por esos viajes de locura juntos, incluso cuando estaba adolorido y enfermito, y tú estabas ahí cuidándome, cocinando para mí aunque luego no me lo coma. Por ese enfado nocturno por no cuidarme, que en realidad era puro drama mientras tú ya estabas en el quinto sueño. Por soportarme cada noche, incluso cuando soy un poco caos. Por todo eso entendí que contigo no quiero solo momentos… quiero UNA VIDA compartida de risas, locuras y complicidad. 💗 "
  },
  {
    img: "./img/foto3.jpg",
    title: "Misión 3",
    caption: "Gracias por las experiencias inolvidables, por uno de los primeros viajes que hice fuera de Europa y por hacerme ver que hay mucho más mundo ahí fuera… pero que a tu lado todo se siente mejor. La confianza que tengo contigo es inquebrantable, y gracias a los errores del pasado aprendí que lo que de verdad importa se cuida día a día. Y si algo aprendí contigo es que amar también significa esforzarse cada día en seguir HACIÉNDOTE FELIZ. 💗 "
  },
  {
    img: "./img/foto4.jpg",
    title: "Misión 4",
    caption: "Gracias por culturizarme, por despertar en mí interés por cosas que antes veía aburridas. Por compartir conmigo tus ideas y tus experiencias sin tapujos, con esa sinceridad tan tuya. Si alguna vez te sentiste como el 'padre' de la relación, espero que hoy veas que he crecido, que soy la persona que quieres a tu lado, que he aprendido y que estoy aquí consciente y presente. Porque si algo tengo claro ahora y siempre es que quiero seguir construyendo esto contigo, cuidándolo, eligiéndote y demostrándotelo CADA DÍA. 💗 "
  }
];

// =======================
// Persistencia (monedas)
// =======================
const COIN_STORAGE_KEY = "valentine_coin_total_v1";
const COIN_MASK_KEY = "valentine_coin_mask_v1";
let coinTotal = 0;

function loadCoinState() {
  try {
    coinTotal = parseInt(localStorage.getItem(COIN_STORAGE_KEY) || "0", 10) || 0;
  } catch (_) { coinTotal = 0; }

  let mask = [];
  try {
    const raw = localStorage.getItem(COIN_MASK_KEY);
    if (raw) mask = JSON.parse(raw);
  } catch (_) { mask = []; }

  coins.forEach((c, idx) => {
    c.w = 12; c.h = 16;
    c.collected = Boolean(mask[idx]);
  });

  updateCoinPill();
}

function saveCoinState() {
  try {
    localStorage.setItem(COIN_STORAGE_KEY, String(coinTotal));
    localStorage.setItem(COIN_MASK_KEY, JSON.stringify(coins.map(c => Boolean(c.collected))));
  } catch (_) {}
}

function updateCoinPill() {
  if (!coinPill) return;
  coinPill.innerHTML = `<i class="bi bi-coin"></i> ${coinTotal}`;
}


// =======================
// DOM
// =======================
const introScreen = document.getElementById("introScreen");
const askScreen = document.getElementById("askScreen");
const gameScreen = document.getElementById("gameScreen");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const askHint = document.getElementById("askHint");

const progressPill = document.getElementById("progressPill");
const coinPill = document.getElementById("coinPill");
const hudHint = document.getElementById("hudHint");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const photoOverlay = document.getElementById("photoOverlay");
const overlayImg = document.getElementById("overlayImg");
const overlayTitle = document.getElementById("overlayTitle");
const overlayCaption = document.getElementById("overlayCaption");
const overlayBackBtn = document.getElementById("overlayBackBtn");

const endingScreen = document.getElementById("endingScreen");
const endingText = document.getElementById("endingText");
const resetBtn = document.getElementById("resetBtn");

// =======================
// Helpers
// =======================
function showScreen(screenEl) {
  [introScreen, askScreen, gameScreen].forEach(s =>
    s.classList.remove("screen--active")
  );
  screenEl.classList.add("screen--active");
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
function showHudHint(text) {
  hudHint.textContent = text;
  hudHint.style.display = "block";
}
function hideHudHint() {
  hudHint.textContent = "";
  hudHint.style.display = "none";
}

// =======================
// 0) Intro auto 5s -> Ask
// =======================
setTimeout(() => {
  introScreen.classList.add("fade-out");
  setTimeout(() => {
    introScreen.classList.remove("screen--active");
    introScreen.classList.remove("fade-out");

    showScreen(askScreen);
    askScreen.classList.add("fade-in");
    setTimeout(() => askScreen.classList.remove("fade-in"), 520);

    initAsk();
  }, 600);
}, 5000);

// =======================
// 1) ASK: SÍ desactivado, NO al lado.
// Al clicar NO: rebota suave y habilita SÍ.
// =======================
let yesUnlocked = false;
let noRunning = false;

const noState = {
  x: 0,
  y: 0,
  vx: 4.2,
  vy: 3.5,
  raf: null,
};

function initAsk() {
  yesBtn.disabled = true;
  yesUnlocked = false;
  noRunning = false;

  askHint.textContent = ""; // sin incitar

  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.zIndex = "";
}

function startNoBouncing() {
  if (noRunning) return;
  noRunning = true;

  const r = noBtn.getBoundingClientRect();
  noState.x = r.left;
  noState.y = r.top;

  noBtn.style.position = "fixed";
  noBtn.style.left = `${noState.x}px`;
  noBtn.style.top = `${noState.y}px`;
  noBtn.style.zIndex = "999";

  if (!yesUnlocked) {
    yesUnlocked = true;
    yesBtn.disabled = false;
  }

  const step = () => {
    if (!askScreen.classList.contains("screen--active")) {
      cancelAnimationFrame(noState.raf);
      noState.raf = null;
      return;
    }

    const bw = noBtn.offsetWidth || 160;
    const bh = noBtn.offsetHeight || 60;
    const pad = 10;

    noState.x += noState.vx;
    noState.y += noState.vy;

    const maxX = window.innerWidth - bw - pad;
    const maxY = window.innerHeight - bh - pad;

    if (noState.x <= pad) { noState.x = pad; noState.vx *= -1; }
    if (noState.y <= pad) { noState.y = pad; noState.vy *= -1; }
    if (noState.x >= maxX) { noState.x = maxX; noState.vx *= -1; }
    if (noState.y >= maxY) { noState.y = maxY; noState.vy *= -1; }

    noBtn.style.left = `${Math.round(noState.x)}px`;
    noBtn.style.top = `${Math.round(noState.y)}px`;

    noState.raf = requestAnimationFrame(step);
  };

  noState.raf = requestAnimationFrame(step);
}

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startNoBouncing();
});

yesBtn.addEventListener("click", () => {
  // reset NO para no tapar
  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.zIndex = "";

  showScreen(gameScreen);
  startGame();
});

resetBtn.addEventListener("click", () => {
  if (!overlayOpen && gameRunning) {
    resetPlayerPosition();
  }
});

// =======================
// 2) GAME
// =======================
const keys = { a:false, d:false, w:false, s:false, e:false };
let jumpPressed = false;
let interactPressed = false;

window.addEventListener("keydown", (ev) => {
  const k = ev.key.toLowerCase();
  if (k in keys) keys[k] = true;
  if (k === "w") jumpPressed = true;
  if (k === "e") interactPressed = true;
  if (k === "r") {
    if (!overlayOpen && gameRunning) resetPlayerPosition();
  }
});
window.addEventListener("keyup", (ev) => {
  const k = ev.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// Mundo
const WORLD = {
  w: canvas.width,
  h: canvas.height,
  gravity: 0.58,
  friction: 0.90,
};

// Player
let checkpoint = { x: 80, y: 0 };
const player = {
  x: 80,
  y: WORLD.h - 140,
  w: 34,
  h: 52,
  vx: 0,
  vy: 0,
  onGround: false,
  crouch: false,

  // Mario-ish vibes 🧱
  facing: 1,            // 1 derecha, -1 izquierda
  state: "idle",        // idle | run | jump | crouch
  tick: 0,              // contador para animaciones

  coyote: 0,
  jumpBuffer: 0,
  bubbleTimer: 0,
};

// Gatita (pegada al suelo)
const cat = {
  x: 40,
  y: WORLD.h - 80,
  w: 22,
  h: 16,
  vx: 0,
  vy: 0,
};

// =======================
// MAPA (Mario vibes: tubos + monedas + bloques)
// =======================
// Nota: mantenemos un layout que se puede pasar a saltos sin frustración.
const platforms = [
  // Suelo
  { x: 0, y: WORLD.h - 48, w: WORLD.w, h: 48, type: "ground" },

  // Escalerita de bricks (inicio)
  { x: 120, y: WORLD.h - 88,  w: 56, h: 16, type: "plank" },
  { x: 170, y: WORLD.h - 120, w: 56, h: 16, type: "plank" },
  { x: 220, y: WORLD.h - 152, w: 56, h: 16, type: "plank" },

  // Bloques flotantes clásicos
  { x: 320, y: WORLD.h - 220, w: 56, h: 16, type: "plank" },
  { x: 392, y: WORLD.h - 220, w: 56, h: 16, type: "plank" },
  { x: 464, y: WORLD.h - 220, w: 56, h: 16, type: "plank" },

  // Tubo 1 (colisionable)
  { x: 360, y: WORLD.h - 120, w: 64, h: 72, type: "pipe" },
  // Plataforma arriba del tubo (para que sea “piso” claro)
  { x: 356, y: WORLD.h - 124, w: 72, h: 12, type: "pipeTop" },

  // Pasarela hacia la misión 2
  { x: 640, y: WORLD.h - 180, w: 80, h: 16, type: "plank" },
  { x: 740, y: WORLD.h - 240, w: 88, h: 16, type: "plank" },

  // Base misión 1 (primer premio rápido)
  { x: 170, y: WORLD.h - 200, w: 150, h: 18, type: "grass" },

  // Base misión 2 (media altura)
  { x: 720, y: WORLD.h - 300, w: 170, h: 18, type: "grass" },

  // Tubo 2 (más alto, estilo 1-1)
  { x: 460, y: WORLD.h - 160, w: 72, h: 112, type: "pipe" },
  { x: 456, y: WORLD.h - 164, w: 80, h: 12, type: "pipeTop" },

  // Base misión 4 (abajo-derecha)
  { x: 780, y: WORLD.h - 160, w: 240, h: 18, type: "grass" },

  // Zona alta derecha (misión 3)
  { x: 900, y: WORLD.h - 360, w: 200, h: 18, type: "grass" },
  

  // Bloque final (mini escalón de salida)
  { x: 1040, y: WORLD.h - 96, w: 64, h: 16, type: "plank" },
];

// Decoración (no colisiona): monedas y mini arbustos/colinas extra
const coins = [
  { x: 150, y: WORLD.h - 120 }, { x: 190, y: WORLD.h - 140 }, { x: 230, y: WORLD.h - 160 },
  { x: 335, y: WORLD.h - 250 }, { x: 407, y: WORLD.h - 250 }, { x: 479, y: WORLD.h - 250 },
  { x: 660, y: WORLD.h - 210 }, { x: 770, y: WORLD.h - 270 },
  { x: 930, y: WORLD.h - 190 }, { x: 990, y: WORLD.h - 190 },
];

const bushes = [
  { x: 80, y: WORLD.h - 74, s: 1.0 },
  { x: 430, y: WORLD.h - 72, s: 1.2 },
  { x: 720, y: WORLD.h - 70, s: 1.1 },
];

// Misiones ahora son “banderitas” (flagpole) con animación de izado.
const missionObjects = [
  { x: 220, y: WORLD.h - 290, w: 54, h: 90 }, // M1 (sobre base 1)
  { x: 740, y: WORLD.h - 390, w: 54, h: 90 }, // M2 (sobre base 2)
  { x: 1010, y: WORLD.h - 450, w: 54, h: 90 }, // M3 (zona alta der)
  { x: 950, y: WORLD.h - 250, w: 54, h: 90 }, // M4 (abajo der)
];

// estado de banderas: 0 (abajo) -> 1 (arriba)
let flagLevel = [0, 0, 0, 0];
let flagTarget = [0, 0, 0, 0];

let currentMission = 0;
let completedMissions = [false,false,false,false];
let gameRunning = false;
let overlayOpen = false;

function updateProgress() {
  const done = completedMissions.filter(Boolean).length;
  if (done < 4) {
    progressPill.innerHTML = `<i class="bi bi-flag-fill"></i> Misión: ${done + 1}/4`;
  } else {
    progressPill.innerHTML = `<i class="bi bi-check-circle-fill"></i> Completado 4/4`;
  }
}

// =======================
// Colisiones (estable)
// =======================
function resolvePlatformCollisions() {
  player.onGround = false;

  const future = { x: player.x, y: player.y, w: player.w, h: player.h };
  const prevY = player.y - player.vy;
  const prevX = player.x - player.vx;

  for (const p of platforms) {
    if (!rectsOverlap(future, p)) continue;

    const oneWay = (p.type === "plank" || p.type === "grass" || p.type === "pipeTop");

    // ONE-WAY: solo colisiona desde arriba cuando CAES
    if (oneWay) {
      const wasAbove = (prevY + player.h) <= p.y + 2;
      const falling = player.vy >= 0;
      if (wasAbove && falling) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
      // Sin colisiones laterales / desde abajo
      continue;
    }

    // SOLID: colisiones completas (suelo / tubos)
    const fromAbove = (prevY + player.h) <= p.y + 2;
    const fromBelow = prevY >= (p.y + p.h - 1);

    if (fromAbove) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
      continue;
    }
    if (fromBelow) {
      player.y = p.y + p.h;
      player.vy = 0;
      continue;
    }

    const fromLeft = (prevX + player.w) <= p.x + 2;
    const fromRight = prevX >= (p.x + p.w - 1);

    if (fromLeft) {
      player.x = p.x - player.w;
      player.vx = 0;
    } else if (fromRight) {
      player.x = p.x + p.w;
      player.vx = 0;
    }
  }

  player.x = clamp(player.x, 0, WORLD.w - player.w);
  player.y = clamp(player.y, 0, WORLD.h - player.h);
}

// =======================
// Overlay misión
// =======================
function openMissionOverlay(i) {
  overlayOpen = true;
  photoOverlay.classList.add("overlay--open");
  photoOverlay.setAttribute("aria-hidden", "false");

  overlayImg.src = MISSIONS[i].img;
  overlayTitle.textContent = MISSIONS[i].title;
  overlayCaption.textContent = MISSIONS[i].caption;

  const card = photoOverlay.querySelector(".overlay-card");
  card.animate(
    [{ transform: "scale(.96)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 220, easing: "ease-out" }
  );
}

function closeMissionOverlay() {
  const card = photoOverlay.querySelector(".overlay-card");
  const anim = card.animate(
    [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.98)", opacity: 0 }],
    { duration: 160, easing: "ease-in" }
  );

  anim.onfinish = () => {
    photoOverlay.classList.remove("overlay--open");
    photoOverlay.setAttribute("aria-hidden", "true");
    overlayOpen = false;

    completedMissions[currentMission] = true;

    // Animación: izar banderita de la misión completada 🏁
    flagTarget[currentMission] = 1;

    // checkpoint: reaparición segura (suelo) cerca de la siguiente misión
    const nextIndex = currentMission + 1;
    const nextX = (nextIndex < missionObjects.length)
      ? (missionObjects[nextIndex].x - 80)
      : (player.x);
    checkpoint = { x: clamp(nextX, 24, WORLD.w - player.w - 24), y: WORLD.h - 48 - player.h };

    currentMission++;

    if (completedMissions.filter(Boolean).length >= 4) finishGame();
    else updateProgress();
  };
}

overlayBackBtn.addEventListener("click", closeMissionOverlay);
photoOverlay.addEventListener("click", (e) => {
  if (e.target === photoOverlay) closeMissionOverlay();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlayOpen) closeMissionOverlay();
});

function tryInteract() {
  if (overlayOpen) return;
  const obj = missionObjects[currentMission];
  const interactZone = { x: obj.x - 22, y: obj.y - 22, w: obj.w + 44, h: obj.h + 44 };
  const ply = { x: player.x, y: player.y, w: player.w, h: player.h };

  if (rectsOverlap(ply, interactZone)) openMissionOverlay(currentMission);
}

// =======================
// Final
// =======================
function finishGame() {
  gameRunning = false;
  updateProgress();

  endingText.textContent = FINAL_MESSAGE;
  endingScreen.classList.add("ending--show");
  endingScreen.setAttribute("aria-hidden", "false");
}

// =======================
// Start game
// =======================
function startGame() {
  player.x = 80;
  player.y = WORLD.h - 140;
  checkpoint = { x: player.x, y: WORLD.h - 48 - player.h };
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.crouch = false;
  player.facing = 1;
  player.state = "idle";
  player.tick = 0;
  player.coyote = 0;
  player.jumpBuffer = 0;
  player.bubbleTimer = 0;

  cat.x = 40;
  cat.y = WORLD.h - 80;
  cat.vx = 0;
  cat.vy = 0;

  currentMission = 0;
  completedMissions = [false,false,false,false];

  loadCoinState();

  flagLevel = [0,0,0,0];
  flagTarget = [0,0,0,0];
  updateProgress();
  hideHudHint();

  endingScreen.classList.remove("ending--show");
  endingScreen.setAttribute("aria-hidden", "true");

  gameRunning = true;
  overlayOpen = false;

  requestAnimationFrame(loop);
}

function resetPlayerPosition() {
  player.x = checkpoint.x;
  player.y = checkpoint.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.facing = 1;
  player.state = "idle";
  player.tick = 0;
  player.coyote = 0;
  player.jumpBuffer = 0;
}

// =======================
// Drawing
// =======================
function drawBackground() {
  // Cielo más colorido y "Mario-ish"
  const grd = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  grd.addColorStop(0.00, "rgba(120,210,255,0.92)");
  grd.addColorStop(0.45, "rgba(70,170,255,0.88)");
  grd.addColorStop(0.78, "rgba(40,120,210,0.86)");
  grd.addColorStop(1.00, "rgba(10,60,55,0.92)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  // Sol pixel
  ctx.imageSmoothingEnabled = false;
  const sunX = 88, sunY = 86;
  ctx.fillStyle = "rgba(255,246,210,0.92)";
  ctx.fillRect(sunX, sunY, 26, 26);
  ctx.fillStyle = "rgba(255,214,90,0.40)";
  ctx.fillRect(sunX - 6, sunY - 6, 38, 38);

  // Nubes
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  drawCloud(160, 90); drawCloud(470, 70); drawCloud(820, 110);

  // Colinas (capas)
  ctx.fillStyle = "rgba(120,240,190,0.16)";
  ctx.beginPath(); ctx.arc(190, WORLD.h - 48, 120, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(430, WORLD.h - 48, 170, Math.PI, 0); ctx.fill();

  ctx.fillStyle = "rgba(60,200,150,0.10)";
  ctx.beginPath(); ctx.arc(720, WORLD.h - 48, 210, Math.PI, 0); ctx.fill();

  // Brillitos sutiles (no exagerar)
  ctx.fillStyle = "rgba(234,255,246,0.10)";
  for (let i = 0; i < 38; i++) {
    const x = (i * 97) % WORLD.w;
    const y = (i * 53) % 220;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawDecorations() {
  drawBushes();
  drawCoins();
}

function drawCoins() {
  ctx.imageSmoothingEnabled = false;
  const t = player.tick;

  for (const c of coins) {
    if (c.collected) continue;

    const bob = Math.sin((t + c.x) / 12) * 2;
    const x = c.x;
    const y = c.y + bob;

    // moneda pixel: anillo + brillo
    ctx.fillStyle = "rgba(255,214,90,0.95)";
    ctx.fillRect(x, y, 12, 16);
    ctx.fillStyle = "rgba(255,246,210,0.85)";
    ctx.fillRect(x + 3, y + 3, 6, 10);
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(x + 1, y + 1, 10, 14);
    ctx.clearRect(x + 3, y + 5, 6, 6);
  }
}

function drawBushes() {
  ctx.imageSmoothingEnabled = false;
  for (const b of bushes) {
    const s = b.s || 1;
    const x = b.x;
    const y = b.y;
    ctx.fillStyle = "rgba(80,210,140,0.35)";
    // 3 bultitos pixel
    ctx.fillRect(x, y, 26*s, 10*s);
    ctx.fillRect(x + 10*s, y - 6*s, 26*s, 12*s);
    ctx.fillRect(x + 22*s, y, 24*s, 10*s);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(x, y + 8*s, 46*s, 3*s);
  }
}

function drawCloud(x, y) {
  // nube pixel (más retro que el círculo)
  ctx.imageSmoothingEnabled = false;
  const s = 4;
  const blocks = [
    [1,1,6,1],[0,2,8,2],[1,4,10,2],[3,6,8,1]
  ];
  for (const [bx,by,bw,bh] of blocks) {
    ctx.fillRect(x + bx*s, y + by*s, bw*s, bh*s);
  }
}

// Plataformas con los colores del juego (no los del esquema)
function drawPlatforms() {
  // Orden de capas para que los tubos se vean bien (especialmente el de la derecha)
  // 1) suelo + plataformas, 2) tubos, 3) tapas de tubo
  for (const p of platforms) {
    if (p.type === "ground") drawGround(p);
    else if (p.type === "grass") drawGrassPlatform(p);
    else if (p.type === "plank") drawPlankPlatform(p);
  }
  for (const p of platforms) {
    if (p.type === "pipe") drawPipe(p);
  }
  for (const p of platforms) {
    if (p.type === "pipeTop") drawPipeTop(p);
  }
}

function drawPipe(p) {
  // Cuerpo de tubo verde pixel
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(60,190,120,0.92)";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // franjas verticales (brillo)
  ctx.fillStyle = "rgba(234,255,246,0.14)";
  ctx.fillRect(p.x + 8, p.y + 6, 8, p.h - 12);
  ctx.fillRect(p.x + 26, p.y + 6, 6, p.h - 12);

  // borde
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

  // sombra abajo
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(p.x, p.y + p.h - 6, p.w, 6);
}

function drawPipeTop(p) {
  // Tapa del tubo (cap)
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(70,210,135,0.95)";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
  ctx.strokeStyle = "rgba(0,0,0,0.30)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
}

function drawGround(p) {
  ctx.fillStyle = "rgba(140,90,55,0.75)";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = "rgba(80,210,140,0.85)";
  ctx.fillRect(p.x, p.y, p.w, 8);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
}

function drawGrassPlatform(p) {
  ctx.fillStyle = "rgba(120,78,48,0.65)";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = "rgba(80,210,140,0.90)";
  ctx.fillRect(p.x, p.y, p.w, Math.min(8, p.h));

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
}

function drawPlankPlatform(p) {
  // Plataforma tipo "madera" (más agradable que el brick gris)
  ctx.imageSmoothingEnabled = false;

  // base
  ctx.fillStyle = "rgba(188,125,58,0.78)";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // vetas (líneas muy suaves)
  ctx.fillStyle = "rgba(255,236,210,0.10)";
  for (let x = p.x + 8; x < p.x + p.w; x += 22) {
    ctx.fillRect(x, p.y + 3, 2, Math.max(1, p.h - 6));
  }

  // borde superior (luz) y borde inferior (sombra)
  ctx.fillStyle = "rgba(255,246,230,0.16)";
  ctx.fillRect(p.x, p.y, p.w, 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(p.x, p.y + p.h - 2, p.w, 2);

  // tornillos pixel
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  const y0 = p.y + Math.floor(p.h / 2) - 1;
  for (let x = p.x + 10; x < p.x + p.w - 8; x += 46) {
    ctx.fillRect(x, y0, 2, 2);
  }

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
}

function drawMissionObjects() {
  ctx.imageSmoothingEnabled = false;
  const t = player.tick;

  for (let i = 0; i < missionObjects.length; i++) {
    const m = missionObjects[i];
    const isUnlocked = i === currentMission;
    const isDone = completedMissions[i];

    // Zona “respirable” para que se note el interact
    const bounce = isUnlocked ? (Math.sin(t / 10) * 1.5) : 0;
    if (isUnlocked) {
      ctx.fillStyle = "rgba(255,77,141,0.12)";
      ctx.fillRect(m.x - 10, m.y + bounce + 24, m.w + 20, 18);
    }

    // Base (mini plataforma) bajo el poste
    ctx.fillStyle = "rgba(140,90,55,0.35)";
    ctx.fillRect(m.x - 4, m.y + m.h - 10, m.w + 8, 10);
    ctx.fillStyle = "rgba(80,210,140,0.55)";
    ctx.fillRect(m.x - 4, m.y + m.h - 10, m.w + 8, 3);

    // Poste
    const poleX = Math.round(m.x + m.w / 2);
    const baseY = m.y + m.h;
    const poleH = 72;

    ctx.fillStyle = "rgba(234,255,246,0.85)";
    ctx.fillRect(poleX, baseY - poleH, 4, poleH);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(poleX + 3, baseY - poleH, 1, poleH);

    // Bolita arriba
    ctx.fillStyle = "rgba(234,255,246,0.92)";
    ctx.fillRect(poleX - 2, baseY - poleH - 6, 8, 6);

    // Bandera (se iza al completar)
    const level = clamp(flagLevel[i], 0, 1);
    const flagY = Math.round(baseY - poleH + (1 - level) * (poleH - 18));
    const wave = (isUnlocked && !isDone) ? Math.sin((t + i * 20) / 8) * 2 : 0;

    // Color: rosa cuando está desbloqueada (o completada), gris si bloqueada
    const flagFill = (isDone || isUnlocked)
      ? "rgba(255,77,141,0.95)"
      : "rgba(234,255,246,0.35)";
    const flagEdge = (isDone || isUnlocked)
      ? "rgba(6,43,31,0.55)"
      : "rgba(0,0,0,0.25)";

    // paño pixel (triángulo/bandera)
    ctx.fillStyle = flagFill;
    ctx.fillRect(poleX + 4, flagY + wave, 18, 12);
    ctx.fillRect(poleX + 4, flagY + 12 + wave, 14, 6);
    ctx.fillStyle = "rgba(234,255,246,0.22)";
    ctx.fillRect(poleX + 6, flagY + 2 + wave, 4, 3);
    ctx.strokeStyle = flagEdge;
    ctx.strokeRect(poleX + 4 + 0.5, flagY + wave + 0.5, 18, 18);

    // Icono: 🔒 si está bloqueada, ★ si completada, ? si actual
    ctx.font = `900 14px "Press Start 2P", system-ui`;
    if (!isDone && !isUnlocked) {
      ctx.fillStyle = "rgba(234,255,246,0.55)";
      ctx.fillText("🔒", m.x + 10, m.y + 42);
    } else if (isDone) {
      ctx.fillStyle = "rgba(255,214,90,0.95)";
      ctx.fillText("★", m.x + 18, m.y + 42);
    } else {
      ctx.fillStyle = "rgba(234,255,246,0.92)";
      ctx.fillText("?", m.x + 20, m.y + 42);
    }
  }
}

// Gatita pixel
function drawCatPixel() {
  ctx.imageSmoothingEnabled = false;

  const x = cat.x;
  const y = cat.y;

  // cola
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(x - 12, y + 9, 10, 3);
  ctx.fillRect(x - 16, y + 8, 4, 3);

  // cuerpo
  ctx.fillRect(x, y + 6, 22, 10);

  // patas
  ctx.fillRect(x + 2, y + 14, 4, 4);
  ctx.fillRect(x + 16, y + 14, 4, 4);

  // cabeza
  ctx.fillRect(x + 14, y, 12, 12);

  // orejas
  ctx.fillRect(x + 14, y - 4, 4, 4);
  ctx.fillRect(x + 22, y - 4, 4, 4);

  // ojos
  ctx.fillStyle = "rgba(255,200,80,0.98)";
  ctx.fillRect(x + 17, y + 4, 3, 3);
  ctx.fillRect(x + 23, y + 4, 3, 3);

  // brillo
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(x + 18, y + 4, 1, 1);
  ctx.fillRect(x + 24, y + 4, 1, 1);
}

// =======================
// Player (más parecido al pixel chibi)
// =======================
function drawPlayerSprite() {
  // Pixel-sprite tipo Mario (pero con sus rasgos: pelo rizado, piel morenita, ojos marrones)
  // El truco: dibujamos en "unidades" (pixeles grandes) y animamos con offsets.
  const U = 3; // tamaño de pixel

  const isCrouch = player.state === "crouch";
  const isRun = player.state === "run";
  const isJump = player.state === "jump";

  // ritmo de animación
  const runFrame = isRun ? Math.floor(player.tick / 6) % 4 : 0;
  const bob = isRun ? ([0, 1, 0, -1][runFrame] || 0) : 0;
  const squat = isJump ? -1 : 0;

  // blink suave (cada ~3s)
  const blinkPhase = player.tick % 180;
  const blinking = blinkPhase <= 4;

  // caja base del sprite
  const baseW = 20;
  const baseH = isCrouch ? 24 : 30;
  const spriteW = baseW * U;
  const spriteH = baseH * U;

  const drawX = player.x + (player.w / 2) - (spriteW / 2);
  const drawY = (player.y + player.h) - spriteH + (bob + squat) * U;

  ctx.imageSmoothingEnabled = false;

  // sombra
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(drawX + 10, player.y + player.h - 6, spriteW - 20, 6);

  // helper pixel
  const px = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(drawX + x * U, drawY + y * U, w * U, h * U);
  };

  // Mirror según facing
  ctx.save();
  const centerX = drawX + spriteW / 2;
  ctx.translate(centerX, 0);
  ctx.scale(player.facing, 1);
  ctx.translate(-centerX, 0);

  // Paleta
  const HAIR = "#1a1110";
  const SKIN = "#8b5a3c";
  const JACKET = "rgba(30,22,34,0.95)";
  const SHIRT = "rgba(190,70,135,0.95)";
  const PANTS = "rgba(20,14,18,0.95)";
  const SHOE = "rgba(0,0,0,0.80)";
  const EYEW = "rgba(234,255,246,0.92)";
  const EYEB = "#3b2418";

  // ===== Pelo rizado (volumen + rizos)
  px(3, 1, 14, 7, HAIR);
  px(2, 3, 1, 4, HAIR);
  px(17, 3, 1, 4, HAIR);
  // rizos arriba
  for (let i = 0; i < 7; i++) px(3 + i * 2, 0, 1, 1, HAIR);
  // mechón bounce
  if (isRun && (runFrame === 1 || runFrame === 3)) px(6, 2, 2, 1, HAIR);

  // ===== Cara
  px(4, 6, 12, 9, SKIN);
  // nariz mini
  px(9, 10, 1, 1, "rgba(0,0,0,0.12)");

  // ojos marrones + parpadeo
  if (!blinking) {
    px(6, 9, 3, 2, EYEW);
    px(12, 9, 3, 2, EYEW);
    px(7, 10, 1, 1, EYEB);
    px(13, 10, 1, 1, EYEB);
  } else {
    // ojos cerrados (línea)
    px(6, 10, 3, 1, "rgba(0,0,0,0.35)");
    px(12, 10, 3, 1, "rgba(0,0,0,0.35)");
  }

  // ===== Cuerpo (chaqueta + camiseta)
  const bodyY = isCrouch ? 15 : 16;
  const bodyH = isCrouch ? 7 : 8;
  px(6, bodyY, 8, bodyH, JACKET);
  px(9, bodyY + 1, 2, bodyH - 2, SHIRT);

  // brazos (oscilan al correr)
  const armSwing = isRun ? ([0, 1, 0, -1][runFrame] || 0) : 0;
  px(5, bodyY + 2 + armSwing, 1, 3, SKIN);
  px(14, bodyY + 2 - armSwing, 1, 3, SKIN);

  // ===== Piernas + zapatos
  const legsY = bodyY + bodyH;
  if (isJump) {
    px(7, legsY, 3, 4, PANTS);
    px(11, legsY, 3, 4, PANTS);
    px(7, legsY + 4, 3, 1, SHOE);
    px(11, legsY + 4, 3, 1, SHOE);
  } else if (isCrouch) {
    // agachado
    px(7, legsY - 1, 6, 3, PANTS);
    px(7, legsY + 2, 3, 1, SHOE);
    px(10, legsY + 2, 3, 1, SHOE);
  } else {
    const step = isRun ? ([0, 1, 0, 1][runFrame] || 0) : 0;
    px(7, legsY, 3, 4, PANTS);
    px(11, legsY + step, 3, 4 - step, PANTS);
    px(7, legsY + 4, 3, 1, SHOE);
    px(11, legsY + 4, 3, 1, SHOE);
  }

  ctx.restore();

  // ===== Burbuja desde la cabeza
  if (player.bubbleTimer > 0) {
    const bubbleW = 184;
    const bubbleH = 56;

    const headCenterX = player.x + player.w / 2;
    const headTopY = drawY + 0;

    const bx = headCenterX - bubbleW / 2;
    const by = headTopY - 66;

    const alpha = Math.min(1, player.bubbleTimer / 18);
    drawSpeechBubble(bx, by, bubbleW, bubbleH, alpha);

    ctx.fillStyle = `rgba(6,43,31,${0.95 * alpha})`;
    ctx.font = `900 12px "Press Start 2P", system-ui`;
    ctx.fillText("TE AMO 🫣​", bx + 30, by + 34);
  }
}

function drawSpeechBubble(x, y, w, h, alpha) {
  const r = 16;
  ctx.fillStyle = `rgba(234,255,246,${0.95 * alpha})`;
  ctx.strokeStyle = `rgba(255,106,165,${0.75 * alpha})`;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // colita apuntando a la cabeza
  ctx.beginPath();
  ctx.moveTo(x + w/2 - 10, y + h);
  ctx.lineTo(x + w/2, y + h + 16);
  ctx.lineTo(x + w/2 + 10, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHUDText() {
  const done = completedMissions.filter(Boolean).length;
  ctx.fillStyle = "rgba(234,255,246,0.90)";
  ctx.font = `900 12px "Press Start 2P", system-ui`;
  ctx.fillText(`FOTOS: ${done}/4  |  OBJETIVO: COMPLETAR EN ORDEN`, 18, 28);
}

// =======================
// Monedas: recolección
// =======================
function collectCoins() {
  const ply = { x: player.x, y: player.y, w: player.w, h: player.h };
  for (const c of coins) {
    if (c.collected) continue;
    const cr = { x: c.x, y: c.y - 2, w: 12, h: 18 }; // un pelín más “generoso”
    if (rectsOverlap(ply, cr)) {
      c.collected = true;
      coinTotal += 1;
      updateCoinPill();
      saveCoinState();
    }
  }
}

// =======================
// Loop
// =======================
function loop() {
  if (!gameRunning) {
    renderFrame();
    return;
  }
  update();
  renderFrame();
  requestAnimationFrame(loop);
}

function update() {
  player.tick++;
  player.crouch = keys.s;

  // Izado suave de banderas (0 -> 1)
  for (let i = 0; i < flagLevel.length; i++) {
    const target = flagTarget[i] || 0;
    flagLevel[i] += (target - flagLevel[i]) * 0.10;
    if (Math.abs(target - flagLevel[i]) < 0.002) flagLevel[i] = target;
  }

  // Movimiento suave
  const accel = player.crouch ? 0.35 : 0.42;
  const maxSpeed = player.crouch ? 3.2 : 4.2;

  if (!overlayOpen) {
    if (keys.a) player.vx -= accel;
    if (keys.d) player.vx += accel;
  }

  // facing (solo si te mueves un poquito)
  if (Math.abs(player.vx) > 0.25) player.facing = player.vx > 0 ? 1 : -1;
  player.vx = clamp(player.vx, -maxSpeed, maxSpeed);
  player.vx *= WORLD.friction;

  // coyote time
  if (player.onGround) player.coyote = 8;
  else player.coyote = Math.max(0, player.coyote - 1);

  // jump buffer
  if (jumpPressed) {
    player.jumpBuffer = 8;
    jumpPressed = false;
  } else {
    player.jumpBuffer = Math.max(0, player.jumpBuffer - 1);
  }

  // salto
  const canJump = player.coyote > 0;
  if (!overlayOpen && player.jumpBuffer > 0 && canJump) {
    player.vy = -11.3;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;

    // burbuja más tiempo
    player.bubbleTimer = 120;
  }

  if (player.bubbleTimer > 0) player.bubbleTimer--;

  // gravedad
  player.vy += WORLD.gravity;

  // aplicar vel
  player.x += player.vx;
  player.y += player.vy;

  resolvePlatformCollisions();

  // estado anim (después de colisiones)
  if (player.crouch && player.onGround) player.state = "crouch";
  else if (!player.onGround) player.state = "jump";
  else if (Math.abs(player.vx) > 0.55) player.state = "run";
  else player.state = "idle";

  // Cat follow pegado al suelo (base alineada con player)
  const targetX = player.x - 34;
  const targetFloorY = player.y + player.h;
  const targetY = targetFloorY - cat.h;

  cat.vx += (targetX - cat.x) * 0.030;
  cat.vy += (targetY - cat.y) * 0.030;
  cat.vx *= 0.84;
  cat.vy *= 0.84;
  cat.x += cat.vx;
  cat.y += cat.vy;

  collectCoins();

  // hint interact
  if (currentMission < missionObjects.length) {
    const obj = missionObjects[currentMission];
    const interactZone = { x: obj.x - 22, y: obj.y - 22, w: obj.w + 44, h: obj.h + 44 };
    const ply = { x: player.x, y: player.y, w: player.w, h: player.h };

    if (!overlayOpen && rectsOverlap(ply, interactZone)) {
      showHudHint(`Pulsa E para abrir ${MISSIONS[currentMission].title}`);
    } else {
      hideHudHint();
    }
  } else {
    hideHudHint();
  }

  // interact E
  if (!overlayOpen && interactPressed) {
    interactPressed = false;
    if (currentMission < missionObjects.length) tryInteract();
  } else if (interactPressed) {
    interactPressed = false;
  }

  // safety
  if (player.y > WORLD.h) {
    player.x = checkpoint.x;
    player.y = checkpoint.y;
    player.vx = 0;
    player.vy = 0;
  }
}

function renderFrame() {
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  drawBackground();
  drawDecorations();
  drawPlatforms();
  drawMissionObjects();
  drawCatPixel();
  drawPlayerSprite();
  drawHUDText();
}
