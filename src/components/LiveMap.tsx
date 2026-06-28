import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_ISSUES } from "../data";
import { CivicIssue, IssueStatus } from "../types";
import IssueVisualizer from "./IssueVisualizer";
import { MapPin, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle, Info, ThumbsUp, Layers, Compass } from "lucide-react";

export default function LiveMap() {
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_ISSUES[0].id);
  const [filter, setFilter] = useState<"all" | IssueStatus>("all");

  const selectedIssue = issues.find((i) => i.id === selectedId) || issues[0];

  const filteredIssues = filter === "all" 
    ? issues 
    : issues.filter((i) => i.status === filter);

  const handleEscalateOnMap = (id: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        return { ...issue, votes: issue.votes + 1 };
      }
      return issue;
    }));
  };

  // Coordinates on our visual SVG map representing the issues
  const mapCoordinates: Record<string, { cx: number; cy: number }> = {
    "CG-2026-089": { cx: 160, cy: 110 }, // Road fracture
    "CG-2026-092": { cx: 280, cy: 180 }, // Water leak
    "CG-2026-074": { cx: 340, cy: 80 },  // Electrical Hazard
    "CG-2026-101": { cx: 110, cy: 230 }, // Hazardous waste
    "CG-2026-061": { cx: 220, cy: 150 }  // Tree failure
  };

  return (
    <section id="map" className="py-24 px-6 md:px-12 bg-[#0A0D04] relative border-t border-[#FAFFF3]/5">
      <div className="max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-[#C0F53D] tracking-[0.25em] uppercase block">
              PORTLAND METRO SECTOR 04
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAFFF3] tracking-tight">
              Tactical <span className="italic font-normal text-[#C0F53D]">Live Map</span> interface.
            </h2>
            <p className="font-sans text-sm text-[#FAFFF3]/60 max-w-xl font-light">
              Real-time ecological telemetry and municipal failures. Select active nodes to pull diagnostic reports, vote on critical priorities, or inspect automated dispatch queues.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2" id="map-filters">
            {(["all", "critical", "active", "resolved"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-mono text-[10px] tracking-widest uppercase border transition-all duration-300 cursor-pointer ${
                  filter === status
                    ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] font-bold"
                    : "bg-[#1A2209]/40 text-[#FAFFF3]/70 border-[#FAFFF3]/10 hover:border-[#FAFFF3]/30 hover:text-[#FAFFF3]"
                }`}
                id={`btn-filter-${status}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Live Grid Layout: Map + Sidebar Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Map Left Viewport (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#1A2209]/20 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-[#FAFFF3]/10 flex flex-col justify-between min-h-[400px] md:min-h-[500px] relative overflow-hidden" id="map-viewport">
            {/* Watermark grid coordinate tags */}
            <div className="absolute top-4 left-4 font-mono text-[8px] text-[#FAFFF3]/30 uppercase flex items-center gap-1.5 pointer-events-none">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              GRID_SYSTEM_OK // SEC_45.5_122.6
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[8px] text-[#FAFFF3]/30 pointer-events-none">
              SCALE: 1:40,000 | PORTLAND, OREGON
            </div>

            {/* Custom SVG Tactical Map */}
            <div className="relative w-full my-auto flex items-center justify-center aspect-[4/3] rounded-xl bg-[#0A0D04]/80 border border-[#FAFFF3]/5 overflow-hidden">
              <svg viewBox="0 0 500 375" className="w-full h-full p-4 select-none">
                {/* Background Grid Pattern */}
                <pattern id="map-subgrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(250, 255, 243, 0.015)" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#map-subgrid)" />

                {/* River vector */}
                <path 
                  d="M 50 -10 Q 180 120, 210 190 T 150 390" 
                  fill="none" 
                  stroke="rgba(192, 245, 61, 0.08)" 
                  strokeWidth="35" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 50 -10 Q 180 120, 210 190 T 150 390" 
                  fill="none" 
                  stroke="rgba(192, 245, 61, 0.12)" 
                  strokeWidth="2" 
                  strokeDasharray="10 5" 
                />

                {/* Major streets wireframes */}
                <line x1="-10" y1="120" x2="510" y2="120" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="2" />
                <line x1="-10" y1="240" x2="510" y2="240" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="1.5" />
                <line x1="150" y1="-10" x2="150" y2="390" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="2" />
                <line x1="320" y1="-10" x2="320" y2="390" stroke="rgba(250, 255, 243, 0.05)" strokeWidth="1.5" />

                {/* Secondary diagonal streets */}
                <line x1="-10" y1="-10" x2="510" y2="300" stroke="rgba(250, 255, 243, 0.03)" strokeWidth="1" />
                <line x1="-10" y1="300" x2="510" y2="50" stroke="rgba(250, 255, 243, 0.03)" strokeWidth="1" />

                {/* Draw eco-buffer zone circles */}
                <circle cx="210" cy="190" r="45" fill="none" stroke="rgba(192, 245, 61, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="110" cy="230" r="30" fill="none" stroke="rgba(192, 245, 61, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="340" cy="80" r="35" fill="none" stroke="rgba(192, 245, 61, 0.05)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Render interactive glowing nodes */}
                {filteredIssues.map((issue) => {
                  const coord = mapCoordinates[issue.id];
                  if (!coord) return null;

                  const isSelected = issue.id === selectedId;
                  
                  // Color according to status
                  const color = issue.status === "critical" 
                    ? "#F43F5E" // deep hazard rose
                    : issue.status === "resolved" 
                      ? "#C0F53D" // green eco accent
                      : "#EAB308"; // yellow active alert

                  return (
                    <g 
                      key={issue.id} 
                      className="cursor-pointer" 
                      onClick={() => setSelectedId(issue.id)}
                    >
                      {/* Interactive ping rings */}
                      <circle 
                        cx={coord.cx} 
                        cy={coord.cy} 
                        r={isSelected ? 18 : 10} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="1" 
                        opacity={isSelected ? "0.6" : "0.3"} 
                        className={isSelected ? "animate-pulse" : ""}
                      />
                      {isSelected && (
                        <circle 
                          cx={coord.cx} 
                          cy={coord.cy} 
                          r={28} 
                          fill="none" 
                          stroke={color} 
                          strokeWidth="0.5" 
                          opacity="0.3" 
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Central Point */}
                      <circle 
                        cx={coord.cx} 
                        cy={coord.cy} 
                        r={isSelected ? 6 : 4} 
                        fill={color} 
                      />

                      {/* Tag label (only visible if selected or critical) */}
                      {(isSelected || issue.status === "critical") && (
                        <g transform={`translate(${coord.cx + 12}, ${coord.cy - 12})`}>
                          <rect 
                            width="75" 
                            height="16" 
                            fill="#1A2209" 
                            stroke={isSelected ? "#C0F53D" : "rgba(250, 255, 243, 0.15)"} 
                            strokeWidth="1" 
                            rx="3" 
                          />
                          <text 
                            x="6" 
                            y="11" 
                            fill={color} 
                            fontFamily="var(--font-mono)" 
                            fontSize="8" 
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {issue.id}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Micro-Instructions for navigation */}
            <div className="mt-4 flex items-center justify-between text-[#FAFFF3]/50 text-[10px] font-mono border-t border-[#FAFFF3]/5 pt-3">
              <span>ACTIVE_SENSORS: {filteredIssues.length} DISPLAYED</span>
              <span>CLICK GLOWING NODES TO RE-SECT REPORT</span>
            </div>
          </div>

          {/* Sidebar Panel Right: Full Issue Details (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between" id="map-sidebar">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIssue.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-[#1A2209]/40 backdrop-blur-md border border-[#FAFFF3]/10 rounded-2xl p-6 flex flex-col h-full justify-between hover:border-[#FAFFF3]/15 transition-all"
              >
                {/* Header detail */}
                <div className="space-y-4">
                  
                  {/* Status, ID and confidence badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#C0F53D] tracking-wider uppercase bg-[#1A2209] px-3 py-1 rounded border border-[#C0F53D]/20 font-bold">
                      {selectedIssue.id}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedIssue.status === "critical" 
                          ? "bg-rose-500 animate-pulse" 
                          : selectedIssue.status === "resolved" 
                            ? "bg-[#C0F53D]" 
                            : "bg-yellow-500 animate-pulse"
                      }`} />
                      <span className="font-mono text-[10px] tracking-widest text-[#FAFFF3]/80 uppercase font-semibold">
                        {selectedIssue.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Title & Coordinates */}
                  <div>
                    <h3 className="font-serif text-2xl text-[#FAFFF3] leading-snug">
                      {selectedIssue.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[#C0F53D] font-mono text-[10px] tracking-wider mt-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedIssue.locationName}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-xs md:text-sm text-[#FAFFF3]/70 font-light leading-relaxed pt-2 border-t border-[#FAFFF3]/5">
                    {selectedIssue.description}
                  </p>

                  {/* AI Vision Scan Vector Image Embedding */}
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#0A0D04]/90 border border-[#FAFFF3]/5 mt-4">
                    <IssueVisualizer type={selectedIssue.image} animate={false} />
                  </div>

                  {/* Coordinates & Metadata footer block */}
                  <div className="grid grid-cols-2 gap-3 bg-[#0A0D04]/80 p-3 rounded-lg border border-[#FAFFF3]/5 mt-4">
                    <div>
                      <div className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase">GPS LOCATION</div>
                      <div className="text-[10px] font-mono text-[#FAFFF3]/80 mt-0.5">{selectedIssue.coordinates}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase">REPORTED TIMECODE</div>
                      <div className="text-[10px] font-mono text-[#FAFFF3]/80 mt-0.5">{selectedIssue.dateReported}</div>
                    </div>
                  </div>

                </div>

                {/* Sidebar footer controls: Vote & Verify Escalate */}
                <div className="pt-6 border-t border-[#FAFFF3]/5 mt-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-serif text-xl font-bold text-[#FAFFF3]">{selectedIssue.votes}</div>
                    <div className="font-mono text-[8px] text-[#FAFFF3]/40 uppercase tracking-widest">Neighbor Attestations</div>
                  </div>

                  <button
                    onClick={() => handleEscalateOnMap(selectedIssue.id)}
                    className="px-5 py-2.5 rounded-lg bg-[#C0F53D] text-[#0A0D04] font-mono text-[11px] font-bold tracking-wider uppercase hover:bg-opacity-90 active:scale-95 cursor-pointer shadow-lg transition-all flex items-center gap-2"
                    id={`btn-escalate-sidebar-${selectedIssue.id}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    VOTE_TO_ESCALATE
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
