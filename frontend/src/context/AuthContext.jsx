import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  signInWithRedirect, // <--- CHANGED: Use Redirect instead of Popup
  signOut,
  onAuthStateChanged,
  getRedirectResult, // <--- CHANGED: Handle the return from Google
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Handle the Return from Google (Run once on mount)
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth);
        // User is signed in, 'onAuthStateChanged' below will catch it
      } catch (error) {
        console.error("Redirect Login Error:", error);
      }
    };
    handleRedirect();
  }, []);

  // 2. The Login Function
  const loginWithGoogle = async () => {
    try {
      // This will redirect the page to Google. No Popup.
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login Trigger Failed", error);
    }
  };

  const logout = () => signOut(auth);

  // 3. Monitor Auth State
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
