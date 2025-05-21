document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    document.getElementById("habitText").textContent = message || "Default habit";

    document.getElementById("markDone").addEventListener('click', () => {
        alert("Habit complete!");
        window.close();
    });
});