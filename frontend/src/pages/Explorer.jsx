import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import * as CryptoUtils from "../utils/cryptoUtils";
import DiaryCard from "../components/dashboard/DiaryCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Explorer = () => {
  const { currentUser } = useAuth();
  const { masterKey } = useEncryption();
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // Stats for tags
  const [availableTags, setAvailableTags] = useState([]);

  // 1. Fetch & Decrypt All (Client-side search required for encrypted data)
  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser || !masterKey) return;
      try {
        const q = query(collection(db, "users", currentUser.uid, "entries"));
        const snapshot = await getDocs(q);

        const results = [];
        const tagCounts = {};

        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data.deleted) continue;
          const decrypted = await CryptoUtils.envelopeDecrypt(
            { id: doc.id, ...data },
            masterKey,
          );

          if (!decrypted.isError) {
            results.push(decrypted);
            // Count tags
            if (decrypted.tags) {
              decrypted.tags.forEach((t) => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
              });
            }
          }
        }

        // Sort by date desc
        results.sort((a, b) => b.date - a.date);

        setAllEntries(results);
        setFilteredEntries(results);

        // Convert tag counts to array
        const tagArray = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([tag]) => tag);
        setAvailableTags(tagArray);
      } catch (e) {
        console.error("Search fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [currentUser, masterKey]);

  // 2. Filter Logic
  useEffect(() => {
    let result = allEntries;

    // Text Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.content && e.content.toLowerCase().includes(q)),
      );
    }

    // Tag Filter
    if (selectedTag) {
      result = result.filter((e) => e.tags && e.tags.includes(selectedTag));
    }

    setFilteredEntries(result);
  }, [searchQuery, selectedTag, allEntries]);

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="max-w-4xl mx-auto w-full px-6 pt-10 pb-4 flex flex-col h-full">
          {/* Header & Search Bar */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-6">
              Explorer
            </h1>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories, ideas, or feelings..."
                className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-blue-500 focus:outline-none transition-all shadow-sm font-medium text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Tags / Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Filter by Tags
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                  selectedTag === null
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                All
              </button>
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(tag === selectedTag ? null : tag)
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                    selectedTag === tag
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-blue-500 border-blue-100 hover:border-blue-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto pb-20 -mx-4 px-4">
            {loading ? (
              <div className="flex justify-center pt-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center pt-20 opacity-50">
                <p className="text-lg font-medium text-slate-500">
                  No matching entries found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEntries.map((entry) => (
                  <DiaryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => navigate(`/entry/${entry.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
