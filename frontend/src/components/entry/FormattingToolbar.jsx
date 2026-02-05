import React, { useEffect, useState, useRef } from "react";
import { Bold, Italic, List, Quote, Type, ChevronDown } from "lucide-react";
import { loadFont } from "../../utils/fontLoader";

export const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Oswald",
  "Source Sans Pro",
  "Slabo 27px",
  "Raleway",
  "PT Sans",
  "Merriweather",
  "Noto Sans",
  "Nunito",
  "Concert One",
  "Prompt",
  "Work Sans",
  "Rubik",
  "Fira Sans",
  "Quicksand",
  "Karla",
  "Inconsolata",
  "Barlow",
  "Titillium Web",
  "Mukta",
  "Oxygen",
  "Heebo",
  "Ubuntu",
  "Bitter",
  "Libre Baskerville",
  "Anton",
  "Cabin",
  "Arvo",
  "Hind",
  "Pacifico",
  "Dancing Script",
  "Shadows Into Light",
  "Lobster",
  "Indie Flower",
  "Abril Fatface",
  "Bree Serif",
  "Fjalla One",
  "Crimson Text",
  "Playfair Display",
  "DM Sans",
  "Manrope",
  "Nanum Gothic",
  "Varela Round",
  "Maven Pro",
  "Asap",
  "Cairo",
  "Exo 2",
  "Kanit",
  "Josefin Sans",
  "Teko",
  "Signika",
  "Righteous",
  "Permanent Marker",
  "Fredoka One",
  "Alfa Slab One",
  "Bangers",
  "Creepster",
  "Press Start 2P",
  "Special Elite",
  "Monoton",
  "Satisfy",
  "Courgette",
  "Great Vibes",
  "Sacramento",
  "Cookie",
  "Amatic SC",
  "Caveat",
  "Gloria Hallelujah",
  "Covered By Your Grace",
  "Patrick Hand",
  "Architects Daughter",
  "Yellowtail",
  "Kaushan Script",
  "Marck Script",
  "Bad Script",
  "Nothing You Could Do",
  "Homemade Apple",
  "Mr Dafoe",
  "Pinyon Script",
  "Tangerine",
  "Allura",
  "Parisienne",
  "Petit Formal Script",
  "Aguafina Script",
  "Herr Von Muellerhoff",
  "Sue Ellen Francisco",
  "Waiting for the Sunrise",
  "Zeyada",
  "Over the Rainbow",
  "Reenie Beanie",
  "Annie Use Your Telescope",
  "Dawning of a New Day",
  "Cedarville Cursive",
  "Kristi",
  "Meddon",
  "The Girl Next Door",
  "Love Ya Like A Sister",
  "Walter Turncoat",
];

const FormattingToolbar = ({
  onBold,
  onItalic,
  onList,
  onQuote,
  font,
  onFontChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load the active font immediately in the editor
  useEffect(() => {
    loadFont(font);
  }, [font]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const Button = ({ icon: Icon, onClick, tooltip }) => (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex items-center gap-2 py-2 px-4 relative z-40">
      <Button icon={Bold} onClick={onBold} tooltip="Bold (**text**)" />
      <Button icon={Italic} onClick={onItalic} tooltip="Italic (_text_)" />
      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
      <Button icon={List} onClick={onList} tooltip="Bullet List" />
      <Button icon={Quote} onClick={onQuote} tooltip="Quote" />
      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-2" />

      {/* Font Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all w-48 justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Type size={14} className="text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
              {font === "plusJakartaSans" ? "Default (Jakarta)" : font}
            </span>
          </div>
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 grid gap-1">
              <button
                onClick={() => {
                  onFontChange("plusJakartaSans");
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${font === "plusJakartaSans" ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              >
                Default (Jakarta)
              </button>

              {GOOGLE_FONTS.map((fontName) => (
                <button
                  key={fontName}
                  onMouseEnter={() => loadFont(fontName)} // Preload on hover for preview
                  onClick={() => {
                    onFontChange(fontName);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-lg rounded-lg transition-colors truncate ${
                    font === fontName
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                  style={{ fontFamily: fontName }}
                >
                  {fontName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormattingToolbar;
