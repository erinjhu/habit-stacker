# Brainstorming #

**Currently working on:**
* choosing custom habits for different websites
* streak counter

**Bugs to fix**
* on Discord, every time you change the channel, the popup comes

**Possible features to add later:**
* a small calendar to show days where the user completed a habit
* statistics
* progress/goals
* tab switches, idle time
* ui
* syncing across devices
* choose how many popups per hour/day
* features to connect with others
* upload progress photos
* quantify habits (e.g. how many cups of water, how many pushups done)


-----------------------------

# Conceptual Notes#

Knowledge and skills gained from working on this project

## Files##

```manifest.json```
* Configuration file
* Permissions, scripts, popups

```background.js```
* Event listener

```habit.html```
* Popup window

```habit.js```
* Interactive features for popup

##Functions##

```chrome.tabs.onUpdated.addListener(...)```
* If a tab changes URL or loads/reloads, do a function