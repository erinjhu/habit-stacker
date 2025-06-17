// Placeholder for content-overlay.js
// This file will be used to inject overlays on matching domains

// Inject overlay if current domain matches a saved domain
chrome.storage.sync.get({ domains: [] }, (data) => {
  const domains = data.domains || [];
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  if (domains.length === 0) {
    // Debug: show a small message if no domains are saved
    console.log('[Habit Stacker] No domains saved.');
    return;
  }
  const matched = domains.find(domain => currentDomain === domain || currentDomain.endsWith('.' + domain));
  if (matched) {
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

    const message = document.createElement('div');
    message.innerText = 'Habit Stacker Overlay';
    message.style.marginBottom = '32px';
    overlay.appendChild(message);

    // Countdown timer
    const timer = document.createElement('div');
    let secondsLeft = 30;
    timer.style.fontSize = '1.5rem';
    timer.style.marginBottom = '24px';
    overlay.appendChild(timer);

    function updateTimer() {
      timer.innerHTML = `<span>Please wait </span><span id="habit-timer-count">${secondsLeft}</span><span> seconds</span>`;
    }
    updateTimer();

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Dismiss';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.padding = '12px 32px';
    closeBtn.style.cursor = 'not-allowed';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = '#fff';
    closeBtn.style.color = '#222';
    closeBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    closeBtn.disabled = true;
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);

    // Countdown logic
    const interval = setInterval(() => {
      secondsLeft--;
      updateTimer();
      if (secondsLeft <= 0) {
        clearInterval(interval);
        timer.innerText = 'You may now dismiss the overlay.';
        closeBtn.disabled = false;
        closeBtn.style.cursor = 'pointer';
      }
    }, 1000);
  } else {
    // Debug: show a small message if no match
    console.log('[Habit Stacker] No domain match for', currentDomain, 'in', domains);
  }
});
