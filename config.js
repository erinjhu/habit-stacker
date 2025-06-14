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

document.getElementById('saveDomainBtn').onclick = saveDomain;
document.getElementById('domainInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveDomain();
});

document.addEventListener('DOMContentLoaded', loadDomainList);
// For direct open (not as popup), also load on script run
loadDomainList();