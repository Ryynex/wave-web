import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  PieChart,
  Search,
  User,
  ArrowLeft,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isEditMode = false, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isExtended, setIsExtended] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/" },
    { icon: Calendar, label: "Timeline", path: "/timeline" },
    { icon: PieChart, label: "Insights", path: "/insights" },
    { icon: Search, label: "Explorer", path: "/search" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div
      className={`h-screen bg-white dark:bg-darkCard border-r border-slate-100 dark:border-slate-800 flex flex-col py-6 transition-all duration-300 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isExtended ? "w-[240px]" : "w-[88px]"}`}
      onMouseEnter={() => setIsExtended(true)}
      onMouseLeave={() => {
        setIsExtended(false);
        setShowUserMenu(false);
      }}
    >
      {/* Brand / Back Button */}
      <div className="px-5 mb-10">
        {isEditMode ? (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <LayoutGrid size={24} />
            </div>
            {isExtended && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-2xl tracking-tight text-slate-800 dark:text-white"
              >
                wave.
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-2 px-3 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}

              <item.icon
                size={24}
                className={
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }
              />

              {isExtended && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[15px] font-bold whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Section (Bottom) */}
      <div className="px-3 mt-auto relative">
        <AnimatePresence>
          {showUserMenu && isExtended && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 overflow-hidden"
            >
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-sm font-bold"
              >
                <User size={18} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-500 text-sm font-bold"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => isExtended && setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center gap-3 p-2 rounded-[20px] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${!isExtended ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.displayName?.[0] || "U"}
          </div>

          {isExtended && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 text-left overflow-hidden"
            >
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {currentUser?.displayName || "User"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                Free Plan
              </p>
            </motion.div>
          )}

          {isExtended && (
            <MoreVertical
              size={16}
              className="text-slate-400 dark:text-slate-500"
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
