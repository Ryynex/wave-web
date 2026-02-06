import React from "react";
import { Smile } from "lucide-react";

const moods = ["😊", "😐", "😔", "😠", "😴", "🤩", "🤔", "😭"];

const MoodSelector = ({ selectedMood, onMoodChanged }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-2 py-1 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all">
        {selectedMood ? (
          <span className="text-lg leading-none">{selectedMood}</span>
        ) : (
          <Smile size={16} />
        )}
      </button>

      <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 p-2 bg-[#0f172a] rounded-xl shadow-2xl border border-white/10 hidden group-hover:grid grid-cols-4 gap-1 w-40 z-50">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => onMoodChanged(mood)}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
              selectedMood === mood ? "bg-primary/10" : ""
            }`}
          >
            <span className="text-xl leading-none">{mood}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
