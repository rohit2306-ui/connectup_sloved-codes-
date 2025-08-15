// src/config/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBcfUBDepW0O8abzmq3wHxv4VySMgnwGoc",
  authDomain: "connectup-d4cb0.firebaseapp.com",
  databaseURL: "https://connectup-d4cb0-default-rtdb.firebaseio.com",
  projectId: "connectup-d4cb0",
  storageBucket: "connectup-d4cb0.appspot.com", // fixed typo
  messagingSenderId: "722006586472",
  appId: "1:722006586472:web:5653bba725f61d3a3eb7dd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
