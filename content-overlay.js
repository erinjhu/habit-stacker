// Placeholder for content-overlay.js
// This file will be used to inject overlays on matching domains

// Inject overlay if current domain matches a saved habit domain
chrome.storage.sync.get(null, (data) => {
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  // Find a matching domain key
  const matchedDomain = Object.keys(data).find(domain =>
    currentDomain === domain || currentDomain.endsWith('.' + domain)
  );
  if (!matchedDomain) {
    console.log('[Habit Stacker] No habit for', currentDomain);
    return;
  }
  const habit = data[matchedDomain];
  if (!habit) return;

  // Frequency/alwaysShow logic
  const now = Date.now();
  let shouldShow = true;
  if (habit.method === 'time' && !habit.alwaysShow && habit.frequency && habit.lastCompleted) {
    const freqMs = (habit.frequency.minutes * 60 + habit.frequency.seconds) * 1000;
    shouldShow = (now - habit.lastCompleted) >= freqMs;
  }
  if (!shouldShow) {
    console.log('[Habit Stacker] Not time to show overlay for', matchedDomain);
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = 'white';
  overlay.style.fontSize = '2rem';

  // Card
  const card = document.createElement('div');
  card.style.background = habit.color || '#f28b82';
  card.style.padding = '32px 40px';
  card.style.borderRadius = '16px';
  card.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.alignItems = 'center';
  card.style.minWidth = '320px';

  // Message
  const message = document.createElement('div');
  message.innerText = habit.message || 'Habit Stacker Overlay';
  message.style.marginBottom = '24px';
  message.style.fontWeight = 'bold';
  message.style.fontSize = '1.4em';
  card.appendChild(message);

  // Streak
  const streak = document.createElement('div');
  streak.innerHTML = `🔥 Streak: <b>${habit.streak || 0}</b> days`;
  streak.style.marginBottom = '18px';
  streak.style.fontSize = '1em';
  card.appendChild(streak);

  // Tracking logic
  let completeBtn, skipBtn;
  if (habit.method === 'time') {
    // Timer
    const timer = document.createElement('div');
    let secondsLeft = (habit.timer?.minutes || 0) * 60 + (habit.timer?.seconds || 0);
    timer.style.fontSize = '1.2em';
    timer.style.marginBottom = '18px';
    card.appendChild(timer);
    function updateTimer() {
      const min = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const sec = (secondsLeft % 60).toString().padStart(2, '0');
      timer.innerHTML = `<span>Wait </span><span id='habit-timer-count'>${min}:${sec}</span>`;
    }
    updateTimer();
    completeBtn = document.createElement('button');
    completeBtn.innerText = 'Complete';
    completeBtn.style.margin = '12px 0 0 0';
    completeBtn.style.fontSize = '1.1em';
    completeBtn.style.padding = '10px 32px';
    completeBtn.style.cursor = 'not-allowed';
    completeBtn.style.border = 'none';
    completeBtn.style.borderRadius = '8px';
    completeBtn.style.background = '#fff';
    completeBtn.style.color = '#222';
    completeBtn.disabled = true;
    card.appendChild(completeBtn);
    let interval = setInterval(() => {
      secondsLeft--;
      updateTimer();
      if (secondsLeft <= 0) {
        clearInterval(interval);
        timer.innerText = 'You may now complete the habit!';
        completeBtn.disabled = false;
        completeBtn.style.cursor = 'pointer';
      }
    }, 1000);
    completeBtn.onclick = () => {
      overlay.remove();
      // Update streak and lastCompleted
      updateStreak(matchedDomain, habit);
    };
  } else if (habit.method === 'reps') {
    // Repetitions/sets
    const sets = habit.reps?.sets || 1;
    const reps = habit.reps?.reps || 3;
    const repsDiv = document.createElement('div');
    repsDiv.style.marginBottom = '12px';
    repsDiv.innerHTML = `Sets: <b>${sets}</b>, Reps per set: <b>${reps}</b>`;
    card.appendChild(repsDiv);
    // Checkmarks for sets
    let completedSets = 0;
    const checksDiv = document.createElement('div');
    for (let i = 0; i < sets; i++) {
      const check = document.createElement('span');
      check.innerHTML = '&#10003;';
      check.style.fontSize = '2em';
      check.style.margin = '0 8px';
      check.style.color = '#bbb';
      check.style.cursor = 'pointer';
      check.onclick = () => {
        if (check.style.color === 'limegreen') return;
        check.style.color = 'limegreen';
        completedSets++;
        if (completedSets === sets) {
          completeBtn.disabled = false;
          completeBtn.style.cursor = 'pointer';
        }
      };
      checksDiv.appendChild(check);
    }
    checksDiv.style.marginBottom = '10px';
    card.appendChild(checksDiv);
    completeBtn = document.createElement('button');
    completeBtn.innerText = 'Complete';
    completeBtn.style.margin = '12px 0 0 0';
    completeBtn.style.fontSize = '1.1em';
    completeBtn.style.padding = '10px 32px';
    completeBtn.style.cursor = 'not-allowed';
    completeBtn.style.border = 'none';
    completeBtn.style.borderRadius = '8px';
    completeBtn.style.background = '#fff';
    completeBtn.style.color = '#222';
    completeBtn.disabled = true;
    card.appendChild(completeBtn);
    completeBtn.onclick = () => {
      overlay.remove();
      updateStreak(matchedDomain, habit);
    };
  }

  // Skip button
  skipBtn = document.createElement('button');
  skipBtn.innerText = 'Skip (does not increment streak)';
  skipBtn.style.margin = '16px 0 0 0';
  skipBtn.style.fontSize = '1em';
  skipBtn.style.padding = '8px 24px';
  skipBtn.style.background = '#eee';
  skipBtn.style.color = '#b00';
  skipBtn.style.border = 'none';
  skipBtn.style.borderRadius = '8px';
  skipBtn.onclick = () => {
    if (confirm('Are you sure you want to skip this habit? Your streak will not increase.')) {
      overlay.remove();
    }
  };
  card.appendChild(skipBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Streak update logic
  function updateStreak(domain, habitObj) {
    chrome.storage.sync.get([domain], (result) => {
      const latest = result[domain] || habitObj;
      const today = new Date();
      const last = latest.lastCompleted ? new Date(latest.lastCompleted) : null;
      let newStreak = 1;
      if (last) {
        const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        if (diff === 1) newStreak = (latest.streak || 0) + 1;
        else if (diff === 0) newStreak = latest.streak || 1;
        else newStreak = 1;
      }
      // --- Stats update logic ---
      const todayKey = today.getFullYear() + '-' + (today.getMonth()+1).toString().padStart(2,'0') + '-' + today.getDate().toString().padStart(2,'0');
      let updated = Object.assign({}, latest, {
        streak: newStreak,
        lastCompleted: today.getTime()
      });
      if (latest.method === 'time') {
        // Add timer duration to totalTime and todayTime
        const seconds = (latest.timer?.minutes || 0) * 60 + (latest.timer?.seconds || 0);
        updated.totalTime = (latest.totalTime || 0) + seconds;
        updated.dailyTime = Object.assign({}, latest.dailyTime || {});
        updated.dailyTime[todayKey] = (updated.dailyTime[todayKey] || 0) + seconds;
      } else if (latest.method === 'reps') {
        // Add reps*sets to totalReps and todayReps
        const reps = (latest.reps?.reps || 3) * (latest.reps?.sets || 1);
        updated.totalReps = (latest.totalReps || 0) + reps;
        updated.dailyReps = Object.assign({}, latest.dailyReps || {});
        updated.dailyReps[todayKey] = (updated.dailyReps[todayKey] || 0) + reps;
      }
      const update = {};
      update[domain] = updated;
      chrome.storage.sync.set(update, () => {
        // Debug log
        console.log('[Habit Stacker] Updated stats for', domain, updated);
        // Notify config page to reload habits if open
        chrome.runtime.sendMessage({ type: 'habit-stats-updated', domain });
      });
    });
  }
});
