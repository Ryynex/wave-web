import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import VaultLockScreen from "../components/security/VaultLockScreen";
import DiaryCard from "../components/dashboard/DiaryCard";
import Sidebar from "../components/layout/Sidebar";
import * as CryptoUtils from "../utils/cryptoUtils";
import { RefreshCw, Plus, Star, PlusCircle, LayoutGrid } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

const InteractiveCard = ({ children, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = e.clientX - rect.left - width / 2;
    const centerY = e.clientY - rect.top - height / 2;
    x.set(centerX);
    y.set(centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { isLocked, isLoading: isAuthLoading, masterKey } = useEncryption();
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!currentUser || !masterKey) return;
    setLoadingEntries(true);
    try {
      const q = query(collection(db, "users", currentUser.uid, "entries"));
      const snapshot = await getDocs(q);
      const decryptedPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (data.deleted) return null;
        const decrypted = await CryptoUtils.envelopeDecrypt(
          { id: doc.id, ...data },
          masterKey,
        );
        return decrypted.isError ? null : decrypted;
      });
      const results = await Promise.all(decryptedPromises);
      const validEntries = results.filter((e) => e !== null);
      validEntries.sort((a, b) => b.date - a.date);
      setAllEntries(validEntries);
    } catch (error) {
      console.error("DATA_FETCH_ERROR", error);
    } finally {
      setLoadingEntries(false);
      setRefreshing(false);
    }
  }, [currentUser, masterKey]);

  useEffect(() => {
    if (masterKey && !isLocked) fetchEntries();
  }, [masterKey, isLocked, fetchEntries]);

  const filteredEntries = useMemo(() => {
    return activeTab === "fav"
      ? allEntries.filter((e) => e.isFavorite)
      : allEntries;
  }, [activeTab, allEntries]);

  if (isAuthLoading) return null;
  if (isLocked) return <VaultLockScreen />;

  const firstName = currentUser?.displayName?.split(" ")[0] || "User";

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,169,244,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full px-8 lg:px-12 pt-16 pb-32 relative z-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-primary/50" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-primary">
                  System Dashboard
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                Hello, <span className="text-primary">{firstName}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchEntries();
                }}
                className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl backdrop-blur-md active:scale-95 ${refreshing ? "animate-spin" : ""}`}
              >
                <RefreshCw size={20} />
              </button>
            </motion.div>
          </header>

          <section className="flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex gap-10">
                {["all", "fav"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-6 text-sm font-black uppercase tracking-[2px] transition-all ${
                      activeTab === tab
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab === "all" ? "All Entries" : "Favorites"}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(0,169,244,0.6)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <LayoutGrid size={12} />
                <span>{filteredEntries.length} Units</span>
              </div>
            </div>

            {loadingEntries ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-600 animate-pulse">
                  Syncing Vault
                </span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <div className="w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500">
                  {activeTab === "all" ? (
                    <PlusCircle size={40} className="text-slate-700" />
                  ) : (
                    <Star size={40} className="text-slate-700" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Records
                </h3>
                <p className="text-slate-500 max-w-[280px]">
                  Your encrypted storage is currently empty for this category.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry) => (
                    <motion.div key={entry.id} variants={itemVariants} layout>
                      <InteractiveCard
                        onClick={() => navigate(`/entry/${entry.id}`)}
                      >
                        <DiaryCard entry={entry} />
                      </InteractiveCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/create")}
          className="fixed bottom-12 right-12 w-20 h-20 bg-primary text-slate-950 rounded-[28px] shadow-[0_20px_40px_rgba(0,169,244,0.4)] flex items-center justify-center cursor-pointer z-50 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          <Plus size={36} strokeWidth={3} />
        </motion.button>
      </main>
    </div>
  );
};

export default Dashboard;
