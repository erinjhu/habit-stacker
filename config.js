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
        let display = `<strong>${domain}</strong>: <span>${data.message}</span> <span style='background:${data.color};padding:2px 8px;border-radius:4px;margin-left:8px;'></span>`;
        display += `<br><small>Streak: ${data.streak || 0} days</small>`;
        display += `<br><button data-edit-domain='${domain}'>Edit</button> <button data-domain='${domain}'>Delete</button>`;
        const li = document.createElement('li');
        li.className = 'habit-card';
        li.innerHTML = display;
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
            document.getElementById('habitColor').value = data.color || '#f28b82';
            document.querySelectorAll('.color-btn').forEach(b => {
              if (b.getAttribute('data-color') === data.color) {
                b.classList.add('selected');
              } else {
                b.classList.remove('selected');
              }
            });
            document.getElementById('save').textContent = 'Update Habit';
          });
        };
      });
    });
  }
  loadHabits();
});