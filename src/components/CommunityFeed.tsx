import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_ISSUES } from "../data";
import { CivicIssue } from "../types";
import IssueVisualizer from "./IssueVisualizer";
import { Vote, Calendar, MessageSquare, Tag, ThumbsUp, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

// Helper to format a relative time from a dateReported string
function getRelativeTime(dateString: string): string {
  try {
    const cleaned = dateString.replace(" UTC", "Z").replace(" ", "T");
    const date = new Date(cleaned);
    
    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) {
      return "just now";
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  } catch (e) {
    return "";
  }
}

interface CommunityFeedProps {
  issues: CivicIssue[];
  onVote: (id: string) => void;
  onOpenReport: () => void;
}

export default function CommunityFeed({ issues, onVote, onOpenReport }: CommunityFeedProps) {
  const [selectedFeedCategory, setSelectedFeedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "ALL_REPORTS" },
    { id: "road_damage", label: "ROAD_DAMAGE" },
    { id: "water_leak", label: "WATER_LEAK" },
    { id: "electrical_hazard", label: "GRID_HAZARD" },
    { id: "hazardous_waste", label: "HAZARDOUS_WASTE" }
  ];

  const filteredIssues = selectedFeedCategory === "all"
    ? issues
    : issues.filter(i => i.category === selectedFeedCategory);

  return (
    <section id="community" className="py-24 px-6 md:px-12 bg-[#0A0D04] relative border-t border-[#FAFFF3]/5">
      <div className="absolute left-[-10%] top-[30%] w-[45vw] h-[45vw] rounded-full bg-[#1A2209]/15 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-[#C0F53D] tracking-[0.25em] uppercase block">
              DECENTRALIZED COMMUNITY LEDGER
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAFFF3] tracking-tight">
              Active citizen <span className="italic font-normal text-[#C0F53D]">transmissions</span>.
            </h2>
            <p className="font-sans text-sm text-[#FAFFF3]/60 max-w-xl font-light">
              Browse through recently recorded municipal issues, attest to active hazards, and track real-time resolution pipelines reported within Portland Metro Sector 04.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2" id="feed-categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFeedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded border font-mono text-[9px] tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                  selectedFeedCategory === cat.id
                    ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] font-bold"
                    : "bg-[#1A2209]/40 text-[#FAFFF3]/60 border-[#FAFFF3]/10 hover:border-[#FAFFF3]/30 hover:text-[#FAFFF3]"
                }`}
                id={`btn-feed-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="community-reports-grid">
          
          {/* Quick Submission Prompt Card */}
          <motion.div
            onClick={onOpenReport}
            className="group cursor-pointer bg-[#1A2209]/20 border border-dashed border-[#FAFFF3]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[380px] hover:border-[#C0F53D] hover:bg-[#1A2209]/35 transition-all duration-300"
            id="card-feed-prompt"
          >
            <div className="w-12 h-12 rounded-full bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center group-hover:border-[#C0F53D] transition-all mb-4">
              <span className="text-xl text-[#C0F53D] font-mono group-hover:scale-110 transition-transform">+</span>
            </div>
            <h3 className="font-serif text-lg text-[#FAFFF3] font-medium mb-2">
              Report a New <span className="italic font-normal text-[#C0F53D]">Failure</span>
            </h3>
            <p className="font-sans text-xs text-[#FAFFF3]/50 max-w-xs font-light leading-relaxed">
              Witnessing a pothole, broken sidewalk, fallen tree, or utility leak? Click here to launch the Civic AI Vision reporter.
            </p>
          </motion.div>

          {/* Issue Cards */}
          <AnimatePresence mode="popLayout">
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="group bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl p-5 flex flex-col justify-between h-[380px] hover:border-[#C0F53D]/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(192,245,61,0.05)]"
                id={`feed-card-${issue.id}`}
              >
                {/* Card Header: Badge & Date */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#C0F53D] tracking-wider bg-[#1A2209] px-2.5 py-0.5 rounded border border-[#C0F53D]/25 font-bold uppercase">
                      {issue.id}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] tracking-[0.05em] uppercase px-2 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                        issue.status === "critical" 
                          ? "bg-rose-500/15 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]" 
                          : issue.status === "resolved" 
                            ? "bg-[#C0F53D]/15 border-[#C0F53D]/35 text-[#C0F53D] shadow-[0_0_8px_rgba(192,245,61,0.1)]" 
                            : "bg-amber-500/15 border-amber-500/35 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          issue.status === "critical" 
                            ? "bg-rose-500 animate-pulse" 
                            : issue.status === "resolved" 
                              ? "bg-[#C0F53D]" 
                              : "bg-amber-400 animate-pulse"
                        }`} />
                        {issue.status === "active" ? "Active" : issue.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Coordinates */}
                  <div>
                    <h3 className="font-serif text-lg text-[#FAFFF3] font-medium leading-tight">
                      {issue.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[#FAFFF3]/40 font-mono text-[8px] mt-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{issue.locationName}</span>
                    </div>
                  </div>

                  {/* Brief description */}
                  <p className="font-sans text-xs text-[#FAFFF3]/70 font-light line-clamp-2 leading-relaxed pt-2 border-t border-[#FAFFF3]/5">
                    {issue.description}
                  </p>
                </div>

                {/* Minimal preview vector scan */}
                <div className="h-28 rounded-lg overflow-hidden bg-[#0A0D04]/90 border border-[#FAFFF3]/5 mt-3 relative">
                  <IssueVisualizer type={issue.image} animate={false} />
                </div>

                {/* Card Footer: Community Votes count and Action */}
                <div className="pt-3 border-t border-[#FAFFF3]/5 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FAFFF3]/30" />
                    <span className="font-mono text-[9px] text-[#FAFFF3]/40">
                      {issue.dateReported.split(" ")[0]}
                      {getRelativeTime(issue.dateReported) && (
                        <span className="text-[#C0F53D]/80 font-semibold ml-2">
                          ({getRelativeTime(issue.dateReported)})
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => onVote(issue.id)}
                    className="px-3.5 py-1.5 rounded bg-[#1A2209] border border-[#C0F53D]/30 hover:bg-[#C0F53D]/10 hover:border-[#C0F53D] text-[#C0F53D] font-mono text-[9px] tracking-wider font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    id={`btn-feed-vote-${issue.id}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{issue.votes}</span>
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
