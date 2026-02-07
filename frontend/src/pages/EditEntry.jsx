import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import { loadFont } from "../utils/fontLoader";
import Sidebar from "../components/layout/Sidebar";
import FormattingToolbar from "../components/entry/FormattingToolbar";
import MoodSelector from "../components/entry/MoodSelector";
import TagEditor from "../components/entry/TagEditor";
import { format } from "date-fns";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  ArrowLeft,
  Calendar,
  Hash,
} from "lucide-react";

const EditEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [fontFamily, setFontFamily] = useState("plusJakartaSans");
  const [showTags, setShowTags] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(null);

  // Load Entry
  useEffect(() => {
    const init = async () => {
      if (!currentUser || !masterKey) return;

      if (id) {
        try {
          const docRef = doc(db, "users", currentUser.uid, "entries", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const decrypted = await CryptoUtils.envelopeDecrypt(
              { id: docSnap.id, ...docSnap.data() },
              masterKey,
            );
            if (!decrypted.isError) {
              setTitle(decrypted.title);
              setContent(decrypted.content);
              setDate(decrypted.date);
              setMood(decrypted.mood);
              setTags(decrypted.tags || []);
              setIsFavorite(decrypted.isFavorite);

              const savedFont = decrypted.fontFamily || "plusJakartaSans";
              setFontFamily(savedFont);
              loadFont(savedFont);
            }
          }
        } catch (e) {
          console.error("Load failed", e);
          addToast("Failed to load entry", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [id, currentUser, masterKey]);

  useEffect(() => {
    loadFont(fontFamily);
  }, [fontFamily]);

  const triggerSave = useCallback(async () => {
    if (!currentUser || !masterKey) return;

    setSaveStatus("saving");
    try {
      const entryId = id || date.getTime().toString();

      const encryptedData = await CryptoUtils.envelopeEncrypt(
        {
          title,
          content,
          date,
          mood,
          tags,
          isFavorite,
          fontFamily,
        },
        masterKey,
      );

      await setDoc(
        doc(db, "users", currentUser.uid, "entries", entryId),
        {
          ...encryptedData,
          id: entryId,
          updatedAt: new Date().toISOString(),
          serverUpdatedAt: serverTimestamp(),
          deleted: false,
        },
        { merge: true },
      );

      if (!id) {
        window.history.replaceState(null, "", `/edit/${entryId}`);
        addToast("Memory created successfully!", "success");
      }

      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (e) {
      console.error("Save failed", e);
      setSaveStatus("error");
    }
  }, [
    id,
    title,
    content,
    date,
    mood,
    tags,
    isFavorite,
    fontFamily,
    currentUser,
    masterKey,
  ]);

  useEffect(() => {
    if (loading) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, mood, tags, isFavorite, fontFamily, loading]);

  const insertText = (before, after = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const newText =
      text.substring(0, start) +
      before +
      selection +
      after +
      text.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Logic to return to Read Page if ID exists, else Dashboard
  const handleBack = () => {
    if (id) {
      navigate(`/entry/${id}`);
    } else {
      navigate("/");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-primary">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[3px]">
          Accessing Vault...
        </span>
      </div>
    );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative z-10">
        {/* TOP BAR: Header (Z-Index 40) */}
        <header className="relative z-40 h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={handleBack}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Node"
              style={{ fontFamily }}
              className="bg-transparent border-none text-xl font-bold text-white placeholder:text-slate-600 focus:ring-0 px-0 w-full max-w-2xl"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {saveStatus === "saving" && (
                <Loader2 size={12} className="animate-spin text-primary" />
              )}
              {saveStatus === "saved" && (
                <CheckCircle2 size={12} className="text-emerald-500" />
              )}
              {saveStatus === "error" && (
                <AlertCircle size={12} className="text-red-500" />
              )}
              <span>
                {saveStatus === "saving"
                  ? "Syncing..."
                  : saveStatus === "saved"
                    ? "Synced"
                    : "Error"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Calendar size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {format(date, "MMM dd")}
              </span>
            </div>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-all ${
                isFavorite
                  ? "bg-amber-500/10 text-amber-500"
                  : "hover:bg-white/5 text-slate-600 hover:text-slate-300"
              }`}
            >
              <Star
                size={16}
                className={isFavorite ? "fill-current" : ""}
                strokeWidth={isFavorite ? 0 : 2}
              />
            </button>
          </div>
        </header>

        {/* TOOLBAR: Formatting, Mood, Tags (Z-Index 50 to allow dropdowns) */}
        <div className="relative z-50 h-12 flex items-center justify-between px-6 border-b border-white/5 bg-[#020617] shrink-0">
          <FormattingToolbar
            onBold={() => insertText("**", "**")}
            onItalic={() => insertText("_", "_")}
            onQuote={() => insertText("\n> ")}
            onList={() => insertText("\n- ")}
            font={fontFamily}
            onFontChange={setFontFamily}
          />

          <div className="flex items-center gap-4">
            <div className="w-px h-4 bg-white/10" />
            <MoodSelector selectedMood={mood} onMoodChanged={setMood} />
            <button
              onClick={() => setShowTags(!showTags)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${
                showTags || tags.length > 0
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Hash size={14} />
              <span>{tags.length > 0 ? `${tags.length} Tags` : "Tags"}</span>
            </button>
          </div>
        </div>

        {/* TAGS DRAWER (Z-Index 30) */}
        {showTags && (
          <div className="relative z-30 px-6 py-3 border-b border-white/5 bg-white/[0.02] animate-in slide-in-from-top-2">
            <TagEditor
              tags={tags}
              onAddTag={(t) => setTags([...tags, t])}
              onRemoveTag={(t) => setTags(tags.filter((tag) => tag !== t))}
            />
          </div>
        )}

        {/* MAIN EDITOR AREA (Z-Index 0) */}
        <div className="flex-1 relative bg-[#020617] z-0">
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            style={{ fontFamily }}
            className="absolute inset-0 w-full h-full p-8 bg-transparent border-none text-lg text-slate-300 placeholder:text-slate-700 leading-relaxed focus:ring-0 resize-none custom-scrollbar"
            spellCheck={false}
          />
        </div>

        {/* FOOTER INFO */}
        <div className="absolute bottom-4 right-6 pointer-events-none opacity-50 z-20">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {content.split(/\s+/).filter((w) => w.length > 0).length} Words
          </span>
        </div>
      </main>
    </div>
  );
};

export default EditEntry;
