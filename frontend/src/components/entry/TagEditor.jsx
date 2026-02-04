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
          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
        >
          #{tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="hover:text-blue-800"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-lg focus-within:ring-2 focus-within:ring-primary/20">
        <Plus size={14} className="text-slate-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag..."
          className="bg-transparent border-none outline-none text-sm w-24 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};

export default TagEditor;
