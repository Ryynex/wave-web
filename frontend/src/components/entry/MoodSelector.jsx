import React from "react";

const moods = ["😊", "😐", "😔", "😠", "😴", "🤩", "🤔", "😭"];

const MoodSelector = ({ selectedMood, onMoodChanged }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-transparent">
          <span className="text-lg leading-none">{selectedMood || "😶"}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mood
          </span>
        </button>

        {/* Dropdown on Hover */}
        <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:grid grid-cols-4 gap-2 w-48 z-20">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChanged(mood)}
              className={`p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${selectedMood === mood ? "bg-blue-100 dark:bg-slate-600" : ""}`}
            >
              <span className="text-xl leading-none">{mood}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;
