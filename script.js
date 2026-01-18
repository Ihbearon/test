let count = 0;
const button = document.getElementById('counterBtn');
const display = document.getElementById('countDisplay');

button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;
});
