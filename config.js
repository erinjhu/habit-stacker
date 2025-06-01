let calendarMonth = (new Date()).getMonth();
let calendarYear = (new Date()).getFullYear();

// Color picker logic
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('habitColor').value = btn.getAttribute('data-color');
  });
});
document.querySelector('.color-btn[data-color="#f28b82"]').classList.add('selected');

// Show/hide frequency controls based on checkbox
document.getElementById("alwaysShow").addEventListener("change", function() {
  document.getElementById("frequencyControls").style.display = this.checked ? "none" : "block";
});

// Load and display saved habits
function loadHabits() {
  chrome.storage.sync.get(null, (habits) => {
    const list = document.getElementById("habitList");
    list.innerHTML = "";
    Object.entries(habits).forEach(([domain, data]) => {
      if(domain === "streaks") return;
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
            ${
              data.limitPopup === false
                ? "Show habit reminder every time I open this site"
                : `Limit: ${frequency.value} ${frequency.unit} between popups`
            }
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
      if (info && typeof info.count === "number" && info.lastDate) {
        // Format the timestamp
        const dateObj = new Date(info.lastDate);
        const formatted = dateObj.toLocaleString(); // shows date and time in user's locale
        const item = document.createElement("li");
        item.textContent = `${domain}: ${info.count} day streak (last completed ${formatted})`;
        list.appendChild(item);
      }
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
  const alwaysShow = document.getElementById("alwaysShow").checked;

  const domain = domainInput.value.trim();
  const habit = habitInput.value.trim();
  if (!domain || !habit) return;

  const habitObj = {
    message: habit,
    limitPopup: !alwaysShow, 
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
    document.getElementById("habitColor").value = "#f28b82";
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector('.color-btn[data-color="#f28b82"]').classList.add('selected');
    document.getElementById("alwaysShow").checked = false;
    document.getElementById("frequencyControls").style.display = "block";
    loadHabits();
    loadStreaks();
  });
});

function renderCalendar() {
  chrome.storage.sync.get(null,(data) => {
    const streaks = data.streaks || {};
    const habits = data;
    delete habits.streaks;

    const completions = {};

    Object.entries(streaks).forEach(([domain, info]) => {
      if (info && Array.isArray(info.dates)) {
        const color = (habits[domain] && habits[domain].color) || "#f28b82";
        info.dates.forEach(dateStr => {
          const dateObj = new Date(dateStr);
          const now = new Date();
          if (
            dateObj.getFullYear() === calendarYear &&
            dateObj.getMonth() === calendarMonth
          ) {
            const key = dateStr.slice(0, 10); // 'YYYY-MM-DD'
            if (!completions[key]) completions[key] = [];
            completions[key].push({ color, domain });
          }
        });
      }
    });

    // Generate calendar grid for current month
    const year = calendarYear;
    const month = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let html = `
      <div class="calendar-header-row" style="display:flex; align-items:center; justify-content:center; margin-bottom:8px;">
        <button id="prevMonth" style="font-size:18px; margin-right:12px;">&#8592;</button>
        <span style="font-weight:bold; font-size:1.1em; min-width:120px; text-align:center;">
          ${monthNames[month]} ${year}
        </span>
        <button id="nextMonth" style="font-size:18px; margin-left:12px;">&#8594;</button>
      </div>
    `;

    html += `<div class="mini-calendar"><div class="calendar-row calendar-header">`;
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(d => html += `<div class="calendar-cell calendar-header">${d}</div>`);
    html += `</div><div class="calendar-row">`;

    // Fill initial empty cells
    for (let i = 0; i < firstDay.getDay(); i++) {
      html += `<div class="calendar-cell"></div>`;
    }

    // Fill days
    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      html += `<div class="calendar-cell"><div class="calendar-day-num">${day}</div>`;
      if (completions[dateStr]) {
        completions[dateStr].forEach(habit => {
          html += `<div class="calendar-bar" title="${habit.domain}" style="background:${habit.color}"></div>`;
        });
      }
      html += `</div>`;
      // New row after Saturday
      if ((firstDay.getDay() + day) % 7 === 0 && day !== numDays) {
        html += `</div><div class="calendar-row">`;
      }
    }

    html += `</div></div>`;
    document.getElementById("calendarContainer").innerHTML = html;

    document.getElementById("prevMonth").addEventListener("click", () => {
      calendarMonth--;
      if(calendarMonth < 0){
        calendarMonth = 11;
        calendarYear--;
      }
      renderCalendar();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      calendarMonth++;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      renderCalendar();
    });
  });

}




function loadStreaks() {
  chrome.storage.sync.get(["streaks"], (data) => {
    const streaks = data.streaks || {};
    const list = document.getElementById("streakList");
    list.innerHTML = "";

    Object.entries(streaks).forEach(([domain, info]) => {
      if (info && typeof info.count === "number" && info.lastDate) {
        const dateObj = new Date(info.lastDate);
        const formatted = dateObj.toLocaleString();
        const item = document.createElement("li");
        item.textContent = `${domain}: ${info.count} day streak (last completed ${formatted})`;
        list.appendChild(item);
      }
    });
    renderCalendar(); 
  });

  
}


loadHabits();
loadStreaks();