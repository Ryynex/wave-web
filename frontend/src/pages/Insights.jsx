import React, { useState, useEffect } from "react";
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
  "is",
  "are",
  "was",
  "were",
]);

const Insights = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    totalWords: 0,
    moods: {},
    tags: {},
    wordCloud: [],
  });

  useEffect(() => {
    const processData = async () => {
      if (!currentUser || !masterKey) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "entries"));
        const snapshot = await getDocs(q);

        const entries = [];
        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data.deleted) continue;
          const decrypted = await CryptoUtils.envelopeDecrypt(
            { id: doc.id, ...data },
            masterKey,
          );
          if (!decrypted.isError) entries.push(decrypted);
        }

        let wordCountTotal = 0;
        const moodMap = {};
        const tagMap = {};
        const wordFreq = {};
        const uniqueDates = new Set();

        entries.forEach((entry) => {
          const text = (entry.content || "").toLowerCase();
          const words = text.match(/\b\w+\b/g) || [];
          wordCountTotal += words.length;

          words.forEach((w) => {
            if (w.length > 3 && !STOP_WORDS.has(w)) {
              wordFreq[w] = (wordFreq[w] || 0) + 1;
            }
          });

          if (entry.mood) moodMap[entry.mood] = (moodMap[entry.mood] || 0) + 1;
          if (entry.tags)
            entry.tags.forEach((tag) => (tagMap[tag] = (tagMap[tag] || 0) + 1));
          if (entry.date) uniqueDates.add(new Date(entry.date).toDateString());
        });

        const sortedDates = Array.from(uniqueDates)
          .map((d) => new Date(d).getTime())
          .sort((a, b) => b - a);
        let streak = 0;
        if (sortedDates.length > 0) {
          const today = new Date().setHours(0, 0, 0, 0);
          const yesterday = today - 86400000;
          const latest = sortedDates[0];
          const norm = (t) => new Date(t).setHours(0, 0, 0, 0);
          if (
            norm(latest) === norm(today) ||
            norm(latest) === norm(yesterday)
          ) {
            streak = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
              const curr = norm(sortedDates[i]);
              const next = norm(sortedDates[i + 1]);
              const diff = (curr - next) / (1000 * 60 * 60 * 24);
              if (Math.round(diff) === 1) streak++;
              else break;
            }
          }
        }

        const sortedCloud = Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 30);

        setStats({
          totalEntries: entries.length,
          totalWords: wordCountTotal,
          currentStreak: streak,
          moods: moodMap,
          tags: tagMap,
          wordCloud: sortedCloud,
        });
      } catch (e) {
        console.error("Error processing insights", e);
      } finally {
        setLoading(false);
      }
    };
    processData();
  }, [currentUser, masterKey]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA] dark:bg-darkBg dark:text-white">
        Loading Analysis...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-darkBg overflow-hidden transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2">
              Insights
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Analyze your emotional journey
            </p>
          </div>

          <div className="grid grid-cols-3 gap-0 bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 mb-8">
            <StatItem
              icon={BookOpen}
              value={stats.totalEntries}
              label="MEMORIES"
              color="text-[#00A9F4]"
              bgColor="bg-[#00A9F4]/10 dark:bg-[#00A9F4]/20"
            />
            <div className="w-[1px] bg-slate-100 dark:bg-slate-700 mx-4" />
            <StatItem
              icon={Flame}
              value={`${stats.currentStreak}d`}
              label="STREAK"
              color="text-orange-400"
              bgColor="bg-orange-400/10 dark:bg-orange-400/20"
            />
            <div className="w-[1px] bg-slate-100 dark:bg-slate-700 mx-4" />
            <StatItem
              icon={AlignLeft}
              value={formatCompactNumber(stats.totalWords)}
              label="WORDS"
              color="text-purple-400"
              bgColor="bg-purple-400/10 dark:bg-purple-400/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DistributionCard
              title="MOOD SPECTRUM"
              data={stats.moods}
              icon={BarChart3}
              colorClass="bg-blue-500"
            />
            <DistributionCard
              title="POPULAR TAGS"
              data={stats.tags}
              icon={Hash}
              isTag={true}
              colorClass="bg-[#00A9F4]"
            />
          </div>

          <div className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit size={16} className="text-slate-400" />
              <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
                THOUGHT CLOUD
              </span>
            </div>

            {stats.wordCloud.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                Write more to reveal patterns.
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {stats.wordCloud.map(([word, count], idx) => {
                  const max = stats.wordCloud[0][1];
                  const scale = count / max;
                  const fontSize = 14 + scale * 16;
                  const opacity = 0.5 + scale * 0.5;

                  return (
                    <span
                      key={word}
                      style={{ fontSize: `${fontSize}px`, opacity }}
                      className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl text-slate-700 dark:text-blue-100 font-bold border border-blue-100/50 dark:border-blue-800/30 transition-all hover:scale-110 cursor-default"
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, value, label, color, bgColor }) => (
  <div className="flex flex-col items-center flex-1">
    <div className={`p-3 rounded-full ${bgColor} mb-4`}>
      <Icon size={24} className={color} />
    </div>
    <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">
      {value}
    </span>
    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">
      {label}
    </span>
  </div>
);

const DistributionCard = ({
  title,
  data,
  icon: Icon,
  isTag = false,
  colorClass,
}) => {
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={16} className="text-slate-400" />
        <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
          {title}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          No data available
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map(([label, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={label}>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>{isTag ? `#${label}` : label}</span>
                  <span className="text-slate-400">{percent}%</span>
                </div>
                <div className="h-2 bg-slate-50 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${colorClass}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const formatCompactNumber = (number) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

export default Insights;
