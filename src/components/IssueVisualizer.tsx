import React from "react";

interface IssueVisualizerProps {
  type: string;
  animate?: boolean;
}

export default function IssueVisualizer({ type, animate = true }: IssueVisualizerProps) {
  // Let's build stunning, premium responsive SVGs that represent cyber-AI-scanned municipal issues
  const pulseClass = animate ? "animate-pulse" : "";
  
  if (type && (type.startsWith("data:") || type.startsWith("blob:") || type.startsWith("http:") || type.startsWith("https:"))) {
    return (
      <div className="w-full h-full relative bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10 flex items-center justify-center">
        <img 
          src={type} 
          alt="User uploaded incident evidence" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 left-2 font-mono text-[8px] bg-black/75 px-1.5 py-0.5 rounded text-[#C0F53D]">
          CAPTURED_EVIDENCE_SOURCE
        </div>
      </div>
    );
  }

  switch (type) {
    case "pothole":
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-pothole">
          {/* Tactical grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(250, 255, 243, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Target reticle */}
          <circle cx="200" cy="150" r="100" fill="none" stroke="rgba(192, 245, 61, 0.1)" strokeWidth="1" />
          <circle cx="200" cy="150" r="4" fill="#C0F53D" className={pulseClass} />
          
          {/* Outer compass bracket */}
          <path d="M 120 150 A 80 80 0 0 1 280 150" fill="none" stroke="rgba(192, 245, 61, 0.2)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-[spin_40s_linear_infinite]" />
          <path d="M 120 150 A 80 80 0 0 0 280 150" fill="none" stroke="rgba(192, 245, 61, 0.2)" strokeWidth="1.5" strokeDasharray="15 5" className="animate-[spin_60s_linear_infinite]" />
          
          {/* Road fracture drawing (pothole simulation) */}
          <g transform="translate(140, 110)">
            <polygon 
              points="30,40 50,20 90,25 120,55 110,85 80,95 40,80" 
              fill="rgba(26, 34, 9, 0.8)" 
              stroke="#C0F53D" 
              strokeWidth="2" 
            />
            {/* Fracture lines */}
            <path d="M 30 40 L 10 45" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 50 20 L 55 5" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 120 55 L 140 60 L 155 55" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 80 95 L 90 120" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Depth heat contour */}
            <polygon 
              points="45,45 65,35 85,38 100,55 95,75 75,80 50,70" 
              fill="rgba(192, 245, 61, 0.15)" 
              stroke="#C0F53D" 
              strokeWidth="1" 
              strokeDasharray="2 2"
            />
            {/* Center blackest point */}
            <polygon 
              points="60,55 75,50 85,55 80,68 65,65" 
              fill="#0A0D04" 
              stroke="#C0F53D" 
              strokeWidth="1" 
            />
          </g>

          {/* HUD scan overlay */}
          <rect x="110" y="80" width="180" height="140" fill="none" stroke="rgba(192, 245, 61, 0.4)" strokeWidth="1" strokeDasharray="4 8" />
          
          {/* Scan Line */}
          <line x1="100" y1="100" x2="300" y2="100" stroke="#C0F53D" strokeWidth="1.5" opacity="0.8" className="animate-[bounce_4s_infinite]" />
          
          {/* AI Info Text elements */}
          <text x="25" y="40" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
            TARGET SECTOR: SEC-RD-04
          </text>
          <text x="25" y="55" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.5">
            SYS_STAT: ANALYZING_FRACTURE_DEPTH
          </text>
          
          {/* Floating diagnostic labels */}
          <g transform="translate(290, 95)" className="opacity-80">
            <line x1="-10" y1="5" x2="15" y2="5" stroke="#C0F53D" strokeWidth="1" />
            <text x="20" y="8" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="8">DEPTH: 14.5CM</text>
          </g>

          <g transform="translate(70, 215)" className="opacity-80">
            <line x1="30" y1="5" x2="5" y2="5" stroke="#C0F53D" strokeWidth="1" />
            <text x="35" y="8" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="8">W_EST: 68.2CM</text>
          </g>

          {/* Bounding box corner ticks */}
          <path d="M 110 95 L 110 80 L 125 80" fill="none" stroke="#C0F53D" strokeWidth="2" />
          <path d="M 290 95 L 290 80 L 275 80" fill="none" stroke="#C0F53D" strokeWidth="2" />
          <path d="M 110 205 L 110 220 L 125 220" fill="none" stroke="#C0F53D" strokeWidth="2" />
          <path d="M 290 205 L 290 220 L 275 220" fill="none" stroke="#C0F53D" strokeWidth="2" />
          
          {/* Compass/Coordinates */}
          <text x="25" y="275" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="9" opacity="0.6">
            LAT: 45.5234° N | LNG: 122.6762° W
          </text>
          <text x="310" y="275" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            98% CONF
          </text>
        </svg>
      );
      
    case "water_leak":
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-water">
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Scan Target */}
          <circle cx="200" cy="150" r="110" fill="none" stroke="rgba(192, 245, 61, 0.05)" strokeWidth="1" />
          <circle cx="200" cy="150" r="60" fill="none" stroke="rgba(192, 245, 61, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Bubble concentric circles (representing liquid seepage) */}
          <circle cx="200" cy="150" r="12" fill="rgba(192, 245, 61, 0.1)" stroke="#C0F53D" strokeWidth="1.5" className="animate-[ping_3s_infinite_ease-in-out]" />
          <circle cx="200" cy="150" r="28" fill="none" stroke="#C0F53D" strokeWidth="1" opacity="0.6" className="animate-[ping_4s_infinite_ease-in-out_1.5s]" />
          <circle cx="200" cy="150" r="45" fill="none" stroke="#C0F53D" strokeWidth="0.5" opacity="0.3" className="animate-[ping_5s_infinite_ease-in-out_3s]" />
          
          {/* Liquid plume drawing */}
          <g transform="translate(150, 110)" opacity="0.85">
            {/* Water pooling contours */}
            <path d="M 20 40 Q 50 10, 80 30 T 110 60 T 70 85 T 10 60 Z" fill="rgba(192, 245, 61, 0.2)" stroke="#C0F53D" strokeWidth="1.5" />
            <path d="M 35 45 Q 50 25, 75 35 T 90 60 T 65 75 T 30 55 Z" fill="rgba(192, 245, 61, 0.15)" stroke="#C0F53D" strokeWidth="1" strokeDasharray="3 1" />
            
            {/* Sidewalk cracked joints */}
            <line x1="-30" y1="10" x2="130" y2="30" stroke="rgba(250, 255, 243, 0.2)" strokeWidth="2" />
            <line x1="50" y1="-20" x2="50" y2="110" stroke="rgba(250, 255, 243, 0.2)" strokeWidth="2" />
          </g>
          
          {/* HUD labels */}
          <text x="25" y="40" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
            SECTOR: SEC-H2O-92
          </text>
          <text x="25" y="55" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.5">
            SENSING: HYDRO_PRESSURE_SPILL
          </text>
          
          {/* Crosshair corner tags */}
          <path d="M 120 70 L 100 70 L 100 90" fill="none" stroke="#C0F53D" strokeWidth="1.5" />
          <path d="M 280 70 L 300 70 L 300 90" fill="none" stroke="#C0F53D" strokeWidth="1.5" />
          <path d="M 100 210 L 100 230 L 120 230" fill="none" stroke="#C0F53D" strokeWidth="1.5" />
          <path d="M 300 210 L 300 230 L 280 230" fill="none" stroke="#C0F53D" strokeWidth="1.5" />

          <text x="25" y="275" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="9" opacity="0.6">
            LAT: 45.5112° N | LNG: 122.6845° W
          </text>
          <text x="310" y="275" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            95% CONF
          </text>
        </svg>
      );
      
    case "electrical":
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-electric">
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Static grid background */}
          <circle cx="200" cy="150" r="80" fill="none" stroke="rgba(244, 63, 94, 0.1)" strokeWidth="1" />
          
          {/* Powerline and electricity arcs */}
          <g transform="translate(100, 100)">
            {/* Wire line hanging */}
            <path d="M -20 20 Q 100 110, 220 30" fill="none" stroke="rgba(250, 255, 243, 0.4)" strokeWidth="3" />
            <path d="M -20 20 Q 100 110, 220 30" fill="none" stroke="#C0F53D" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Electrical Arc 1 */}
            <path d="M 100 65 L 110 50 L 95 45 L 105 30" fill="none" stroke="#C0F53D" strokeWidth="2.5" className={pulseClass} />
            {/* Secondary Arc */}
            <path d="M 70 60 L 85 75 L 75 85 L 90 95" fill="none" stroke="#C0F53D" strokeWidth="1.5" opacity="0.8" className={pulseClass} />
            
            {/* Ground spark star */}
            <path d="M 100 65 M 100 55 L 100 75 M 90 65 L 110 65 M 93 58 L 107 72 M 107 58 L 93 72" stroke="#C0F53D" strokeWidth="1.5" className="animate-[spin_4s_linear_infinite]" />
            
            {/* Sagebrush canopy contact */}
            <circle cx="100" cy="70" r="18" fill="rgba(192, 245, 61, 0.2)" stroke="#C0F53D" strokeWidth="1" strokeDasharray="2 2" />
          </g>
          
          {/* Scan box */}
          <rect x="140" y="110" width="120" height="90" fill="none" stroke="rgba(192, 245, 61, 0.3)" strokeWidth="1" />
          <line x1="130" y1="150" x2="270" y2="150" stroke="#C0F53D" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="200" y1="100" x2="200" y2="210" stroke="#C0F53D" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Diagnostic Info */}
          <text x="25" y="40" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
            GRID STATUS: LIVE ARC DETECTED
          </text>
          <text x="25" y="55" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.5">
            TEMP: 142.5°C | VOLTS: ~240V
          </text>
          
          <text x="25" y="275" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="9" opacity="0.6">
            LAT: 45.5301° N | LNG: 122.6421° W
          </text>
          <text x="310" y="275" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            99% CONF
          </text>
        </svg>
      );
      
    case "chemical":
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-chemical">
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Circular coordinate overlay */}
          <g transform="translate(200, 150)">
            <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(192, 245, 61, 0.1)" strokeWidth="1" />
            <line x1="-120" y1="0" x2="120" y2="0" stroke="rgba(192, 245, 61, 0.1)" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="0" y1="-120" x2="0" y2="120" stroke="rgba(192, 245, 61, 0.1)" strokeWidth="1" strokeDasharray="2 4" />
          </g>

          {/* Spilled chemical pool */}
          <g transform="translate(130, 100)">
            {/* Highly alkaline spill visual */}
            <path d="M 20 50 C 40 30, 90 20, 110 40 C 130 60, 140 80, 120 100 C 100 120, 50 110, 30 90 C 10 70, 0 70, 20 50 Z" 
              fill="rgba(192, 245, 61, 0.25)" 
              stroke="#C0F53D" 
              strokeWidth="2" 
              className={pulseClass} 
            />
            {/* Liquid flow vectors */}
            <path d="M 40 60 L 55 63" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 80 50 L 92 55" stroke="#C0F53D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 60 80 L 80 85" stroke="#C0F53D" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* pH marker node */}
            <g transform="translate(110, 50)">
              <circle cx="0" cy="0" r="3" fill="#C0F53D" />
              <line x1="0" y1="0" x2="25" y2="-20" stroke="#C0F53D" strokeWidth="1" />
              <rect x="25" y="-35" width="45" height="15" fill="#1A2209" stroke="#C0F53D" strokeWidth="1" rx="2" />
              <text x="29" y="-24" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="8">pH 11.4</text>
            </g>
          </g>

          {/* Diagnostic Stats */}
          <text x="25" y="40" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
            ALKALINE CORROSIVE SPILL
          </text>
          <text x="25" y="55" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.5">
            BIOSWALE BUFFER PROX: 8.5M
          </text>
          
          <text x="25" y="275" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="9" opacity="0.6">
            LAT: 45.4829° N | LNG: 122.6104° W
          </text>
          <text x="310" y="275" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            92% CONF
          </text>
        </svg>
      );
      
    case "tree":
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-tree">
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Concentric targets */}
          <circle cx="200" cy="150" r="95" fill="none" stroke="rgba(192, 245, 61, 0.1)" strokeWidth="1" />
          
          {/* Canopy structural breakdown outline */}
          <g transform="translate(130, 80)">
            {/* Tree trunk structure */}
            <path d="M 70 120 L 70 80 L 40 50 L 50 40 L 70 65 L 90 45 L 100 52 L 80 80 L 80 120 Z" fill="#1A2209" stroke="#C0F53D" strokeWidth="1.5" />
            
            {/* Broken limb dangling */}
            <path d="M 40 50 L 10 90 L 5 85 L 35 45 Z" fill="rgba(192, 245, 61, 0.1)" stroke="#C0F53D" strokeWidth="1.5" className={pulseClass} />
            <path d="M 35 45 M 35 45 L 30 30" stroke="#C0F53D" strokeWidth="2.5" />
            
            {/* Crown perimeter dashed lines */}
            <circle cx="70" cy="40" r="35" fill="none" stroke="#C0F53D" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          </g>

          {/* Diagnostic Text */}
          <text x="25" y="40" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
            CANOPY STABILITY: STABILIZED
          </text>
          <text x="25" y="55" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.5">
            IMPACT: RESOLVED & RECLAIMED
          </text>
          
          <text x="25" y="275" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="9" opacity="0.6">
            LAT: 45.5042° N | LNG: 122.6288° W
          </text>
          <text x="310" y="275" fill="#C0F53D" fontFamily="var(--font-mono)" fontSize="9" fontWeight="bold">
            97% CONF
          </text>
        </svg>
      );
      
    default:
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10" id="svg-default">
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="200" cy="150" r="40" fill="none" stroke="#C0F53D" strokeWidth="2" className={pulseClass} />
          <path d="M 180 150 L 220 150 M 200 130 L 200 170" stroke="#C0F53D" strokeWidth="1.5" />
          <text x="200" y="210" textAnchor="middle" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="10">SCANNING...</text>
        </svg>
      );
  }
}
