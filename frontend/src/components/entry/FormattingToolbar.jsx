import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Bold,
  Italic,
  List,
  Quote,
  Type,
  ChevronDown,
  Check,
} from "lucide-react";
import { loadFont } from "../../utils/fontLoader";

export const GOOGLE_FONTS = [
  "plusJakartaSans",
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

// Sub-component to handle lazy loading of fonts
const FontOption = ({ fontName, isSelected, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Only set up observer if the element exists and isn't already visible
    if (!elementRef.current || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          loadFont(fontName); // Load font only when it scrolls into view
          observer.disconnect();
        }
      },
      {
        root: null, // viewport
        rootMargin: "100px", // Preload fonts slightly before they appear
        threshold: 0.1,
      },
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [fontName, isVisible]);

  return (
    <button
      ref={elementRef}
      onClick={() => onSelect(fontName)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-white/5 text-slate-300"
      }`}
    >
      <span
        className="text-sm truncate mr-4"
        style={{
          fontFamily:
            fontName === "plusJakartaSans"
              ? '"Plus Jakarta Sans", sans-serif'
              : fontName,
          // Only apply the font style if we've triggered the load (visibility)
          // otherwise it might cause layout thrashing
          opacity: isVisible ? 1 : 0.7,
        }}
      >
        {fontName === "plusJakartaSans" ? "Default (Jakarta)" : fontName}
      </span>
      {isSelected && <Check size={12} />}
    </button>
  );
};

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

  // Load the active font immediately so the editor looks right
  useEffect(() => {
    loadFont(font);
  }, [font]);

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
      className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      <Button icon={Bold} onClick={onBold} tooltip="Bold" />
      <Button icon={Italic} onClick={onItalic} tooltip="Italic" />
      <Button icon={List} onClick={onList} tooltip="List" />
      <Button icon={Quote} onClick={onQuote} tooltip="Quote" />

      <div className="w-px h-3 bg-white/10 mx-2" />

      {/* Font Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors group`}
        >
          <Type
            size={14}
            className="text-slate-500 group-hover:text-primary transition-colors"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white max-w-[100px] truncate">
            {font === "plusJakartaSans" ? "Jakarta" : font}
          </span>
          <ChevronDown
            size={10}
            className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 max-h-[300px] overflow-y-auto bg-[#1e293b] rounded-lg shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-100 custom-scrollbar">
            <div className="p-1 grid gap-0.5">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 sticky top-0 bg-[#1e293b] z-10">
                Select Typeface
              </div>

              <div className="pb-1">
                {GOOGLE_FONTS.map((fontName) => (
                  <FontOption
                    key={fontName}
                    fontName={fontName}
                    isSelected={font === fontName}
                    onSelect={(f) => {
                      onFontChange(f);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormattingToolbar;
