import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9_nqZXGwTCZ1edUMF3kHxFb5Tisakovo",
    authDomain: "practice-d29e9.firebaseapp.com",
    projectId: "practice-d29e9",
    storageBucket: "practice-d29e9.firebasestorage.app",
    messagingSenderId: "1086461013407",
    appId: "1:1086461013407:web:5f1009519e907d009aa1aa",
    measurementId: "G-T5FBEH9HZY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp
};