import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import {
  BookOpen,
  Flame,
  AlignLeft,
  BarChart3,
  Hash,
  BrainCircuit,
  Zap,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const STOP_WORDS = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
]);

const Insights = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!currentUser || !masterKey) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "entries"));
        const snapshot = await getDocs(q);
        const decryptedPromises = snapshot.docs.map(async (doc) => {
          const data = doc.data();
          if (data.deleted) return null;
          return await CryptoUtils.envelopeDecrypt(
            { id: doc.id, ...data },
            masterKey,
          );
        });
        const results = await Promise.all(decryptedPromises);
        setEntries(results.filter((e) => e !== null && !e.isError));
      } catch (e) {
        console.error("INSIGHTS_ENGINE_FAILURE", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser, masterKey]);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    let totalWords = 0;
    const moodCounts = {};
    const tagCounts = {};
    const wordFreq = {};

    entries.forEach((e) => {
      const content = (e.content || "").trim();
      const words = content.split(/\s+/);
      totalWords += words.length;

      words.forEach((w) => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, "");
        if (clean && clean.length > 2 && !STOP_WORDS.has(clean)) {
          wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
      });

      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });

    return { totalEntries, totalWords, moodCounts, tagCounts, wordFreq };
  }, [entries]);

  if (loading) return null;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,169,244,0.15),transparent_60%)] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 py-10 h-full flex flex-col gap-8 relative z-10">
          <header className="shrink-0 flex items-end justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-[1px] bg-primary/50" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-primary">
                  Intelligence Hub
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                System Analytics
              </h1>
            </motion.div>
            <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Live Decryption Stream
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <StatCard
              icon={BookOpen}
              label="Total Nodes"
              value={stats.totalEntries}
              color="text-primary"
              glow="shadow-primary/20"
            />
            <StatCard
              icon={AlignLeft}
              label="Lexical Volume"
              value={stats.totalWords.toLocaleString()}
              color="text-emerald-400"
              glow="shadow-emerald-500/20"
            />
            <StatCard
              icon={Flame}
              label="Current Pulse"
              value="0"
              color="text-orange-500"
              glow="shadow-orange-500/20"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 pb-8">
            <div className="h-full min-h-0">
              <DistributionCard
                title="Emotional Distribution"
                icon={BarChart3}
                data={stats.moodCounts}
                total={stats.totalEntries}
                accent="bg-primary"
              />
            </div>

            <div className="h-full min-h-0">
              <DistributionCard
                title="Tag Clustering"
                icon={Hash}
                data={stats.tagCounts}
                total={stats.totalEntries}
                accent="bg-emerald-500"
                isTag
              />
            </div>

            <div className="h-full min-h-0">
              <WordPatternCard data={stats.wordFreq} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, glow }) => (
  <div
    className={`bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-2xl flex items-center justify-between group hover:border-white/20 transition-all ${glow} shadow-2xl`}
  >
    <div className="flex items-center gap-5">
      <div
        className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}
      >
        <Icon size={24} />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[3px] text-slate-500 mb-1">
          {label}
        </div>
        <div className="text-3xl font-black text-white tracking-tighter">
          {value}
        </div>
      </div>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Zap size={16} className={color} />
    </div>
  </div>
);

const DistributionCard = ({
  title,
  icon: Icon,
  data,
  total,
  accent,
  isTag = false,
}) => {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] backdrop-blur-3xl h-full flex flex-col hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <Icon size={14} className="text-primary" />
          </div>
          <span className="text-[11px] font-black text-white tracking-[3px] uppercase">
            {title}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          sorted.map(([label, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={label} className="group cursor-default">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">
                    {isTag ? `#${label}` : label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white">
                      {percent}
                    </span>
                    <span className="text-[10px] font-black text-slate-600">
                      %
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                    className={`h-full rounded-full relative z-10 ${accent} shadow-[0_0_10px_rgba(0,169,244,0.2)]`}
                  />
                  <div className="absolute inset-0 bg-white/5" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const WordPatternCard = ({ data }) => {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] backdrop-blur-3xl h-full flex flex-col hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-8 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <AlignLeft size={14} className="text-primary" />
        </div>
        <span className="text-[11px] font-black text-white tracking-[3px] uppercase">
          Repeating Patterns
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          sorted.map(([word, count]) => (
            <motion.div
              key={word}
              whileHover={{ x: 5 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(0,169,244,0.8)] transition-all" />
                <span className="text-sm font-bold text-slate-300 tracking-tight group-hover:text-white uppercase">
                  "{word}"
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-primary leading-none uppercase">
                  {count} Hits
                </span>
                <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                  Frequency
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center opacity-30">
    <Zap size={24} className="mb-4 animate-pulse" />
    <span className="text-[10px] font-black uppercase tracking-[4px]">
      Neural Void
    </span>
  </div>
);

export default Insights;
