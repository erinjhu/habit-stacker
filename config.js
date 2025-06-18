// --- Domain Input Logic ---

// Save domain to chrome.storage.sync
function saveDomain() {
  const input = document.getElementById('domainInput');
  const domain = input.value.trim();
  if (!domain) return;
  chrome.storage.sync.get({ domains: [] }, (data) => {
    const domains = data.domains || [];
    if (!domains.includes(domain)) {
      domains.push(domain);
      chrome.storage.sync.set({ domains }, () => {
        input.value = '';
        loadDomainList();
      });
    } else {
      input.value = '';
    }
  });
}

// Load and display saved domains
function loadDomainList() {
  chrome.storage.sync.get({ domains: [] }, (data) => {
    const list = document.getElementById('domainList');
    if (!list) return;
    list.innerHTML = '';
    (data.domains || []).forEach(domain => {
      const li = document.createElement('li');
      li.textContent = domain;
      list.appendChild(li);
    });
  });
}

document.getElementById('save').onclick = saveDomain;
document.getElementById('domainInput')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveDomain();
});

document.addEventListener('DOMContentLoaded', loadDomainList);
// For direct open (not as popup), also load on script run
loadDomainList();

// --- Habit Stacker Advanced Logic ---
let calendarMonth = (new Date()).getMonth();
let calendarYear = (new Date()).getFullYear();

// Populate dropdowns for timer and frequency
function populateDropdown(id, max, defaultValue) {
  const sel = document.getElementById(id);
  sel.innerHTML = '';
  for (let i = 0; i <= max; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i.toString().padStart(2, '0');
    if (i === defaultValue) opt.selected = true;
    sel.appendChild(opt);
  }
}
document.addEventListener('DOMContentLoaded', function() {
  populateDropdown('timerMinutes', 59, 0);
  populateDropdown('timerSeconds', 59, 0);
  populateDropdown('freqMinutes', 59, 0);
  populateDropdown('freqSeconds', 59, 0);

  // Toggle tracking method
  const toggleTime = document.getElementById('toggleTime');
  const toggleReps = document.getElementById('toggleReps');
  const timeControls = document.getElementById('timeControls');
  const repsControls = document.getElementById('repsControls');
  let trackingMethod = 'time';
  toggleTime.onclick = function() {
    trackingMethod = 'time';
    toggleTime.classList.add('selected');
    toggleReps.classList.remove('selected');
    timeControls.style.display = '';
    repsControls.style.display = 'none';
    updatePreview();
  };
  toggleReps.onclick = function() {
    trackingMethod = 'reps';
    toggleReps.classList.add('selected');
    toggleTime.classList.remove('selected');
    timeControls.style.display = 'none';
    repsControls.style.display = '';
    updatePreview();
  };

  // Color picker logic
  let selectedColor = '#f28b82';
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.getAttribute('data-color');
      document.getElementById('habitColor').value = selectedColor;
      updatePreview();
    });
  });
  document.querySelector('.color-btn[data-color="#f28b82"]').classList.add('selected');

  // Show/hide frequency controls based on checkbox
  const alwaysShow = document.getElementById('alwaysShow');
  alwaysShow.addEventListener('change', function() {
    document.getElementById('frequencyControls').style.display = this.checked ? 'none' : '';
  });

  // Overlay preview logic
  function updatePreview() {
    const msg = document.getElementById('habitText').value || 'Your habit message here';
    let html = `<div style="background:${selectedColor};padding:16px;border-radius:8px;min-width:200px;min-height:60px;">`;
    html += `<div style='font-size:1.2em;margin-bottom:8px;'>${msg}</div>`;
    if (trackingMethod === 'time') {
      const min = document.getElementById('timerMinutes').value;
      const sec = document.getElementById('timerSeconds').value;
      html += `<div>Timer: ${min.padStart(2,'0')}:${sec.padStart(2,'0')}</div>`;
      html += `<button style='margin-top:10px;' disabled>Complete (wait for timer)</button>`;
    } else {
      const sets = document.getElementById('numSets').value;
      const reps = document.getElementById('repsPerSet').value;
      html += `<div>Sets: ${sets}, Reps per set: ${reps}</div>`;
      html += `<div style='margin-top:10px;'>`;
      for (let i = 0; i < sets; i++) {
        html += `<span style='font-size:1.5em;margin:0 4px;color:#bbb;'>&#10003;</span>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    document.getElementById('previewContent').innerHTML = html;
  }
  document.getElementById('habitText').addEventListener('input', updatePreview);
  document.getElementById('timerMinutes').addEventListener('change', updatePreview);
  document.getElementById('timerSeconds').addEventListener('change', updatePreview);
  document.getElementById('numSets').addEventListener('input', updatePreview);
  document.getElementById('repsPerSet').addEventListener('input', updatePreview);
  updatePreview();

  // Save new habit
  function saveHabit() {
    const domain = document.getElementById('domain').value.trim();
    const message = document.getElementById('habitText').value.trim();
    if (!domain || !message) return;
    const method = trackingMethod;
    let habitObj = {
      message,
      color: selectedColor,
      method,
      streak: 0,
      lastCompleted: null
    };
    if (method === 'time') {
      habitObj.timer = {
        minutes: parseInt(document.getElementById('timerMinutes').value, 10),
        seconds: parseInt(document.getElementById('timerSeconds').value, 10)
      };
      habitObj.alwaysShow = alwaysShow.checked;
      if (!alwaysShow.checked) {
        habitObj.frequency = {
          minutes: parseInt(document.getElementById('freqMinutes').value, 10),
          seconds: parseInt(document.getElementById('freqSeconds').value, 10)
        };
      }
    } else {
      habitObj.reps = {
        sets: parseInt(document.getElementById('numSets').value, 10),
        reps: parseInt(document.getElementById('repsPerSet').value, 10)
      };
    }
    chrome.storage.sync.get(null, (data) => {
      data[domain] = habitObj;
      chrome.storage.sync.set(data, () => {
        loadHabits();
        document.getElementById('domain').value = '';
        document.getElementById('habitText').value = '';
        updatePreview();
      });
    });
  }
  document.getElementById('save').onclick = saveHabit;
  document.getElementById('habitText').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveHabit();
  });
  document.getElementById('domain').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveHabit();
  });

  // Load and display saved habits
  function loadHabits() {
    chrome.storage.sync.get(null, (habits) => {
      const list = document.getElementById('habitList');
      list.innerHTML = '';
      Object.entries(habits).forEach(([domain, data]) => {
        if (domain === 'streaks') return;
        // Frequency display logic
        let frequencyText = '';
        if (data.alwaysShow) {
          frequencyText = 'Always show overlay when visiting this site';
        } else if (data.method === 'time' && data.frequency) {
          const min = data.frequency.minutes || 0;
          const sec = data.frequency.seconds || 0;
          let parts = [];
          if (min > 0) parts.push(min + ' minute' + (min > 1 ? 's' : ''));
          if (sec > 0) parts.push(sec + ' second' + (sec > 1 ? 's' : ''));
          frequencyText = 'Show overlay only once every ' + (parts.length ? parts.join(' and ') : '0 seconds');
        } else {
          frequencyText = 'Always show overlay when visiting this site';
        }

        // Time/reps stats
        let statsText = '';
        const today = new Date();
        const todayKey = today.getFullYear() + '-' + (today.getMonth()+1).toString().padStart(2,'0') + '-' + today.getDate().toString().padStart(2,'0');
        if (data.method === 'time') {
          // Total time and today's time (in seconds)
          let totalTime = Number(data.totalTime) || 0; // in seconds
          let todayTime = (data.dailyTime && data.dailyTime[todayKey]) ? Number(data.dailyTime[todayKey]) : 0;
          // Debug log
          console.log('[Habit Stacker][Config] Time stats for', domain, { totalTime, todayTime, dailyTime: data.dailyTime });
          // Format as mm:ss
          function formatTime(sec) {
            const m = Math.floor(sec/60);
            const s = sec%60;
            return m+"m "+s+"s";
          }
          statsText = `<br><small>Total time: <b>${formatTime(totalTime)}</b> &nbsp; | &nbsp; Today: <b>${formatTime(todayTime)}</b></small>`;
        } else if (data.method === 'reps') {
          // Total reps, today's reps, and total sets
          let totalReps = Number(data.totalReps) || 0;
          let todayReps = (data.dailyReps && data.dailyReps[todayKey]) ? Number(data.dailyReps[todayKey]) : 0;
          // Calculate total sets (totalReps / reps per set)
          let repsPerSet = data.reps?.reps || 1;
          let totalSets = repsPerSet > 0 ? Math.floor(totalReps / repsPerSet) : 0;
          // Debug log
          console.log('[Habit Stacker][Config] Reps stats for', domain, { totalReps, todayReps, totalSets, dailyReps: data.dailyReps });
          statsText = `<br><small>Total reps: <b>${totalReps}</b> &nbsp; | &nbsp; Today: <b>${todayReps}</b> &nbsp; | &nbsp; Total sets: <b>${totalSets}</b></small>`;
        }

        // Domain heading with colored text only
        let main = `<span class="habit-domain" style="color:${data.color};">${domain}</span>`;
        main += `<div style='padding-top:6px;'><span class="habit-message">${data.message}</span>`;
        main += `<br><small>${frequencyText}</small>`;
        main += statsText;
        main += `<br><button data-edit-domain='${domain}'>Edit</button> <button data-domain='${domain}'>Delete</button>`;
        main += `</div>`;
        let streakBox = `<div class='habit-streak-box'>`;
        streakBox += `<div class='habit-streak-label'>Streak</div>`;
        streakBox += `<div class='habit-streak-num'>${data.streak || 0}</div>`;
        streakBox += `<div class='habit-streak-days'>days</div>`;
        streakBox += `</div>`;
        const li = document.createElement('li');
        li.className = 'habit-card habit-row';
        li.innerHTML = `<div class='habit-main'>${main}</div>${streakBox}`;
        list.appendChild(li);
      });
      // Add working edit/delete logic
      document.querySelectorAll('button[data-domain]').forEach(btn => {
        btn.onclick = function() {
          const domain = btn.getAttribute('data-domain');
          chrome.storage.sync.remove(domain, loadHabits);
        };
      });
      document.querySelectorAll('button[data-edit-domain]').forEach(btn => {
        btn.onclick = function() {
          const domain = btn.getAttribute('data-edit-domain');
          chrome.storage.sync.get([domain], (result) => {
            const data = result[domain];
            if (!data) return;
            document.getElementById('domain').value = domain;
            document.getElementById('habitText').value = data.message;
            if (data.method === 'time') {
              document.getElementById('toggleTime').click();
              document.getElementById('timerMinutes').value = data.timer?.minutes || 0;
              document.getElementById('timerSeconds').value = data.timer?.seconds || 0;
            } else {
              document.getElementById('toggleReps').click();
              document.getElementById('numSets').value = data.reps?.sets || 1;
              document.getElementById('repsPerSet').value = data.reps?.reps || 3;
            }
            alwaysShow.checked = data.alwaysShow;
            document.getElementById('frequencyControls').style.display = data.alwaysShow ? 'none' : '';
          });
        };
      });
      renderMiniCalendar(habits);
    });
  }
  loadHabits();

  // Listen for habit stats update from overlay
  if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'habit-stats-updated') {
        if (typeof loadHabits === 'function') loadHabits();
      }
    });
  }
});

// Mini Calendar Logic
function renderMiniCalendar(habits) {
  const calendarDiv = document.getElementById('miniCalendar');
  if (!calendarDiv) return;
  calendarDiv.innerHTML = '';
  const month = calendarMonth;
  const year = calendarYear;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  // Collect completions per day: { 'YYYY-MM-DD': [habitColor, ...] }
  const completions = {};
  Object.entries(habits).forEach(([domain, data]) => {
    if (domain === 'streaks') return;
    let color = data.color || '#f28b82';
    let daily = data.method === 'time' ? data.dailyTime : data.dailyReps;
    if (daily) {
      Object.keys(daily).forEach(dateKey => {
        if (Number(daily[dateKey]) > 0 && dateKey.startsWith(year + '-')) {
          if (!completions[dateKey]) completions[dateKey] = [];
          completions[dateKey].push(color);
        }
      });
    }
  });
  // Calendar header
  const headerRow = document.createElement('div');
  headerRow.className = 'calendar-header-row';
  const leftBtn = document.createElement('button');
  leftBtn.textContent = '<';
  leftBtn.onclick = () => { calendarMonth--; if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; } renderMiniCalendar(habits); };

  // Month dropdown
  const monthSelect = document.createElement('select');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  for (let i = 0; i < 12; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = monthNames[i];
    if (i === month) opt.selected = true;
    monthSelect.appendChild(opt);
  }
  monthSelect.onchange = (e) => {
    calendarMonth = Number(e.target.value);
    renderMiniCalendar(habits);
  };

  // Year dropdown
  const yearSelect = document.createElement('select');
  const thisYear = (new Date()).getFullYear();
  for (let y = thisYear - 5; y <= thisYear + 5; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === year) opt.selected = true;
    yearSelect.appendChild(opt);
  }
  yearSelect.onchange = (e) => {
    calendarYear = Number(e.target.value);
    renderMiniCalendar(habits);
  };

  const rightBtn = document.createElement('button');
  rightBtn.textContent = '>';
  rightBtn.onclick = () => { calendarMonth++; if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; } renderMiniCalendar(habits); };

  headerRow.appendChild(leftBtn);
  headerRow.appendChild(monthSelect);
  headerRow.appendChild(yearSelect);
  headerRow.appendChild(rightBtn);
  calendarDiv.appendChild(headerRow);
  // Day headers
  const daysRow = document.createElement('div');
  daysRow.className = 'calendar-row';
  ['S','M','T','W','T','F','S'].forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell calendar-header';
    cell.textContent = d;
    daysRow.appendChild(cell);
  });
  calendarDiv.appendChild(daysRow);
  // Calendar days
  let day = 1;
  for (let week = 0; week < 6 && day <= daysInMonth; week++) {
    const row = document.createElement('div');
    row.className = 'calendar-row';
    for (let d = 0; d < 7; d++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      if ((week === 0 && d < firstDay) || day > daysInMonth) {
        cell.innerHTML = '&nbsp;';
      } else {
        const dateKey = year + '-' + (month+1).toString().padStart(2,'0') + '-' + day.toString().padStart(2,'0');
        const barStack = document.createElement('div');
        if (completions[dateKey]) {
          completions[dateKey].forEach(color => {
            const bar = document.createElement('div');
            bar.className = 'calendar-bar';
            bar.style.background = color;
            barStack.appendChild(bar);
          });
        }
        const dayNum = document.createElement('div');
        dayNum.className = 'calendar-day-num';
        dayNum.textContent = day;
        cell.appendChild(dayNum);
        cell.appendChild(barStack);
        day++;
      }
      row.appendChild(cell);
    }
    calendarDiv.appendChild(row);
  }
}

// Theme toggle logic for dark/light mode
window.addEventListener('DOMContentLoaded', function() {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  function setTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    themeBtn.textContent = dark ? '☀️' : '🌙';
  }
  let dark = localStorage.getItem('habitTheme') === 'dark';
  setTheme(dark);
  themeBtn.onclick = () => {
    dark = !dark;
    setTheme(dark);
    localStorage.setItem('habitTheme', dark ? 'dark' : 'light');
  };
});

