import React, { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { useTheme } from "../context/ThemeContext";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import {
  User,
  Shield,
  Lock,
  Mail,
  Moon,
  Sun,
  Award,
  Zap,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { lockVault, masterKey } = useEncryption();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ count: 0, words: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser || !masterKey) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "entries"));
        const snapshot = await getDocs(q);
        let wordCount = 0;
        let entryCount = 0;

        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data.deleted) continue;
          // We decrypt just to count words accurately
          const decrypted = await CryptoUtils.envelopeDecrypt(
            { id: doc.id, ...data },
            masterKey,
          );
          if (!decrypted.isError) {
            entryCount++;
            const text = decrypted.content || "";
            wordCount += text.split(/\s+/).filter((w) => w.length > 0).length;
          }
        }
        setStats({ count: entryCount, words: wordCount });
      } catch (e) {
        console.error("Stats error", e);
      }
    };
    fetchStats();
  }, [currentUser, masterKey]);

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-darkBg transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Manage your account and preferences.
              </p>
            </div>
          </div>

          {/* User Hero Card */}
          <div className="bg-white dark:bg-darkCard rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-500/30 z-10">
              {currentUser?.displayName?.[0] || "U"}
            </div>
            <div className="z-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentUser?.displayName || "User"}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                <Mail size={16} />
                <span className="text-sm">{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-bold flex items-center gap-1">
                  <Award size={12} /> Premium Member
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-darkCard p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white mb-1">
                {stats.count}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Memories
              </span>
            </div>
            <div className="bg-white dark:bg-darkCard p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white mb-1">
                {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                  stats.words,
                )}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Words Written
              </span>
            </div>
          </div>

          {/* Settings Section */}
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 ml-2 flex items-center gap-2">
            <Zap size={20} className="text-blue-500" /> Preferences
          </h3>

          <div className="bg-white dark:bg-darkCard rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[20px] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl">
                  {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    Appearance
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {theme === "dark"
                      ? "Dark Mode is active"
                      : "Light Mode is active"}
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
                />
              </div>
            </button>
          </div>

          {/* Security Section */}
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 ml-2 flex items-center gap-2">
            <Shield size={20} className="text-blue-500" /> Security
          </h3>

          <div className="bg-white dark:bg-darkCard rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <button
              onClick={lockVault}
              className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[20px] transition-colors text-left group"
            >
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">
                  Lock Sanctuary Now
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Immediately lock your encrypted diary entries.
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
