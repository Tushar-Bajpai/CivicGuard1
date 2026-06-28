import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDropzone } from "react-dropzone";
import { 
  X, 
  Upload, 
  MapPin, 
  Tag, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Compass, 
  Image as ImageIcon,
  ChevronDown
} from "lucide-react";

interface ReportIssueModalProps {
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

type PredefinedCategory = "Road Issue" | "Potholes" | "Streetlight" | "Water Leak" | "Others";

export default function ReportIssueModal({ isOpen, onClose, onSubmitReport }: ReportIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PredefinedCategory>("Potholes");
  const [customCategory, setCustomCategory] = useState("");
  const [severity, setSeverity] = useState<"Moderate" | "High" | "Critical">("High");
  
  // Geolocation states
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // File Upload states
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // On Drop callback for react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedImageFile(file);
      
      // Convert to base64 or ObjectURL for instant browser rendering
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    multiple: false
  } as any);

  // Browser Geolocation API call
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    setLocationError(null);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Format coordinates elegantly matching standard dashboard coordinates
        const formattedCoords = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
        
        setCoordinates(formattedCoords);
        setIsFetchingLocation(false);
        setLocationSuccess(true);
        
        if (!locationName) {
          setLocationName(`GPS Node ${Math.floor(Math.random() * 800 + 100)} Area`);
        }
      },
      (error) => {
        console.warn("Geolocation failed or was denied in container context. Applying high-fidelity simulated fallback coordinate:", error);
        let errorMsg = "Coordinates fetched from virtual simulator.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Hardware permission blocked. Virtual fallback coords applied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location service unavailable. Virtual fallback coords applied.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Request timed out. Virtual fallback coords applied.";
        }
        
        // Auto-simulate coordinates so user is not blocked
        const lat = 45.5200 + (Math.random() - 0.5) * 0.03;
        const lng = -122.6800 + (Math.random() - 0.5) * 0.03;
        const formattedCoords = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
        
        setCoordinates(formattedCoords);
        setLocationError(errorMsg);
        setIsFetchingLocation(false);
        setLocationSuccess(true);
        
        if (!locationName) {
          setLocationName(`GPS Node ${Math.floor(Math.random() * 800 + 100)} Area (Simulated)`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimulateLocation = () => {
    // Generate Portland center randomized mock coordinate coordinates
    const lat = 45.50 + Math.random() * 0.05;
    const lng = -122.68 + Math.random() * 0.05;
    const formatted = `${Math.abs(lat).toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° W`;
    setCoordinates(formatted);
    setLocationSuccess(true);
    setLocationError(null);
    if (!locationName) {
      setLocationName("Simulated Sector Cluster " + Math.floor(Math.random() * 900 + 100));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Determine final category string
    const finalCategoryStr = selectedCategory === "Others" 
      ? (customCategory.trim() || "Custom Issue") 
      : selectedCategory;

    // Map selected tag to internal standard categories for chart/icon routing
    let mappedCategoryCode = "road_damage";
    if (selectedCategory === "Water Leak") {
      mappedCategoryCode = "water_leak";
    } else if (selectedCategory === "Streetlight") {
      mappedCategoryCode = "electrical_hazard";
    } else if (selectedCategory === "Others") {
      mappedCategoryCode = "hazardous_waste";
    }

    // Pass base64 image or a simulated image identifier if none uploaded
    const finalImageString = imagePreviewUrl || selectedCategory.toLowerCase().replace(" ", "_");

    onSubmitReport({
      category: mappedCategoryCode,
      title: title.trim(),
      description: description.trim() || `Automated audit ticket filed for municipal ${selectedCategory.toLowerCase()}.`,
      coordinates: coordinates || "45.5230° N, 122.6760° W",
      locationName: locationName.trim() || "Portland Central Grid Node",
      severity: severity.toUpperCase(),
      image: finalImageString
    });

    // Reset local states
    setTitle("");
    setDescription("");
    setLocationName("");
    setCoordinates("");
    setUploadedImageFile(null);
    setImagePreviewUrl(null);
    setSelectedCategory("Potholes");
    setCustomCategory("");
    setLocationSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D04]/80 backdrop-blur-md">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
      />

      {/* Glassmorphic Modal Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-xl max-h-[92vh] md:max-h-[85vh] bg-[#1A2209]/95 backdrop-blur-xl border border-[#FAFFF3]/15 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col"
        id="report-issue-modal-wrapper"
      >
        {/* Futuristic Grid / Cyber details */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#C0F53D]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Tighter border details for futuristic styling */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C0F53D]/30 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FAFFF3]/10 pb-3 mb-4 shrink-0">
          <div>
            <span className="font-mono text-[9px] text-[#C0F53D] tracking-[0.2em] uppercase block">TRANSMISSION LINK</span>
            <h3 className="font-serif text-lg md:text-xl text-[#FAFFF3] mt-0.5">
              File Tactical <span className="italic text-[#C0F53D]">Civic Report</span>
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/40 text-[#FAFFF3]/70 hover:text-[#C0F53D] transition-all cursor-pointer"
            id="btn-close-report-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 text-left">
          
          {/* Scrollable inner input zone */}
          <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 min-h-0">
            
            {/* Issue Title Input */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                Incident Header / Title *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Broken streetlight, active deep pothole..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 rounded-xl px-4 py-3 text-sm text-[#FAFFF3] focus:border-[#C0F53D] focus:ring-1 focus:ring-[#C0F53D]/30 focus:outline-none transition-all placeholder-[#FAFFF3]/30"
                id="report-input-title"
              />
            </div>

            {/* Image Drag and Drop Upload Zone using react-dropzone */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                Evidence Image Capture
              </label>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive 
                    ? "border-[#C0F53D] bg-[#C0F53D]/5" 
                    : imagePreviewUrl 
                      ? "border-emerald-500/30 bg-[#0A0D04]/40" 
                      : "border-[#FAFFF3]/15 hover:border-[#FAFFF3]/35 bg-[#0A0D04]/60"
                }`}
                id="report-image-dropzone"
              >
                <input {...getInputProps()} />
                
                {imagePreviewUrl ? (
                  <div className="flex flex-col items-center justify-center space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="relative group w-full max-w-[160px] aspect-video rounded-lg overflow-hidden border border-[#FAFFF3]/10 shadow-lg">
                      <img 
                        src={imagePreviewUrl} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-[10px] font-mono text-white">Click Upload Box to Replace</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Image Uploaded ({uploadedImageFile?.name})
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setUploadedImageFile(null);
                          setImagePreviewUrl(null);
                        }}
                        className="text-[9px] font-mono text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-[#1A2209] border border-[#C0F53D]/20 flex items-center justify-center text-[#C0F53D]">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#FAFFF3]">
                        Drag & drop image here, or <span className="text-[#C0F53D]">browse files</span>
                      </p>
                      <p className="text-[10px] text-[#FAFFF3]/40 font-mono mt-0.5">
                        SUPPORTS JPG, PNG, GIF (MAX 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Location Fetcher using browser Geolocation API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Display/Fetch Coordinates */}
              <div className="space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                      Telemetry Coordinates *
                    </label>
                    <button 
                      type="button"
                      onClick={handleSimulateLocation}
                      className="font-mono text-[8px] text-[#C0F53D]/60 hover:text-[#C0F53D] hover:underline uppercase"
                    >
                      Simulate
                    </button>
                  </div>
                  
                  {/* Monospaced coordinates preview display */}
                  <div className="w-full h-[40px] bg-[#0A0D04]/80 border border-[#FAFFF3]/10 rounded-xl px-3 flex items-center justify-between mt-1">
                    <span className={`font-mono text-xs tracking-wider ${coordinates ? "text-[#C0F53D]" : "text-[#FAFFF3]/30"}`}>
                      {coordinates || "FETCHING GPS REQUIRED..."}
                    </span>
                    
                    {locationSuccess && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {locationError && (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 ml-2" title={locationError} />
                    )}
                  </div>
                </div>

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="w-full mt-2 py-2 rounded-xl border border-[#C0F53D]/30 hover:border-[#C0F53D] hover:bg-[#C0F53D]/5 text-[#C0F53D] font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isFetchingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>PINPOINTING SATELLITE...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" />
                      <span>FETCH LIVE GPS LOCATION</span>
                    </>
                  )}
                </button>
              </div>

              {/* Location Name Description Input */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                  Geographic Reference / Address
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Near Laurelhurst Park, NE 33rd Ave..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 rounded-xl px-4 py-2 text-xs text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none transition-all placeholder-[#FAFFF3]/30 resize-none h-[80px]"
                  id="report-input-location-name"
                />
              </div>
            </div>

            {/* Location Errors Alert Block */}
            {locationError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-mono text-[10px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Category Tags selection */}
            <div className="space-y-2 text-left">
              <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                Incident Category Node tag
              </label>
              
              {/* Predefined toggle chips */}
              <div className="flex flex-wrap gap-1.5" id="report-category-toggle-group">
                {(["Road Issue", "Potholes", "Streetlight", "Water Leak", "Others"] as PredefinedCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      selectedCategory === cat 
                        ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] font-bold shadow-[0_0_12px_rgba(192,245,61,0.3)]"
                        : "bg-[#0A0D04]/60 border-[#FAFFF3]/10 text-[#FAFFF3]/60 hover:border-[#FAFFF3]/30 hover:text-white"
                    }`}
                    id={`btn-tag-${cat.toLowerCase().replace(" ", "-")}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Custom Category Tag Reveal */}
              <AnimatePresence>
                {selectedCategory === "Others" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pt-1.5"
                  >
                    <input 
                      type="text"
                      required
                      placeholder="Enter custom incident category label..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-[#0A0D04]/80 border border-[#C0F53D]/40 rounded-xl px-3 py-2 text-xs text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none placeholder-[#FAFFF3]/30"
                      id="report-input-custom-tag"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Severity & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Severity Picker */}
              <div className="sm:col-span-1 space-y-1.5">
                <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                  Muni-Priority
                </label>
                <div className="relative">
                  <select 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 rounded-xl px-3 py-2 text-xs text-[#FAFFF3] appearance-none focus:border-[#C0F53D] focus:outline-none cursor-pointer"
                    id="report-input-severity"
                  >
                    <option value="Moderate" className="bg-[#1A2209] text-white">Moderate</option>
                    <option value="High" className="bg-[#1A2209] text-white">High priority</option>
                    <option value="Critical" className="bg-rose-950 text-rose-200 font-bold">CRITICAL NODE</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#FAFFF3]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Incident Observations */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-mono text-[10px] text-[#FAFFF3]/50 uppercase tracking-wider block">
                  Observation Detail / Log Summary
                </label>
                <input 
                  type="text" 
                  placeholder="Structural failure detected, immediate dispatch required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0A0D04]/60 border border-[#FAFFF3]/10 rounded-xl px-4 py-2 text-xs text-[#FAFFF3] focus:border-[#C0F53D] focus:outline-none transition-all placeholder-[#FAFFF3]/30"
                  id="report-input-desc"
                />
              </div>

            </div>

          </div>

          {/* Sticky Footer Controls */}
          <div className="pt-3.5 border-t border-[#FAFFF3]/10 mt-3.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(192,245,61,0.4)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 bg-[#C0F53D] hover:bg-opacity-95 text-[#0A0D04] font-mono text-xs font-bold uppercase tracking-widest rounded-xl shadow-[0_4px_25px_rgba(192,245,61,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#C0F53D]/50"
              id="report-submit-btn"
            >
              <AlertTriangle className="w-4 h-4 text-[#0A0D04]" />
              <span>DISPATCH CIVIC TRANSMISSION</span>
            </motion.button>

            {/* Small footer branding node */}
            <div className="mt-3 text-center">
              <p className="font-mono text-[8px] text-[#FAFFF3]/30 tracking-widest uppercase">
                SECURE CIVICGUARD ENDPOINT // VER v4.99_AUTO
              </p>
            </div>
          </div>

        </form>

      </motion.div>
    </div>
  );
}
