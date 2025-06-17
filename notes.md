# Progress #

**Currently working on:**


**Bugs to fix**

**Possible features to add later:**
* button to quickly disable all habits
* daily habit or multiple times per day
* statistics
* progress/goals
* tab switches, idle time
* ui
* syncing across devices
* choose how many popups per hour/day
* features to connect with others
* upload progress photos
* quantify habits (e.g. how many cups of water, how many pushups done)
* habit counter for other things like doing work
* friend streaks
* a timemr so that you actually do the habit instead of clicking away. option to configure how long you want the timer for
* customizable dashboard for which stats to show
* feed for completed habits where users can react and comment on their friend's habit completions
* if a user skips a habit, it notifies their friends

**Done**
* choosing custom habits for different websites
* streak counter
* popup comes every time you refresh a website. instead, allow the user to change the frequency
* a small calendar to show days where the user completed a habit


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
