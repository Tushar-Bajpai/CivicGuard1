import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Award } from "lucide-react";

interface Toast {
  id: number;
  diff: number;
}

export default function ScoreToast() {
  const { scoreToastEvent } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (scoreToastEvent) {
      setToasts((prev) => [...prev, scoreToastEvent]);

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== scoreToastEvent.id));
      }, 3000);
    }
  }, [scoreToastEvent]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#1A2209] border border-[#C0F53D]/40 rounded-xl p-4 shadow-[0_8px_30px_rgba(192,245,61,0.15)] flex items-center gap-4 relative overflow-hidden backdrop-blur-md pointer-events-auto"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C0F53D]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="p-2 bg-[#C0F53D]/20 text-[#C0F53D] rounded-full shrink-0 relative z-10">
              <Award className="w-6 h-6" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-serif font-bold text-[#C0F53D] leading-none mb-1">
                +{toast.diff} Civic Score
              </h4>
              <p className="text-xs text-[#FAFFF3]/70 font-mono">
                Community Contribution
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
