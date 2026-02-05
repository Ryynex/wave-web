import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import { loadFont } from "../utils/fontLoader"; // <--- Import Loader
import Sidebar from "../components/layout/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Star, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const ReadEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

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
          // Load font immediately
          if (decrypted.fontFamily) loadFont(decrypted.fontFamily);
        } else {
          navigate("/");
        }
      } catch (e) {
        console.error("Error loading entry:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, currentUser, masterKey, navigate]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this memory? This cannot be undone.",
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "entries", id));
        navigate("/");
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center dark:bg-darkBg dark:text-white">
        Loading...
      </div>
    );
  if (!entry) return null;

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-darkBg overflow-hidden transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 md:px-16 py-12 pb-32">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-sm">Back</span>
              </button>

              <div className="flex gap-2">
                {entry.isFavorite && (
                  <div
                    className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full"
                    title="Favorite Memory"
                  >
                    <Star size={20} className="fill-current" />
                  </div>
                )}
              </div>
            </div>

            {/* Entry Header */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <Calendar size={14} />
                  <span>{format(entry.date, "MMMM d, yyyy • h:mm a")}</span>
                </div>
                {entry.mood && (
                  <span className="text-xl" title="Mood">
                    {entry.mood}
                  </span>
                )}
              </div>

              <motion.h1
                layoutId={`title_${entry.id}`}
                className="text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight"
                style={{ fontFamily: entry.fontFamily }}
              >
                {entry.title || "Untitled Memory"}
              </motion.h1>
            </div>

            {/* Content Body */}
            <div className="bg-white dark:bg-darkCard rounded-[32px] p-10 md:p-14 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[500px]">
              <article
                className="prose prose-lg prose-slate dark:prose-invert max-w-none leading-loose"
                style={{ fontFamily: entry.fontFamily }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {entry.content}
                </ReactMarkdown>
              </article>
            </div>

            {/* Footer Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold tracking-wide"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Actions */}
        <div className="absolute bottom-8 right-8 flex gap-3">
          <button
            onClick={handleDelete}
            className="p-4 bg-white dark:bg-slate-800 text-red-500 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-slate-100 dark:border-slate-700"
            title="Delete"
          >
            <Trash2 size={24} />
          </button>

          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="p-4 bg-slate-900 dark:bg-primary text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-110 transition-all"
            title="Edit"
          >
            <Edit size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadEntry;
