importScripts('settings.js');

const REMINDER_ID = 'stand-reminder';
const COMPLETE_ID = 'stand-complete';

const ALARM_WORK = 'work';
const ALARM_SNOOZE = 'snooze';
const ALARM_ACTIVITY = 'activity';
const ALARM_WAKEUP = 'wakeup';

const SNOOZE_MINUTES = 10;
const ACTIVITY_MINUTES = {
  'stretch-break': 5,
  'standing-desk': 10,
};

const START_LABELS = {
  'stretch-break': 'Start break',
  'standing-desk': 'Start standing',
};

const REMINDER_MESSAGES = {
  'stretch-break': 'Stand up, move, and stretch for 5 minutes.',
  'standing-desk': 'Raise your desk and work standing for 10 minutes.',
};

const COMPLETE_MESSAGES = {
  'stretch-break': 'Break complete. Back to work.',
  'standing-desk': 'You can sit down. Back to work.',
};

function activityMinutes(mode) {
  return (
    ACTIVITY_MINUTES[mode] ||
    ACTIVITY_MINUTES[HabitsSettings.DEFAULTS.activityMode]
  );
}

async function getCycle() {
  const stored = await chrome.storage.local.get('cycle');
  return stored.cycle || { phase: 'working', nextAt: null, mode: null };
}

async function setCycle(cycle) {
  await chrome.storage.local.set({ cycle });
}

async function clearAllAlarms() {
  await chrome.alarms.clear(ALARM_WORK);
  await chrome.alarms.clear(ALARM_SNOOZE);
  await chrome.alarms.clear(ALARM_ACTIVITY);
  await chrome.alarms.clear(ALARM_WAKEUP);
}

async function scheduleWork(settings) {
  await clearAllAlarms();
  await chrome.alarms.create(ALARM_WORK, {
    delayInMinutes: settings.intervalMinutes,
  });
  await setCycle({
    phase: 'working',
    nextAt: Date.now() + settings.intervalMinutes * 60000,
    mode: null,
  });
}

async function scheduleSnooze() {
  await clearAllAlarms();
  await chrome.alarms.create(ALARM_SNOOZE, {
    delayInMinutes: SNOOZE_MINUTES,
  });
  await setCycle({
    phase: 'snoozed',
    nextAt: Date.now() + SNOOZE_MINUTES * 60000,
    mode: null,
  });
}

async function startActivity(settings) {
  const minutes = activityMinutes(settings.activityMode);
  await clearAllAlarms();
  await chrome.alarms.create(ALARM_ACTIVITY, { delayInMinutes: minutes });
  await setCycle({
    phase: 'activity',
    nextAt: Date.now() + minutes * 60000,
    mode: settings.activityMode,
  });
}

function isActiveDay(settings) {
  return HabitsSettings.isActiveNow(settings);
}

// Outside active days/hours: sleep until the next window opens (or fall
// back to a fresh work interval when no resume time applies).
async function scheduleWakeupOrWork(settings) {
  const resume = HabitsSettings.nextResumeTime(settings);
  if (resume == null) {
    await scheduleWork(settings);
    return;
  }
  await clearAllAlarms();
  await chrome.alarms.create(ALARM_WAKEUP, {
    delayInMinutes: Math.max(
      1,
      Math.ceil((resume - Date.now()) / 60000),
    ),
  });
  await setCycle({ phase: 'paused', nextAt: resume, mode: null });
}

// (Re)enter the cycle: fresh work interval when active, otherwise park.
async function enterWindow(settings) {
  if (HabitsSettings.isActiveNow(settings)) {
    await scheduleWork(settings);
  } else {
    await scheduleWakeupOrWork(settings);
  }
}

async function setBadge(on) {
  await chrome.action.setBadgeText({ text: on ? '!' : '' });
  if (on) {
    await chrome.action.setBadgeBackgroundColor({ color: '#0d9488' });
  }
}

// Work/snooze timer fired: notify when active, otherwise park until resume.
async function fireReminder() {
  const settings = await HabitsSettings.load();
  if (!isActiveDay(settings)) {
    await scheduleWakeupOrWork(settings);
    return;
  }
  const mode = settings.activityMode;
  await chrome.notifications.create(REMINDER_ID, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
    title: 'Time to stand',
    message: REMINDER_MESSAGES[mode],
    buttons: [{ title: START_LABELS[mode] }, { title: 'Snooze 10 min' }],
    requireInteraction: true,
  });
  await setBadge(true);
  await setCycle({ phase: 'awaiting', nextAt: null, mode });
}

// Activity timer fired: notify completion, then auto-restart the cycle
// (or park if the window has closed meanwhile).
async function fireCompletion() {
  const settings = await HabitsSettings.load();
  const mode = settings.activityMode;
  await enterWindow(settings);
  await chrome.notifications.create(COMPLETE_ID, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
    title: 'Stand Reminder',
    message: COMPLETE_MESSAGES[mode],
    requireInteraction: true,
  });
  await setBadge(true);
}

chrome.runtime.onInstalled.addListener(() => {
  HabitsSettings.load().then(enterWindow).catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  HabitsSettings.load().then(enterWindow).catch(() => {});
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (
    'activeDays' in changes ||
    'intervalMinutes' in changes ||
    'activityMode' in changes ||
    'workHours' in changes
  ) {
    HabitsSettings.load().then(enterWindow).catch(() => {});
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_WORK || alarm.name === ALARM_SNOOZE) {
    fireReminder().catch(() => {});
  } else if (alarm.name === ALARM_ACTIVITY) {
    fireCompletion().catch(() => {});
  } else if (alarm.name === ALARM_WAKEUP) {
    // Window opened: begin a full fresh interval inside it.
    HabitsSettings.load().then(enterWindow).catch(() => {});
  }
});

chrome.notifications.onButtonClicked.addListener((id, index) => {
  if (id !== REMINDER_ID) return;
  HabitsSettings.load()
    .then(async (settings) => {
      await chrome.notifications.clear(REMINDER_ID);
      if (index === 0) {
        await startActivity(settings);
      } else {
        await scheduleSnooze();
      }
      await setBadge(false);
    })
    .catch(() => {});
});

// Clicking the notification body = ignore: fresh work interval.
chrome.notifications.onClicked.addListener((id) => {
  (async () => {
    if (id === REMINDER_ID) {
      const settings = await HabitsSettings.load();
      await chrome.notifications.clear(REMINDER_ID);
      await enterWindow(settings);
      await setBadge(false);
    } else if (id === COMPLETE_ID) {
      await setBadge(false);
    }
  })().catch(() => {});
});

// Closing without a button = ignore. Programmatic clears report
// byUser === false, so only explicit dismissal restarts the cycle.
chrome.notifications.onClosed.addListener((id, byUser) => {
  if (!byUser) return;
  (async () => {
    if (id === REMINDER_ID) {
      const settings = await HabitsSettings.load();
      await enterWindow(settings);
    }
    await setBadge(false);
  })().catch(() => {});
});

// Popup actions: run one immediate real cycle for testing, start the
// activity right away, or end it early (completion + auto-restart).
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'test-reminder') {
    fireReminder().then(
      () => sendResponse({ ok: true }),
      () => sendResponse({ ok: false }),
    );
    return true;
  }
  if (message && message.type === 'start-now') {
    HabitsSettings.load().then(
      async (settings) => {
        await chrome.notifications.clear(REMINDER_ID);
        await startActivity(settings);
        await setBadge(false);
        sendResponse({ ok: true });
      },
      () => sendResponse({ ok: false }),
    );
    return true;
  }
  if (message && message.type === 'end-now') {
    fireCompletion().then(
      () => sendResponse({ ok: true }),
      () => sendResponse({ ok: false }),
    );
    return true;
  }
  return false;
});
