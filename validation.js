// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfd2248DUNdP9XrOT5DoHreovxydRy9qs",
  authDomain: "quickchatapp-d83a2.firebaseapp.com",
  databaseURL:
    "https://quickchatapp-d83a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quickchatapp-d83a2",
  storageBucket: "quickchatapp-d83a2.appspot.com",
  messagingSenderId: "588119145594",
  appId: "1:588119145594:web:cac385ca995fcb5dc48fc3",
  measurementId: "G-3M7FWYVPQR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const database = getDatabase(app);

// Function to validate email format using a regular expression
function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailPattern.test(email);
}

// Function to validate username using a regex
function validateUsername(username) {
  const usernamePattern = /^[A-Za-z0-9]+$/; // Allows letters and numbers
  return usernamePattern.test(username);
}

// Function to validate password strength
function validatePassword(password) {
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/; // At least one uppercase, one lowercase, one number, one special character, and min 6 characters
  return passwordPattern.test(password);
}

// Function to print error messages
function printError(elemID, hintMsg) {
  document.getElementById(elemID).innerText = hintMsg; // Correct assignment operator
}

// Function to check if email already exists in registered users
async function checkEmailExists(email) {
  const userRef = ref(database, "registered_users");
  const snapshot = await get(userRef); // Use get() to fetch data

  if (!snapshot.exists()) {
    return false; // If no users are found
  }

  // Check each user for matching email
  const users = snapshot.val();
  for (let userId in users) {
    if (users[userId].email === email) {
      return true; // Email exists
    }
  }
  return false; // Email does not exist
}

// Add an event listener to the form submission for registration
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent form from submitting

  // Clear previous error messages
  document.getElementById("usernameErr").innerText = "";
  document.getElementById("emailErr").innerText = "";
  document.getElementById("passwordErr").innerText = "";
  document.getElementById("confirmPasswordErr").innerText = "";

  // Get form values
  const username = document.getElementById("username")
    ? document.getElementById("username").value.trim()
    : "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword")
    ? document.getElementById("confirmPassword").value
    : "";

  // Validate inputs
  let isValid = true;

  // Validate username (if available)
  if (username && (!validateUsername(username) || username.length < 3)) {
    printError(
      "usernameErr",
      "Username must be at least 3 characters and contain only letters and numbers."
    );
    isValid = false;
  }

  // Validate email
  if (!validateEmail(email)) {
    printError("emailErr", "Please enter a valid email address.");
    isValid = false;
  }

  // Validate password
  if (!validatePassword(password)) {
    printError(
      "passwordErr",
      "Password must be at least 6 characters long and include upper/lowercase letters, numbers, and special characters."
    );
    isValid = false;
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    printError("confirmPasswordErr", "Passwords do not match.");
    isValid = false;
  }

  // Check if email already exists before proceeding
  if (isValid) {
    const emailExists = await checkEmailExists(email); // Check for existing email
    if (emailExists) {
      printError("emailErr", "This email is already in use.");
      isValid = false;
    }
  }

  // If all validations passed, register user
  if (isValid && confirmPassword) {
    // Show loading indicator
    const loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.style.display = "block";

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Show success modal
      const successModal = new bootstrap.Modal(
        document.getElementById("successModal")
      );
      successModal.show();

      // Clear form fields
      document.querySelector("form").reset();

      // Optionally redirect after a few seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use.";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address is not valid.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
      }
      printError("emailErr", errorMessage); // Show error message
    } finally {
      // Hide loading indicator
      loadingIndicator.style.display = "none";
    }
  }
});

// Function to handle login
function handleLogin(e) {
  e.preventDefault(); // Prevent default form submission

  // Clear previous error messages
  document.getElementById("emailErr").innerText = "";
  document.getElementById("passwordErr").innerText = "";

  // Get login form values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validate email
  if (!validateEmail(email)) {
    printError("emailErr", "Please enter a valid email address.");
    return;
  }

  // Validate password
  if (password.length < 6) {
    printError("passwordErr", "Password must be at least 6 characters long.");
    return;
  }

  // If validations passed, try logging in
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successful login
      alert("Successfully Logged In");
      window.location.href = "start-chat.html"; // Redirect to chat page
    })
    .catch((error) => {
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
      }
      printError("emailErr", errorMessage); // Show error message
    });
}

// Event listener for login form submission
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

// Toggle password visibility
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    this.classList.toggle("fa-eye-slash"); // Change icon to eye slash
  });

document
  .getElementById("toggleConfirmPassword")
  .addEventListener("click", function () {
    const confirmPasswordField = document.getElementById("confirmPassword");
    const type =
      confirmPasswordField.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordField.setAttribute("type", type);
    this.classList.toggle("fa-eye-slash"); // Change icon to eye slash
  });
