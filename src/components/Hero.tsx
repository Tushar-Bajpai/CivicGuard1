import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Cpu, Eye, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import IssueVisualizer from "./IssueVisualizer";

interface HeroProps {
  onReportClick: () => void;
  onViewMapClick: () => void;
}

export default function Hero({ onReportClick, onViewMapClick }: HeroProps) {
  // Let user switch the active scan type in the interactive HUD widget
  const [activeScan, setActiveScan] = useState<"pothole" | "water_leak" | "electrical">("pothole");

  const scanOptions = [
    { id: "pothole", label: "ROAD_DAMAGE", code: "SEC-RD-04", conf: "0.98" },
    { id: "water_leak", label: "WATER_LEAK", code: "SEC-H2O-92", conf: "0.95" },
    { id: "electrical", label: "GRID_HAZARD", code: "SEC-GRID-02", conf: "0.99" }
  ] as const;

  // Auto rotate scans every 6 seconds unless hovered
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveScan((current) => {
        if (current === "pothole") return "water_leak";
        if (current === "water_leak") return "electrical";
        return "pothole";
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const activeJson = {
    pothole: `{
  "category": "road_damage",
  "confidence": 0.98,
  "severity": "CRITICAL",
  "priority_score": "94/100",
  "metrics": {
    "depth_cm": 14.5,
    "width_cm": 68.2
  },
  "route_to": "Transportation & Road Repair"
}`,
    water_leak: `{
  "category": "water_leak",
  "confidence": 0.95,
  "severity": "HIGH",
  "priority_score": "81/100",
  "metrics": {
    "flow_lpm": 34.2,
    "saturation": 0.88
  },
  "route_to": "Water & Sanitation Dept"
}`,
    electrical: `{
  "category": "electrical_hazard",
  "confidence": 0.99,
  "severity": "IMMEDIATE",
  "priority_score": "98/100",
  "metrics": {
    "voltage_v": 240,
    "temp_c": 142.5
  },
  "route_to": "Grid & Electrification Board"
}`
  }[activeScan];

  return (
    <section 
      id="hero" 
      className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center overflow-hidden"
    >
      {/* Background glow behind visual anchor */}
      <div className="absolute right-[-10%] top-[20%] w-[50vw] h-[50vw] rounded-full bg-[#C0F53D]/5 blur-[120px] pointer-events-none" />
      <div className="absolute left-[-5%] bottom-[10%] w-[30vw] h-[30vw] rounded-full bg-[#1A2209]/20 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Side: Massive Headline, Body, CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-8">
          
          {/* Micro-Data Status Tag */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1A2209] border border-[#C0F53D]/20 text-[#C0F53D] font-mono text-[10px] uppercase tracking-[0.2em]"
            id="status-tag"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0F53D] animate-ping" />
            LIVE IN YOUR CITY
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FAFFF3] leading-[1.1] tracking-tight"
            id="hero-title"
          >
            A <span className="italic font-normal text-[#C0F53D]">smarter</span> way <br />
            to report civic issues.
          </motion.h1>

          {/* Body Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl text-base md:text-lg text-[#FAFFF3]/70 font-sans font-light leading-relaxed"
            id="hero-desc"
          >
            Empowering residents to snap photos of potholes, leaks, and hazards. Our AI instantly analyzes the issue and routes it to the right city department, helping keep your neighborhood safe and well-maintained.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            id="hero-ctas"
          >
            <button
              onClick={onReportClick}
              className="px-8 py-4 rounded-xl bg-[#C0F53D] text-[#0A0D04] font-sans font-bold text-sm tracking-wider uppercase cursor-pointer hover:bg-opacity-90 active:scale-95 shadow-[0_4px_25px_rgba(192,245,61,0.25)] transition-all duration-300 flex items-center justify-center gap-3"
              id="hero-btn-report"
            >
              Report an Issue
              <ArrowRight className="w-4 h-4 text-[#0A0D04]" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById("how-it-works");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-8 py-4 rounded-xl bg-[#1A2209] text-[#FAFFF3] border border-[#FAFFF3]/10 font-sans font-semibold text-sm tracking-wider uppercase cursor-pointer hover:bg-[#1A2209]/80 hover:border-[#C0F53D]/30 transition-all duration-300 flex items-center justify-center gap-2"
              id="hero-btn-viewmap"
            >
              See How It Works
            </button>
          </motion.div>

        </div>

        {/* Right Side: Rotating topographical-style concentric circles anchor + overlay tactical AI Vision widget */}
        <div 
          className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] lg:min-h-[500px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Rotating Data Wheel / Topographical Map Background Graphic */}
          <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full flex items-center justify-center" id="rotating-anchor-container">
            {/* Ambient Radial Gradient Glow using #C0F53D directly behind the circular structure */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-radial from-[#C0F53D]/20 to-transparent blur-2xl pointer-events-none" />
            
            {/* Concentric rotating SVG vector circles */}
            <svg viewBox="0 0 500 500" className="w-full h-full opacity-35 animate-[spin_120s_linear_infinite] pointer-events-none">
              {/* Outer dashed ring */}
              <circle cx="250" cy="250" r="230" fill="none" stroke="#C0F53D" strokeWidth="1" strokeDasharray="4 8" />
              {/* Complex telemetry ring */}
              <circle cx="250" cy="250" r="190" fill="none" stroke="#C0F53D" strokeWidth="1.5" strokeDasharray="30 10 5 10" />
              {/* Topographical mock rings */}
              <path d="M 250 80 Q 280 120, 250 160 T 250 240" fill="none" stroke="#C0F53D" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M 120 250 Q 180 200, 240 250 T 380 250" fill="none" stroke="#C0F53D" strokeWidth="0.5" strokeDasharray="2 4" />
              <circle cx="250" cy="250" r="140" fill="none" stroke="#C0F53D" strokeWidth="1" strokeDasharray="40 5 10 5" />
              <circle cx="250" cy="250" r="90" fill="none" stroke="#C0F53D" strokeWidth="0.5" />
            </svg>
            
            {/* Inner inverse spin ring */}
            <svg viewBox="0 0 500 500" className="absolute w-full h-full opacity-20 animate-[spin_80s_linear_infinite_reverse] pointer-events-none">
              <circle cx="250" cy="250" r="210" fill="none" stroke="#C0F53D" strokeWidth="1" strokeDasharray="15 30" />
              <circle cx="250" cy="250" r="110" fill="none" stroke="#C0F53D" strokeWidth="1.5" strokeDasharray="10 5 50 5" />
            </svg>
          </div>

          {/* Floating Frosted Glass AI Vision Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-full max-w-[420px] bg-[#1A2209]/80 backdrop-blur-xl border border-[#FAFFF3]/15 rounded-2xl p-4 md:p-5 shadow-3xl overflow-hidden"
            id="frosted-ai-widget"
          >
            {/* Top Widget Bar */}
            <div className="flex items-center justify-between border-b border-[#FAFFF3]/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C0F53D] animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-[#FAFFF3]/60 uppercase">
                  AI_VISION_PROCESSED
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A0D04] px-2 py-0.5 rounded border border-[#FAFFF3]/5 font-mono text-[9px] text-[#C0F53D]">
                <Terminal className="w-3 h-3" />
                <span>INTELLIGENCE_NODE</span>
              </div>
            </div>

            {/* Simulated Live Scan image display */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#0A0D04] border border-[#FAFFF3]/5 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScan}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <IssueVisualizer type={activeScan} animate={true} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Interactive Tab switches inside the HUD */}
            <div className="grid grid-cols-3 gap-2 mb-4" id="scan-selectors">
              {scanOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveScan(opt.id)}
                  className={`py-1.5 px-1 rounded border font-mono text-[8px] md:text-[9px] tracking-wide transition-all duration-200 cursor-pointer text-center ${
                    activeScan === opt.id
                      ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] font-bold shadow-[0_0_10px_rgba(192,245,61,0.2)]"
                      : "bg-[#0A0D04]/60 text-[#FAFFF3]/50 border-[#FAFFF3]/10 hover:text-[#FAFFF3] hover:border-[#FAFFF3]/30"
                  }`}
                  id={`btn-hud-scan-${opt.id}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Simulated Bounding Box and JSON Analysis block */}
            <div className="bg-[#0A0D04]/90 rounded-lg p-3 border border-[#FAFFF3]/10 relative">
              <div className="absolute top-2 right-3 font-mono text-[8px] text-[#FAFFF3]/30">JSON FORMAT</div>
              <pre className="font-mono text-[10px] md:text-[11px] text-[#FAFFF3]/90 leading-tight overflow-x-auto max-h-[140px] whitespace-pre select-none">
                <code className="text-[#C0F53D]">{activeJson}</code>
              </pre>
            </div>

            {/* Dynamic priority tag */}
            <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-[#FAFFF3]/5">
              <span className="text-[#FAFFF3]/50">PRIORITY ROUTING:</span>
              <span className="text-[#C0F53D] font-bold">
                {activeScan === "electrical" ? "98/100 (HIGH_VOLTAGE)" : activeScan === "pothole" ? "94/100 (ROAD_DECAY)" : "81/100 (WATER_SEEPAGE)"}
              </span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
