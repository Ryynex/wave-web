import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as CryptoUtils from "../utils/cryptoUtils";

const EncryptionContext = createContext();

export const useEncryption = () => useContext(EncryptionContext);

export const EncryptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [masterKey, setMasterKey] = useState(null);
  const [lockedBox, setLockedBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);

  // 1. Initialize: Check Session Storage & Fetch Vault
  useEffect(() => {
    if (!currentUser) {
      setLoadingBox(false);
      return;
    }

    const initEncryption = async () => {
      // A. Check for persisted key in Session Storage (Fixes Refresh Issue)
      const savedKey = sessionStorage.getItem(`wave_key_${currentUser.uid}`);
      if (savedKey) {
        setMasterKey(savedKey);
      }

      // B. Fetch LockedBox from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().lockedBox) {
          setLockedBox(userDoc.data().lockedBox);
        } else {
          setLockedBox(null);
        }
      } catch (e) {
        console.error("Error fetching locked box:", e);
      } finally {
        setLoadingBox(false);
      }
    };

    initEncryption();
  }, [currentUser]);

  // 2. Unlock Vault
  const unlockVault = async (password) => {
    if (!lockedBox || !currentUser) return false;

    const key = await CryptoUtils.unlockMasterKey(
      password,
      currentUser.uid,
      lockedBox,
    );

    if (key) {
      setMasterKey(key);
      // Save to Session Storage
      sessionStorage.setItem(`wave_key_${currentUser.uid}`, key);
      return true;
    }
    return false;
  };

  // 3. Create Vault
  const createVault = async (password) => {
    if (!currentUser) return;

    const result = await CryptoUtils.generateNewMasterKey(
      password,
      currentUser.uid,
    );

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        lockedBox: result.lockedBox,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    setLockedBox(result.lockedBox);
    setMasterKey(result.masterKeyB64);
    sessionStorage.setItem(`wave_key_${currentUser.uid}`, result.masterKeyB64);
  };

  // 4. Lock / Logout
  const lockVault = () => {
    setMasterKey(null);
    if (currentUser) {
      sessionStorage.removeItem(`wave_key_${currentUser.uid}`);
    }
  };

  return (
    <EncryptionContext.Provider
      value={{
        isLocked: !masterKey,
        hasVault: !!lockedBox,
        isLoading: loadingBox,
        masterKey,
        unlockVault,
        createVault,
        lockVault,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
};
