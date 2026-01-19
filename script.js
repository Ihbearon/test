// 1. Firebase Configuration (Using your actual keys)
const firebaseConfig = {
    apiKey: "AIzaSyCGnHOcQHYo5-Pl1xYEHR8RP11Y7H0krkg",
    authDomain: "button-clicker-8cc95.firebaseapp.com",
    databaseURL: "https://button-clicker-8cc95-default-rtdb.firebaseio.com",
    projectId: "button-clicker-8cc95",
    storageBucket: "button-clicker-8cc95.firebasestorage.app",
    messagingSenderId: "1020622365359",
    appId: "1:1020622365359:web:6ae5a32db488dd27e8ea5a",
    measurementId: "G-YG9920VMGG"
};

// 2. Initialize Firebase once
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 3. UI Elements
let count = 0;
const button = document.getElementById('counterBtn');
const display = document.getElementById('countDisplay');
const resetBtn = document.getElementById('resetBtn');
const loginBtn = document.getElementById('loginBtn');

// 4. Handle Login
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password).catch(() => {
        auth.signInWithEmailAndPassword(email, password);
    });
});

// 5. Update UI when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        document.getElementById('welcomeText').innerText = `Hello, ${user.email}`;
        loadLeaderboard();
    }
});

// 6. Handle Clicks & Save to Database
button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;
    
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        db.ref('leaderboard/' + userId).set({
            name: auth.currentUser.email,
            score: count
        });
    }
});

// 7. Handle Reset
resetBtn.addEventListener('click', () => {
    count = 0;
    display.innerHTML = count;
});

// 8. Load Leaderboard
function loadLeaderboard() {
    db.ref('leaderboard').orderByChild('score').limitToLast(5).on('value', snapshot => {
        const list = document.getElementById('leaderboard');
        list.innerHTML = '';
        
        let isFirst = true; // Track the top scorer
        
        snapshot.forEach(child => {
            const item = document.createElement('li');
            const data = child.val();
            
            // If this is the top person, add the crown
            const crown = isFirst ? " 👑" : ""; 
            
            item.innerHTML = `<span>${data.name}${crown}</span> <strong>${data.score}</strong>`;
            list.prepend(item); // Put highest score at the top
            
            isFirst = false; // Only the first one gets the crown
        });
    });
}
