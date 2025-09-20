import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCVzQGUYRf2GLblNnDxYn7FrXksy9-O8Ig",
    authDomain: "progress-tracker-ea7d8.firebaseapp.com",
    projectId: "progress-tracker-ea7d8",
    storageBucket: "progress-tracker-ea7d8.firebasestorage.app",
    messagingSenderId: "75869585957",
    appId: "1:75869585957:web:89945750a3fea90a2fb5cc",
    measurementId: "G-1QS3ZQZQ0W"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);