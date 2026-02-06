import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, ShieldCheck, Sparkles, Fingerprint } from "lucide-react";
import iconSvg from "../assets/icon.svg";

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  const calculateParallax = (factor) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (mousePos.x - centerX) * factor;
    const moveY = (mousePos.y - centerY) * factor;
    return `translate(${moveX}px, ${moveY}px)`;
  };

  return (
    <div
      className="flex h-screen w-full bg-slate-950 text-slate-900 overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
    >
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,169,244,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[-50px] left-0 w-[200%] h-[400px] opacity-20 animate-wave-ultra-slow flex">
            {[1, 2].map((i) => (
              <svg
                key={i}
                className="w-1/2 h-full fill-primary"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
              >
                <path d="M0,160 C320,300 480,0 720,160 C960,320 1120,20 1440,160 L1440,320 L0,320 Z"></path>
              </svg>
            ))}
          </div>
          <div className="absolute bottom-[-80px] left-0 w-[200%] h-[450px] opacity-10 animate-wave-slow flex">
            {[1, 2].map((i) => (
              <svg
                key={i}
                className="w-1/2 h-full fill-primary/60"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
              >
                <path d="M0,224 C288,128 576,288 864,224 C1152,160 1440,256 1440,224 L1440,320 L0,320 Z"></path>
              </svg>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 flex flex-col items-center text-center px-12 transition-transform duration-500 ease-out"
          style={{ transform: calculateParallax(-0.02) }}
        >
          <div className="animate-fade-in-up opacity-0 flex items-center gap-3 mb-12">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-white font-bold text-[10px] tracking-[6px] uppercase opacity-70">
              Personal Intelligence
            </span>
          </div>

          <div className="animate-fade-in-up delay-150 opacity-0 mb-10">
            <div
              className="animate-float p-8 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] transition-transform duration-300"
              style={{ transform: calculateParallax(0.01) }}
            >
              <img
                src={iconSvg}
                alt="Wave Icon"
                className="w-24 h-24 drop-shadow-[0_0_20px_rgba(0,169,244,0.4)]"
              />
            </div>
          </div>

          <h1
            className="text-[110px] font-black text-white tracking-[-5px] leading-none animate-fade-in-up delay-300 opacity-0 transition-transform duration-700 ease-out"
            style={{ transform: calculateParallax(-0.04) }}
          >
            wave
          </h1>

          <p className="mt-10 text-slate-400 text-xl font-medium max-w-sm leading-relaxed animate-fade-in-up delay-[450ms] opacity-0">
            A high-fidelity sanctuary for your thoughts and digital memories
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-950 group/login">
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse blur-[1px]"
              style={{
                top: `${(i * 13) % 100}%`,
                left: `${(i * 17) % 100}%`,
                opacity: 0.1 + (i % 5) * 0.05,
                animationDelay: `${i * 0.4}s`,
                transform: calculateParallax(0.01 + (i % 10) * 0.002),
                transition: "transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)",
              }}
            />
          ))}
        </div>

        <div className="h-full w-full flex flex-col justify-center px-12 lg:px-24 bg-white/[0.03] backdrop-blur-[80px] relative overflow-hidden border-l border-white/5">
          <div
            className="absolute pointer-events-none opacity-40 transition-opacity duration-1000"
            style={{
              transform: `translate(${mousePos.x - window.innerWidth * 0.75}px, ${mousePos.y - window.innerHeight / 2}px)`,
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle, rgba(0,169,244,0.25) 0%, transparent 70%)",
              filter: "blur(60px)",
              top: "50%",
              left: "50%",
              marginTop: "-200px",
              marginLeft: "-200px",
            }}
          />

          <div className="max-w-[420px] w-full relative z-10">
            <div className="animate-fade-in-up delay-300 opacity-0">
              <h2 className="text-[52px] font-black text-white tracking-tight leading-[0.95]">
                Your space <br />
                is waiting
              </h2>
              <p className="mt-6 text-slate-400 font-medium text-lg leading-relaxed">
                Step back into the seamless flow of your digital diary.
                High-speed, private, and entirely yours.
              </p>
            </div>

            <div className="w-full mt-12 animate-fade-in-up delay-500 opacity-0">
              <button
                onClick={loginWithGoogle}
                className="group relative w-full h-[80px] bg-white hover:bg-slate-100 rounded-2xl flex items-center justify-between px-8 transition-all duration-500 ease-out hover:shadow-[0_0_40px_rgba(0,169,244,0.3)] cursor-pointer text-slate-950 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-slate-950 p-2.5 rounded-xl group-hover:rotate-[360deg] transition-transform duration-700">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                      alt="G"
                      className="w-5 h-5 invert"
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    Enter with Google
                  </span>
                </div>
                <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="mt-12 space-y-5 animate-fade-in-up delay-700 opacity-0">
              {[
                {
                  icon: ShieldCheck,
                  title: "Full Privacy Control",
                  desc: "End-to-end encryption by default",
                },
                {
                  icon: Fingerprint,
                  title: "Zero-Knowledge Storage",
                  desc: "Only you hold the decryption keys",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-5 p-2 group/item"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-slate-400 group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-300 group-hover/item:scale-110">
                    <item.icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 animate-fade-in-up delay-[900ms] opacity-0 border-t border-white/10">
              <p className="text-[12px] text-slate-500 font-semibold tracking-wide uppercase">
                No tracking • No ads • Just you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
