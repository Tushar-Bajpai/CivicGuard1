import React from "react";
import { motion } from "motion/react";
import { Shield, PenTool as Tool, Menu, X } from "lucide-react";

interface NavigationProps {
  onReportClick: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export default function Navigation({ onReportClick, activeSection, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: "hero", label: "Overview" },
    { id: "map", label: "Live Map" },
    { id: "community", label: "Community" },
    { id: "impact", label: "Impact" }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 font-sans"
      id="main-navigation"
    >
      <div className="backdrop-blur-md bg-[#0A0D04]/60 border border-[#FAFFF3]/10 rounded-full px-6 py-3 md:py-4 flex items-center justify-between shadow-2xl">
        {/* Left Side: Logo */}
        <button 
          onClick={() => handleNavClick("hero")}
          className="flex items-center gap-2 group text-left cursor-pointer"
          id="btn-logo"
        >
          <div className="w-8 h-8 rounded-full bg-[#1A2209] border border-[#C0F53D]/30 flex items-center justify-center group-hover:border-[#C0F53D] transition-colors duration-300">
            <Shield className="w-4 h-4 text-[#C0F53D]" />
          </div>
          <span className="font-serif text-lg md:text-xl font-bold text-[#FAFFF3] tracking-wide">
            Civic<span className="italic text-[#C0F53D]">Guard</span>
          </span>
        </button>

        {/* Center: Desktop Nav items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative py-1 text-sm font-sans tracking-wide cursor-pointer text-[#FAFFF3]/70 hover:text-[#FAFFF3] transition-colors duration-200"
              id={`nav-${item.id}`}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C0F53D]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right Side: CTA Button and Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReportClick}
            className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-[#C0F53D] text-[#0A0D04] font-sans font-semibold text-xs md:text-sm tracking-wide cursor-pointer shadow-[0_0_15px_rgba(192,245,61,0.2)] hover:shadow-[0_0_25px_rgba(192,245,61,0.4)] transition-all duration-300"
            id="btn-report-desktop"
          >
            <Tool className="w-3.5 h-3.5" />
            Report Issue
          </motion.button>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#FAFFF3]/80 hover:text-[#FAFFF3] cursor-pointer"
            id="btn-mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav dropdown drawer */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-0 right-0 bg-[#1A2209]/95 backdrop-blur-xl border border-[#FAFFF3]/10 rounded-2xl p-6 flex flex-col gap-4 shadow-3xl md:hidden"
          id="mobile-menu-drawer"
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 text-left text-base font-sans tracking-wide cursor-pointer border-b border-[#FAFFF3]/5 ${
                  activeSection === item.id ? "text-[#C0F53D] font-semibold" : "text-[#FAFFF3]/70"
                }`}
                id={`nav-mob-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onReportClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C0F53D] text-[#0A0D04] font-sans font-semibold text-sm tracking-wide cursor-pointer shadow-lg"
            id="btn-report-mobile"
          >
            <Tool className="w-4 h-4" />
            Report Issue
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
