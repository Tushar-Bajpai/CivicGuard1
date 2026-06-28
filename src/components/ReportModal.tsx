import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Check, Cpu, Terminal, ShieldAlert, Sparkles, MapPin, Loader2, ArrowRight } from "lucide-react";
import IssueVisualizer from "./IssueVisualizer";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: {
    category: string;
    title: string;
    description: string;
    coordinates: string;
    locationName: string;
    severity: string;
    image: string;
  }) => void;
}

export default function ReportModal({ isOpen, onClose, onSubmitReport }: ReportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<"pothole" | "water_leak" | "electrical" | "chemical" | null>(null);
  const [severity, setSeverity] = useState<"moderate" | "high" | "critical">("high");
  const [customDescription, setCustomDescription] = useState("");
  const [locationName, setLocationName] = useState("Saratoga St & Interstate Ave");
  const [coordinates, setCoordinates] = useState("45.5681° N, 122.6894° W");

  // Loading / AI analysis simulation
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState("");

  const issueCategories = [
    { id: "pothole", label: "Critical Road Fracture", icon: "road_damage", defaultDesc: "Deep structural pothole on active transit lane, causing immediate vehicle damage." },
    { id: "water_leak", label: "Mainline Pressure Leak", icon: "utility_water_leak", defaultDesc: "Subterranean water main fracture causing sidwalk erosion and heavy bubbling." },
    { id: "electrical", label: "Arcing Utility Hazard", icon: "grid_hazard", defaultDesc: "Sparking downed high voltage line near brush canopy, fire hazard risk is extreme." },
    { id: "chemical", label: "Chemical Runoff Deposit", icon: "hazardous_spill", defaultDesc: "Odorless high pH liquid accumulation near public bioswale, damaging roots." }
  ] as const;

  const handleSimulateGPS = () => {
    // Generate random Portland coordinates
    const lat = (45.48 + Math.random() * 0.1).toFixed(4);
    const lng = (122.60 + Math.random() * 0.1).toFixed(4);
    setCoordinates(`${lat}° N, 122.${lng.split(".")[1]}° W`);
    setLocationName("Simulated GPS Coordinates Node " + Math.floor(Math.random() * 900 + 100));
  };

  const handleStartAnalysis = () => {
    if (!selectedCategory) return;
    setStep(2);
    setAnalyzing(true);
    setAnalysisText("INITIALIZING CIVICGUARD TELEMETRY LINK...");

    setTimeout(() => {
      setAnalysisText("TRANSMITTING BINARY IMAGE CHUNKS TO NEURAL CORRIDOR...");
    }, 1000);

    setTimeout(() => {
      setAnalysisText("COMPILING VECTOR ACCIDENT PREDICTOR COEFFICIENTS...");
    }, 2000);

    setTimeout(() => {
      setAnalysisText("ISOLATING COORDINATE BUFFER MARGINS (99.8% PRECISION)...");
    }, 3000);

    setTimeout(() => {
      setAnalyzing(false);
      setStep(3);
    }, 4000);
  };

  const handleSubmit = () => {
    if (!selectedCategory) return;
    const matchedCategory = issueCategories.find(c => c.id === selectedCategory);
    
    onSubmitReport({
      category: selectedCategory === "pothole" ? "road_damage" : selectedCategory === "water_leak" ? "water_leak" : selectedCategory === "electrical" ? "electrical_hazard" : "hazardous_waste",
      title: matchedCategory?.label || "Reported Issue",
      description: customDescription || matchedCategory?.defaultDesc || "",
      coordinates,
      locationName,
      severity: severity.toUpperCase(),
      image: selectedCategory
    });
    
    // Reset wizard
    setStep(1);
    setSelectedCategory(null);
    setCustomDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0D04]/90 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#1A2209]/90 border border-[#FAFFF3]/15 rounded-2xl p-6 md:p-8 shadow-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col justify-between"
        id="report-wizard-container"
      >
        {/* Glow corner elements */}
        <div className="absolute right-[-10%] top-[-10%] w-[120px] h-[120px] rounded-full bg-[#C0F53D]/10 blur-xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FAFFF3]/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#C0F53D]" />
            <h3 className="font-serif text-xl md:text-2xl text-[#FAFFF3]">
              Active Civic <span className="italic font-normal text-[#C0F53D]">AI Reporting</span>
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full border border-[#FAFFF3]/10 hover:border-[#C0F53D]/30 text-[#FAFFF3]/70 hover:text-[#C0F53D] cursor-pointer"
            id="btn-close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-6 font-mono text-[9px] text-[#FAFFF3]/40 border-b border-[#FAFFF3]/5 pb-3">
          <span className={step === 1 ? "text-[#C0F53D] font-bold" : ""}>01_SPECIFY_Telemetry</span>
          <div className="h-[1px] bg-[#FAFFF3]/5 flex-1 mx-3" />
          <span className={step === 2 ? "text-[#C0F53D] font-bold" : ""}>02_NEURAL_PROCESSING</span>
          <div className="h-[1px] bg-[#FAFFF3]/5 flex-1 mx-3" />
          <span className={step === 3 ? "text-[#C0F53D] font-bold" : ""}>03_DISPATCH_CONFIRMATION</span>
        </div>

        {/* Content Block */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Select Category */}
              <div className="space-y-3">
                <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                  Select Issue Signature Image To Analyze:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="wizard-category-selector">
                  {issueCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (!customDescription) {
                          setCustomDescription(cat.defaultDesc);
                        }
                      }}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-[110px] transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-[#C0F53D]/10 border-[#C0F53D] text-[#C0F53D]"
                          : "bg-[#0A0D04]/60 border-[#FAFFF3]/15 text-[#FAFFF3]/70 hover:border-[#FAFFF3]/30 hover:text-[#FAFFF3]"
                      }`}
                      id={`btn-wizard-cat-${cat.id}`}
                    >
                      <span className="font-serif text-base font-semibold block">{cat.label}</span>
                      <span className="font-mono text-[8px] tracking-wider text-[#FAFFF3]/40 uppercase">
                        [{cat.icon}]
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geo telemetry coordinates fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-[#FAFFF3]/50 uppercase">Location Descriptor</label>
                  <input 
                    type="text" 
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-[#0A0D04]/80 border border-[#FAFFF3]/15 rounded-lg px-3 py-2 text-xs font-sans text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[9px] text-[#FAFFF3]/50 uppercase">GPS Node Coordinates</label>
                    <button 
                      onClick={handleSimulateGPS}
                      className="font-mono text-[8px] text-[#C0F53D] hover:underline uppercase cursor-pointer"
                    >
                      Simulate Location
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={coordinates} 
                    onChange={(e) => setCoordinates(e.target.value)}
                    className="w-full bg-[#0A0D04]/80 border border-[#FAFFF3]/15 rounded-lg px-3 py-2 text-xs font-mono text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Severity & custom description */}
              <div className="space-y-3">
                <label className="font-mono text-[9px] text-[#FAFFF3]/50 uppercase block">Severity Priority Indicator</label>
                <div className="flex gap-2" id="wizard-severity-selector">
                  {(["moderate", "high", "critical"] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 py-2 rounded-lg border font-mono text-[9px] tracking-widest uppercase transition-all cursor-pointer ${
                        severity === sev
                          ? sev === "critical"
                            ? "bg-rose-500/10 border-rose-500 text-rose-500 font-bold"
                            : "bg-[#C0F53D]/10 border-[#C0F53D] text-[#C0F53D] font-bold"
                          : "bg-[#0A0D04]/60 border-[#FAFFF3]/10 text-[#FAFFF3]/50 hover:border-[#FAFFF3]/25"
                      }`}
                      id={`btn-wizard-sev-${sev}`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-[#FAFFF3]/50 uppercase">Observations / Impact Notes</label>
                <textarea 
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Specify any localized details..."
                  className="w-full bg-[#0A0D04]/80 border border-[#FAFFF3]/15 rounded-lg px-3 py-2 text-xs font-sans text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none resize-none"
                />
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-[#C0F53D] animate-spin" />
                <Cpu className="w-6 h-6 text-[#C0F53D] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <div className="font-mono text-[11px] text-[#C0F53D] tracking-wider uppercase font-bold animate-pulse">
                  Analyzing Telemetry Data Packet
                </div>
                <div className="font-mono text-[9px] text-[#FAFFF3]/40 uppercase tracking-widest h-6 overflow-hidden">
                  {analysisText}
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedCategory && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#C0F53D]/10 border border-[#C0F53D]/30 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-[#C0F53D]" />
                </div>
                <h4 className="font-serif text-lg text-[#FAFFF3]">AI Processing Successful</h4>
                <p className="text-xs text-[#FAFFF3]/60 font-light mt-1">
                  The image contours mapped successfully with 98.4% diagnostic accuracy.
                </p>
              </div>

              {/* Diagnostic output comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="aspect-video bg-[#0A0D04] rounded-xl overflow-hidden border border-[#FAFFF3]/15">
                  <IssueVisualizer type={selectedCategory} animate={false} />
                </div>

                <div className="bg-[#0A0D04] rounded-xl p-4 border border-[#FAFFF3]/15 font-mono text-[9px] leading-tight flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-[#C0F53D] font-bold mb-2">CIVIC_AI_SPEC_OUTPUT</div>
                    <div>CLASS: {selectedCategory.toUpperCase()}</div>
                    <div>LATITUDE: {coordinates.split(",")[0]}</div>
                    <div>LONGITUDE: {coordinates.split(",")[1]?.trim() || "N/A"}</div>
                    <div>SEVERITY_LEVEL: {severity.toUpperCase()}</div>
                    <div>COMMUNITY_PRIORITY: AUTO_ROUTE_OK</div>
                  </div>
                  
                  <div className="pt-2 border-t border-[#FAFFF3]/5 text-[8px] text-[#FAFFF3]/30 uppercase mt-4">
                    MD5_HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}...
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-[#FAFFF3]/10 pt-4 mt-6 flex items-center justify-between">
          <div className="font-mono text-[9px] text-[#FAFFF3]/40 uppercase">
            {step === 1 ? "STAGE: PRE-ANALYSIS" : step === 2 ? "STAGE: PROCESSING" : "STAGE: DISPATCH"}
          </div>

          <div className="flex gap-2">
            {step === 1 && (
              <button
                disabled={!selectedCategory}
                onClick={handleStartAnalysis}
                className={`px-5 py-2.5 rounded-lg font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCategory 
                    ? "bg-[#C0F53D] text-[#0A0D04] hover:bg-opacity-90 active:scale-95" 
                    : "bg-[#1A2209] text-[#FAFFF3]/30 border border-[#FAFFF3]/5 cursor-not-allowed"
                }`}
                id="btn-start-ai-analysis"
              >
                Launch Civic AI
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg bg-[#C0F53D] text-[#0A0D04] font-mono text-[10px] tracking-wider uppercase font-bold hover:bg-opacity-90 active:scale-95 cursor-pointer flex items-center gap-2"
                id="btn-dispatch-report"
              >
                Route to Dispatch Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
