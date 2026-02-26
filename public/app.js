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

/* ── Event listeners ── */
newGameBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', resetGame);

/* ── Bootstrap ── */
startNewGame();
