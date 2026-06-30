import React from "react";
import { Shield, ArrowUp, Github } from "lucide-react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  
  const handleScrollTop = () => {
    onNavigate("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A2209] border-t border-[#FAFFF3]/10 pt-20 pb-8 px-6 md:px-12 relative overflow-hidden" id="footer-section">
      <div className="absolute right-[5%] top-[10%] w-[300px] h-[300px] rounded-full bg-[#C0F53D]/5 blur-[70px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Main Footer Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo Column (Takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <button 
              onClick={handleScrollTop}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              id="footer-logo"
            >
              <div className="w-10 h-10 rounded-full bg-[#0A0D04] border border-[#C0F53D]/30 flex items-center justify-center group-hover:border-[#C0F53D] transition-colors">
                <Shield className="w-4.5 h-4.5 text-[#C0F53D]" />
              </div>
              <span className="font-serif text-2xl font-bold text-[#FAFFF3] tracking-wide">
                Civic<span className="italic text-[#C0F53D]">Guard</span>
              </span>
            </button>
            <p className="font-sans text-sm text-[#FAFFF3]/60 font-light leading-relaxed max-w-sm">
              Improving local neighborhoods and public infrastructure through collaborative civic reporting. Empowering everyday citizens with real-time, prioritized municipal updates and resolution tracking.
            </p>
            {/* Social handles */}
            <div className="flex items-center gap-4 text-[#FAFFF3]/50 font-mono text-[9px]">
              <a href="#github" className="hover:text-[#C0F53D] transition-colors duration-200" id="link-github"><Github className="w-4 h-4" /></a>
              <span className="tracking-wider uppercase ml-2 bg-[#0A0D04] px-2.5 py-0.5 rounded border border-[#FAFFF3]/5 text-[#C0F53D]">
                COMMUNITY NETWORK
              </span>
            </div>
          </div>

          {/* Links Column 1: Platform */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-[#FAFFF3]">
              Platform
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-[#FAFFF3]/70 font-light">
              <li><button onClick={() => onNavigate("map")} className="hover:text-[#C0F53D] cursor-pointer text-left transition-colors">Live Telemetry Map</button></li>
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">AI Processing Core</a></li>
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">Smart Department Routing</a></li>
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">Duplicate Detection</a></li>
            </ul>
          </div>

          {/* Links Column 2: Legal */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-[#FAFFF3]">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-[#FAFFF3]/70 font-light">
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">Privacy Policy</a></li>
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">Terms of Service</a></li>
              <li><a href="#pothole" className="hover:text-[#C0F53D] transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Faint separation grid line & Copyright info */}
        <div className="border-t border-[#FAFFF3]/10 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[10px] text-[#FAFFF3]/40 tracking-wider text-center md:text-left">
            © {currentYear} CIVICGUARD INC. ALL RIGHTS RESERVED.
          </div>
          
          <button
            onClick={handleScrollTop}
            className="group px-4 py-2 rounded-full bg-[#0A0D04] border border-[#FAFFF3]/10 hover:border-[#C0F53D]/30 flex items-center gap-2 font-mono text-[10px] text-[#FAFFF3]/70 hover:text-[#C0F53D] transition-all duration-300 cursor-pointer"
            id="btn-scroll-top-footer"
          >
            BACK TO TOP
            <ArrowUp className="w-3.5 h-3.5 text-[#FAFFF3]/60 group-hover:text-[#C0F53D] transition-colors" />
          </button>
        </div>

      </div>
    </footer>
  );
}
