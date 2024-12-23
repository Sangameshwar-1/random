// <script>
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
        // index-script.js
       // index-script.js
      document.getElementById("termsCheckbox").addEventListener("change", function() {
          document.getElementById("signupButton").disabled = !this.checked;
      });
      
      document.getElementById("signupButton").addEventListener("click", function() {
          if (document.getElementById("termsCheckbox").checked) {
              // Proceed with sign-up logic
              // Function to handle signup
              function signup() {
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
          else {
               document.getElementById("signupErrorMessage").style.display = "block";
          }
      });
        
        // Event listeners
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
// </script>