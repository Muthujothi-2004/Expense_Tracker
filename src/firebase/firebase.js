// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4nkPyPX81P7fU_kq8i9cmzvrnYKoTIUA",
  authDomain: "expensestracker-f9788.firebaseapp.com",
  projectId: "expensestracker-f9788",
  storageBucket: "expensestracker-f9788.firebasestorage.app",
  messagingSenderId: "579387865040",
  appId: "1:579387865040:web:a322d90c29a8061068ebd5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { Timestamp };
