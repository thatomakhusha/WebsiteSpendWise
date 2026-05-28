
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCm3bjPL6SQYVRRuLupCzbOsgeHrVIz4U4",
    authDomain: "spendwise-88c6a.firebaseapp.com",
    projectId: "spendwise-88c6a",
    storageBucket: "spendwise-88c6a.firebasestorage.app",
    messagingSenderId: "1002656047111",
    appId: "1:1002656047111:web:0be961aa5024d315664aa2",
    measurementId: "G-1Q3B79FW1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// EXPORT so other files can use it
export { app, auth };