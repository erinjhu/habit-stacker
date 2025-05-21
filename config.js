
// load and display saved habits
function loadHabits() {
    chrome.storage.sync.get(null, (habits) => {
        const list = document.getElementById("habitList");
        list.innerHTML = "";
        Object.entries(habits).forEach(([domain, message]) => {
            const item = document.createElement("li");
            // buttons for edit/delete
            item.innerHTML = `
                <div class="row">
                <div><strong>${domain}</strong>: <span class="habit-message">${message}</span></div>
                <div>
                    <button data-edit-domain="${domain}">Edit</button>
                    <button data-domain="${domain}">Delete</button>
                </div>
                </div>`;
            list.appendChild(item);
        });

        // delete habits
        document.querySelectorAll("button[data-domain]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const domain = btn.getAttribute("data-domain");
                chrome.storage.sync.remove(domain, () => {
                    loadHabits();
                    loadStreaks(); // <-- Add this line
                });
            });
        });

        // edit habits
        document.querySelectorAll("button[data-edit-domain]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const domain = btn.getAttribute("data-edit-domain");
                const message = btn.closest(".row").querySelector(".habit-message").textContent;
                document.getElementById("domain").value = domain;
                document.getElementById("habitText").value = message;
                document.getElementById("save").textContent = "Update Habit";
            });
        });
    });
}

// load and display streaks
function loadStreaks() {
  chrome.storage.sync.get(["streaks"], (data) => {
    const streaks = data.streaks || {};
    const list = document.getElementById("streakList");
    list.innerHTML = "";

    Object.entries(streaks).forEach(([domain, info]) => {
      const item = document.createElement("li");
      item.textContent = `${domain}: ${info.count} day streak (last completed ${info.lastDate})`;
      list.appendChild(item);
    });
  });
}

// frequency controls
document.getElementById("limitPopup").addEventListener("change", function() {
  document.getElementById("frequencyControls").style.display = this.checked ? "block" : "none";
});

// save new habits

document.getElementById("save").addEventListener("click", () => {
    const domainInput = document.getElementById("domain");
    const habitInput = document.getElementById("habitText");
    const domain = document.getElementById("domain").value.trim();
    const habit = document.getElementById("habitText").value.trim();
    if (!domain || !habit) return;

    chrome.storage.sync.set({ [domain]: habit }, () => {
        domainInput.value = "";
        habitInput.value = "";
        domainInput.disabled = false;
        document.getElementById("save").textContent = "Save Habit";
        loadHabits();
        loadStreaks();
    });
});

loadHabits(); 
loadStreaks();
