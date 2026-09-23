const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MODE_NAMES = {
  'stretch-break': 'Stretch break',
  'standing-desk': 'Standing desk',
};

function summarize(settings) {
  const days = settings.activeDays
    .slice()
    .sort()
    .map((d) => DAY_NAMES[d])
    .join(', ');
  const mode = MODE_NAMES[settings.activityMode] || settings.activityMode;
  return `${days || 'No days'} · every ${settings.intervalMinutes} min · ${mode}`;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function describeCycle(settings, cycle) {
  if (settings.activeDays.length === 0) {
    return 'Paused — no active days.';
  }
  switch (cycle.phase) {
    case 'awaiting':
      return 'Reminder awaiting action.';
    case 'snoozed':
      return `Snoozed — reminder at ${formatTime(cycle.nextAt)}.`;
    case 'activity':
      return cycle.mode === 'standing-desk'
        ? `Standing until ${formatTime(cycle.nextAt)}.`
        : `Stretching until ${formatTime(cycle.nextAt)}.`;
    default:
      return `Working — next reminder at ${formatTime(cycle.nextAt)}.`;
  }
}

async function render() {
  const summaryEl = document.getElementById('summary');
  const statusEl = document.getElementById('cycle-status');
  try {
    const settings = await HabitsSettings.load();
    const stored = await chrome.storage.local.get('cycle');
    summaryEl.textContent = summarize(settings);
    statusEl.textContent = describeCycle(
      settings,
      stored.cycle || { phase: 'working', nextAt: null, mode: null },
    );
  } catch {
    summaryEl.textContent = 'Could not load settings.';
    statusEl.textContent = '';
  }
}

document.getElementById('test-reminder').addEventListener('click', async () => {
  const status = document.getElementById('status');
  try {
    await chrome.runtime.sendMessage({ type: 'test-reminder' });
    status.textContent = 'Reminder sent.';
  } catch {
    status.textContent = 'Could not send reminder.';
  }
  render();
});

document.getElementById('open-settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

chrome.storage.onChanged.addListener(() => {
  render();
});

render();
