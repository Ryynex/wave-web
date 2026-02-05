import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Timeline = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]); // All entries
  const [selectedEntries, setSelectedEntries] = useState([]); // Entries for selected date
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Entries (to mark dots on calendar)
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
        console.error("Error fetching timeline", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser, masterKey]);

  // 2. Filter entries when Date or Entries change
  useEffect(() => {
    const matches = entries.filter((e) =>
      isSameDay(new Date(e.date), selectedDate),
    );
    // Sort by time descending
    matches.sort((a, b) => b.date - a.date);
    setSelectedEntries(matches);
  }, [selectedDate, entries]);

  // --- Calendar Helpers ---
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    // Generate Days
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold text-slate-400 py-2 uppercase tracking-wider"
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
            <div key={i} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedDate(date)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative
                  ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                      : isCurrentMonth
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300"
                  }
                `}
              >
                <span>{format(date, dateFormat)}</span>

                {/* Dot Indicator for entries */}
                {hasEntry && !isSelected && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-6 pt-8 pb-4 h-full flex flex-col md:flex-row gap-8">
          {/* LEFT: Calendar Widget */}
          <div className="md:w-[400px] shrink-0 flex flex-col">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-6">
              Timeline
            </h1>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 ml-2">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-500"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={jumpToToday}
                    className="p-2 hover:bg-slate-50 rounded-full text-blue-500 text-xs font-bold uppercase tracking-wide"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-500"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              {renderCalendar()}
            </div>
          </div>

          {/* RIGHT: Entry List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-4 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {format(selectedDate, "EEEE, MMMM do")}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">
              {selectedEntries.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[300px]">
                  <CalendarIcon size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">
                    No memories on this day
                  </p>
                  <button
                    onClick={() => navigate("/create")}
                    className="mt-4 text-blue-500 font-bold hover:underline"
                  >
                    Write a new entry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEntries.map((entry) => (
                    <DiaryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => navigate(`/entry/${entry.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
