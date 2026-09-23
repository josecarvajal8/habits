/* Shared settings for the Stand Reminder extension.
 * Classic script (not a module) so it loads in pages via <script>
 * and in the service worker via importScripts().
 */
var HabitsSettings = (function () {
  var DEFAULTS = {
    activeDays: [1, 2, 3, 4, 5],
    intervalMinutes: 45,
    activityMode: 'stretch-break',
  };

  var INTERVALS = [30, 45, 60, 90];
  var MODES = ['stretch-break', 'standing-desk'];
  // 0 = Sunday ... 6 = Saturday (matches Date#getDay)
  var DAYS = [0, 1, 2, 3, 4, 5, 6];

  function sanitize(stored) {
    var settings = {
      activeDays: DEFAULTS.activeDays.slice(),
      intervalMinutes: DEFAULTS.intervalMinutes,
      activityMode: DEFAULTS.activityMode,
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
    ]);
    return sanitize(stored);
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
  };
})();
