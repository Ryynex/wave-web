import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils"; // Ensure this matches filename case
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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(null);

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
              if (decrypted.tags?.length > 0) setShowTags(true);
            }
          }
        } catch (e) {
          console.error("Load failed", e);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, currentUser, masterKey]);

  const triggerSave = useCallback(async () => {
    if (!currentUser || !masterKey) return;

    setSaveStatus("saving");
    try {
      const entryId = id || date.getTime().toString();

      // Encrypt
      const encryptedData = await CryptoUtils.envelopeEncrypt(
        {
          title,
          content,
          date,
          mood,
          tags,
          isFavorite,
          fontFamily: "plusJakartaSans",
        },
        masterKey,
      );

      // Save to Firestore
      await setDoc(
        doc(db, "users", currentUser.uid, "entries", entryId),
        {
          ...encryptedData,
          id: entryId,
          // Save both Timestamp (for Web/Admin) and String (for Flutter compatibility)
          updatedAt: new Date().toISOString(),
          serverUpdatedAt: serverTimestamp(),
          deleted: false,
        },
        { merge: true },
      );

      if (!id) {
        window.history.replaceState(null, "", `/edit/${entryId}`);
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
  }, [title, content, mood, tags, isFavorite, loading]);

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
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar isEditMode={true} onBack={() => navigate("/")} />

      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">
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
                    ? "bg-green-50 text-green-600"
                    : "bg-slate-50 text-slate-500"
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

        <div className="bg-white border-b border-slate-200 py-1">
          <FormattingToolbar
            onBold={() => insertText("**", "**")}
            onItalic={() => insertText("_", "_")}
            onQuote={() => insertText("\n> ")}
            onList={() => insertText("\n- ")}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-12 py-10 min-h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <MoodSelector selectedMood={mood} onMoodChanged={setMood} />
              <div className="w-[1px] h-6 bg-slate-200" />
              <button
                onClick={() => setShowTags(!showTags)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showTags ? "border-primary bg-primary/5 text-primary" : "border-transparent hover:bg-slate-50 text-slate-500"}`}
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

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="text-4xl font-black text-slate-800 placeholder:text-slate-200 border-none focus:outline-none focus:ring-0 bg-transparent w-full mb-6"
            />

            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="flex-1 w-full resize-none border-none focus:outline-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 bg-transparent font-sans"
              spellCheck={false}
            />

            <div className="mt-20 pt-6 border-t border-slate-50 flex justify-between text-xs text-slate-400 font-medium">
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
