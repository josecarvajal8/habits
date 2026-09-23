const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const daysEl = document.getElementById('days');
const intervalsEl = document.getElementById('intervals');
const saveButton = document.getElementById('save');
const statusEl = document.getElementById('status');

HabitsSettings.DAYS.forEach((day) => {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = String(day);
  label.append(input, ` ${DAY_NAMES[day]}`);
  daysEl.append(label);
});

HabitsSettings.INTERVALS.forEach((minutes) => {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'intervalMinutes';
  input.value = String(minutes);
  label.append(input, ` ${minutes} min`);
  intervalsEl.append(label);
});

async function render() {
  const settings = await HabitsSettings.load();
  daysEl.querySelectorAll('input').forEach((input) => {
    input.checked = settings.activeDays.includes(Number(input.value));
  });
  intervalsEl.querySelectorAll('input').forEach((input) => {
    input.checked = settings.intervalMinutes === Number(input.value);
  });
  document
    .querySelectorAll('input[name="activityMode"]')
    .forEach((input) => {
      input.checked = settings.activityMode === input.value;
    });
}

saveButton.addEventListener('click', async () => {
  const activeDays = Array.from(daysEl.querySelectorAll('input:checked')).map(
    (input) => Number(input.value),
  );
  const intervalInput = intervalsEl.querySelector('input:checked');
  const modeInput = document.querySelector(
    'input[name="activityMode"]:checked',
  );
  try {
    await HabitsSettings.save({
      activeDays,
      intervalMinutes: intervalInput ? Number(intervalInput.value) : undefined,
      activityMode: modeInput ? modeInput.value : undefined,
    });
    statusEl.textContent = 'Settings saved.';
  } catch {
    statusEl.textContent = 'Could not save settings.';
  }
});

render().catch(() => {
  statusEl.textContent = 'Could not load settings.';
});
