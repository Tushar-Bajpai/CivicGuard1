import React from "react";
import { motion } from "motion/react";
import { AlertCircle, Clock, TrendingDown } from "lucide-react";

export default function ProblemStatement() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#0A0D04] relative border-t border-[#FAFFF3]/5">
      <div className="absolute inset-0 pointer-events-none opacity-20 tactical-grid z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs text-[#F43F5E] tracking-[0.2em] uppercase block font-bold mb-4">THE PROBLEM</span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#FAFFF3] mb-6 max-w-3xl mx-auto leading-tight">
            Cities are struggling to keep up with crumbling infrastructure.
          </h2>
          <p className="text-[#FAFFF3]/60 max-w-2xl mx-auto font-light text-lg mb-16">
            Traditional reporting systems are slow, fragmented, and frustrating for citizens. Critical issues go unreported, and maintenance teams lack the data they need to prioritize repairs efficiently.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-8 bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#F43F5E]/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-[#F43F5E]" />
            </div>
            <h3 className="font-serif text-4xl text-[#FAFFF3] mb-2 font-bold">60%</h3>
            <p className="font-mono text-xs text-[#FAFFF3]/50 uppercase tracking-wider">Of issues go unreported</p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-8 bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAB308]/10 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-[#EAB308]" />
            </div>
            <h3 className="font-serif text-4xl text-[#FAFFF3] mb-2 font-bold">42 Days</h3>
            <p className="font-mono text-xs text-[#FAFFF3]/50 uppercase tracking-wider">Average resolution time</p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-8 bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#C0F53D]/10 flex items-center justify-center mb-6">
              <TrendingDown className="w-6 h-6 text-[#C0F53D]" />
            </div>
            <h3 className="font-serif text-4xl text-[#FAFFF3] mb-2 font-bold">$2.1B</h3>
            <p className="font-mono text-xs text-[#FAFFF3]/50 uppercase tracking-wider">Lost in deferred maintenance</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
