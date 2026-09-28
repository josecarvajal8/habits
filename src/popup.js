const RING_C = 433.54;
const SNOOZE_MINUTES = 10;

const pill = document.getElementById('state-pill');
const card = document.getElementById('status-card');
const ring = document.getElementById('ring');
const arc = document.getElementById('ring-arc');
const countdown = document.getElementById('countdown');
const countdownSub = document.getElementById('countdown-sub');
const nextLine = document.getElementById('next-line');
const primary = document.getElementById('primary-action');

let view = null;
let timer = null;

function formatCountdown(ms) {
  if (ms == null || ms < 0) return '--:--';
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function setPill(text, cls) {
  pill.textContent = text;
  pill.className = `ss-pill ${cls}`;
}

function setCardWash(cls) {
  card.classList.remove('is-stand', 'is-sit');
  if (cls) card.classList.add(cls);
}

function setArc(cls, progress) {
  arc.setAttribute('class', cls);
  arc.setAttribute('stroke-dashoffset', String(RING_C * (1 - progress)));
  ring.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
}

function setPrimary(label, cls, message) {
  primary.hidden = !label;
  if (!label) return;
  primary.textContent = label;
  primary.className = `ss-btn ss-btn-block ${cls}`;
  primary.onclick = async () => {
    primary.disabled = true;
    try {
      await chrome.runtime.sendMessage({ type: message });
    } catch {
      // Popup stays usable; status refreshes from storage events.
    } finally {
      primary.disabled = false;
    }
    render();
  };
}

function startLabel(mode) {
  return mode === 'standing-desk' ? 'Start standing now' : 'Start break now';
}

async function computeView() {
  const settings = await HabitsSettings.load();
  const stored = await chrome.storage.local.get('cycle');
  const cycle = stored.cycle || { phase: 'working', nextAt: null, mode: null };

  if (settings.activeDays.length === 0) {
    return { kind: 'paused', nextAt: null };
  }
  if (cycle.phase === 'paused') {
    return { kind: 'paused', nextAt: cycle.nextAt };
  }
  if (cycle.phase === 'awaiting') {
    return { kind: 'awaiting', mode: cycle.mode || settings.activityMode };
  }
  if (cycle.phase === 'activity') {
    const mode = cycle.mode || settings.activityMode;
    const total = settings.activityDurationMinutes * 60000;
    return { kind: 'activity', mode, total, nextAt: cycle.nextAt };
  }
  if (cycle.phase === 'snoozed') {
    return {
      kind: 'snoozed',
      mode: settings.activityMode,
      total: SNOOZE_MINUTES * 60000,
      nextAt: cycle.nextAt,
    };
  }
  return {
    kind: 'working',
    mode: settings.activityMode,
    total: settings.intervalMinutes * 60000,
    nextAt: cycle.nextAt,
  };
}

function paintStatic() {
  if (!view) return;
  if (view.kind === 'paused') {
    setPill('Paused', 'ss-pill-paused');
    setCardWash(null);
    setArc('ss-ring-paused', 0);
    countdownSub.textContent = 'paused';
    nextLine.innerHTML = view.nextAt
      ? `Paused until <b>${formatTime(view.nextAt)}</b>`
      : 'Set active days in <b>Settings</b>';
    setPrimary(null);
    return;
  }
  if (view.kind === 'awaiting') {
    setPill('Time to move', 'ss-pill-stand');
    setCardWash('is-stand');
    setArc('ss-ring-stand', 1);
    countdown.textContent = 'NOW';
    countdownSub.textContent = 'due';
    nextLine.innerHTML = `Next: <b>${view.mode === 'standing-desk' ? 'start standing' : 'start your break'}</b>`;
    setPrimary(startLabel(view.mode), 'ss-btn-stand', 'start-now');
    return;
  }
  if (view.kind === 'activity') {
    const standing = view.mode === 'standing-desk';
    setPill(standing ? 'Standing' : 'Stretching', 'ss-pill-stand');
    setCardWash('is-stand');
    setArc('ss-ring-stand', 0);
    countdownSub.textContent = 'left';
    nextLine.innerHTML = `Next: <b>${standing ? 'sit' : 'back to work'} at ${formatTime(view.nextAt)}</b>`;
    setPrimary(
      standing ? 'Sit now' : 'End break',
      'ss-btn-sit',
      'end-now',
    );
    return;
  }
  // working or snoozed
  const snoozed = view.kind === 'snoozed';
  setPill(snoozed ? 'Snoozed' : 'Working', snoozed ? 'ss-pill-paused' : 'ss-pill-sit');
  setCardWash(snoozed ? null : 'is-sit');
  setArc(snoozed ? 'ss-ring-paused' : 'ss-ring-sit', 0);
  countdownSub.textContent = 'left';
  const what = snoozed
    ? 'reminder'
    : view.mode === 'standing-desk'
      ? 'stand'
      : 'break';
  nextLine.innerHTML = view.nextAt
    ? `Next: <b>${what} at ${formatTime(view.nextAt)}</b>`
    : `Next: <b>${what}</b>`;
  setPrimary(startLabel(view.mode), 'ss-btn-stand', 'start-now');
}

function tick() {
  if (!view || view.kind === 'paused' || view.kind === 'awaiting') return;
  const remaining = view.nextAt - Date.now();
  countdown.textContent = formatCountdown(remaining);
  const progress = Math.min(1, Math.max(0, 1 - remaining / view.total));
  setArc(
    view.kind === 'activity'
      ? 'ss-ring-stand'
      : view.kind === 'snoozed'
        ? 'ss-ring-paused'
        : 'ss-ring-sit',
    progress,
  );
}

async function render() {
  try {
    view = await computeView();
  } catch {
    view = { kind: 'paused' };
  }
  paintStatic();
  tick();
}

document.getElementById('open-settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

chrome.storage.onChanged.addListener(() => {
  render();
});

render();
timer = setInterval(tick, 1000);
