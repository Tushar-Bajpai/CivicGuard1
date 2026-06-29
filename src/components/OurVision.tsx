import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring } from "motion/react";
import { Target, Shield, Heart } from "lucide-react";

// Helper component for count-up animation
function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplay(Math.floor(latest).toLocaleString());
    });
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function OurVision() {
  const visionMetrics = [
    { number: 100000, suffix: "+", label: "ISSUES REPORTED", sub: "Goal for our first year", icon: <Target className="w-5 h-5 text-[#C0F53D]" /> },
    { number: 50, suffix: "", label: "CITIES ONBOARDED", sub: "Expanding our reach nationwide", icon: <Shield className="w-5 h-5 text-[#C0F53D]" /> },
    { number: 24, suffix: "h", label: "RESPONSE TIME", sub: "Target average resolution time", icon: <Heart className="w-5 h-5 text-[#C0F53D]" /> }
  ];

  return (
    <section id="vision" className="py-24 px-6 md:px-12 bg-[#1A2209]/20 backdrop-blur-3xl border-t border-[#FAFFF3]/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute right-[5%] bottom-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#C0F53D]/5 blur-[90px] pointer-events-none" />
      <div className="absolute left-[10%] top-[10%] w-[25vw] h-[25vw] rounded-full bg-[#1A2209]/30 blur-[75px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold mb-4">OUR VISION</span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#FAFFF3] mb-6">
            Building a better tomorrow, together.
          </h2>
          <p className="text-[#FAFFF3]/60 max-w-2xl mx-auto font-light text-lg">
            We're on a mission to modernize how citizens interact with their local governments. By providing the right tools, we can make cities safer, cleaner, and more efficient.
          </p>
        </motion.div>
        
        {/* Animated Vision Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {visionMetrics.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="space-y-4 p-8 rounded-2xl bg-[#1A2209]/40 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/30 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C0F53D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0A0D04] border border-[#FAFFF3]/10 flex items-center justify-center mb-4">
                {m.icon}
              </div>
              
              <h3 className="font-serif text-5xl md:text-6xl font-bold text-[#FAFFF3] tracking-tight">
                <Counter value={m.number} suffix={m.suffix} />
              </h3>
              
              <div>
                <div className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] font-bold uppercase mb-1">
                  {m.label}
                </div>
                <p className="font-sans text-sm text-[#FAFFF3]/50 font-light">
                  {m.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
