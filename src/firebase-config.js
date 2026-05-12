import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUIujnqnEWd6jg2crES0lfFlUKzG2lTv4",
  authDomain: "mybigworld.online",
  projectId: "my-big-world-79980",
  storageBucket: "my-big-world-79980.firebasestorage.app",
  messagingSenderId: "60867825408",
  appId: "1:60867825408:web:6f76dea53f2561754fade5",
  measurementId: "G-8HTTG28PF9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

setPersistence(auth, browserLocalPersistence);

export { auth, db, googleProvider, doc, getDoc, setDoc, updateDoc, signInWithPopup };
