import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Handle the return from Google Redirect
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth);
        // We don't need to do anything manually here;
        // onAuthStateChanged below will pick up the user automatically.
      } catch (error) {
        console.error("Redirect Login Error:", error);
      }
    };
    handleRedirect();
  }, []);

  // 2. Login Trigger (Redirects page immediately)
  const loginWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login Trigger Failed", error);
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
