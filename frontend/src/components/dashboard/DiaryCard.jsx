import React, { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Star, Clock, Zap, ArrowUpRight } from "lucide-react";
import { loadFont } from "../../utils/fontLoader";

const DiaryCard = ({ entry }) => {
  const dateObj =
    entry.date instanceof Date ? entry.date : new Date(entry.date);
  const day = format(dateObj, "dd");
  const month = format(dateObj, "MMM");
  const time = format(dateObj, "hh:mm a");

  useEffect(() => {
    if (entry.fontFamily) {
      loadFont(entry.fontFamily);
    }
  }, [entry.fontFamily]);

  const moodConfig = useMemo(() => {
    const maps = {
      "😊": "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-400",
      "😢": "from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-400",
      "🔥": "from-orange-500/20 to-red-500/5 border-orange-500/20 text-orange-400",
      "✨": "from-primary/20 to-purple-500/5 border-primary/20 text-primary",
      "🧘": "from-slate-500/20 to-slate-400/5 border-slate-500/20 text-slate-400",
      "💡": "from-yellow-500/20 to-amber-500/5 border-yellow-500/20 text-amber-400",
    };
    return (
      maps[entry.mood] ||
      "from-white/5 to-transparent border-white/5 text-slate-500"
    );
  }, [entry.mood]);

  const getPreviewText = (md) => {
    if (!md) return "";
    return md.replace(/[#*`_]/g, "").substring(0, 85);
  };

  return (
    <div
      className={`relative group w-full h-[210px] bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 transition-all duration-500 hover:border-primary/40 overflow-hidden flex flex-col justify-between`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${moodConfig.split(" ").slice(0, 2).join(" ")}`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center justify-center w-12 h-12 bg-white text-slate-950 rounded-2xl shadow-2xl">
                <span className="text-xl font-black leading-none tracking-tighter">
                  {day}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                  {month}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-slate-300 transition-colors">
                <Clock size={10} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[2px]">
                  {time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {entry.isFavorite && (
              <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-full border border-amber-500/20">
                <Star size={14} className="text-amber-500 fill-amber-500" />
              </div>
            )}
            <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          </div>
        </div>

        <h3
          className="text-lg font-black text-white mb-2 tracking-tight leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300"
          style={{ fontFamily: entry.fontFamily }}
        >
          {entry.title || "Untitled Node"}
        </h3>

        <p
          className="text-[13px] font-medium text-slate-400 leading-relaxed line-clamp-2"
          style={{ fontFamily: entry.fontFamily }}
        >
          {getPreviewText(entry.content)}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 ${moodConfig.split(" ").pop()}`}
          >
            <span className="text-xs filter drop-shadow-sm">
              {entry.mood || "🌑"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[2px]">
              {entry.mood ? "Status" : "Void"}
            </span>
          </div>

          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
        </div>

        <div className="flex items-center gap-1">
          <Zap
            size={12}
            className="text-slate-700 group-hover:text-primary transition-colors"
          />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiaryCard;
