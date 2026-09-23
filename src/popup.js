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

async function renderSummary() {
  const summary = document.getElementById('summary');
  try {
    summary.textContent = summarize(await HabitsSettings.load());
  } catch {
    summary.textContent = 'Could not load settings.';
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
});

document.getElementById('open-settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

renderSummary();
