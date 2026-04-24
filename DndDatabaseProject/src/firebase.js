import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDG3b5Ek87nItNcrTRN6Cquid7FK0ucbBU",
  authDomain: "dnddatabas.firebaseapp.com",
  projectId: "dnddatabas",
  storageBucket: "dnddatabas.firebasestorage.app",
  messagingSenderId: "795566622579",
  appId: "1:795566622579:web:df7ea6cfc6cd3dd827e706",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
