import React, { useEffect } from "react";
import { useAuth } from "../AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export default function ProtectedRoute({ children, onRedirectToLogin }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      onRedirectToLogin();
    }
  }, [currentUser, loading, onRedirectToLogin]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0A0D04] text-[#FAFFF3] flex flex-col items-center justify-center font-mono text-xs">
        <div className="absolute inset-0 pointer-events-none opacity-40 tactical-grid z-0" />
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-[#C0F53D] animate-spin mb-4" />
        <span className="animate-pulse tracking-widest text-[#C0F53D]">SYNCHRONIZING CIVICGUARD NODE...</span>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
