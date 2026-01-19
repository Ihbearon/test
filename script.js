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
const logoutBtn = document.getElementById('logoutBtn');
const deleteBtn = document.getElementById('deleteAccountBtn');
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
        // Logged In: Show Game, Hide Login
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        document.getElementById('welcomeText').innerText = `Hello, ${user.email}`;
        loadLeaderboard();
    } else {
        // Logged Out: Show Login, Hide Game
        document.getElementById('loginSection').style.display = 'flex'; 
        document.getElementById('gameSection').style.display = 'none';
        
        // Reset the local click counter for the next person
        count = 0;
        display.innerHTML = count;
    }
});

// 6. Handle Clicks & Save to Database
// 6. Handle Clicks & Save to Database
// 6. Handle Clicks & Save to Database
button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;

    // Confetti Milestone logic
    if (count > 0 && count % 100 === 0) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#fbbf24', '#ef4444']
        }); // ADD THIS CLOSING BRACKET AND PARENTHESIS HERE
    }

    // Animation logic
    display.classList.remove('pop-animation');
    void display.offsetWidth; 
    display.classList.add('pop-animation');

    // Database logic
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userRef = db.ref('leaderboard/' + userId);

        userRef.once('value').then((snapshot) => {
            const currentData = snapshot.val();
            const existingHighScore = currentData ? currentData.score : 0;

            if (count > existingHighScore) {
                userRef.set({
                    name: document.getElementById('username').value || auth.currentUser.email,
                    score: count
                });
            }
        });
    }
}); // Ensure this final closing bracket is present
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
        
        const entries = [];
        snapshot.forEach(child => {
            entries.push(child.val());
        });

        // Entries are sorted lowest to highest by Firebase
        entries.forEach((data, index) => {
            const item = document.createElement('li');
            
            // Apply the crown only to the last item in the array (the highest score)
            const isHighest = (index === entries.length - 1);
            const crown = isHighest ? " 👑" : ""; 
            
            item.innerHTML = `<span>${data.name}${crown}</span> <strong>${data.score}</strong>`;
            
            // We prepend so the highest score ends up at the top of the visual list
            list.prepend(item); 
        });
    });
}
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log("Sign-out successful.");
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
});
deleteBtn.addEventListener('click', () => {
    if (confirm("Are you sure? This will delete your account and your high score forever.")) {
        const user = auth.currentUser;
        const userId = user.uid;

        // 1. Remove their data from the database
        db.ref('leaderboard/' + userId).remove()
            .then(() => {
                // 2. Delete the user authentication account
                return user.delete();
            })
            .then(() => {
                console.log("Account and data deleted successfully.");
                // The onAuthStateChanged listener will automatically show the login screen
            })
            .catch((error) => {
                console.error("Error deleting account:", error);
                alert("Please log out and log back in to verify your identity before deleting your account.");
            });
    }
});
