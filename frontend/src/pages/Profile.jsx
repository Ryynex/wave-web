import React, { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { useTheme } from "../context/ThemeContext";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import {
  Shield,
  Lock,
  Mail,
  Moon,
  Sun,
  Award,
  Zap,
  LogOut,
  User as UserIcon,
  Fingerprint,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { lockVault, masterKey } = useEncryption();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ count: 0, words: 0 });
  const [loading, setLoading] = useState(true);

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
        console.error("STATS_ENGINE_FAILURE", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser, masterKey]);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,169,244,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1100px] mx-auto w-full px-8 py-10 h-full flex flex-col relative z-10">
          <header className="shrink-0 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Fingerprint size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[3px] text-primary">
                  Identity Terminal
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                System Profile
              </h1>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-[28px] flex items-center justify-center text-white text-4xl font-black shadow-xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                      {currentUser?.displayName?.[0] || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#020617] rounded-full animate-pulse shadow-lg" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight mb-1">
                    {currentUser?.displayName || "User"}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    {currentUser?.email}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
                    <Award size={12} className="text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">
                      Verified Entity
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <MetricTile
                  label="Decrypted Nodes"
                  value={stats.count}
                  icon={Activity}
                  color="text-primary"
                />
                <MetricTile
                  label="Lexical Volume"
                  value={Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(stats.words)}
                  icon={Zap}
                  color="text-emerald-400"
                />
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 backdrop-blur-3xl flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-6 shrink-0">
                  <Shield size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-white">
                    Security & Environment
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <SettingRow
                    onClick={toggleTheme}
                    icon={theme === "dark" ? Moon : Sun}
                    title="Interface Phase"
                    desc={
                      theme === "dark" ? "Mode: Deep Sea" : "Mode: Clean Slate"
                    }
                    active={theme === "dark"}
                    isToggle
                  />
                  <SettingRow
                    onClick={lockVault}
                    icon={Lock}
                    title="Seal Sanctuary"
                    desc="Terminate local decryption stream"
                    color="text-red-500"
                  />
                  <SettingRow
                    onClick={() => {}}
                    icon={Shield}
                    title="Neural Encryption"
                    desc="256-bit AES protection active"
                    color="text-emerald-500"
                    disabled
                  />
                </div>

                <div className="pt-6 shrink-0">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-black uppercase tracking-[3px] text-[9px] hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 group"
                  >
                    <LogOut
                      size={14}
                      className="group-hover:-translate-x-1 transition-transform"
                    />
                    Terminate Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricTile = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
    <div>
      <div className="text-[8px] font-black uppercase tracking-[2px] text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-xl font-black text-white tracking-tighter">
        {value}
      </div>
    </div>
    <div
      className={`p-2.5 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}
    >
      <Icon size={18} />
    </div>
  </div>
);

const SettingRow = ({
  onClick,
  icon: Icon,
  title,
  desc,
  active,
  isToggle,
  color = "text-primary",
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group ${disabled ? "cursor-default opacity-80" : "cursor-pointer"}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-3 bg-white/5 ${color} rounded-xl group-hover:scale-110 transition-transform`}
      >
        <Icon size={18} />
      </div>
      <div className="text-left">
        <div className="text-xs font-black text-white uppercase tracking-tight">
          {title}
        </div>
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {desc}
        </div>
      </div>
    </div>
    {isToggle ? (
      <div
        className={`w-10 h-5 rounded-full p-1 transition-colors ${active ? "bg-primary" : "bg-white/10"}`}
      >
        <div
          className={`w-3 h-3 bg-white rounded-full transition-transform ${active ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
    ) : (
      !disabled && (
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all"
        />
      )
    )}
  </button>
);

export default Profile;
