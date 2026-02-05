import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  signInWithPopup, // <--- CHANGE THIS IMPORT
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. REMOVED: getRedirectResult useEffect is no longer needed

  // 2. Login Trigger (Changed to Popup)
  const loginWithGoogle = async () => {
    try {
      // Using Popup avoids the "redirect loop" caused by browser storage blocking
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  const logout = () => signOut(auth);

  // 3. Monitor Global Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
