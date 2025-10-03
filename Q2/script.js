// Get the button and the body element
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Add a click event listener to the button
themeToggleButton.addEventListener('click', () => {
    // Toggle the .dark-mode class on the body
    body.classList.toggle('dark-mode');
});