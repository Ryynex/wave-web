import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import DiaryCard from "../components/dashboard/DiaryCard";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Layers,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Timeline = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
        console.error("TIMELINE_CORE_ERROR", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser, masterKey]);

  const selectedEntries = useMemo(() => {
    return entries
      .filter((e) => isSameDay(new Date(e.date), selectedDate))
      .sort((a, b) => b.date - a.date);
  }, [selectedDate, entries]);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-black text-slate-500 py-3 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
        {calendarDays.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, monthStart);
          const hasEntry = entries.some((e) =>
            isSameDay(new Date(e.date), date),
          );

          return (
            <div
              key={i}
              className="aspect-square flex items-center justify-center p-1"
            >
              <button
                onClick={() => setSelectedDate(date)}
                className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all relative group
                  ${
                    isSelected
                      ? "bg-primary text-slate-950 shadow-lg shadow-primary/20 scale-105"
                      : isCurrentMonth
                        ? "hover:bg-white/5 text-slate-300"
                        : "text-slate-700 opacity-40"
                  }
                `}
              >
                <span className="text-xs font-bold">{format(date, "d")}</span>
                {hasEntry && !isSelected && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#00A9F4]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return null;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

        <div className="max-w-[1400px] w-full mx-auto px-8 lg:px-12 py-12 h-full flex flex-col md:flex-row gap-12 relative z-10">
          <aside className="md:w-[380px] shrink-0 flex flex-col">
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <Layers size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-primary">
                  Temporal Index
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Timeline
              </h1>
            </header>

            <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] p-6 border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {format(currentMonth, "MMMM")}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {format(currentMonth, "yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      setCurrentMonth(d);
                      setSelectedDate(d);
                    }}
                    className="px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              {renderCalendar()}
            </div>

            <div className="mt-6 p-6 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-primary" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Activity Density
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                System detected{" "}
                <span className="text-primary font-bold">{entries.length}</span>{" "}
                decrypted nodes across the temporal continuum.
              </p>
            </div>
          </aside>

          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#00A9F4]" />
                <h3 className="text-sm font-black text-white uppercase tracking-[3px]">
                  {format(selectedDate, "EEEE, MMMM do")}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {selectedEntries.length} Signals Found
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {selectedEntries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <CalendarIcon size={32} className="text-slate-600" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      No Records Detected
                    </h4>
                    <p className="text-sm text-slate-500 max-w-[240px] mb-8">
                      This temporal coordinate contains zero encrypted data
                      nodes.
                    </p>
                    <button
                      onClick={() => navigate("/create")}
                      className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Initialize Entry
                    </button>
                  </motion.div>
                ) : (
                  <motion.div layout className="grid grid-cols-1 gap-6">
                    {selectedEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <DiaryCard entry={entry} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Timeline;
