import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  PieChart,
  Search,
  User,
  ArrowLeft,
} from "lucide-react";

const Sidebar = ({ isEditMode = false, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExtended, setIsExtended] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/" },
    { icon: Calendar, label: "Timeline", path: "/timeline" },
    { icon: PieChart, label: "Insights", path: "/insights" },
    { icon: Search, label: "Explorer", path: "/search" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div
      className={`h-screen bg-[#F3F4F6] border-r border-black/5 flex flex-col items-center py-6 transition-all duration-300 z-20 ${isExtended ? "w-[200px]" : "w-[80px]"}`}
      onMouseEnter={() => setIsExtended(true)}
      onMouseLeave={() => setIsExtended(false)}
    >
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

      <div className="flex flex-col gap-2 w-full px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                isActive ? "bg-white shadow-sm" : "hover:bg-black/5"
              } ${!isExtended ? "justify-center" : "px-4"}`}
            >
              <item.icon
                size={24}
                className={isActive ? "text-primary" : "text-slate-400"}
              />
              {isExtended && (
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${isActive ? "text-primary" : "text-slate-500"}`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
