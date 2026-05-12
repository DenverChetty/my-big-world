import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Your Firebase configuration
// Get this from: https://console.firebase.google.com → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAUIujnqnEWd6jg2crES0lfFlUKzG2lTv4",
  authDomain: "my-big-world-79980.firebaseapp.com",
  projectId: "my-big-world-79980",
  storageBucket: "my-big-world-79980.firebasestorage.app",
  messagingSenderId: "60867825408",
  appId: "1:60867825408:web:6f76dea53f2561754fade5",
  measurementId: "G-8HTTG28PF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Keep user signed in across page reloads
setPersistence(auth, browserLocalPersistence);

export { auth, db, googleProvider, doc, getDoc, setDoc, updateDoc };

// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ... your firebaseConfig object is unchanged ...

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Optional: Add custom parameters (like forcing account selection)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

setPersistence(auth, browserLocalPersistence);

export { auth, db, googleProvider, signInWithPopup };
