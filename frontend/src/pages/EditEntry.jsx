import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import { loadFont } from "../utils/fontLoader"; // Import
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
  Calendar as CalendarIcon,
  Tag,
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

              // Load Font
              const savedFont = decrypted.fontFamily || "plusJakartaSans";
              setFontFamily(savedFont);
              loadFont(savedFont);

              if (decrypted.tags?.length > 0) setShowTags(true);
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

  // Load font when user changes it in dropdown
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
          fontFamily, // Save raw font name (e.g. "Dancing Script")
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center dark:bg-darkBg dark:text-white">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-darkBg overflow-hidden transition-colors duration-300">
      <Sidebar isEditMode={true} onBack={() => navigate("/")} />

      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center px-6 justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              <CalendarIcon size={16} className="text-slate-400" />
              <span className="font-semibold text-sm">
                {format(date, "MMMM d, yyyy")}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                saveStatus === "error"
                  ? "bg-red-50 text-red-600"
                  : saveStatus === "saved"
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {saveStatus === "saving" && (
                <Loader2 size={12} className="animate-spin" />
              )}
              {saveStatus === "saved" && <CheckCircle2 size={12} />}
              {saveStatus === "error" && <AlertCircle size={12} />}
              <span>
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Error"}
              </span>
            </div>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Star
                size={20}
                className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-darkCard border-b border-slate-200 dark:border-slate-800 py-1">
          <FormattingToolbar
            onBold={() => insertText("**", "**")}
            onItalic={() => insertText("_", "_")}
            onQuote={() => insertText("\n> ")}
            onList={() => insertText("\n- ")}
            font={fontFamily}
            onFontChange={setFontFamily}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-darkCard">
          <div className="max-w-3xl mx-auto px-12 py-10 min-h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <MoodSelector selectedMood={mood} onMoodChanged={setMood} />
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={() => setShowTags(!showTags)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showTags ? "border-primary bg-primary/5 text-primary" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
              >
                <Tag size={14} />
                <span className="text-xs font-bold">
                  {tags.length > 0 ? `${tags.length} Tags` : "Add Tags"}
                </span>
              </button>
            </div>

            {showTags && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                <TagEditor
                  tags={tags}
                  onAddTag={(t) => setTags([...tags, t])}
                  onRemoveTag={(t) => setTags(tags.filter((tag) => tag !== t))}
                />
              </div>
            )}

            {/* Title Input with Dynamic Font */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={{ fontFamily }}
              className="text-4xl font-black text-slate-800 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700 border-none focus:outline-none focus:ring-0 bg-transparent w-full mb-6"
            />

            {/* Content Input with Dynamic Font */}
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              style={{ fontFamily }}
              className="flex-1 w-full resize-none border-none focus:outline-none focus:ring-0 text-lg leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent"
              spellCheck={false}
            />

            <div className="mt-20 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between text-xs text-slate-400 font-medium">
              <span>
                {content.split(/\s+/).filter((w) => w.length > 0).length} words
              </span>
              <span>
                {lastSaved ? `Last saved ${format(lastSaved, "h:mm a")}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEntry;
