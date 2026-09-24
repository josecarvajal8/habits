/* Shared settings for the Stand Reminder extension.
 * Classic script (not a module) so it loads in pages via <script>
 * and in the service worker via importScripts().
 */
var HabitsSettings = (function () {
  var DEFAULTS = {
    activeDays: [1, 2, 3, 4, 5],
    intervalMinutes: 45,
    activityMode: 'stretch-break',
    workHours: { enabled: false, start: '09:00', end: '17:00' },
  };

  var INTERVALS = [30, 45, 60, 90];
  var MODES = ['stretch-break', 'standing-desk'];
  // 0 = Sunday ... 6 = Saturday (matches Date#getDay)
  var DAYS = [0, 1, 2, 3, 4, 5, 6];

  function sanitizeTime(value, fallback) {
    if (typeof value !== 'string') return fallback;
    var m = /^(\d{2}):(\d{2})$/.exec(value);
    if (!m) return fallback;
    var h = Number(m[1]);
    var min = Number(m[2]);
    if (h > 23 || min > 59) return fallback;
    return value;
  }

  function sanitizeWorkHours(stored) {
    var fallback = DEFAULTS.workHours;
    if (!stored || typeof stored !== 'object') {
      return { enabled: fallback.enabled, start: fallback.start, end: fallback.end };
    }
    var start = sanitizeTime(stored.start, fallback.start);
    var end = sanitizeTime(stored.end, fallback.end);
    if (start >= end) {
      return { enabled: fallback.enabled, start: fallback.start, end: fallback.end };
    }
    return {
      enabled: stored.enabled === true,
      start: start,
      end: end,
    };
  }

  function sanitize(stored) {
    var settings = {
      activeDays: DEFAULTS.activeDays.slice(),
      intervalMinutes: DEFAULTS.intervalMinutes,
      activityMode: DEFAULTS.activityMode,
      workHours: sanitizeWorkHours(stored && stored.workHours),
    };
    if (!stored) return settings;
    if (Array.isArray(stored.activeDays)) {
      settings.activeDays = stored.activeDays.filter(function (d) {
        return DAYS.indexOf(d) !== -1;
      });
    }
    if (INTERVALS.indexOf(stored.intervalMinutes) !== -1) {
      settings.intervalMinutes = stored.intervalMinutes;
    }
    if (MODES.indexOf(stored.activityMode) !== -1) {
      settings.activityMode = stored.activityMode;
    }
    return settings;
  }

  async function load() {
    var stored = await chrome.storage.local.get([
      'activeDays',
      'intervalMinutes',
      'activityMode',
      'workHours',
    ]);
    return sanitize(stored);
  }

  function toMinutes(hhmm) {
    var parts = hhmm.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function minutesOf(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  // True when reminders may fire at `date` (defaults to now).
  function isActiveNow(settings, date) {
    var at = date || new Date();
    if (settings.activeDays.indexOf(at.getDay()) === -1) return false;
    if (!settings.workHours.enabled) return true;
    var now = minutesOf(at);
    return (
      now >= toMinutes(settings.workHours.start) &&
      now < toMinutes(settings.workHours.end)
    );
  }

  // Next timestamp (ms) at which reminders resume, or null when active
  // now / when no resume time applies (hours disabled). Same-day windows only.
  function nextResumeTime(settings, nowMs) {
    var now = new Date(nowMs === undefined ? Date.now() : nowMs);
    if (settings.activeDays.length === 0) return null;
    if (isActiveNow(settings, now)) return null;
    if (!settings.workHours.enabled) return null;
    var startMin = toMinutes(settings.workHours.start);
    for (var d = 0; d < 8; d++) {
      var day = new Date(now.getTime());
      day.setDate(now.getDate() + d);
      if (settings.activeDays.indexOf(day.getDay()) === -1) continue;
      var resume = new Date(day.getTime());
      resume.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
      if (resume.getTime() > now.getTime()) return resume.getTime();
    }
    return null;
  }

  async function save(patch) {
    await chrome.storage.local.set(sanitize(patch));
  }

  return {
    DEFAULTS: DEFAULTS,
    INTERVALS: INTERVALS,
    MODES: MODES,
    DAYS: DAYS,
    load: load,
    save: save,
    isActiveNow: isActiveNow,
    nextResumeTime: nextResumeTime,
  };
})();
