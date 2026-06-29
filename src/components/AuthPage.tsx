import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Mail, Lock, User, KeyRound, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface AuthPageProps {
  onBackToLanding: () => void;
  onSuccess: () => void;
  initialState?: "signin" | "signup";
}

export default function AuthPage({ onBackToLanding, onSuccess, initialState = "signin" }: AuthPageProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialState);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Loading and Error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter your name to sign up.");
        }
        if (password.length < 6) {
          throw new Error("Your password should be at least 6 characters long.");
        }
        await signUpWithEmail(email, password, name.trim());
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth error details:", err);
      let message = err.message || "An error occurred. Please try again.";
      if (err.code === "auth/invalid-credential") {
        message = "Incorrect email address or password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        message = "This email is already in use by another account.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email. You can sign up using the Sign Up tab.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"))) {
        message = "Email/Password sign-in is not enabled in your Firebase console. To fix this:\n1. Open your Firebase Project Dashboard.\n2. Go to 'Authentication' -> 'Sign-in method'.\n3. Click 'Add new provider' and choose 'Email/Password'.\n4. Enable it and save.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        let message = err.message || "Failed to sign in with Google.";
        if (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"))) {
          message = "Google Sign-In is not enabled in your Firebase console. To fix this:\n1. Open your Firebase Project Dashboard.\n2. Go to 'Authentication' -> 'Sign-in method'.\n3. Click 'Add new provider' and choose 'Google'.\n4. Complete the configuration steps and save.";
        }
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0A0D04] text-[#FAFFF3] flex flex-col justify-center items-center px-4 overflow-hidden selection:bg-[#C0F53D] selection:text-[#0A0D04]">
      {/* Background radial glow */}
      <div className="absolute w-[45vw] h-[45vw] rounded-full bg-[#C0F53D]/5 blur-[130px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 pointer-events-none opacity-20 tactical-grid" />

      {/* Header Back Button */}
      <div className="absolute top-8 left-4 md:left-8 z-20">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FAFFF3]/10 bg-[#0A0D04]/60 backdrop-blur text-xs font-mono text-[#FAFFF3]/70 hover:text-white hover:border-[#C0F53D]/30 transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Map View</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md bg-[#1A2209]/80 backdrop-blur-xl border border-[#FAFFF3]/15 rounded-2xl p-6 md:p-8 shadow-2xl z-10"
      >
        {/* Shield Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#0A0D04] border border-[#C0F53D]/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-[#C0F53D]" />
          </div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-center">
            {activeTab === "signin" ? "Sign In to CivicGuard" : "Create Your Account"}
          </h2>
          <p className="font-mono text-[9px] tracking-widest text-[#C0F53D]/70 uppercase mt-1">
            {activeTab === "signin" ? "WELCOME BACK CITIZEN" : "JOIN THE CIVIC NETWORK"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-[#0A0D04]/80 rounded-xl border border-[#FAFFF3]/10 mb-6">
          <button
            onClick={() => {
              setActiveTab("signin");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "signin"
                ? "bg-[#C0F53D] text-[#0A0D04] shadow-md"
                : "text-[#FAFFF3]/60 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-[#C0F53D] text-[#0A0D04] shadow-md"
                : "text-[#FAFFF3]/60 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message Box */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="whitespace-pre-line">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] text-[#FAFFF3]/70 font-semibold block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAFFF3]/30">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#FAFFF3]/25 focus:border-[#C0F53D]/50 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white placeholder-[#FAFFF3]/30 focus:outline-none transition-all duration-300 animate-fadeIn"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-[#FAFFF3]/70 font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAFFF3]/30">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#FAFFF3]/25 focus:border-[#C0F53D]/50 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white placeholder-[#FAFFF3]/30 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-[#FAFFF3]/70 font-semibold block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAFFF3]/30">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#FAFFF3]/25 focus:border-[#C0F53D]/50 rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-white placeholder-[#FAFFF3]/30 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C0F53D] hover:bg-opacity-95 text-[#0A0D04] font-sans font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(192,245,61,0.25)] hover:shadow-[0_4px_25px_rgba(192,245,61,0.4)] transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0A0D04]" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-[#0A0D04]" />
                <span>{activeTab === "signin" ? "Sign In" : "Create Account"}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FAFFF3]/10"></div>
          </div>
          <span className="relative px-3 bg-[#1A2209] text-[10px] font-mono tracking-wider text-[#FAFFF3]/40 uppercase">
            or
          </span>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
          className="w-full bg-transparent hover:bg-white/5 border border-[#FAFFF3]/15 hover:border-[#FAFFF3]/30 text-white font-sans font-semibold text-xs py-3.5 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Demo Mode Bypass */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FAFFF3]/5"></div>
          </div>
          <span className="relative px-3 bg-[#1A2209] text-[9px] font-mono tracking-widest text-[#FAFFF3]/30 uppercase">
            Quick testing fallback
          </span>
        </div>

        <button
          onClick={() => {
            signInAsDemo();
            onSuccess();
          }}
          type="button"
          className="w-full bg-[#C0F53D]/10 hover:bg-[#C0F53D]/20 border border-[#C0F53D]/20 text-[#C0F53D] font-sans font-semibold text-xs py-3.5 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Continue in Demo Mode (Skip Auth)</span>
        </button>

        {/* Bottom Switch Link */}
        <div className="mt-6 text-center text-xs">
          <span className="text-[#FAFFF3]/50">
            {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setActiveTab(activeTab === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="text-[#C0F53D] hover:underline font-semibold cursor-pointer focus:outline-none"
          >
            {activeTab === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
