import React from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEncryption } from "../context/EncryptionContext";
import { User, Shield, Lock, Mail, Calendar } from "lucide-react";

const Profile = () => {
  const { currentUser } = useAuth();
  const { lockVault } = useEncryption();

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <h1 className="text-4xl font-black text-slate-800 mb-2">Profile</h1>
          <p className="text-slate-500 mb-12">
            Manage your account and security settings.
          </p>

          {/* User Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
              {currentUser?.displayName?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {currentUser?.displayName || "User"}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <Mail size={16} />
                <span className="text-sm">{currentUser?.email}</span>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <h3 className="text-lg font-bold text-slate-800 mb-4 ml-2 flex items-center gap-2">
            <Shield size={20} className="text-blue-500" /> Security
          </h3>

          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
            <button
              onClick={lockVault}
              className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 rounded-[20px] transition-colors text-left group"
            >
              <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Lock Sanctuary Now</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Immediately lock your encrypted diary entries.
                </p>
              </div>
            </button>
          </div>

          {/* Account Info */}
          <h3 className="text-lg font-bold text-slate-800 mb-4 ml-2 mt-8 flex items-center gap-2">
            <User size={20} className="text-blue-500" /> Account
          </h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-medium">Member Since</span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Calendar size={16} className="text-slate-400" />
                <span>
                  {currentUser?.metadata?.creationTime
                    ? new Date(
                        currentUser.metadata.creationTime,
                      ).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
