document.getElementById('test-reminder').addEventListener('click', async () => {
  const status = document.getElementById('status');
  try {
    await chrome.runtime.sendMessage({ type: 'test-reminder' });
    status.textContent = 'Reminder sent.';
  } catch {
    status.textContent = 'Could not send reminder.';
  }
});
