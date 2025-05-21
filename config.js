function loadHabits() {
  chrome.storage.sync.get(null, (habits) => {
    const list = document.getElementById("habitList");
    list.innerHTML = "";
    Object.entries(habits).forEach(([domain, message]) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <div class="row">
          <div><strong>${domain}</strong>: ${message}</div>
          <button data-domain="${domain}">Delete</button>
        </div>`;
      list.appendChild(item);
    });

    // Add delete listeners
    document.querySelectorAll("button[data-domain]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const domain = btn.getAttribute("data-domain");
        chrome.storage.sync.remove(domain, loadHabits);
      });
    });
  });
}

document.getElementById("save").addEventListener("click", () => {
  const domain = document.getElementById("domain").value.trim();
  const habit = document.getElementById("habitText").value.trim();
  if (!domain || !habit) return;

  chrome.storage.sync.set({ [domain]: habit }, () => {
    document.getElementById("domain").value = "";
    document.getElementById("habitText").value = "";
    loadHabits();
  });
});

loadHabits(); // load habits on page open
