/* src/components/security/VaultLockScreen.jsx */
import React, { useState } from "react";
import { useEncryption } from "../../context/EncryptionContext";
import { Lock, UserCheck, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const VaultLockScreen = () => {
  const { hasVault, unlockVault, createVault } = useEncryption();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Strength calculation for Create Mode
  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 10) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[!@#$%^&*]/.test(pass)) strength += 1;
    return strength; // 0 to 4
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Give UI a moment to breathe (simulate native feel)
    await new Promise((r) => setTimeout(r, 500));

    if (!hasVault) {
      // Create Mode
      if (password !== confirm) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError("Password is too short");
        setIsSubmitting(false);
        return;
      }
      await createVault(password);
    } else {
      // Unlock Mode
      const success = await unlockVault(password);
      if (!success) {
        setError("Invalid Master Password");
      }
    }
    setIsSubmitting(false);
  };

  const isCreateMode = !hasVault;

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden absolute top-0 left-0 z-50">
      {/* LEFT SIDE: Branding & Wave */}
      <div className="hidden lg:flex w-7/12 relative flex-col items-center justify-center bg-gradient-to-br from-[#F0F9FF] to-white overflow-hidden">
        {/* Simple CSS Wave Animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="absolute bottom-0 w-[200%] animate-wave-slow text-primary fill-current"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="p-8 bg-white rounded-full shadow-2xl shadow-blue-100 mb-8">
            <Lock className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">
            {isCreateMode ? "Setup Vault" : "Vault Locked"}
          </h1>
          <p className="mt-4 text-slate-500 max-w-md text-center text-lg leading-relaxed">
            {isCreateMode
              ? "Create a master key to protect your digital sanctuary. This password cannot be recovered."
              : "Your diary entries are encrypted with your master key. Enter it to unlock your sanctuary."}
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center bg-white p-8">
        <div className="max-w-sm w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              {isCreateMode ? "Initialize Key" : "Master Password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Master Password"
                  className="w-full h-14 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {isCreateMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Strength Meter */}
                  <div className="space-y-2">
                    <div className="flex h-1 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            calculateStrength(password) >= step
                              ? step < 3
                                ? "bg-orange-400"
                                : "bg-green-500"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium text-right">
                      Use numbers & symbols for strength
                    </p>
                  </div>

                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm Master Password"
                    className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-slate-700"
                  />
                </motion.div>
              )}

              {error && (
                <p className="text-red-500 text-sm font-semibold animate-pulse">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isCreateMode ? (
                  "Create Vault"
                ) : (
                  "Unlock Sanctuary"
                )}
              </button>
            </form>

            <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                AES-256 GCM authenticated encryption ensures data integrity. We
                cannot recover your password if lost.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VaultLockScreen;
