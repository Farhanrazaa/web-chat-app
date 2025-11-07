import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
// Get this from your Firebase Project Settings (click the ⚙️ icon)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
// ----------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// This is the line that fixes the error by exporting 'db'
export const db = getFirestore(app);

// --- 2. ADD THIS EXPORT ---
// Export authentication
export const auth = getAuth(app);