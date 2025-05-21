// listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url) return;

    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');

    // get saved habits from chrome storage
    chrome.storage.sync.get(null, (habits) => {
        const habit = habits[domain];
        if (!habit) return;

        let message, limitPopup, frequency;
        if (typeof habit === "string") {
            message = habit;
            limitPopup = false;
            frequency = { value: 1, unit: "hours" };
        } else {
            message = habit.message;
            limitPopup = habit.limitPopup;
            frequency = habit.frequency || { value: 1, unit: "hours" };
        }

        // show popup if the user hasn't chosen to limit the frequency
        if (!limitPopup) {
            showHabitPopup(message, domain);
            return;
        }

        // if the user limits frequency, check when the last popul was shown
        chrome.storage.local.get(["popupTimestamps"], (data) => {
            const timestamps = data.popupTimestamps || {};
            const now = Date.now();
            const lastShown = timestamps[domain] || 0;
            const intervalMs = frequency.unit === "hours"
                ? frequency.value * 60 * 60 * 1000
                : frequency.value * 60 * 1000;

            if (now - lastShown >= intervalMs) {
                // show the popup if enough time has passed
                showHabitPopup(message, domain);
                timestamps[domain] = now;
                chrome.storage.local.set({ popupTimestamps: timestamps });
            }
        });
    });
});

// show popup window
function showHabitPopup(habitMessage, domain) {
    const habitURL = new URL(chrome.runtime.getURL("habit.html"));
    habitURL.searchParams.set("message", habitMessage);
    habitURL.searchParams.set("domain", domain);

    chrome.windows.create({
        url: habitURL.toString(),
        type: "popup",
        width: 300,
        height: 200
    });
}

// open config page when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
});



