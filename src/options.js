const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const daysEl = document.getElementById('days');
const intervalsEl = document.getElementById('intervals');
const statusEl = document.getElementById('status');
const whEnabled = document.getElementById('wh-enabled');
const whStart = document.getElementById('wh-start');
const whEnd = document.getElementById('wh-end');
const whHint = document.getElementById('wh-hint');
let savedTimer = null;

function flashSaved() {
  statusEl.textContent = 'Saved';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    statusEl.textContent = '';
  }, 1500);
}

async function collect() {
  return {
    activeDays: Array.from(
      daysEl.querySelectorAll('[aria-pressed="true"]'),
    ).map((b) => Number(b.dataset.value)),
    intervalMinutes: Number(
      intervalsEl.querySelector('[aria-pressed="true"]').dataset.value,
    ),
    activityMode: document.querySelector('input[name="activityMode"]:checked')
      .value,
    workHours: {
      enabled: whEnabled.getAttribute('aria-checked') === 'true',
      start: whStart.value,
      end: whEnd.value,
    },
  };
}

async function persist() {
  try {
    await HabitsSettings.save(await collect());
    flashSaved();
  } catch {
    statusEl.textContent = 'Could not save settings.';
  }
}

HabitsSettings.DAYS.forEach((day) => {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'ss-chip';
  chip.dataset.value = String(day);
  chip.textContent = DAY_NAMES[day];
  chip.setAttribute('aria-pressed', 'false');
  chip.addEventListener('click', async () => {
    chip.setAttribute(
      'aria-pressed',
      chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true',
    );
    await persist();
  });
  daysEl.append(chip);
});

HabitsSettings.INTERVALS.forEach((minutes) => {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'ss-chip';
  chip.dataset.value = String(minutes);
  chip.textContent = `${minutes} min`;
  chip.setAttribute('aria-pressed', 'false');
  chip.addEventListener('click', async () => {
    intervalsEl
      .querySelectorAll('.ss-chip')
      .forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    await persist();
  });
  intervalsEl.append(chip);
});

document.querySelectorAll('input[name="activityMode"]').forEach((input) => {
  input.addEventListener('change', persist);
});

whEnabled.addEventListener('click', async () => {
  whEnabled.setAttribute(
    'aria-checked',
    whEnabled.getAttribute('aria-checked') === 'true' ? 'false' : 'true',
  );
  await persist();
});

[whStart, whEnd].forEach((input) => {
  input.addEventListener('change', async () => {
    if (whStart.value && whEnd.value && whStart.value >= whEnd.value) {
      whHint.textContent = 'Start must be before end.';
      whHint.classList.add('is-error');
      return;
    }
    whHint.textContent = 'Local time, same day';
    whHint.classList.remove('is-error');
    await persist();
  });
});

async function render() {
  const settings = await HabitsSettings.load();
  daysEl.querySelectorAll('.ss-chip').forEach((chip) => {
    chip.setAttribute(
      'aria-pressed',
      String(settings.activeDays.includes(Number(chip.dataset.value))),
    );
  });
  intervalsEl.querySelectorAll('.ss-chip').forEach((chip) => {
    chip.setAttribute(
      'aria-pressed',
      String(settings.intervalMinutes === Number(chip.dataset.value)),
    );
  });
  document
    .querySelectorAll('input[name="activityMode"]')
    .forEach((input) => {
      input.checked = settings.activityMode === input.value;
    });
  whEnabled.setAttribute(
    'aria-checked',
    String(settings.workHours.enabled),
  );
  whStart.value = settings.workHours.start;
  whEnd.value = settings.workHours.end;
}

render().catch(() => {
  statusEl.textContent = 'Could not load settings.';
});
