import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ─────────────────────────────────────────────────────────
// Fill these in from your Firebase project console:
// Firebase Console → Project Settings → Your apps → SDK setup
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDgXP8_9uYj7khq0sQ41gVuAslhTO9Cz2E",
  authDomain: "stephanny-portfolio.firebaseapp.com",
  projectId: "stephanny-portfolio",
  storageBucket: "stephanny-portfolio.firebasestorage.app",
  messagingSenderId: "566438754439",
  appId: "1:566438754439:web:e772da514ae745ad0f2022",
  measurementId: "G-PGB1PWR8QD",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
