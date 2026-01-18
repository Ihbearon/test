let count = 0;
const button = document.getElementById('counterBtn');
const display = document.getElementById('countDisplay');

button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;
});
const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
    count = 0; // Reset the number to zero
    display.innerHTML = count; // Update the screen to show 0
});
