import React, { useState } from "react";
import { X, Plus } from "lucide-react";

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
          className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900/50"
        >
          #{tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="hover:text-blue-800 dark:hover:text-blue-300 ml-1"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 border border-transparent dark:border-slate-700">
        <Plus size={14} className="text-slate-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag..."
          className="bg-transparent border-none outline-none text-sm w-24 placeholder:text-slate-400 dark:text-slate-200"
        />
      </div>
    </div>
  );
};

export default TagEditor;
