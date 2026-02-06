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
import { format } from "date-fns";
import {
  Star,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  Zap,
} from "lucide-react";

const ReadEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Confirm permanent deletion of this data node?")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "entries", id));
        navigate("/");
      } catch (e) {
        console.error("PURGE_FAILURE", e);
      }
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
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[4px]">
          Decrypting Node...
        </span>
      </div>
    );

  if (!entry) return null;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-[60]">
          <div
            className="h-full bg-primary shadow-[0_0_10px_rgba(0,169,244,0.8)] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,169,244,0.03),transparent_70%)] pointer-events-none" />

        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative z-10 scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="w-full max-w-[1100px] mx-auto px-12 lg:px-24 py-16 pb-48">
            <header className="mb-10">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 mb-8 text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-[10px] font-black uppercase tracking-[3px]">
                  Index
                </span>
              </button>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2.5 px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                    <Calendar size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-300">
                      {format(entry.date, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                    <Clock size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-300">
                      {format(entry.date, "hh:mm a")}
                    </span>
                  </div>
                  {entry.isFavorite && (
                    <Star size={18} className="text-amber-500 fill-amber-500" />
                  )}
                  {entry.mood && (
                    <div className="flex items-center gap-2.5 px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        {entry.mood}
                      </span>
                    </div>
                  )}
                </div>

                <h1
                  className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter"
                  style={{ fontFamily: entry.fontFamily }}
                >
                  {entry.title || "Untitled Node"}
                </h1>
              </div>
            </header>

            <article
              className="prose prose-invert prose-lg max-w-none prose-p:leading-[1.8] prose-p:text-slate-300 prose-headings:text-white prose-headings:font-black prose-strong:text-white prose-code:bg-white/5 prose-code:px-2 prose-code:rounded prose-img:rounded-2xl"
              style={{ fontFamily: entry.fontFamily }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.content}
              </ReactMarkdown>
            </article>

            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-3">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-white/[0.02] border border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

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
            onClick={handleDelete}
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
