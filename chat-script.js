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

// Encrypt Function
async function encryptText(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Convert key to CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key.padEnd(16, ' ')), // Ensure key is 16 bytes
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    // Generate a random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        data
    );

    // Combine IV and encrypted data, then Base64 encode
    const encryptedArray = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return btoa(String.fromCharCode(...encryptedArray));
}

// Decrypt Function
async function decryptText(encryptedText, key) {
    const decoder = new TextDecoder();
    const encryptedArray = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    // Extract IV (first 12 bytes) and encrypted data
    const iv = encryptedArray.slice(0, 12);
    const data = encryptedArray.slice(12);

    // Convert key to CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key.padEnd(16, ' ')), // Ensure key is 16 bytes
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        data
    );

    return decoder.decode(decrypted);
}

async function loadGroupMessages(group) {
    messagesContainer.innerHTML = ''; // Clear existing messages
    const groupMessagesRef = database.ref(`messages/${group}`);
    groupMessagesRef.off(); // Remove any existing listeners to avoid duplicates
    groupMessagesRef.on("child_added", async (snapshot) => {
        const messageData = snapshot.val();
        const messageId = snapshot.key;
        const currentUser = auth.currentUser ? auth.currentUser.uid : "anonymous";
        const decryptedMessage = await decryptText(messageData.message, "my_secret_key"); // Decrypt message before displaying
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.innerHTML = `
            <strong>${messageData.username}:</strong> ${decryptedMessage} 
            <h6><small>${messageData.timestamp}</small></h6>
            ${messageData.userId === currentUser ? `<button onclick="deleteMessage('${messageId}')">Del</button>` : ''}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to latest message
    });
}

async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message && userGroup) {
        const timestamp = new Date().toISOString();
        const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";
        const username = auth.currentUser ? auth.currentUser.displayName || "Anonymous" : "Anonymous";

        const encryptedMessage = await encryptText(message, "my_secret_key"); // Encrypt message

        const groupMessagesRef = firebase.database().ref(`messages/${userGroup}`);
        
        groupMessagesRef.push({
            userId: userId,
            username: username,
            message: encryptedMessage,
            timestamp: formatDate(timestamp)
        });

        messageInput.value = "";
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function deleteMessage(messageId) {
    const groupMessagesRef = database.ref(`messages/${userGroup}/${messageId}`);
    groupMessagesRef.remove().then(() => {
        console.log("Message deleted successfully");
        loadGroupMessages(userGroup); // Reload messages after deletion
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

// Logout function
document.getElementById("logoutButton").addEventListener("click", () => {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});
