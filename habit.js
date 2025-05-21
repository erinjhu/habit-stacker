document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message");

  const domain = new URLSearchParams(window.location.search).get("domain");

  document.getElementById("habitText").textContent = message || "Default habit";

  document.getElementById("markDone").addEventListener('click', () => {
    const today = new Date().toDateString(); // 'Mon May 20 2025'

    chrome.storage.sync.get(["streaks"], (data) => {
      const streaks = data.streaks || {};
      const record = streaks[domain] || { lastDate: "", count: 0 };

      if (record.lastDate === today) {
        // already completed today
        alert("Already completed today!");
        window.close();
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = record.lastDate === yesterday.toDateString();

      const updated = {
        lastDate: today,
        count: wasYesterday ? record.count + 1 : 1,
      };

      streaks[domain] = updated;

      chrome.storage.sync.set({ streaks }, () => {
        alert(`Habit complete! Current streak: ${updated.count} day(s).`);
        window.close();
      });
    });
  });
});
