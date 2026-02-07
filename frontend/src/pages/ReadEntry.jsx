import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import { loadFont } from "../utils/fontLoader";
import Sidebar from "../components/layout/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { format } from "date-fns";
import {
  Star,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  Zap,
  Loader2,
  Hash,
  Smile,
  AlertTriangle,
} from "lucide-react";

const ReadEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // New state for the custom delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!currentUser || !masterKey || !id) return;
      try {
        const docRef = doc(db, "users", currentUser.uid, "entries", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const decrypted = await CryptoUtils.envelopeDecrypt(
            { id: docSnap.id, ...docSnap.data() },
            masterKey,
          );
          setEntry(decrypted);
          if (decrypted.fontFamily) loadFont(decrypted.fontFamily);
        } else {
          navigate("/");
        }
      } catch (e) {
        console.error("DECRYPTION_STREAM_FAILURE", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, currentUser, masterKey, navigate]);

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const progress =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setScrollProgress(progress);
  };

  // Replaces the window.confirm with setting state
  const handleDeleteRequest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Actual deletion logic
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "entries", id));
      navigate("/");
    } catch (e) {
      console.error("PURGE_FAILURE", e);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-primary">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[3px]">
          Decrypting Node...
        </span>
      </div>
    );

  if (!entry) return null;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative z-10 bg-[#020617]">
        {/* TOP META BAR */}
        <header className="relative z-40 h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6 flex-1 overflow-hidden">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div className="h-6 w-px bg-white/10 shrink-0" />

            <h1
              className="text-xl font-bold text-white truncate w-full max-w-2xl"
              style={{ fontFamily: entry.fontFamily }}
            >
              {entry.title || "Untitled Node"}
            </h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Calendar size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {format(entry.date, "MMM dd")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Clock size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {format(entry.date, "h:mm a")}
              </span>
            </div>

            {entry.isFavorite && (
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                <Star size={16} className="fill-current" strokeWidth={0} />
              </div>
            )}
          </div>
        </header>

        {/* INFO BAR */}
        <div className="relative z-30 h-14 flex items-center px-6 border-b border-white/5 bg-[#020617] shrink-0 gap-4 overflow-x-auto no-scrollbar">
          {entry.mood ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
              <span className="text-lg leading-none">{entry.mood}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Mood
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-slate-600 opacity-50 whitespace-nowrap">
              <Smile size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                No Mood
              </span>
            </div>
          )}

          <div className="w-px h-6 bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {entry.tags && entry.tags.length > 0 ? (
              entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 pl-2.5 pr-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap"
                >
                  <Hash size={10} className="opacity-50" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 pl-2 whitespace-nowrap">
                No Tags
              </span>
            )}
          </div>
        </div>

        {/* READING AREA */}
        <div className="flex-1 relative flex flex-col z-0">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5 z-20">
            <div
              className="h-full bg-primary shadow-[0_0_10px_rgba(0,169,244,0.8)] transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <div
            className="absolute inset-0 overflow-y-auto custom-scrollbar"
            onScroll={handleScroll}
          >
            <div className="w-full px-8 md:px-12 py-12 pb-48 min-h-full">
              <article
                className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-headings:font-black prose-strong:text-white prose-code:bg-white/5 prose-code:px-2 prose-code:rounded prose-img:rounded-2xl"
                style={{ fontFamily: entry.fontFamily }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {entry.content}
                </ReactMarkdown>
              </article>

              <div className="mt-20 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[3px] text-slate-700">
                {entry.content.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                Words
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Delete Node?</h3>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed px-2">
                    This action is irreversible. This memory node will be
                    permanently purged from the vault.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    {isDeleting ? "Purging..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-[#020617]/95 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2.5 px-6 py-3 bg-primary text-slate-950 rounded-xl font-black uppercase tracking-wider text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,169,244,0.2)]"
          >
            <Edit size={14} />
            Modify Data
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          <button
            onClick={handleDeleteRequest}
            className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
          >
            <Trash2 size={18} />
          </button>
          <button className="p-3 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90">
            <Zap size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReadEntry;
