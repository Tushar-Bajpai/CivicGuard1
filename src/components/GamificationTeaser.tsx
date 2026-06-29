import React from "react";
import { motion } from "motion/react";
import { Award, Star, Shield, Trophy } from "lucide-react";

export default function GamificationTeaser() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#0A0D04] relative border-t border-[#FAFFF3]/5 overflow-hidden">
      <div className="absolute right-[10%] top-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#C0F53D]/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold mb-4">REWARDING GOOD CITIZENS</span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#FAFFF3] mb-6 leading-tight">
            Earn points. Build your reputation.
          </h2>
          <p className="text-[#FAFFF3]/60 font-light text-lg mb-8 leading-relaxed max-w-lg">
            CivicGuard isn't just about reporting issues—it's about building a community. Earn a Civic Score for every issue you report and verify. Climb the local leaderboard and unlock exclusive badges to showcase your civic pride.
          </p>
          
          <div className="flex items-center gap-6 font-mono text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-[#EAB308]" />
              </div>
              <span className="text-[#FAFFF3]/50 uppercase tracking-widest text-[9px]">Report</span>
              <span className="text-[#C0F53D] font-bold">+10 pts</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <span className="text-[#FAFFF3]/50 uppercase tracking-widest text-[9px]">Verify</span>
              <span className="text-[#C0F53D] font-bold">+5 pts</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1A2209] border border-[#FAFFF3]/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#F43F5E]" />
              </div>
              <span className="text-[#FAFFF3]/50 uppercase tracking-widest text-[9px]">Resolved</span>
              <span className="text-[#C0F53D] font-bold">+20 pts</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Mock Leaderboard Visual */}
          <div className="bg-[#1A2209]/60 backdrop-blur-md border border-[#FAFFF3]/15 rounded-2xl p-6 shadow-2xl relative z-20 w-full max-w-md mx-auto">
            <div className="flex justify-between items-end border-b border-[#FAFFF3]/10 pb-4 mb-4">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#FAFFF3]/40 uppercase tracking-widest">CURRENT RANKINGS</span>
                <h3 className="font-serif text-xl text-[#FAFFF3]">City Leaderboard</h3>
              </div>
              <Award className="w-6 h-6 text-[#C0F53D]" />
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: "Arjun Mehta", score: 2150, badge: "Civic Star", me: false },
                { rank: 2, name: "Priya Sharma", score: 1980, badge: "Eco Warden", me: false },
                { rank: 3, name: "You", score: 1845, badge: "Road Guardian", me: true },
                { rank: 4, name: "Rohan Das", score: 1720, badge: "Road Guardian", me: false }
              ].map((user) => (
                <div key={user.rank} className={`flex items-center justify-between p-3 rounded-xl border ${user.me ? 'bg-[#C0F53D]/10 border-[#C0F53D]/30' : 'bg-[#0A0D04]/40 border-[#FAFFF3]/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm ${user.me ? 'text-[#C0F53D]' : 'text-[#FAFFF3]/40'}`}>#{user.rank}</span>
                    <div>
                      <div className="text-sm text-[#FAFFF3] font-semibold">{user.name}</div>
                      <div className="text-[10px] text-[#FAFFF3]/50 font-mono">{user.badge}</div>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#C0F53D]">
                    {user.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative accents */}
          <div className="absolute top-12 -left-8 w-24 h-24 bg-[#1A2209] rounded-xl border border-[#FAFFF3]/10 rotate-12 -z-10" />
          <div className="absolute bottom-8 -right-6 w-32 h-32 bg-[#1A2209] rounded-xl border border-[#FAFFF3]/10 -rotate-6 -z-10" />
        </motion.div>

      </div>
    </section>
  );
}
