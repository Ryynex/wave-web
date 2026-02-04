import React from "react";
import { Bold, Italic, List, Quote, Type } from "lucide-react";

const FormattingToolbar = ({ onBold, onItalic, onList, onQuote }) => {
  const Button = ({ icon: Icon, onClick, tooltip }) => (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Button icon={Bold} onClick={onBold} tooltip="Bold (**text**)" />
      <Button icon={Italic} onClick={onItalic} tooltip="Italic (_text_)" />
      <div className="w-[1px] h-4 bg-slate-200 mx-2" />
      <Button icon={List} onClick={onList} tooltip="Bullet List" />
      <Button icon={Quote} onClick={onQuote} tooltip="Quote" />
      <div className="w-[1px] h-4 bg-slate-200 mx-2" />
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 cursor-not-allowed opacity-50">
        <Type size={14} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-400">
          Plus Jakarta Sans
        </span>
      </div>
    </div>
  );
};

export default FormattingToolbar;
