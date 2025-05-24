// Color picker logic
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('habitColor').value = btn.getAttribute('data-color');
  });
});
document.querySelector('.color-btn[data-color="#f28b82"]').classList.add('selected');

// Load and display saved habits
function loadHabits() {
  chrome.storage.sync.get(null, (habits) => {
    const list = document.getElementById("habitList");
    list.innerHTML = "";
    Object.entries(habits).forEach(([domain, data]) => {
      // Support old (string) and new (object) formats
      let message, frequency, color;
      if (typeof data === "string") {
        message = data;
        frequency = { value: 1, unit: "hours" };
        color = "#f28b82"; // default color
      } else {
        message = data.message;
        frequency = data.frequency || { value: 1, unit: "hours" };
        color = data.color || "#f28b82";
      }
      const item = document.createElement("li");
      item.className = "habit-card";
      item.style.background = color;
      item.innerHTML = `
        <div class="row">
          <div>
            <strong>${domain}</strong>: <span class="habit-message">${message}</span>
            <br>
            <small>
              Limit: ${frequency.value} ${frequency.unit} between popups
            </small>
          </div>
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
          loadStreaks();
        });
      });
    });

    // edit habits
    document.querySelectorAll("button[data-edit-domain]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const domain = btn.getAttribute("data-edit-domain");
        chrome.storage.sync.get([domain], (result) => {
          const data = result[domain];
          let message, frequency, color;
          if (typeof data === "string") {
            message = data;
            frequency = { value: 1, unit: "hours" };
            color = "#f28b82";
          } else {
            message = data.message;
            frequency = data.frequency || { value: 1, unit: "hours" };
            color = data.color || "#f28b82";
          }
          document.getElementById("domain").value = domain;
          document.getElementById("habitText").value = message;
          document.getElementById("frequencyValue").value = frequency.value;
          document.getElementById("frequencyUnit").value = frequency.unit;
          document.getElementById("habitColor").value = color;
          // Highlight the selected color button
          document.querySelectorAll('.color-btn').forEach(b => {
            if (b.getAttribute('data-color') === color) {
              b.classList.add('selected');
            } else {
              b.classList.remove('selected');
            }
          });
          document.getElementById("save").textContent = "Update Habit";
        });
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

// save new habits
document.getElementById("save").addEventListener("click", () => {
  const domainInput = document.getElementById("domain");
  const habitInput = document.getElementById("habitText");
  const frequencyValue = parseInt(document.getElementById("frequencyValue").value, 10);
  const frequencyUnit = document.getElementById("frequencyUnit").value;
  const color = document.getElementById("habitColor").value;

  const domain = domainInput.value.trim();
  const habit = habitInput.value.trim();
  if (!domain || !habit) return;

  const habitObj = {
    message: habit,
    limitPopup: true,
    frequency: {
      value: frequencyValue,
      unit: frequencyUnit
    },
    color: color
  };

  chrome.storage.sync.set({ [domain]: habitObj }, () => {
    domainInput.value = "";
    habitInput.value = "";
    domainInput.disabled = false;
    document.getElementById("save").textContent = "Save Habit";
    // Reset color picker to default
    document.getElementById("habitColor").value = "#f28b82";
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector('.color-btn[data-color="#f28b82"]').classList.add('selected');
    loadHabits();
    loadStreaks();
  });
});

loadHabits();
loadStreaks();