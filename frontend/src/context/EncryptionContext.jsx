import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../config/firebase"; // Now this import works
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as CryptoUtils from "../utils/cryptoUtils";

const EncryptionContext = createContext();

export const useEncryption = () => useContext(EncryptionContext);

export const EncryptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [masterKey, setMasterKey] = useState(null);
  const [lockedBox, setLockedBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);

  // 1. Fetch the "Locked Box" (Encrypted Master Key) from Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoadingBox(false);
      return;
    }

    const fetchBox = async () => {
      try {
        // Direct Firestore call - No local sync manager
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists() && userDoc.data().lockedBox) {
          setLockedBox(userDoc.data().lockedBox);
        } else {
          setLockedBox(null); // User needs to create a vault
        }
      } catch (e) {
        console.error("Error fetching locked box:", e);
      } finally {
        setLoadingBox(false);
      }
    };

    fetchBox();
  }, [currentUser]);

  // 2. Unlock Vault (Decrypt the Master Key)
  const unlockVault = async (password) => {
    if (!lockedBox || !currentUser) return false;

    // CryptoUtils runs purely in memory - no storage
    const key = await CryptoUtils.unlockMasterKey(
      password,
      currentUser.uid,
      lockedBox,
    );

    if (key) {
      setMasterKey(key); // Key is held in React State (RAM) only
      return true;
    }
    return false;
  };

  // 3. Create Vault (Generate and Save new Master Key)
  const createVault = async (password) => {
    if (!currentUser) return;

    const result = await CryptoUtils.generateNewMasterKey(
      password,
      currentUser.uid,
    );

    // Save directly to cloud
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
  };

  const lockVault = () => {
    setMasterKey(null);
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
