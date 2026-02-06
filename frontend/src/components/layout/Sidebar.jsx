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
  ChevronRight,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import iconSvg from "../../assets/icon.svg";

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
      console.error("LOGOUT_FAILURE", error);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isExtended ? 280 : 88 }}
      onMouseEnter={() => setIsExtended(true)}
      onMouseLeave={() => {
        setIsExtended(false);
        setShowUserMenu(false);
      }}
      className="h-screen bg-white dark:bg-[#020617] border-r border-slate-100 dark:border-white/5 flex flex-col py-8 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 shadow-[20px_0_80px_rgba(0,0,0,0.02)]"
    >
      <div className="px-6 mb-12 h-10 flex items-center overflow-hidden">
        {isEditMode ? (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-primary hover:text-white rounded-xl text-slate-600 dark:text-slate-400 transition-all duration-300 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
        ) : (
          <div className="flex items-center gap-4 min-w-max">
            <img src={iconSvg} alt="Logo" className="w-9 h-9 drop-shadow-sm" />
            <AnimatePresence>
              {isExtended && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase"
                >
                  Wave
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1.5 px-4 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 relative group ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-lg shadow-black/5"
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className="relative z-10"
              />
              {isExtended && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[15px] font-bold tracking-tight z-10"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && isExtended && (
                <motion.div layoutId="activePill" className="ml-auto">
                  <ChevronRight size={16} className="opacity-50" />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 mt-auto relative">
        <AnimatePresence>
          {showUserMenu && isExtended && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-24 left-4 right-4 bg-white dark:bg-[#0f172a] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-white/5 p-2 z-50 overflow-hidden"
            >
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-sm font-bold"
              >
                <User size={18} /> Profile
              </button>
              <div className="h-px bg-slate-50 dark:bg-white/5 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-red-500 text-sm font-bold"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => isExtended && setShowUserMenu(!showUserMenu)}
          className={`w-full group flex items-center gap-3 p-2 rounded-[24px] transition-all duration-300 ${
            isExtended
              ? "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
              : "justify-center"
          }`}
        >
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-slate-900 dark:bg-primary text-white rounded-[18px] flex items-center justify-center font-bold text-lg shadow-lg overflow-hidden group-hover:scale-95 transition-transform">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser?.email?.[0].toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-[#020617] rounded-full flex items-center justify-center border-2 border-white dark:border-[#020617]">
              <Shield size={10} className="text-primary fill-primary/20" />
            </div>
          </div>

          {isExtended && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 text-left overflow-hidden"
            >
              <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                {currentUser?.displayName || "User"}
              </p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Pro Access
              </p>
            </motion.div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
