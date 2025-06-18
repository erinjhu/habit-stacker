# Features on the configuration page


the first heading is "Create New Habit"

- for the domain input, there will be an example placeholder "youtube.com" and a tooltip that says “The website where this habit reminder should appear”.

- under the domain input, the user can customize a habit message which will appear on the overlay for the correspoding domain. there is a save button to save the habit. the user can press enter to save the habit. 

- put a label that says "Choose a tracking method" or something that is more intuitive. the user can adjust the tracking units for each habit based on time or repetitions. put a toggle button for time or repetitions. if the user selects time, refer to the following paragraph. if the user selects repetitions, put a text box for the number of repetitions per set and the number of sets. put the default number of sets as 1 and the default number of repetitions as 3. 

- the user can customize the length of the timer on the overlay. this will be dropdown menus for number of minutes and number of seconds. update the overlay code so that it can display the user customized time. 

- put a checkbox that the user checks to indicate whether they want the overlay to come every time they load/refresh the site. the checkbox will have a label that says "Always show overlay when visiting this site". there is also a smaller label that says "If unchecked, show overlay only once every x minutes/seconds" if the user does not check the box, put dropdown menus for the minutes and seconds that the extension should "wait" in between so that the overlay doesn't appear too often. for example, if the user doesn't check the box, they can input 5 minutes. this means that the domain that they inputted will only be covered by the overlay every 5 minutes.

- put small clickable colour swatches with tooltip "Choose a colour for this habit". if the user presses that button before saving, the habit will be displayed with that colour. 

the second section is "Overlay Preview"

- the user can see a small preview of the overlay, which shows the message and timer/checkmarks.

the third section is "Saved Habits"

- each saved habit for each domain gets displayed in this section. under each domain, put a button for the user to edit or delete the habit. if the user selects edit, they can use the user input features at the top of the page to change the habit. the save button text will change to update if the user selects to edit the habit. if the user deletes the habit, the habit will not be displayed under saved habits, and the extension will not affect the domain that the habit was associated with. each saved habit will also have a streak count for the number of days in a row that the habit has been completed.

- for each saved habit that is done by time, display the total time and the time for that specific day (today's time completed).

- for each saved habit that is done by sets and repetitions, display the total repetitions and the total repetitions for that specific day.

- a mini calendar. for each day that the user completes the habit, display a small coloured bar to indicate that the habit was completed. if there are multiple habits completed on a certain day, display the coloured bars one after the other. the mini calendar shows one month at a time. there are right and left arrows on either side of the calendar. pressing these buttons will go to the next or previous month.

info for the actual overlay that will appear:

- this paragraph describes what to do if the user selected repetitions. put a checkmark for each set. when the user clicks the checkmark button, that specific checkmark will turn green. if the user clicks it again, change the colour back to the default checkmark.

- if the user selected time, the overlay will just have a countdown for the time that they put.
