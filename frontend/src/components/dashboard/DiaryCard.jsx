import React, { useEffect } from "react";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { loadFont } from "../../utils/fontLoader";

const DiaryCard = ({ entry, onClick }) => {
  const dateObj =
    entry.date instanceof Date ? entry.date : new Date(entry.date);
  const day = format(dateObj, "d");
  const month = format(dateObj, "MMM").toUpperCase();
  const time = format(dateObj, "EEEE, h:mm a");

  // Dynamically load the font for this specific card
  useEffect(() => {
    if (entry.fontFamily) {
      loadFont(entry.fontFamily);
    }
  }, [entry.fontFamily]);

  const getPreviewText = (md) => {
    if (!md) return "";
    return md.replace(/[#*`_]/g, "");
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-darkCard border border-transparent dark:border-slate-800 hover:border-blue-100 dark:hover:border-slate-700 rounded-[24px] p-4 transition-all duration-300 ease-out cursor-pointer shadow-[0_8px_20px_-4px_rgba(45,52,54,0.05)] dark:shadow-none hover:shadow-[0_10px_25px_rgba(0,169,244,0.15)] hover:scale-[1.01]"
    >
      <div className="flex h-full">
        {/* Date Badge */}
        <div className="w-[50px] py-2 bg-[#F0F4F8] dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center shrink-0 h-fit group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
          <span className="text-xl font-extrabold text-[#2D3436] dark:text-slate-200 leading-none mb-1">
            {day}
          </span>
          <span className="text-[10px] font-bold text-[#636E72] dark:text-slate-400 tracking-wider group-hover:text-primary transition-colors">
            {month}
          </span>
        </div>

        <div className="w-[1px] h-auto bg-gray-100 dark:bg-slate-700 mx-3.5" />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 tracking-wide uppercase">
              {time}
            </span>
            {entry.isFavorite && (
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            )}
          </div>

          <h3
            className="mt-2 text-[16px] font-bold text-slate-800 dark:text-slate-100 truncate leading-snug"
            style={{ fontFamily: entry.fontFamily }}
          >
            {entry.title || "Untitled Memory"}
          </h3>

          <p
            className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2"
            style={{ fontFamily: entry.fontFamily }}
          >
            {getPreviewText(entry.content)}
          </p>
        </div>

        {/* Mood Indicator */}
        {entry.mood && (
          <div className="ml-2 shrink-0">
            <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
              <span className="text-lg leading-none">{entry.mood}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryCard;
