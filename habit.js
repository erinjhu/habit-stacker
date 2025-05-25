function markHabitDone(domain) {
  chrome.storage.sync.get(["streaks"], (data) => {
    const streaks = data.streaks || {};
    const now = new Date();
    const todayISO = now.toISOString();
    const todayStr = now.toDateString();

    let record = streaks[domain] || { lastDate: "", count: 0, dates: [] };

    // Prevent double marking for today
    if (record.dates && record.dates.some(d => new Date(d).toDateString() === todayStr)) {
      alert("Already completed today!");
      window.close();
      return;
    }

    // Streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = record.lastDate === yesterday.toDateString();

    record = {
      lastDate: todayStr,
      count: wasYesterday ? record.count + 1 : 1,
      dates: (record.dates || []).concat(todayISO)
    };

    streaks[domain] = record;

    chrome.storage.sync.set({ streaks }, () => {
      alert(`Habit complete! Current streak: ${record.count} day(s).`);
      window.close();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message");
  const domain = params.get("domain");

  document.getElementById("habitText").textContent = message || "Default habit";

  document.getElementById("markDone").addEventListener('click', () => {
    markHabitDone(domain);
  });
});