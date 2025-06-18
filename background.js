// Empty background script required by manifest.json

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
});
