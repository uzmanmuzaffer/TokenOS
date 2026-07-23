import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_BKlM75bomr52WJm8kViREtd27Et0AaA",
  authDomain: "tokenos-42cd4.firebaseapp.com",
  projectId: "tokenos-42cd4",
  storageBucket: "tokenos-42cd4.appspot.com",
  messagingSenderId: "540871665151",
  appId: "1:540871665151:web:e72c0c46425e3c9e1433ca",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);