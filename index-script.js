  
        // Firebase Configuration (replace with your own config)
      
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
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const database = firebase.database(app);

        // References
        const authContainer = document.getElementById("authContainer");
        const signupContainer = document.getElementById("signupContainer");
        const errorMessage = document.getElementById("errorMessage");
        const signupErrorMessage = document.getElementById("signupErrorMessage");

        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is authenticated
                getAndPushIP();
            } else {
                // User is not authenticated
                console.error('User is not authenticated.');
            }
        });
        
        function getAndPushIP() {
            fetch('https://ipinfo.io/json')
                .then(response => response.json())
                .then(data => {
                    const userIP = data.ip;
                    console.log('Fetched IP Address:', userIP);
        
                    const ipRef = database.ref('viewerIPs');
        
                    // Checking if the IP already exists in Firebase
                    ipRef.orderByChild('ip').equalTo(userIP).once('value', snapshot => {
                        if (snapshot.exists()) {
                            snapshot.forEach(childSnapshot => {
                                const childKey = childSnapshot.key;
                                ipRef.child(childKey).update({
                                    timestamp: formatDate(new Date())
                                }).then(() => {
                                    console.log('Timestamp updated for existing IP address!');
                                    updateViewerCount();
                                }).catch(error => {
                                    console.error('Error updating timestamp:', error);
                                });
                            });
                        } else {
                            ipRef.push({
                                ip: userIP,
                                timestamp: formatDate(new Date())
                            }).then(() => {
                                console.log('IP address pushed to Firebase successfully!');
                                updateViewerCount();
                            }).catch(error => {
                                console.error('Error pushing IP address to Firebase:', error);
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching IP address:', error);
                });
        }
        
        function updateViewerCount() {
            const ipRef = database.ref('viewerIPs');
            ipRef.once('value', snapshot => {
                const count = snapshot.numChildren();
                document.getElementById('viewerCount').innerText = `Viewer count: ${count}`;
            });
        }
        
        function formatDate(date) {
            return date.toLocaleString();
        }

        // Function to handle login
        function login(event) {
            event.preventDefault();  // Prevent form submission

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (email === "" || password === "") {
                errorMessage.style.display = "block";
                errorMessage.textContent = "Email and password cannot be empty!";
                return;
            }

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    authContainer.style.display = "none";
                    alert("Login successful!");

                    // Redirect to chat.html after successful login
                    window.location.href = "chat.html";
                })
                .catch((error) => {
                    console.error("Login Error:", error.message);
                    errorMessage.style.display = "block";
                    errorMessage.textContent = error.message;
                });
        }

        // Disabling the signup button
        document.getElementById("termsCheckbox").addEventListener("change", function () {
            document.getElementById("signupButton").disabled = !this.checked;
        });

        // Signup function
        function signup() {
            const termsCheckbox = document.getElementById("termsCheckbox");
            if (!termsCheckbox.checked) {
                signupErrorMessage.style.display = "block";
                signupErrorMessage.textContent = "Please read and accept the terms and conditions.";
            } else {
                const username = document.getElementById("username").value.trim();
                const email = document.getElementById("signupEmail").value.trim();
                const password = document.getElementById("signupPassword").value.trim();
                const group = document.getElementById("group").value;
                
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        user.updateProfile({
                            displayName: username
                        }).then(() => {
                            const userRef = database.ref(`users/${user.uid}`);
                            userRef.set({ group: group });
                            signupContainer.style.display = "none";
                            
                                  // import * as Bytescale from "@bytescale/sdk";
                                  const uploadManager = new Bytescale.UploadManager({
                                    apiKey: "public_FW25cKpDr5MQcwMBW6DbvWeiSSfW" // This is your API key.
                                  });
                            
                            // Ensure this function is defined before it is used
                            const onFileSelected = async event => {
                                const file = event.target.files[0];
                                const email = auth.currentUser.email; // Get the current user's email
                            
                                // Extract the file extension to preserve it
                                const fileExtension = file.name.split('.').pop();
                                const newFileName = `${email}.${fileExtension}`;
                            
                                // Create a new file with the email as the name
                                const newFile = new File([file], newFileName, { type: file.type });
                            
                                try {
                                    const { fileUrl, filePath } = await uploadManager.upload({ data: newFile });
                                    alert(`File uploaded:\n${fileUrl}`);
                                } catch (e) {
                                    alert(`Error:\n${e.message}`);
                                }
                            }
                            
                            // HTML input element should have the onchange event defined correctly
                            document.getElementById("fileInput").addEventListener("change", onFileSelected);
                            alert("Signup successful!");
                        });
                    })
                    .catch((error) => {
                        console.error("Signup Error:", error.message);
                        signupErrorMessage.style.display = "block";
                        signupErrorMessage.textContent = error.message;
                    });
            }
        }

        // Function to handle password reset
        function resetPassword() {
            const email = prompt("Please enter your email address:");
            if (email) {
                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        alert("Password reset email sent!");
                    })
                    .catch((error) => {
                        console.error("Error sending password reset email:", error.message);
                        errorMessage.textContent = "Error sending password reset email: " + error.message;
                        errorMessage.style.display = "block";
                    });
            }
        }

        document.getElementById("loginButton").addEventListener("click", login);
        document.getElementById("signupButton").addEventListener("click", signup);
        document.getElementById("showSignup").addEventListener("click", () => {
            authContainer.style.display = "none";
            signupContainer.style.display = "flex";
        });
        document.getElementById("showLogin").addEventListener("click", () => {
            signupContainer.style.display = "none";
            authContainer.style.display = "flex";
        });
        document.getElementById("resetPasswordButton").addEventListener("click", resetPassword);
    
