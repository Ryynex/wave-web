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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isEditMode = false, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isExtended, setIsExtended] = useState(false);

  // We only enable Profile and Dashboard for now
  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/" },
    { icon: Calendar, label: "Timeline", path: "/timeline" },
    { icon: PieChart, label: "Insights", path: "/insights" },
    { icon: Search, label: "Explorer", path: "/search" },
    { icon: User, label: "Profile", path: "/profile" },
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
      className={`h-screen bg-[#F3F4F6] border-r border-black/5 flex flex-col items-center py-6 transition-all duration-300 z-20 sticky top-0 ${isExtended ? "w-[200px]" : "w-[80px]"}`}
      onMouseEnter={() => setIsExtended(true)}
      onMouseLeave={() => setIsExtended(false)}
    >
      {/* Back Button (only for Edit Mode) or Logo/Brand */}
      {isEditMode ? (
        <button
          onClick={onBack || (() => navigate(-1))}
          className={`mb-8 flex items-center justify-center transition-all duration-300 ${isExtended ? "px-6 py-3 bg-white shadow-sm rounded-full gap-2" : "p-3 bg-white shadow-sm rounded-full"}`}
        >
          <ArrowLeft size={20} className="text-slate-700" />
          {isExtended && (
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
              Back
            </span>
          )}
        </button>
      ) : (
        <div className="mb-8 p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
          <LayoutGrid size={24} className="text-white" />
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 w-full px-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white shadow-sm text-blue-600"
                  : "hover:bg-white/50 text-slate-400 hover:text-slate-600"
              } ${!isExtended ? "justify-center" : "px-4"}`}
            >
              <item.icon
                size={24}
                className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
              />

              {isExtended && (
                <motion-span className="text-sm font-semibold whitespace-nowrap">
                  {item.label}
                </motion-span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="w-full px-2 mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-red-50 text-slate-400 hover:text-red-500 w-full ${!isExtended ? "justify-center" : "px-4"}`}
        >
          <LogOut size={24} />
          {isExtended && (
            <span className="text-sm font-bold whitespace-nowrap">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
