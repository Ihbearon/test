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
button.addEventListener('click', () => {
    count++;
    display.innerHTML = count;
    
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userRef = db.ref('leaderboard/' + userId);

        // Check the existing score before saving
        userRef.once('value').then((snapshot) => {
            const currentData = snapshot.val();
            const existingHighScore = currentData ? currentData.score : 0;

            // Only update the database if the new count is higher
            if (count > existingHighScore) {
                userRef.set({
                    name: document.getElementById('username').value || auth.currentUser.email, // Or your custom name variable
                    score: count
                });
            }
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
