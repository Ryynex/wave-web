import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <--- ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyDdJGi-bfyR0fQ7qvGOrUI0KDDA2IbgXG8",
  authDomain: "wave-ced5e.firebaseapp.com",
  projectId: "wave-ced5e",
  storageBucket: "wave-ced5e.firebasestorage.app",
  messagingSenderId: "952369658820",
  appId: "1:952369658820:web:11f22aba5b207a03c10291",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // <--- ADD THIS EXPORT
