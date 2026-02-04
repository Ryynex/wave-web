import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import VaultLockScreen from "../components/security/VaultLockScreen";
import DiaryCard from "../components/dashboard/DiaryCard";
import * as CryptoUtils from "../utils/cryptoUtils";
import { RefreshCw, Plus, Star, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { isLocked, isLoading: isAuthLoading, masterKey } = useEncryption();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Logic
  const fetchEntries = useCallback(async () => {
    if (!currentUser || !masterKey) return;

    setLoadingEntries(true);
    try {
      const q = query(
        collection(db, "users", currentUser.uid, "entries"),
        orderBy("date", "desc"),
      );
      const snapshot = await getDocs(q);

      const decryptedPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Skip deleted entries
        if (data.deleted) return null;

        // Decrypt
        const decrypted = await CryptoUtils.envelopeDecrypt(
          { id: doc.id, ...data },
          masterKey,
        );

        if (decrypted.isError) return null;
        return decrypted;
      });

      const results = await Promise.all(decryptedPromises);
      setEntries(results.filter((e) => e !== null));
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoadingEntries(false);
      setRefreshing(false);
    }
  }, [currentUser, masterKey]);

  // Trigger Fetch
  useEffect(() => {
    if (masterKey && !isLocked) {
      fetchEntries();
    }
  }, [masterKey, isLocked, fetchEntries]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  // Render Conditional States
  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        Loading...
      </div>
    );
  }

  if (isLocked) {
    return <VaultLockScreen />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = currentUser?.displayName?.split(" ")[0] || "Friend";
  const filteredEntries =
    activeTab === "all" ? entries : entries.filter((e) => e.isFavorite);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-4xl font-extrabold text-slate-800">
              {firstName}.
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${refreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw className="text-slate-400" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-slate-200">
          {["all", "fav"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-lg font-bold transition-all relative ${
                activeTab === tab
                  ? "text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "all" ? "All Memories" : "Favorites"}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loadingEntries ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 opacity-50">
            <div className="p-8 bg-blue-50 rounded-full mb-4">
              {activeTab === "all" ? (
                <PlusCircle size={40} className="text-blue-400" />
              ) : (
                <Star size={40} className="text-amber-400" />
              )}
            </div>
            <p className="text-lg font-semibold text-slate-600">
              {activeTab === "all"
                ? "Your story begins here."
                : "No favorites yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/entry/${entry.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/create")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#00A9F4] text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Dashboard;
