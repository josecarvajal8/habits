const TEST_NOTIFICATION_ID = 'stand-reminder-test';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'test-reminder') {
    showTestReminder().then(
      () => sendResponse({ ok: true }),
      () => sendResponse({ ok: false }),
    );
    return true;
  }
  return false;
});

async function showTestReminder() {
  await chrome.notifications.create(TEST_NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title: 'Time to stand',
    message: 'You have been sitting for a while. Stand up and stretch.',
  });
  await chrome.action.setBadgeText({ text: '!' });
  await chrome.action.setBadgeBackgroundColor({ color: '#0d9488' });
}

async function clearBadge(notificationId) {
  if (notificationId === TEST_NOTIFICATION_ID) {
    await chrome.action.setBadgeText({ text: '' });
  }
}

chrome.notifications.onClicked.addListener((notificationId) => {
  clearBadge(notificationId).catch(() => {});
});

chrome.notifications.onClosed.addListener((notificationId) => {
  clearBadge(notificationId).catch(() => {});
});
