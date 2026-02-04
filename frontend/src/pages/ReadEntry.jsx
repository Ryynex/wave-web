import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import Sidebar from "../components/layout/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Star, Edit, Trash2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ReadEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1.0);

  // Fetch and Decrypt
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
        } else {
          console.error("No such document!");
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

  const toggleFavorite = async () => {
    // Note: In a real app, you'd update this in Firestore immediately
    // For simplicity, we just update local state visually here
    setEntry((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    // Trigger background save logic here if needed
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!entry) return null;

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-16 py-16 pb-32">
            {/* Header */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                {entry.mood && (
                  <span className="px-3 py-1 bg-blue-50 text-xl rounded-full">
                    {entry.mood}
                  </span>
                )}
                <span>{format(entry.date, "MMMM d, yyyy")}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{format(entry.date, "h:mm a")}</span>
              </div>

              <motion.h1
                layoutId={`title_${entry.id}`}
                className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight"
              >
                {entry.title || "Untitled Memory"}
              </motion.h1>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[24px] p-12 shadow-[0_10px_40px_rgba(0,0,0,0.04)] min-h-[400px]">
              <article className="prose prose-slate prose-lg max-w-none">
                <div
                  style={{
                    fontSize: `${1.125 * fontScale}rem`,
                    lineHeight: 1.8,
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {entry.content}
                  </ReactMarkdown>
                </div>
              </article>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold border border-blue-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Command Bar */}
        <div className="absolute bottom-8 right-8 flex gap-2 p-2 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 z-10">
          <CommandButton
            icon={Star}
            active={entry.isFavorite}
            color="text-amber-400"
            onClick={toggleFavorite}
          />
          <div className="w-[1px] bg-slate-100 my-2" />
          <CommandButton icon={Edit} onClick={() => navigate(`/edit/${id}`)} />
          <div className="w-[1px] bg-slate-100 my-2" />
          <CommandButton
            icon={Trash2}
            color="text-red-500"
            hoverColor="bg-red-50"
            onClick={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

const CommandButton = ({
  icon: Icon,
  onClick,
  active,
  color = "text-slate-600",
  hoverColor = "hover:bg-slate-50",
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full transition-all ${hoverColor} ${active ? "bg-amber-50" : ""}`}
  >
    <Icon
      size={22}
      className={`${active ? color : "text-slate-500"} ${active ? "fill-current" : ""}`}
    />
  </button>
);

export default ReadEntry;
