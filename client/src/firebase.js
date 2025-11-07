// --- 1. THESE IMPORT LINES ARE THE FIX ---
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- 2. PASTE YOUR REAL FIREBASE CONFIG OBJECT HERE ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEDCDrIXxh_2d79lFmMtqw2pgAY_jjrNU",
  authDomain: "web-chat-app-a832f.firebaseapp.com",
  databaseURL: "https://web-chat-app-a832f-default-rtdb.firebaseio.com",
  projectId: "web-chat-app-a832f",
  storageBucket: "web-chat-app-a832f.firebasestorage.app",
  messagingSenderId: "826288572999",
  appId: "1:826288572999:web:7c794c9687a094a98dbf62",
  measurementId: "G-2KLR0WBFFR"
};
// ----------------------------------------------

// --- 3. THESE LINES USE THE IMPORTS ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);