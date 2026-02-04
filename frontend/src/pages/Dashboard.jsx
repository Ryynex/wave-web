/* src/pages/Dashboard.jsx */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase"; // Ensure this exports your firestore instance
import VaultLockScreen from "../components/security/VaultLockScreen";
import DiaryCard from "../components/dashboard/DiaryCard";
import * as CryptoUtils from "../utils/cryptoUtils";
import { RefreshCw, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { isLocked, isLoading: isAuthLoading, masterKey } = useEncryption();

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'fav'
  const [refreshing, setRefreshing] = useState(false);

  // If locked or checking auth, show the Lock Screen
  // The Lock Screen handles the 'Loading' state internaly via hasVault check
  if (isAuthLoading || isLocked) {
    return <VaultLockScreen />;
  }

  const fetchEntries = async () => {
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
        // If the entry is marked as deleted (soft delete), skip it
        if (data.deleted) return null;

        // Decrypt
        return await CryptoUtils.envelopeDecrypt(
          { id: doc.id, ...data },
          masterKey,
        );
      });

      const results = await Promise.all(decryptedPromises);
      setEntries(results.filter((e) => e !== null && !e.isError));
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoadingEntries(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchEntries();
  }, [masterKey]); // Fetch when masterKey becomes available

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

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
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 opacity-50">
            <div className="p-8 bg-blue-50 rounded-full mb-4">
              {activeTab === "all" ? (
                <Plus size={40} className="text-blue-400" />
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
                onClick={() => console.log("Open Entry", entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform">
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Dashboard;
