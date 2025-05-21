chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const url = new URL(tab.url);
  const domain = url.hostname.replace('www.', ''); // gets 'mail.google.com'

  chrome.storage.sync.get(null, (habits) => {
    const habitMessage = habits[domain];
    if (habitMessage) {
      const habitURL = new URL(chrome.runtime.getURL("habit.html"));
      habitURL.searchParams.set("message", habitMessage);

      // testing
      console.log("Matched domain:", domain);
      console.log("Habit message:", habitMessage);
      console.log("Popup URL:", habitURL.toString());


      chrome.windows.create({
        url: habitURL.toString(),
        type: "popup",
        width: 300,
        height: 200
      });
    }
  });
});


chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
});


