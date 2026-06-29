import React, { useState } from "react";
import { motion } from "motion/react";
import { Camera, Users, CheckCircle, Smartphone, Flame, Vote, ArrowRight, ShieldCheck } from "lucide-react";

export default function ProcessGrid() {
  // Step 2 voting simulation
  const [votesCount, setVotesCount] = useState(142);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!hasVoted) {
      setVotesCount(votesCount + 1);
      setHasVoted(true);
    } else {
      setVotesCount(votesCount - 1);
      setHasVoted(false);
    }
  };

  return (
    <section id="process" className="py-24 px-6 md:px-12 bg-[#0A0D04] relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute left-[40%] top-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#1A2209]/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <span className="font-mono text-[10px] text-[#C0F53D] tracking-[0.25em] uppercase block">
            HOW IT WORKS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAFFF3] tracking-tight" id="how-it-works">
            Fix your city in <span className="italic font-normal text-[#C0F53D]">three steps</span>.
          </h2>
          <p className="font-sans text-sm md:text-base text-[#FAFFF3]/60 font-light leading-relaxed">
            Report issues easily and let our platform ensure they get into the right hands, tracked transparently until resolved.
          </p>
        </motion.div>

        {/* 3-Column Glassmorphic Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="process-cards-grid"
        >
          
          {/* Step 1: Report */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#1A2209]/40 backdrop-blur-md border border-[#FAFFF3]/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#C0F53D]/30 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(192,245,61,0.06)]"
            id="card-step-1"
          >
            {/* Top Row: Tag & Step */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center group-hover:border-[#C0F53D]/40 transition-all duration-300">
                <Camera className="w-5 h-5 text-[#C0F53D]" />
              </div>
              <span className="font-mono text-[11px] text-[#C0F53D] font-bold tracking-widest bg-[#1A2209] px-3 py-1 rounded-full border border-[#FAFFF3]/5">
                STEP_01
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3 mb-6">
              <h3 className="font-serif text-xl md:text-2xl text-[#FAFFF3] font-medium">
                Snap & <span className="italic font-normal">Report</span>
              </h3>
              <p className="font-sans text-sm text-[#FAFFF3]/60 font-light leading-relaxed">
                Take a quick photo of a pothole, leak, or hazard. Our platform instantly identifies the issue, pinpoints the location, and estimates the severity.
              </p>
            </div>

            {/* Interactive Demo Block: Simulated scanner frame */}
            <div className="mt-auto bg-[#0A0D04]/90 rounded-xl p-4 border border-[#FAFFF3]/5 font-mono text-[10px] space-y-2">
              <div className="flex items-center justify-between border-b border-[#FAFFF3]/5 pb-2 mb-2">
                <span className="text-[#FAFFF3]/40">SCANNER_INPUT</span>
                <span className="text-[#C0F53D] font-bold animate-pulse">● ACTIVE_CAMERA</span>
              </div>
              <div className="relative h-20 rounded bg-[#1A2209]/40 flex items-center justify-center border border-[#FAFFF3]/10 overflow-hidden">
                <div className="absolute inset-x-0 h-[1.5px] bg-[#C0F53D] opacity-70 animate-[bounce_3s_infinite]" />
                <div className="text-center">
                  <Smartphone className="w-4 h-4 mx-auto text-[#C0F53D]/60 mb-1" />
                  <span className="text-[9px] text-[#FAFFF3]/70">READY_FOR_CAPTURE</span>
                </div>
              </div>
              <div className="text-[8px] text-[#FAFFF3]/40 text-center uppercase tracking-wider">
                NO ACCOUNT REQUIRED TO REPORT
              </div>
            </div>
          </motion.div>

          {/* Step 2: Verify */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#1A2209]/40 backdrop-blur-md border border-[#FAFFF3]/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#C0F53D]/30 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(192,245,61,0.06)]"
            id="card-step-2"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center group-hover:border-[#C0F53D]/40 transition-all duration-300">
                <Users className="w-5 h-5 text-[#C0F53D]" />
              </div>
              <span className="font-mono text-[11px] text-[#C0F53D] font-bold tracking-widest bg-[#1A2209] px-3 py-1 rounded-full border border-[#FAFFF3]/5">
                STEP_02
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3 mb-6">
              <h3 className="font-serif text-xl md:text-2xl text-[#FAFFF3] font-medium">
                Community <span className="italic font-normal">Verification</span>
              </h3>
              <p className="font-sans text-sm text-[#FAFFF3]/60 font-light leading-relaxed">
                Neighbors can confirm your report by clicking <strong className="text-[#C0F53D] font-medium">"I'm affected too"</strong>. This helps prioritize the most urgent issues for the city.
              </p>
            </div>

            {/* Interactive Demo Block: Clickable Escalation node */}
            <div className="mt-auto bg-[#0A0D04]/90 rounded-xl p-4 border border-[#FAFFF3]/5 font-mono text-[10px] space-y-3">
              <div className="flex items-center justify-between text-[#FAFFF3]/40 border-b border-[#FAFFF3]/5 pb-2">
                <span>VOTE_MODULE</span>
                <span className="text-[#C0F53D] font-bold">MUTUAL_AID_NET</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[12px] font-bold text-[#FAFFF3]">{votesCount} Verified</div>
                  <div className="text-[8px] text-[#FAFFF3]/50">COMMUNAL ESCALATION COUNT</div>
                </div>
                
                <button
                  onClick={handleVote}
                  className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    hasVoted 
                      ? "bg-[#C0F53D] text-[#0A0D04] font-bold shadow-[0_0_12px_rgba(192,245,61,0.25)]" 
                      : "bg-[#1A2209] border border-[#C0F53D]/30 text-[#C0F53D] hover:bg-[#C0F53D]/10"
                  }`}
                  id="btn-interactive-vote"
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>{hasVoted ? "Voted" : "Escalate"}</span>
                </button>
              </div>

              <div className="text-[8px] text-[#FAFFF3]/40 text-center uppercase tracking-wider">
                Click button to simulate citizen support
              </div>
            </div>
          </motion.div>

          {/* Step 3: Resolve */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#1A2209]/40 backdrop-blur-md border border-[#FAFFF3]/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#C0F53D]/30 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(192,245,61,0.06)]"
            id="card-step-3"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center group-hover:border-[#C0F53D]/40 transition-all duration-300">
                <CheckCircle className="w-5 h-5 text-[#C0F53D]" />
              </div>
              <span className="font-mono text-[11px] text-[#C0F53D] font-bold tracking-widest bg-[#1A2209] px-3 py-1 rounded-full border border-[#FAFFF3]/5">
                STEP_03
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3 mb-6">
              <h3 className="font-serif text-xl md:text-2xl text-[#FAFFF3] font-medium">
                Automated <span className="italic font-normal">Resolution</span>
              </h3>
              <p className="font-sans text-sm text-[#FAFFF3]/60 font-light leading-relaxed">
                The verified report is sent directly to the correct city department. Track the progress in real-time until the issue is officially resolved.
              </p>
            </div>

            {/* Interactive Demo Block: Automated Dispatch state */}
            <div className="mt-auto bg-[#0A0D04]/90 rounded-xl p-4 border border-[#FAFFF3]/5 font-mono text-[10px] space-y-2">
              <div className="flex items-center justify-between border-b border-[#FAFFF3]/5 pb-2">
                <span className="text-[#FAFFF3]/40">MUNI_GATEWAY</span>
                <span className="text-[#C0F53D] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#C0F53D]" />
                  SYNC_COMPLETE
                </span>
              </div>
              
              <div className="space-y-1.5 text-[9px] text-[#FAFFF3]/70">
                <div className="flex justify-between items-center bg-[#1A2209]/40 p-1 rounded">
                  <span>↳ DEPT: Transportation Board</span>
                  <span className="text-[#C0F53D] font-semibold">ROUTE_OK</span>
                </div>
                <div className="flex justify-between items-center bg-[#1A2209]/40 p-1 rounded">
                  <span>↳ PRIORITY_INDEX: 9.4/10</span>
                  <span className="text-[#C0F53D] font-semibold">DISPATCHED</span>
                </div>
              </div>
              <div className="text-[8px] text-[#FAFFF3]/40 text-center uppercase tracking-wider">
                AUTO-COMMUNICATED AND TIME-STAMPED
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
