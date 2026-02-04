import React from "react";

const moods = ["😊", "😐", "😔", "😠", "😴", "🤩", "🤔", "😭"];

const MoodSelector = ({ selectedMood, onMoodChanged }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          <span className="text-lg">{selectedMood || "😶"}</span>
          <span className="text-xs font-semibold text-slate-500">Mood</span>
        </button>

        {/* Dropdown on Hover */}
        <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:grid grid-cols-4 gap-2 w-48 z-10">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChanged(mood)}
              className={`p-2 rounded-lg hover:bg-blue-50 transition-colors ${selectedMood === mood ? "bg-blue-100" : ""}`}
            >
              <span className="text-xl">{mood}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;
