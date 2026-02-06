import React, { useState } from "react";
import { X, Plus, Hash } from "lucide-react";

const TagEditor = ({ tags, onAddTag, onRemoveTag }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAddTag(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-widest"
        >
          <Hash size={10} className="opacity-50" />
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="hover:text-white ml-1 transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}

      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5 focus-within:border-primary/50 transition-colors">
        <Plus size={12} className="text-slate-500" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New Tag..."
          className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-24 p-0 focus:ring-0"
        />
      </div>
    </div>
  );
};

export default TagEditor;
