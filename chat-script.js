// <script> 
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBQOhH2t5XPieLGlM3anZYco06-PvQt37c",
            authDomain: "adpsr-75e1f.firebaseapp.com",
            databaseURL: "https://adpsr-75e1f-default-rtdb.firebaseio.com",
            projectId: "adpsr-75e1f",
            storageBucket: "adpsr-75e1f.appspot.com",
            messagingSenderId: "959425930437",
            appId: "1:959425930437:web:cd3bae057e5b657a32fcac",
            measurementId: "G-1X15K2TPH4"
        };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let userGroup = ""; // Store user's group
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

auth.onAuthStateChanged((user) => {
    if (user) {
        const userId = user.uid;
        const userRef = database.ref(`users/${userId}`);

        userRef.once("value").then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                const userName = user.displayName || "Anonymous";
                userGroup = userData.group;

                document.getElementById("userName").innerText = `Username: ${userName}`;
                document.getElementById("userGroup").innerText = `Group: ${userGroup}`;

                loadGroupMessages(userGroup);
            } else {
                console.error("User data not found.");
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
    } else {
        window.location.href = "index.html";
    }
});

function loadGroupMessages(group) {
    const groupMessagesRef = database.ref(`messages/${group}`);
    groupMessagesRef.on("child_added", (snapshot) => {
        const messageData = snapshot.val();
        const messageId = snapshot.key;
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.innerHTML = `<strong>${messageData.username}:</strong> ${messageData.message} <small>${messageData.timestamp}</small> <button onclick="deleteMessage('${messageId}')">Delete</button>`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to latest message
    });
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && userGroup) {
        const timestamp = new Date().toISOString();
        const username = auth.currentUser ? auth.currentUser.displayName || "Anonymous" : "Anonymous";

        const groupMessagesRef = database.ref(`messages/${userGroup}`);
        groupMessagesRef.push({
            username: username,
            message: message,
            timestamp: formatDate(timestamp)
        });
        messageInput.value = "";
    }
}

function deleteMessage(messageId) {
    const groupMessagesRef = database.ref(`messages/${userGroup}/${messageId}`);
    groupMessagesRef.remove().then(() => {
        console.log("Message deleted successfully");
        // Optionally, remove the message element from the DOM
        const messageElement = document.querySelector(`div[data-id='${messageId}']`);
        if (messageElement) {
            messageElement.remove();
        }
    }).catch((error) => {
        console.error("Error deleting message:", error);
    });
}

document.getElementById("sendButton").addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Logout function
document.getElementById("logoutButton").addEventListener("click", () => {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});
// </script>
