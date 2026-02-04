import React from "react";
import { useAuth } from "../context/AuthContext";
import { Waves, Lock } from "lucide-react";

const Login = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* --- LEFT SIDE (Branding & Animation) --- 
          Replicates: Flex 5 container with gradients and wave painter */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col items-center justify-center bg-gradient-to-br from-[#F0F9FF] to-white overflow-hidden">
        {/* Animated Background Waves (CSS/SVG approximation of _FluidWavePainter) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="absolute bottom-0 w-[200%] animate-wave-slow text-primary fill-current"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Powered By AI Label */}
          <div className="animate-fade-in-up opacity-0">
            <span className="text-primary font-bold text-xs tracking-[1px] uppercase">
              Powered by AI
            </span>
          </div>

          {/* Floating Icon Box */}
          <div className="mt-4 animate-fade-in-up delay-100 opacity-0">
            <div className="animate-float p-7 bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,169,244,0.15)]">
              <Waves className="w-[72px] h-[72px] text-primary" />
            </div>
          </div>

          {/* Large Title "wave" */}
          <h1 className="mt-8 text-[92px] font-black text-primary tracking-[-4px] leading-tight animate-fade-in-up delay-200 opacity-0">
            wave
          </h1>

          {/* Subtitle */}
          <p className="mt-0 text-lg text-secondaryText font-medium tracking-wide animate-fade-in-up delay-300 opacity-0 max-w-md">
            Capture your daily moments, thoughts,
            <br />
            and ideas in a seamless flow.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE (Auth Form) --- 
          Replicates: Flex 4 container with Google Button */}
      <div className="w-full lg:w-5/12 flex items-center justify-center bg-white">
        <div className="max-w-[440px] w-full px-14 flex flex-col items-start">
          {/* Welcome Text */}
          <div className="animate-fade-in-up delay-300 opacity-0">
            <h2 className="text-[42px] font-extrabold text-darkText leading-[1.1]">
              Welcome back
            </h2>
            <p className="mt-3 text-base text-secondaryText leading-[1.6]">
              A digital sanctuary for your daily reflections. Sign in to sync
              your encrypted diary across all devices.
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="w-full mt-16 animate-fade-in-up delay-400 opacity-0">
            <button
              onClick={loginWithGoogle}
              className="group w-full h-[68px] bg-[#1E293B] hover:bg-[#0F172A] rounded-[18px] flex items-center justify-center transition-all duration-300 ease-out hover:shadow-[0_12px_25px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              <div className="bg-white p-2 rounded-full mr-5">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                  alt="G"
                  className="w-[22px] h-[22px]"
                />
              </div>
              <span className="text-white text-[17px] font-bold tracking-wide">
                Sign in with Google
              </span>
            </button>
          </div>

          {/* Encryption Notice */}
          <div className="mt-12 w-full animate-fade-in-up delay-500 opacity-0">
            <div className="flex items-start">
              <div className="p-2.5 bg-[#00A9F4]/10 rounded-full mr-4 shrink-0">
                <Lock className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-[13px] text-secondaryText font-medium leading-normal mt-1">
                Zero-knowledge AES-256 encryption. Only you hold the keys to
                your sanctuary.
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 w-full text-center animate-fade-in-up delay-500 opacity-0">
            <p className="text-xs text-secondaryText">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary font-bold hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary font-bold hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
