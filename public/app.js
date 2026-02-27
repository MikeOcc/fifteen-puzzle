/* ── State ── */
let sessionId = null;
let startTime = null;
let timerInterval = null;

/* ── DOM refs ── */
const boardEl     = document.getElementById('board');
const moveCountEl = document.getElementById('move-count');
const timerEl     = document.getElementById('timer');
const solvedMsgEl = document.getElementById('solved-msg');
const finishStats = document.getElementById('finish-stats');
const newGameBtn  = document.getElementById('new-game');
const resetBtn    = document.getElementById('reset');

/* ── API helpers ── */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/* ── Game actions ── */
async function startNewGame() {
  clearInterval(timerInterval);
  solvedMsgEl.classList.add('hidden');
  disableButtons(true);

  try {
    const data = await apiFetch('/api/session', { method: 'POST' });
    sessionId = data.id;
    startTime = new Date(data.startedAt);
    renderBoard(data.tiles, data.moveCount);
    startTimer();
  } catch (e) {
    alert('Could not start a new game: ' + e.message);
  } finally {
    disableButtons(false);
  }
}

async function resetGame() {
  if (!sessionId) return;
  clearInterval(timerInterval);
  solvedMsgEl.classList.add('hidden');
  disableButtons(true);

  try {
    const data = await apiFetch(`/api/session/${sessionId}/reset`, { method: 'POST' });
    startTime = new Date(data.startedAt);
    renderBoard(data.tiles, data.moveCount);
    startTimer();
  } catch (e) {
    alert('Could not reset: ' + e.message);
  } finally {
    disableButtons(false);
  }
}

async function makeMove(tileIndex) {
  if (!sessionId) return;

  try {
    const data = await apiFetch(`/api/session/${sessionId}/move`, {
      method: 'POST',
      body: JSON.stringify({ tileIndex }),
    });

    if (!data.valid) return;

    renderBoard(data.tiles, data.moveCount);

    if (data.finishedAt) {
      clearInterval(timerInterval);
      const elapsed = Math.round((new Date(data.finishedAt) - startTime) / 1000);
      finishStats.textContent = `Solved in ${data.moveCount} moves and ${elapsed}s`;
      solvedMsgEl.classList.remove('hidden');
      launchFireworks();
    }
  } catch (e) {
    // Ignore invalid-move rejections silently; show other errors
    if (!e.message.includes('Invalid move') && !e.message.includes('already finished')) {
      console.error(e);
    }
  }
}

/* ── Rendering ── */
function renderBoard(tiles, moveCount) {
  boardEl.innerHTML = '';
  moveCountEl.textContent = `Moves: ${moveCount}`;

  tiles.forEach((tile, index) => {
    const cell = document.createElement('div');
    cell.className = 'tile' + (tile === 0 ? ' blank' : '');

    if (tile !== 0) {
      cell.textContent = tile;
      cell.addEventListener('click', () => makeMove(index));
    }

    boardEl.appendChild(cell);
  });
}

function startTimer() {
  timerEl.textContent = 'Time: 0s';
  timerInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    timerEl.textContent = `Time: ${elapsed}s`;
  }, 1000);
}

function disableButtons(disabled) {
  newGameBtn.disabled = disabled;
  resetBtn.disabled = disabled;
}

/* ── Fireworks ── */
function launchFireworks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fireworks-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const rockets = [];
  const colors = ['#e94560', '#ffd60a', '#00b4d8', '#90e0ef', '#f7c59f', '#ff6b6b', '#4ecdc4', '#a8e6cf', '#ffaaa5', '#c084fc', '#fff'];

  function createBurst(x, y) {
    const count = 100 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 1.5 + Math.random() * 2.5,
        streak: false,
      });
    }
    // Bright streak sparks
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: '#fff',
        radius: 1,
        streak: true,
      });
    }
  }

  function spawnRocket(xFrac) {
    rockets.push({
      x: window.innerWidth * xFrac,
      y: window.innerHeight + 10,
      vy: -(13 + Math.random() * 5),
      targetY: window.innerHeight * (0.12 + Math.random() * 0.38),
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  // Seven waves spread over ~7 s
  const waves = [
    [0,    [0.25, 0.5,  0.75]],
    [700,  [0.15, 0.42, 0.58, 0.85]],
    [1600, [0.3,  0.5,  0.7]],
    [2700, [0.2,  0.45, 0.55, 0.8]],
    [3900, [0.35, 0.5,  0.65]],
    [5200, [0.22, 0.5,  0.78]],
    [6600, [0.38, 0.5,  0.62]],
  ];
  waves.forEach(([delay, fracs]) => {
    setTimeout(() => fracs.forEach(spawnRocket), delay);
  });

  let frame;
  const start = Date.now();
  const DURATION = 7000;

  function animate() {
    // Fade trail instead of hard clear
    ctx.fillStyle = 'rgba(26, 26, 46, 0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y  += r.vy;
      r.vy *= 0.985;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      if (r.y <= r.targetY) {
        createBurst(r.x, r.y);
        rockets.splice(i, 1);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.07;
      p.vx *= 0.99;
      p.alpha -= 0.010;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.alpha;
      if (p.streak) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (Date.now() - start < DURATION || particles.length > 0 || rockets.length > 0) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();

  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, DURATION + 3000);
}

/* ── Event listeners ── */
newGameBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', resetGame);

/* ── Bootstrap ── */
startNewGame();
