// listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
    // only continue after tab is loaded
    if (changeInfo.status !== "complete" || !tab.url) return;

    // get domain
    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', ''); // gets 'mail.google.com'

    // get habits and messages from storage
    chrome.storage.sync.get(null, (habits) => {
        const habitMessage = habits[domain];
        if (habitMessage) {
            // build popup
            const habitURL = new URL(chrome.runtime.getURL("habit.html"));
            habitURL.searchParams.set("message", habitMessage);
            habitURL.searchParams.set("domain", domain);

            // testing
            console.log("Matched domain:", domain);
            console.log("Habit message:", habitMessage);
            console.log("Popup URL:", habitURL.toString());

            // open popup window
            chrome.windows.create({
                url: habitURL.toString(),
                type: "popup",
                width: 300,
                height: 200
            });
        }
    });
});

// open config page when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
});


