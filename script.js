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
// Paste your config here from Step 1.4
const firebaseConfig = { /* YOUR CONFIG HERE */ };
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// Handle Login
document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // This creates an account if it doesn't exist, otherwise it logs in
    auth.createUserWithEmailAndPassword(email, password).catch(() => {
        auth.signInWithEmailAndPassword(email, password);
    });
});

// Update UI when logged in
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        document.getElementById('welcomeText').innerText = `Hello, ${user.email}`;
        loadLeaderboard();
    }
});

// Save high score to Database
button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;
    const userId = auth.currentUser.uid;
    // Save the user's name and their count to the "leaderboard" path
    db.ref('leaderboard/' + userId).set({
        name: auth.currentUser.email,
        score: count
    });
});

function loadLeaderboard() {
    db.ref('leaderboard').orderByChild('score').limitToLast(5).on('value', snapshot => {
        const list = document.getElementById('leaderboard');
        list.innerHTML = '';
        snapshot.forEach(child => {
            const item = document.createElement('li');
            item.innerText = `${child.val().name}: ${child.val().score}`;
            list.prepend(item); // Put highest score at the top
        });
    });
}
