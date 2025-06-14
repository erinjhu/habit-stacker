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
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '2rem';
    overlay.innerText = 'Habit Stacker Overlay';
    document.body.appendChild(overlay);
  } else {
    // Debug: show a small message if no match
    console.log('[Habit Stacker] No domain match for', currentDomain, 'in', domains);
  }
});
