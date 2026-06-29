import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Cpu } from "lucide-react";

interface FinalCTAProps {
  onReportClick: () => void;
}

export default function FinalCTA({ onReportClick }: FinalCTAProps) {
  return (
    <section className="py-32 px-6 md:px-12 bg-[#0A0D04] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 tactical-grid z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-radial from-[#C0F53D]/10 to-transparent blur-[80px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-[#1A2209]/80 backdrop-blur-xl border border-[#C0F53D]/30 p-10 md:p-16 rounded-3xl shadow-[0_0_50px_rgba(192,245,61,0.1)] relative overflow-hidden"
        >
          {/* Subtle animated border top */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C0F53D] to-transparent opacity-70" />
          
          <h2 className="font-serif text-3xl md:text-5xl text-[#FAFFF3] mb-6 leading-tight">
            Ready to make a difference in your neighborhood?
          </h2>
          <p className="text-[#FAFFF3]/70 font-light text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of citizens who are already using CivicGuard to report issues, verify hazards, and improve their city infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onReportClick}
              className="w-full sm:w-auto px-10 py-5 rounded-xl bg-[#C0F53D] text-[#0A0D04] font-sans font-bold text-base tracking-wider uppercase cursor-pointer hover:bg-opacity-90 active:scale-95 shadow-[0_4px_25px_rgba(192,245,61,0.25)] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Cpu className="w-5 h-5 text-[#0A0D04]" />
              Report an Issue Now
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-5 rounded-xl bg-transparent text-[#FAFFF3] border border-[#FAFFF3]/20 font-sans font-semibold text-sm tracking-wider uppercase cursor-pointer hover:bg-[#1A2209] hover:border-[#FAFFF3]/40 transition-all duration-300"
            >
              Back to Top
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
