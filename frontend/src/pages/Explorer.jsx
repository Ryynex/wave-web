import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import DiaryCard from "../components/dashboard/DiaryCard";
import {
  Search as SearchIcon,
  X,
  Compass,
  Hash,
  Layers,
  Filter,
  Star,
  Clock,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Explorer = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser || !masterKey) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "entries"));
        const snapshot = await getDocs(q);
        const results = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.deleted) return null;
            return await CryptoUtils.envelopeDecrypt(
              { id: doc.id, ...data },
              masterKey,
            );
          }),
        );
        setAllEntries(results.filter((e) => e !== null && !e.isError));
      } catch (e) {
        console.error("EXPLORER_INIT_FAILURE", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [currentUser, masterKey]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    allEntries.forEach((e) => e.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allEntries]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      const matchesSearch =
        (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.content || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || e.tags?.includes(selectedTag);

      let matchesReadyFilter = true;
      if (activeFilter === "favorites") matchesReadyFilter = e.isFavorite;
      if (activeFilter === "recent") {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchesReadyFilter = e.date >= oneWeekAgo;
      }
      if (activeFilter === "long") {
        matchesReadyFilter = (e.content || "").length > 500;
      }

      return matchesSearch && matchesTag && matchesReadyFilter;
    });
  }, [allEntries, searchQuery, selectedTag, activeFilter]);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,169,244,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1400px] w-full mx-auto px-8 lg:px-12 py-10 h-full flex flex-col gap-6 relative z-10">
          <header className="shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Compass size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-primary">
                  Data Retrieval
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Explorer
              </h1>
            </motion.div>
          </header>

          <div className="flex flex-col gap-6 shrink-0">
            <div className="relative group max-w-2xl">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none gap-3">
                <SearchIcon size={18} className="text-primary" />
                <div className="w-[1px] h-4 bg-white/10" />
              </div>
              <input
                type="text"
                placeholder="Search across the encrypted continuum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 text-white pl-16 pr-12 py-5 rounded-[28px] focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600 font-medium shadow-2xl backdrop-blur-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-6 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-4 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Filter size={12} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ready Filters
                  </span>
                </div>
                {[
                  { id: "all", label: "All Nodes", icon: Layers },
                  { id: "favorites", label: "Favorites", icon: Star },
                  { id: "recent", label: "Last 7 Days", icon: Clock },
                  { id: "long", label: "Deep Logs", icon: Zap },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeFilter === f.id
                        ? "bg-primary text-slate-950 border-primary shadow-[0_0_20px_rgba(0,169,244,0.3)]"
                        : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <f.icon size={12} />
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-4 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Hash size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Neural Tags
                  </span>
                </div>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(tag === selectedTag ? null : tag)
                    }
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      selectedTag === tag
                        ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "bg-white/5 text-slate-500 border-white/5 hover:border-emerald-500/50"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[3px]">
                  Indexing...
                </span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] text-center p-12"
              >
                <Layers size={32} className="text-slate-800 mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  No matching nodes detected
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      onClick={() => navigate(`/entry/${entry.id}`)}
                    >
                      <DiaryCard entry={entry} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explorer;
