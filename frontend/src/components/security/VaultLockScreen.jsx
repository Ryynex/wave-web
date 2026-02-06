import React, { useState, useEffect, useCallback } from "react";
import { useEncryption } from "../../context/EncryptionContext";
import {
  ArrowRight,
  Lock,
  KeyRound,
  Loader2,
  AlertTriangle,
  Shield,
  Fingerprint,
} from "lucide-react";
import iconSvg from "../../assets/icon.svg";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";

const VaultLockScreen = () => {
  const { unlockVault, hasVault, createVault, isLoading } = useEncryption();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const x = useSpring(0, { stiffness: 100, damping: 30 });
  const y = useSpring(0, { stiffness: 100, damping: 30 });

  const handleMove = useCallback(
    (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const moveX = (e.clientX - window.innerWidth / 4) / 20;
      const moveY = (e.clientY - window.innerHeight / 2) / 20;
      x.set(moveX);
      y.set(moveY);
    },
    [x, y],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    if (hasVault) {
      const success = await unlockVault(password);
      if (!success) setError("INVALID_KEY_SIGNATURE");
    } else {
      await createVault(password);
    }
    setIsSubmitting(false);
  };

  if (isLoading) return null;

  return (
    <div className="flex h-screen w-full bg-[#020617] font-sans overflow-hidden selection:bg-primary/30">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden border-r border-white/5 bg-[#01040a]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
          <motion.div
            style={{ x, y }}
            className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(0,169,244,0.08),transparent)]"
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                x: useTransform(x, (v) => v * (i + 1) * 0.3),
                y: useTransform(y, (v) => v * (i + 1) * 0.3),
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 60 + i * 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] border-dashed"
              style={{
                width: `${350 + i * 180}px`,
                height: `${350 + i * 180}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-16">
          <motion.div
            style={{
              x: useTransform(x, (v) => v * -0.6),
              y: useTransform(y, (v) => v * -0.6),
              rotateX: useTransform(y, (v) => v * 0.5),
              rotateY: useTransform(x, (v) => v * -0.5),
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="perspective-1000"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-10 p-10 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-3xl rounded-[48px] border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] relative group cursor-none"
            >
              <Shield
                className="w-16 h-16 text-primary relative z-10"
                strokeWidth={1.5}
              />
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 blur-3xl bg-primary/30 rounded-full"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-white tracking-tight mb-4 flex items-center gap-3 justify-center">
              <span className="opacity-40 font-mono text-xl">0x</span>
              {hasVault ? "VAULT_LOCKED" : "INIT_PROTOCOL"}
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-sm leading-relaxed">
              {hasVault
                ? "Local session is encrypted. Move your cursor to calibrate and enter the master key."
                : "Establish a zero-knowledge core. This hardware-bound key secures your environment."}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-950">
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none opacity-50 transition-opacity"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x - window.innerWidth / 2}px ${mousePos.y}px, rgba(0,169,244,0.06), transparent 40%)`,
          }}
        />

        <div className="h-full w-full flex flex-col justify-center px-12 lg:px-24 bg-white/[0.01] backdrop-blur-[80px] border-l border-white/5 relative">
          <div className="max-w-[400px] w-full mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
                  <img src={iconSvg} alt="Wave" className="w-6 h-6" />
                </div>
                <span className="text-white text-2xl font-bold tracking-tighter uppercase">
                  Wave
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <div className="h-1 w-2 bg-white/10 rounded-full" />
                <div className="h-1 w-2 bg-white/10 rounded-full" />
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="relative group">
              <motion.div
                animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-3 transition-all duration-300 focus-within:bg-white/[0.05] focus-within:border-primary/40 focus-within:ring-[12px] focus-within:ring-primary/5"
              >
                <div className="flex items-center gap-5 px-3">
                  <div className="text-slate-600 group-focus-within:text-primary transition-colors">
                    {hasVault ? (
                      <Fingerprint size={24} />
                    ) : (
                      <KeyRound size={24} />
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Master Key"
                    className="w-full h-14 bg-transparent text-xl font-medium text-white placeholder:text-slate-700 outline-none"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#00A9F4",
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!password || isSubmitting}
                    className="h-12 w-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center transition-all shadow-xl disabled:opacity-0 disabled:translate-x-8"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowRight size={22} />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                    className="absolute top-full left-0 right-0 mt-6 flex items-center gap-3 text-rose-400 font-bold bg-rose-500/5 border border-rose-500/10 px-5 py-4 rounded-2xl backdrop-blur-md"
                  >
                    <div className="p-1.5 bg-rose-500/20 rounded-lg">
                      <AlertTriangle size={16} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[2px]">
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-16 grid grid-cols-2 gap-4">
              {[
                { icon: Lock, title: "AES-256-GCM", desc: "Encryption" },
                { icon: Shield, title: "Zero-Knowledge", desc: "Architecture" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-default"
                >
                  <item.icon size={18} className="text-primary/70 mb-4" />
                  <div className="text-white text-sm font-bold tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-slate-600 text-[9px] uppercase tracking-widest mt-1 font-bold">
                    {item.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-12 right-12 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-500 font-bold tracking-[2px] uppercase">
                Node Active
              </span>
            </div>
            <span className="text-[9px] text-slate-700 font-mono">
              v1.0.2-stable
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VaultLockScreen;
