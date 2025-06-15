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
- If matched, injects a fullscreen overlay with a "Dismiss" button
- Overlay blocks the site until dismissed, then disappears

# background.js
- Handles extension icon click to open the config page

# Summary
- User saves domains via the config page
- When visiting a saved domain, the overlay appears and can be dismissed
- All logic uses Chrome extension APIs and works across browser sessions