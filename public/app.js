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
  const colors = ['#e94560', '#ffd60a', '#00b4d8', '#90e0ef', '#f7c59f', '#fff'];

  function createBurst(x, y) {
    for (let i = 0; i < 70; i++) {
      const angle = (i / 70) * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 2 + Math.random() * 2,
      });
    }
  }

  const positions = [
    [0.25, 0.35], [0.5, 0.22], [0.75, 0.35], [0.38, 0.55], [0.62, 0.48],
  ].map(([rx, ry]) => [window.innerWidth * rx, window.innerHeight * ry]);

  let idx = 0;
  function fireBurst() {
    createBurst(positions[idx][0], positions[idx][1]);
    idx++;
    if (idx < positions.length) setTimeout(fireBurst, 350);
  }
  fireBurst();

  let frame;
  const start = Date.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.09;
      p.alpha -= 0.013;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (Date.now() - start < 4500 || particles.length > 0) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();

  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 6000);
}

/* ── Event listeners ── */
newGameBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', resetGame);

/* ── Bootstrap ── */
startNewGame();
