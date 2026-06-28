import React, { useState } from "react";
import { motion } from "motion/react";
import { MUNICIPAL_AGENCY_STATS } from "../data";
import { Activity, ShieldCheck, TrendingUp, Cpu, Server } from "lucide-react";

export default function ImpactMetrics() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const keyMetrics = [
    { number: "12,450", label: "ISSUES RESOLVED", sub: "99.4% resolution target accuracy" },
    { number: "8,900", label: "ACTIVE CITIZENS", sub: "Attested neighbor nodes" },
    { number: "45", label: "NEIGHBORHOODS", sub: "Fully saturated eco-guards" }
  ];

  return (
    <section id="impact" className="py-24 px-6 md:px-12 bg-[#1A2209]/20 backdrop-blur-3xl border-t border-[#FAFFF3]/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute right-[5%] bottom-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#C0F53D]/5 blur-[90px] pointer-events-none" />
      <div className="absolute left-[10%] top-[10%] w-[25vw] h-[25vw] rounded-full bg-[#1A2209]/30 blur-[75px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Core Big Numbers - Responsive Flex / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left mb-20">
          {keyMetrics.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="space-y-3 p-6 rounded-2xl bg-[#1A2209]/10 border border-[#FAFFF3]/5 hover:border-[#C0F53D]/10 hover:bg-[#1A2209]/25 transition-all duration-300"
              id={`metric-card-${idx}`}
            >
              <h3 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-[#FAFFF3] tracking-tight">
                {m.number}
              </h3>
              <div className="font-mono text-[11px] md:text-xs text-[#C0F53D] tracking-[0.25em] font-bold">
                {m.label}
              </div>
              <p className="font-sans text-xs text-[#FAFFF3]/50 font-light">
                {m.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tactical Graphs & Municipal Agencies Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="impact-diagnostics">
          
          {/* Left panel: Tactical Resolution Graph (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-[#FAFFF3]/10 flex flex-col justify-between">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C0F53D]" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase">
                  RESOLUTION_VELOCITY_INDEX
                </span>
              </div>
              <h4 className="font-serif text-xl md:text-2xl text-[#FAFFF3]">
                Communal response <span className="italic font-normal">acceleration</span> curves.
              </h4>
            </div>

            {/* Premium custom SVG line graph */}
            <div className="relative w-full aspect-[21/9] bg-[#0A0D04]/60 rounded-xl border border-[#FAFFF3]/5 p-4 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] tactical-grid" />
              
              <svg viewBox="0 0 500 150" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="0.5" />
                <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="0.5" />
                
                {/* Resolution trendline (Neon Lime #C0F53D) */}
                <path 
                  d="M 20 130 Q 80 110, 140 85 T 260 65 T 380 35 T 480 15" 
                  fill="none" 
                  stroke="#C0F53D" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  className="animate-[dash_5s_ease-out_infinite]"
                />
                
                {/* Shading area below path */}
                <path 
                  d="M 20 130 Q 80 110, 140 85 T 260 65 T 380 35 T 480 15 L 480 150 L 20 150 Z" 
                  fill="url(#trend-gradient)" 
                  opacity="0.1" 
                />

                <defs>
                  <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C0F53D" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>

                {/* Nodes on graph */}
                {[
                  { cx: 20, cy: 130, label: "Jan", val: "140" },
                  { cx: 140, cy: 85, label: "Mar", val: "480" },
                  { cx: 260, cy: 65, label: "May", val: "890" },
                  { cx: 380, cy: 35, label: "Jul", val: "1.2K" },
                  { cx: 480, cy: 15, label: "Sep", val: "2.4K" }
                ].map((node, nIdx) => (
                  <g 
                    key={nIdx}
                    className="cursor-help"
                    onMouseEnter={() => setHoveredStat(nIdx)}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <circle 
                      cx={node.cx} 
                      cy={node.cy} 
                      r={hoveredStat === nIdx ? 6 : 4} 
                      fill="#C0F53D" 
                      stroke="#0A0D04" 
                      strokeWidth="1" 
                      className="transition-all"
                    />
                    {hoveredStat === nIdx && (
                      <g transform={`translate(${node.cx - 20}, ${node.cy - 25})`}>
                        <rect width="40" height="15" fill="#1A2209" stroke="#C0F53D" strokeWidth="1" rx="2" />
                        <text x="20" y="10" textAnchor="middle" fill="#FAFFF3" fontFamily="var(--font-mono)" fontSize="8">
                          {node.val}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>

              {/* Graph axis months */}
              <div className="flex justify-between font-mono text-[8px] text-[#FAFFF3]/40 tracking-wider pt-2 border-t border-[#FAFFF3]/5">
                <span>Q1_INITIATION</span>
                <span>Q2_INTEGRATION</span>
                <span>Q3_SATURATION_MAX</span>
              </div>
            </div>
            
            <div className="text-[10px] font-mono text-[#FAFFF3]/50 mt-4 flex justify-between">
              <span>ACTIVE_SAMPLING: CONTINOUS_GEO_POLLS</span>
              <span className="text-[#C0F53D]">COMPLIANCE RATE: 99.4%</span>
            </div>
          </div>

          {/* Right panel: Municipal routing priority distribution (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-[#FAFFF3]/10 flex flex-col justify-between">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#C0F53D]" />
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase">
                  MUNICIPAL_DISPATCH_LOAD
                </span>
              </div>
              <h4 className="font-serif text-xl md:text-2xl text-[#FAFFF3]">
                Automated agency <span className="italic font-normal">backbones</span>.
              </h4>
            </div>

            {/* Progress Bars showing load stats */}
            <div className="space-y-4">
              {MUNICIPAL_AGENCY_STATS.map((agency, aIdx) => (
                <div key={aIdx} className="space-y-1.5" id={`agency-stat-${aIdx}`}>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#FAFFF3]/80">{agency.name}</span>
                    <span className="text-[#C0F53D] font-bold">
                      {agency.resolved} resolved
                    </span>
                  </div>
                  
                  {/* Progress track */}
                  <div className="w-full h-1.5 bg-[#0A0D04] rounded-full overflow-hidden border border-[#FAFFF3]/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(agency.resolved / 250) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-[#C0F53D]"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[8px] font-mono text-[#FAFFF3]/40">
                    <span>ACTIVE_LOAD: {agency.active}</span>
                    <span>ROUTE_WEIGHT: {agency.priority_index}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#FAFFF3]/5 text-[9px] font-mono text-[#FAFFF3]/40 text-center uppercase tracking-wider mt-4">
              Decentralised citizen priorities override default townhall queues.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
