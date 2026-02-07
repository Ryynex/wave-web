import React, { useState, useRef, useEffect } from "react";
import { Smile, X } from "lucide-react";

const moods = ["😊", "😐", "😔", "😠", "😴", "🤩", "🤔", "😭", "🤯", "🥳"];

const MoodSelector = ({ selectedMood, onMoodChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          selectedMood
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-transparent border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
        }`}
      >
        {selectedMood ? (
          <>
            <span className="text-lg leading-none">{selectedMood}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Mood
            </span>
            <div
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoodChanged(null);
              }}
              className="ml-1 p-0.5 hover:bg-black/20 rounded-full"
            >
              <X size={10} />
            </div>
          </>
        ) : (
          <>
            <Smile size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Set Mood
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-[#1e293b] rounded-xl shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-100 w-64">
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => {
                  onMoodChanged(mood);
                  setIsOpen(false);
                }}
                className={`aspect-square flex items-center justify-center rounded-lg text-2xl hover:bg-white/10 transition-transform hover:scale-110 active:scale-95 ${
                  selectedMood === mood
                    ? "bg-primary/20 ring-1 ring-primary/50"
                    : ""
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
