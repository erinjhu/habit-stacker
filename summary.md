# config.html
- Users can enter a website domain in a text box and click save or press enter
- The domain is stored in Chrome’s cloud storage (chrome.storage.sync), so it persists across browser sessions and devices
- All saved domains are displayed in a list under the "Saved Domains" heading

# config.js
- Handles saving new domains and loading the list of saved domains
- Updates the displayed list whenever a new domain is saved

# manifest.json
- Declares permissions and files used by the extension
- Allows the extension to use storage, run scripts, and display the config page
- Registers a content script to run on all URLs

# content-overlay.js
- Runs on every website (except restricted ones)
- Checks if the current domain matches any saved domain
- If matched, injects a fullscreen overlay with a countdown timer and a "Dismiss" button
- The overlay blocks the site for 30 seconds, showing a live countdown
- The "Dismiss" button is disabled until the timer finishes, then can be used to close the overlay

# background.js
- When the user clicks the extension icon, they will open the config page

# How it works
- User saves domains via the config page
- When visiting a saved domain, the overlay appears with a 30-second countdown and can be dismissed after the timer
- All logic uses Chrome extension APIs and works across browser sessions