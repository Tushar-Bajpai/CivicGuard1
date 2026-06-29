/// <reference path="../types-map.d.ts" />
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { 
  Shield, 
  MapPin, 
  ThumbsUp, 
  Activity, 
  Building2, 
  FileText, 
  Terminal, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  Compass, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Radio,
  CheckCircle,
  AlertTriangle,
  Flame,
  Droplet,
  Zap,
  Leaf,
  Layers,
  Sparkles,
  ArrowLeft,
  Globe,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronsUpDown
} from "lucide-react";
import { CivicIssue, IssueStatus } from "../types";
import { INITIAL_ISSUES } from "../data";
import IssueVisualizer from "./IssueVisualizer";

// Import MapLibre styles
import "maplibre-gl/dist/maplibre-gl.css";

interface DashboardLayoutProps {
  issues: CivicIssue[];
  onVote: (id: string) => void;
  onReportClick: () => void;
  onBackToLanding: () => void;
}

type TabType = "map" | "grid" | "environmental" | "dispatch" | "settings";

export default function DashboardLayout({ 
  issues, 
  onVote, 
  onReportClick, 
  onBackToLanding 
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || "");
  const [filter, setFilter] = useState<"all" | IssueStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Custom Map Layer Toggles
  const [showEcoBuffer, setShowEcoBuffer] = useState(true);
  const [showHeatmapPoints, setShowHeatmapPoints] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    "INITIALIZING: Tactical Eco-Buffer Grid Mapping...",
    "CONNECTED: Municipal routing telemetry established.",
  ]);

  // Map Style & Preset Locations configs
  const MAP_STYLES = [
    { id: "dark", name: "Tactical Dark", url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" },
    { id: "light", name: "Clean Light", url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" },
    { id: "voyager", name: "Detailed World", url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" }
  ];

  const SECTOR_PRESETS = [
    { name: "Global Grid 🌍", longitude: 0, latitude: 20, zoom: 1.5, pitch: 0, bearing: 0 },
    { name: "India Grid 🇮🇳", longitude: 78.9629, latitude: 20.5937, zoom: 4.8, pitch: 0, bearing: 0 },
    { name: "Portland (OR)", longitude: -122.6762, latitude: 45.5234, zoom: 11.8, pitch: 35, bearing: -10 },
    { name: "New York Sector", longitude: -74.0060, latitude: 40.7128, zoom: 11.5, pitch: 40, bearing: 15 },
    { name: "London Terminal", longitude: -0.1278, latitude: 51.5074, zoom: 11.5, pitch: 30, bearing: -5 },
    { name: "Tokyo Central", longitude: 139.6503, latitude: 35.6762, zoom: 11.5, pitch: 45, bearing: 20 },
    { name: "Sydney Station", longitude: 151.2093, latitude: -33.8688, zoom: 11.5, pitch: 35, bearing: 10 },
    { name: "Paris Outpost", longitude: 2.3522, latitude: 48.8566, zoom: 11.5, pitch: 30, bearing: -15 }
  ];

  const [currentMapStyle, setCurrentMapStyle] = useState("https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json");
  const [selectedPresetCity, setSelectedPresetCity] = useState("India Grid 🇮🇳");
  const [isCompassDeckExpanded, setIsCompassDeckExpanded] = useState(true);

  const handleZoomIn = () => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 22) }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 0.5) }));
  };

  const handleResetOrientation = () => {
    setViewState(prev => ({ ...prev, bearing: 0, pitch: 0 }));
  };

  const handleTogglePitch = () => {
    setViewState(prev => ({ ...prev, pitch: prev.pitch === 0 ? 50 : 0 }));
  };

  const handleSelectPreset = (presetName: string) => {
    const preset = SECTOR_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSelectedPresetCity(preset.name);
      setViewState({
        longitude: preset.longitude,
        latitude: preset.latitude,
        zoom: preset.zoom,
        pitch: preset.pitch,
        bearing: preset.bearing
      });
    }
  };

  // Initial View State centered on India
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4.8,
    pitch: 0,
    bearing: 0
  });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  // Automatically fly to newly created issues when they are added to the list
  const [prevIssuesLength, setPrevIssuesLength] = useState(issues.length);

  useEffect(() => {
    if (issues.length > prevIssuesLength) {
      const newIssue = issues[0]; // The newest issue is prepended to the top of the array
      if (newIssue) {
        setSelectedIssueId(newIssue.id);
        const coords = getCoordinates(newIssue.coordinates);
        
        // Transition viewport smoothly to simulate "flyTo"
        setViewState({
          longitude: coords.longitude,
          latitude: coords.latitude,
          zoom: 13.8, // Zoom in for high fidelity inspection
          pitch: 45, // Dynamic pitch for futuristic view
          bearing: 0
        });

        // Ensure the active tab is set to "map" so the user sees the map transition
        setActiveTab("map");
      }
    }
    setPrevIssuesLength(issues.length);
  }, [issues, prevIssuesLength]);

  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleFlyToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation not supported by browser.");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 14.5,
          pitch: 50,
          bearing: 15
        });
        
        setIsLocating(false);
      },
      (error) => {
        console.warn("FlyTo current location error, falling back to simulated central node:", error);
        let errorMsg = "Unable to retrieve exact location. Simulated fallback applied.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Simulated fallback applied.";
        }
        
        // Dynamic simulated fallback coordinate close to active issues
        const lat = 45.5230 + (Math.random() - 0.5) * 0.01;
        const lng = -122.6760 + (Math.random() - 0.5) * 0.01;

        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 14.5,
          pitch: 50,
          bearing: 15
        });

        setLocateError(errorMsg);
        setIsLocating(false);
        // Clear simulated fallback message after 4 seconds
        setTimeout(() => setLocateError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Map Category to Specific Icon & Color
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "road_damage":
        return { icon: AlertTriangle, color: "#EF4444", label: "Road Damage" };
      case "water_leak":
        return { icon: Droplet, color: "#3B82F6", label: "Utility Leak" };
      case "electrical_hazard":
        return { icon: Zap, color: "#F59E0B", label: "Grid Hazard" };
      case "hazardous_waste":
        return { icon: Flame, color: "#EC4899", label: "Chemical Spill" };
      case "canopy_decay":
        return { icon: Leaf, color: "#10B981", label: "Canopy Decay" };
      default:
        return { icon: Radio, color: "#C0F53D", label: "Civic Node" };
    }
  };

  // Extract Numeric Coordinates for MapLibre Markers
  const getCoordinates = (coordStr: string) => {
    try {
      // Format example: "45.5234° N, 122.6762° W"
      const parts = coordStr.split(",");
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      
      const latSign = parts[0].includes("S") ? -1 : 1;
      const lngSign = parts[1].includes("W") ? -1 : 1;
      
      return {
        latitude: lat * latSign,
        longitude: lng * lngSign
      };
    } catch (e) {
      // Fallback close to Portland center
      return { latitude: 45.5122, longitude: -122.6845 };
    }
  };

  // Filter and Search Issues
  const dummyIds = ["CG-2026-089", "CG-2026-092", "CG-2026-074", "CG-2026-101", "CG-2026-061"];

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = filter === "all" || issue.status === filter;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Simulation flow handler
  const triggerSimulation = () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimulationLogs(prev => [...prev, `[SYS] Automated route audit triggered for dispatch ${selectedIssue?.id}`]);

    setTimeout(() => {
      setSimulationLogs(prev => [...prev, "[AI-AGENT] Analyzing density overlays & emergency transit paths..."]);
    }, 1000);

    setTimeout(() => {
      setSimulationLogs(prev => [...prev, `[MUNI-GRID] Match found: Auto-forwarding dispatch packet to municipal sector ${selectedIssue?.id}`]);
    }, 2200);

    setTimeout(() => {
      setSimulationLogs(prev => [...prev, "[SUCCESS] Dispatch pipeline verified. Resolution estimation: 18.5 hours."]);
      setSimulationActive(false);
    }, 3400);
  };

  return (
    <div className="h-screen w-screen bg-[#0A0D04] text-[#FAFFF3] flex overflow-hidden font-sans relative" id="dashboard-container">
      {/* Absolute Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C0F53D]/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#1A2209] border-b border-[#FAFFF3]/10 px-4 flex items-center justify-between z-40">
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs text-[#FAFFF3]/60 hover:text-[#C0F53D] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#C0F53D]" />
          <span className="font-serif text-sm font-semibold text-[#FAFFF3]">CivicGuard</span>
          <span className="font-mono text-[9px] bg-[#C0F53D]/10 text-[#C0F53D] px-1.5 py-0.5 rounded border border-[#C0F53D]/20">DASH</span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-[#FAFFF3]/80 hover:text-[#C0F53D] cursor-pointer focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Panel */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 w-64 bg-[#1A2209] border-r border-[#FAFFF3]/10 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 transform md:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        id="dashboard-sidebar"
      >
        <div className="flex flex-col">
          {/* Sidebar Top Branding Header */}
          <div className="h-20 px-6 border-b border-[#FAFFF3]/10 flex items-center justify-between">
            <button 
              onClick={onBackToLanding}
              className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#0A0D04] border border-[#C0F53D]/30 flex items-center justify-center group-hover:border-[#C0F53D] transition-all">
                <Shield className="w-4 h-4 text-[#C0F53D]" />
              </div>
              <div>
                <span className="font-serif text-base font-semibold text-[#FAFFF3] block leading-none">
                  Civic<span className="italic text-[#C0F53D]">Guard</span>
                </span>
                <span className="text-[9px] font-mono tracking-wider text-[#C0F53D]/60 uppercase block mt-0.5">Control Center</span>
              </div>
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#FAFFF3]/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Status Profile Card */}
          <div className="p-4 mx-4 mt-4 bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A2209] border border-[#C0F53D]/40 flex items-center justify-center text-xs font-bold text-[#C0F53D]">
              SB
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#C0F53D] font-mono tracking-wider">AUTHORIZED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0F53D] animate-ping" />
              </div>
              <p className="text-xs text-[#FAFFF3]/80 truncate font-mono mt-0.5">smitabajpai6@gmail.com</p>
            </div>
          </div>

          {/* Sidebar Navigation Options */}
          <nav className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-[#FAFFF3]/30 uppercase tracking-widest block px-2 mb-2">TELEMETRY VIEWS</span>
            
            <button
              onClick={() => { setActiveTab("map"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "map" 
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]" 
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Tactical Heatmap</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === "map" ? "rotate-90 text-[#C0F53D]" : "opacity-40"}`} />
            </button>

            <button
              onClick={() => { setActiveTab("grid"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "grid" 
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]" 
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Incident Registry</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === "grid" ? "rotate-90 text-[#C0F53D]" : "opacity-40"}`} />
            </button>

            <button
              onClick={() => { setActiveTab("environmental"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "environmental" 
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]" 
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Leaf className="w-4 h-4" />
                <span>Eco Canopy Audits</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === "environmental" ? "rotate-90 text-[#C0F53D]" : "opacity-40"}`} />
            </button>

            <button
              onClick={() => { setActiveTab("dispatch"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "dispatch" 
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]" 
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>Dispatch Simulator</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === "dispatch" ? "rotate-90 text-[#C0F53D]" : "opacity-40"}`} />
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom diagnostics status */}
        <div className="p-4 border-t border-[#FAFFF3]/10">
          <div className="bg-[#0A0D04]/80 rounded-xl p-3 border border-[#FAFFF3]/5 space-y-2.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#FAFFF3]/40">
              <span>SYSTEM DIAGNOSTIC</span>
              <span className="text-[#C0F53D]">v4.99</span>
            </div>
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between items-center text-[#FAFFF3]/70">
                <span>Vect_Layer:</span>
                <span className="font-bold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-[#FAFFF3]/70">
                <span>Geo-Fencing:</span>
                <span className="font-bold text-emerald-400">OPTIMAL</span>
              </div>
            </div>
            <button 
              onClick={onBackToLanding}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-transparent hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>EXIT CONTROL PANEL</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 relative z-10" id="dashboard-main">
        {/* Core Display Tab Routing View */}
        <div className="flex-1 relative flex flex-col md:flex-row items-stretch min-h-0">
          
          {/* Main Map Visual Panel (Tab: map) */}
          <div className={`flex-1 relative flex flex-col min-h-0 ${activeTab === "map" ? "flex" : "hidden md:flex"}`}>
            
            {/* Overlay Map Headers and Controls */}
            <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row gap-3 z-30 pointer-events-none">
              
              {/* Filter pills on map (Interactive) */}
              <div className="pointer-events-auto flex items-center gap-1.5 bg-[#1A2209]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FAFFF3]/15 shadow-2xl">
                <Filter className="w-3.5 h-3.5 text-[#C0F53D]" />
                <div className="flex gap-1">
                  {(["all", "critical", "active", "resolved"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                        filter === status 
                          ? "bg-[#C0F53D] text-[#0A0D04] font-bold" 
                          : "text-[#FAFFF3]/60 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="pointer-events-auto flex-1 max-w-sm flex items-center gap-2 bg-[#1A2209]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#FAFFF3]/15 shadow-2xl">
                <Search className="w-3.5 h-3.5 text-[#C0F53D]/60" />
                <input 
                  type="text"
                  placeholder="Search live sectors, issues, IDs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-[#FAFFF3] focus:outline-none placeholder-[#FAFFF3]/30"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-[#FAFFF3]/40 hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Unified Tactical Compass Deck (Top-Right of Map) */}
            {!isCompassDeckExpanded ? (
              <button 
                onClick={() => setIsCompassDeckExpanded(true)}
                className="absolute top-20 sm:top-4 right-4 z-30 w-11 h-11 bg-[#1A2209]/95 backdrop-blur-md border border-[#C0F53D]/40 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 hover:border-[#C0F53D] transition-all group pointer-events-auto"
                title="Expand Navigation Deck"
              >
                <Compass className="w-5 h-5 text-[#C0F53D] group-hover:rotate-45 transition-transform duration-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C0F53D]/50 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C0F53D]"></span>
                </span>
              </button>
            ) : (
              <div className="absolute top-20 sm:top-4 right-4 z-30 flex flex-col gap-3.5 pointer-events-auto bg-[#1A2209]/95 backdrop-blur-md p-4 rounded-2xl border border-[#FAFFF3]/15 shadow-2xl text-left w-72 max-h-[85vh] overflow-y-auto" id="compass-deck">
                {/* Title and Collapse trigger */}
                <div className="flex items-center justify-between border-b border-[#FAFFF3]/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C0F53D] animate-spin" style={{ animationDuration: '10s' }} />
                    <span className="text-[10px] font-mono text-[#FAFFF3] uppercase tracking-widest font-bold">Compass Deck</span>
                  </div>
                  <button 
                    onClick={() => setIsCompassDeckExpanded(false)}
                    className="text-[#FAFFF3]/50 hover:text-white p-1 rounded hover:bg-[#0A0D04]/40 transition-colors cursor-pointer"
                    title="Collapse Deck"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Clear Map Style Selector */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Clear Map Visual Style</span>
                  <div className="grid grid-cols-3 gap-1" id="map-style-grid">
                    {MAP_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setCurrentMapStyle(style.url)}
                        className={`px-1 py-1.5 rounded-lg border font-mono text-[8px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          currentMapStyle === style.url 
                            ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] font-bold shadow-[0_0_8px_rgba(192,245,61,0.3)]"
                            : "bg-[#0A0D04]/60 border-[#FAFFF3]/10 text-[#FAFFF3]/60 hover:border-[#FAFFF3]/30 hover:text-white"
                        }`}
                        id={`btn-style-${style.id}`}
                      >
                        {style.name.split(" ")[1] || style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Locations / Easy Navigations */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Tactical Sector Presets</span>
                  <div className="relative">
                    <select 
                      value={selectedPresetCity}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      className="w-full bg-[#0A0D04]/80 border border-[#FAFFF3]/10 rounded-xl px-3 py-2 text-xs text-[#FAFFF3] appearance-none focus:border-[#C0F53D] focus:outline-none cursor-pointer"
                      id="map-sector-select"
                    >
                      {SECTOR_PRESETS.map((preset) => (
                        <option key={preset.name} value={preset.name} className="bg-[#1A2209] text-white">
                          {preset.name}
                        </option>
                      ))}
                    </select>
                    <ChevronsUpDown className="w-3 h-3 text-[#FAFFF3]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  
                  {/* High Frequency Quick Chips */}
                  <div className="flex gap-1.5 pt-0.5" id="sector-quick-chips">
                    {["Global Grid 🌍", "Portland (OR)", "Tokyo Central"].map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSelectPreset(name)}
                        className={`flex-1 px-1.5 py-1 rounded-md border font-mono text-[7px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                          selectedPresetCity === name
                            ? "bg-[#C0F53D]/20 text-[#C0F53D] border-[#C0F53D]/40"
                            : "bg-[#0A0D04]/40 border-[#FAFFF3]/5 text-[#FAFFF3]/40 hover:border-[#FAFFF3]/20 hover:text-white"
                        }`}
                      >
                        {name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer Toggles */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Map Overlays</span>
                  <div className="grid grid-cols-2 gap-2 bg-[#0A0D04]/40 p-2 rounded-xl border border-[#FAFFF3]/5">
                    <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#FAFFF3]/80 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showEcoBuffer}
                        onChange={(e) => setShowEcoBuffer(e.target.checked)}
                        className="accent-[#C0F53D] w-3 h-3"
                      />
                      <span>Eco Buffer</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#FAFFF3]/80 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showHeatmapPoints}
                        onChange={(e) => setShowHeatmapPoints(e.target.checked)}
                        className="accent-[#C0F53D] w-3 h-3"
                      />
                      <span>Heatmaps</span>
                    </label>
                  </div>
                </div>

                {/* Manual Steering Toolbar */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Manual Steering Controls</span>
                  <div className="flex gap-1" id="steering-controls">
                    <button
                      onClick={handleZoomIn}
                      className="flex-1 py-1.5 rounded-lg bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/50 hover:bg-[#C0F53D]/5 text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-[#C0F53D]" />
                    </button>
                    
                    <button
                      onClick={handleZoomOut}
                      className="flex-1 py-1.5 rounded-lg bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/50 hover:bg-[#C0F53D]/5 text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-[#C0F53D]" />
                    </button>

                    <button
                      onClick={handleTogglePitch}
                      className="flex-1 py-1.5 rounded-lg bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/50 hover:bg-[#C0F53D]/5 text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Toggle 3D perspective pitch"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#C0F53D] rotate-45" />
                    </button>

                    <button
                      onClick={handleResetOrientation}
                      className="flex-1 py-1.5 rounded-lg bg-[#0A0D04]/60 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/50 hover:bg-[#C0F53D]/5 text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Reset Heading/Flat view"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#C0F53D]" />
                    </button>
                  </div>
                </div>

                {/* GPS Locate Info Panel */}
                <div className="pt-2 border-t border-[#FAFFF3]/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#FAFFF3]/40">
                    <span>TELEMETRY POSITION</span>
                    <span className="text-emerald-400 font-bold">{viewState.latitude.toFixed(4)}°N, {viewState.longitude.toFixed(4)}°W</span>
                  </div>

                  <button
                    onClick={handleFlyToCurrentLocation}
                    disabled={isLocating}
                    className="w-full mt-0.5 py-2 rounded-xl border border-[#C0F53D]/30 hover:border-[#C0F53D] bg-[#0A0D04]/60 hover:bg-[#C0F53D]/5 text-[#C0F53D] font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    id="btn-map-locate-me"
                  >
                    {isLocating ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C0F53D] animate-ping" />
                        <span>PINPOINTING...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3 h-3 text-[#C0F53D] animate-spin" style={{ animationDuration: '3s' }} />
                        <span>LOCATE MY GPS</span>
                      </>
                    )}
                  </button>

                  {locateError && (
                    <span className="text-[7px] font-mono text-rose-400 text-center leading-tight">
                      {locateError}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Map Area */}
            <div className="flex-1 w-full h-full relative bg-[#0A0D04] z-10" id="tactical-maplibre-container">
              <Map
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                mapLibre={maplibregl}
                mapStyle={currentMapStyle}
                style={{ width: "100%", height: "100%" }}
              >
                <NavigationControl position="top-left" />

                {/* Render issues from our data */}
                {filteredIssues.filter((issue) => !dummyIds.includes(issue.id)).map((issue) => {
                  const coords = getCoordinates(issue.coordinates);
                  const isSelected = issue.id === selectedIssueId;
                  const isUserReported = issue.id.startsWith("CG-2026-");
                  const cat = getCategoryDetails(issue.category);
                  const Icon = cat.icon;

                  if (isUserReported) {
                    return (
                      <Marker
                        key={issue.id}
                        latitude={coords.latitude}
                        longitude={coords.longitude}
                        anchor="center"
                      >
                        <button 
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="relative flex items-center justify-center group cursor-pointer"
                          id={`map-marker-${issue.id}`}
                        >
                          {/* Pulsing outer ping wave */}
                          <span className="absolute rounded-full w-8 h-8 bg-[#C0F53D]/30 animate-ping pointer-events-none" />
                          {/* Inner glowing pulse ring */}
                          <span className="absolute rounded-full w-4.5 h-4.5 bg-[#C0F53D]/25 animate-pulse pointer-events-none" />
                          
                          {/* Solid neon green center dot */}
                          <div 
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 relative border border-[#0A0D04] ${
                              isSelected 
                                ? "scale-125 bg-[#C0F53D] shadow-[0_0_15px_#C0F53D]" 
                                : "bg-[#C0F53D] hover:scale-110 shadow-[0_0_8px_rgba(192,245,61,0.6)]"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0A0D04]" />
                          </div>

                          {/* Custom Micro Hover Card */}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1A2209]/95 border border-[#C0F53D]/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] scale-0 group-hover:scale-100 origin-bottom transition-all duration-200 z-50 pointer-events-none w-72 p-3 text-left backdrop-blur-md flex gap-3">
                            {/* Left Side: Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full animate-pulse" 
                                    style={{ backgroundColor: issue.status === "critical" ? "#F43F5E" : issue.status === "resolved" ? "#C0F53D" : "#EAB308" }}
                                  />
                                  <p className="font-mono text-[7px] text-[#C0F53D] tracking-widest font-bold uppercase">{issue.id}</p>
                                  <span className="font-mono text-[6px] text-[#FAFFF3]/40 px-1 border border-[#FAFFF3]/10 rounded bg-[#FAFFF3]/5 uppercase ml-auto">
                                    {issue.status}
                                  </span>
                                </div>
                                
                                <p className="text-[10px] text-[#FAFFF3] font-bold tracking-tight mt-1 line-clamp-1 leading-snug">{issue.title}</p>
                                <p className="text-[8px] text-[#FAFFF3]/60 font-light mt-0.5 line-clamp-1">{issue.description}</p>
                              </div>
                              
                              <div className="flex items-center gap-1 text-[7px] text-[#FAFFF3]/40 font-mono uppercase mt-1.5">
                                <MapPin className="w-2.5 h-2.5 text-[#C0F53D]/70 shrink-0" />
                                <span className="truncate">{issue.locationName}</span>
                              </div>
                            </div>

                            {/* Right Side: Thumbnail Visualizer */}
                            <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden border border-[#FAFFF3]/15 bg-[#0A0D04]/60">
                              <IssueVisualizer type={issue.image} animate={false} />
                            </div>
                          </div>
                        </button>
                      </Marker>
                    );
                  }

                  return (
                    <Marker
                      key={issue.id}
                      latitude={coords.latitude}
                      longitude={coords.longitude}
                      anchor="center"
                    >
                      <button 
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="relative flex items-center justify-center group cursor-pointer"
                        id={`map-marker-${issue.id}`}
                      >
                        {/* Dynamic Radar Glows */}
                        <span 
                          className="absolute rounded-full pointer-events-none animate-ping"
                          style={{
                            width: isSelected ? "32px" : "18px",
                            height: isSelected ? "32px" : "18px",
                            backgroundColor: cat.color,
                            opacity: isSelected ? 0.45 : 0.25
                          }}
                        />
                        <span 
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: isSelected ? "18px" : "10px",
                            height: isSelected ? "18px" : "10px",
                            backgroundColor: cat.color,
                            opacity: 0.15
                          }}
                        />

                        {/* Interactive marker center pin */}
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                            isSelected 
                              ? "scale-110 shadow-[0_0_15px_rgba(192,245,61,0.6)]" 
                              : "hover:scale-105"
                          }`}
                          style={{
                            backgroundColor: isSelected ? "#C0F53D" : "#1A2209",
                            border: `1.5px solid ${cat.color}`
                          }}
                        >
                          <Icon 
                            className={`w-3.5 h-3.5 ${
                              isSelected ? "text-[#0A0D04]" : ""
                            }`}
                            style={{
                              color: isSelected ? undefined : cat.color
                            }}
                          />
                        </div>

                        {/* Custom Micro Hover Card */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1A2209]/95 border border-[#C0F53D]/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] scale-0 group-hover:scale-100 origin-bottom transition-all duration-200 z-50 pointer-events-none w-72 p-3 text-left backdrop-blur-md flex gap-3">
                          {/* Left Side: Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full animate-pulse" 
                                  style={{ backgroundColor: issue.status === "critical" ? "#F43F5E" : issue.status === "resolved" ? "#C0F53D" : "#EAB308" }}
                                />
                                <p className="font-mono text-[7px] text-[#C0F53D] tracking-widest font-bold uppercase">{issue.id}</p>
                                <span className="font-mono text-[6px] text-[#FAFFF3]/40 px-1 border border-[#FAFFF3]/10 rounded bg-[#FAFFF3]/5 uppercase ml-auto">
                                  {issue.status}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-[#FAFFF3] font-bold tracking-tight mt-1 line-clamp-1 leading-snug">{issue.title}</p>
                              <p className="text-[8px] text-[#FAFFF3]/60 font-light mt-0.5 line-clamp-1">{issue.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[7px] text-[#FAFFF3]/40 font-mono uppercase mt-1.5">
                              <MapPin className="w-2.5 h-2.5 text-[#C0F53D]/70 shrink-0" />
                              <span className="truncate">{issue.locationName}</span>
                            </div>
                          </div>

                          {/* Right Side: Thumbnail Visualizer */}
                          <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden border border-[#FAFFF3]/15 bg-[#0A0D04]/60">
                            <IssueVisualizer type={issue.image} animate={false} />
                          </div>
                        </div>
                      </button>
                    </Marker>
                  );
                })}

                {/* Render Eco-Buffer Rings if toggled */}
                {showEcoBuffer && filteredIssues.filter((issue) => !dummyIds.includes(issue.id)).map((issue) => {
                  const coords = getCoordinates(issue.coordinates);
                  const cat = getCategoryDetails(issue.category);
                  
                  return (
                    <Marker
                      key={`ring-${issue.id}`}
                      latitude={coords.latitude}
                      longitude={coords.longitude}
                    >
                      <div 
                        className="rounded-full border border-dashed pointer-events-none opacity-20"
                        style={{
                          width: "80px",
                          height: "80px",
                          transform: "translate(-50%, -50%)",
                          borderColor: cat.color,
                          backgroundColor: `${cat.color}05`
                        }}
                      />
                    </Marker>
                  );
                })}
              </Map>
            </div>

            {/* Bottom-right overlay Floating CTA (high z-index) */}
            <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(192,245,61,0.5)" }}
                whileTap={{ scale: 0.96 }}
                onClick={onReportClick}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#C0F53D] text-[#0A0D04] rounded-full font-mono text-xs font-bold uppercase tracking-wider shadow-[0_8px_30px_rgba(192,245,61,0.3)] border border-[#C0F53D]/40 cursor-pointer"
                id="btn-floating-report"
              >
                <Plus className="w-4 h-4 text-[#0A0D04]" />
                <span>Report an Issue</span>
              </motion.button>
            </div>

            {/* Bottom left telemetry watermark display on map */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none bg-[#0A0D04]/70 border border-[#FAFFF3]/5 p-2 rounded px-3 font-mono text-[9px] text-[#FAFFF3]/40">
              <div className="flex items-center gap-1.5 text-[#C0F53D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0F53D] animate-pulse" />
                <span>DISPATCH FREQUENCY: HIGH</span>
              </div>
              <div className="mt-0.5">MAP_TILE_PROVIDER: CARTODB DARK MATTER</div>
            </div>
          </div>

          {/* Right Sidebar Inspection Panel (Active on Tab: map, persistent on desktop) */}
          <div className={`w-full md:w-96 bg-[#1A2209]/45 backdrop-blur-xl border-l border-[#FAFFF3]/10 flex flex-col justify-between min-h-0 ${
            activeTab === "map" ? "flex" : "hidden"
          }`} id="dashboard-inspect-panel">
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Heading */}
              <div>
                <span className="font-mono text-[9px] text-[#C0F53D] tracking-[0.2em] uppercase block">TACTICAL METADATA NODE</span>
                <h3 className="font-serif text-2xl text-[#FAFFF3] mt-0.5">Telemetry <span className="italic">Analysis</span></h3>
              </div>

              {selectedIssue ? (
                <div className="space-y-6">
                  {/* Status, ID and priority */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C0F53D] bg-[#1A2209] px-2.5 py-1 rounded border border-[#C0F53D]/25">
                      {selectedIssue.id}
                    </span>
                    <span className="font-mono text-[10px] text-[#FAFFF3]/50">
                      VOTES: <span className="text-[#C0F53D] font-bold">{selectedIssue.votes}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-semibold text-[#FAFFF3] leading-snug">{selectedIssue.title}</h4>
                    <div className="flex items-center gap-1 text-[#C0F53D] font-mono text-[9px] mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedIssue.locationName}</span>
                    </div>
                    <p className="text-xs text-[#FAFFF3]/70 font-light mt-3 leading-relaxed">
                      {selectedIssue.description}
                    </p>
                  </div>

                  {/* High Fidelity Visualizer */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0A0D04] border border-[#FAFFF3]/10">
                    <IssueVisualizer type={selectedIssue.image} animate={false} />
                    <div className="absolute top-2 left-2 font-mono text-[8px] bg-[#0A0D04]/80 px-1.5 py-0.5 rounded text-[#FAFFF3]/40">
                      AI_VISION_PROJECTION
                    </div>
                  </div>

                  {/* Technical Coordinates and Details */}
                  <div className="bg-[#0A0D04]/60 rounded-xl p-3 border border-[#FAFFF3]/5 space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#FAFFF3]/40">COORDINATES</span>
                      <span className="text-[#FAFFF3]/90">{selectedIssue.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FAFFF3]/40">REPORTED DATE</span>
                      <span className="text-[#FAFFF3]/90">{selectedIssue.dateReported}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FAFFF3]/40">DISPATCH ALGO</span>
                      <span className="text-[#C0F53D]">MUNI-AUTO-ECO</span>
                    </div>
                  </div>

                  {/* Raw AI JSON Metadata Output */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase tracking-wider block">AI ANALYTICS ENGINE SUMMARY</span>
                    <pre className="bg-black/80 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed border border-[#FAFFF3]/10 shadow-inner">
                      {selectedIssue.aiOutput}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-8 h-8 text-[#FAFFF3]/20 mx-auto animate-pulse" />
                  <p className="text-xs text-[#FAFFF3]/40 font-mono mt-3">Select a live map node to pull full telemetry diagnostics.</p>
                </div>
              )}
            </div>

            {/* Inspect Panel Footer Controls */}
            {selectedIssue && (
              <div className="p-4 border-t border-[#FAFFF3]/10 bg-[#1A2209]/80 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onVote(selectedIssue.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#C0F53D]/30 hover:border-[#C0F53D] hover:bg-[#C0F53D]/10 text-[#C0F53D] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>VOTE_UP</span>
                </button>
                <button 
                  disabled={simulationActive}
                  onClick={triggerSimulation}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#C0F53D] hover:bg-[#C0F53D]/95 text-[#0A0D04] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>SIM_DISPATCH</span>
                </button>
              </div>
            )}
          </div>

          {/* Grid View (Incident Registry) */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${activeTab === "grid" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block">CIVIC LEDGER ARRAY</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Incident <span className="italic">Registry</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Review, sort, and inspect all reported environmental failures across municipal sectors. Search and filter variables in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => {
                const cat = getCategoryDetails(issue.category);
                const Icon = cat.icon;
                return (
                  <div 
                    key={issue.id}
                    onClick={() => { setSelectedIssueId(issue.id); setActiveTab("map"); }}
                    className="bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl p-5 hover:border-[#C0F53D]/40 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#C0F53D] font-bold px-2 py-0.5 rounded bg-[#1A2209] border border-[#C0F53D]/20">
                          {issue.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-mono text-[10px] text-[#FAFFF3]/60 uppercase">{issue.status}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-[#FAFFF3] group-hover:text-[#C0F53D] transition-colors">{issue.title}</h4>
                        <p className="text-xs text-[#FAFFF3]/60 font-light mt-1.5 line-clamp-2">{issue.description}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[#C0F53D]/80 font-mono text-[9px]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{issue.locationName}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#FAFFF3]/5 mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#FAFFF3]/40">{issue.dateReported}</span>
                      <button className="text-[10px] font-mono text-[#C0F53D] hover:underline flex items-center gap-1">
                        <span>OPEN_MAP</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Audits view (Tab: environmental) */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${activeTab === "environmental" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block">ECOLOGICAL ANALYSIS</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Eco Canopy <span className="italic">Audits</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Advanced structural analysis of urban ecosystems, focusing on canopy coverage, moisture runoff profiles, and hazardous waste buffer zones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left detail card */}
              <div className="lg:col-span-7 bg-[#1A2209]/30 border border-[#FAFFF3]/10 rounded-2xl p-6 space-y-6">
                <h4 className="text-lg font-serif text-[#FAFFF3] flex items-center gap-2">
                  <Leaf className="text-[#C0F53D]" />
                  <span>Sensing Array: Bio-System Integrity</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase block">CANOPY COVERAGE RATIO</span>
                    <span className="text-2xl font-serif text-[#FAFFF3] font-semibold block">41.8%</span>
                    <span className="text-[10px] font-mono text-emerald-400 block">+1.4% OVER PREV YEAR</span>
                  </div>
                  <div className="bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase block">BIOSWALE ABSORPTION RATE</span>
                    <span className="text-2xl font-serif text-[#FAFFF3] font-semibold block">882 L/sec</span>
                    <span className="text-[10px] font-mono text-[#C0F53D] block">OPTIMAL THRESHOLD</span>
                  </div>
                </div>

                <p className="text-xs text-[#FAFFF3]/70 font-light leading-relaxed">
                  Decentralized sensors calculate leaf-area index (LAI) and subterranean moisture levels to flag thermal stressors. High-volume urban hot spots are tagged for priority ecological buffer interventions.
                </p>

                {/* Simulated Eco Chart */}
                <div className="bg-[#0A0D04]/80 border border-[#FAFFF3]/5 rounded-xl p-4 space-y-3">
                  <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase">ECOLOGICAL STRESS TIME-SERIES</span>
                  <div className="h-28 flex items-end gap-2.5 pt-4">
                    {[34, 45, 61, 78, 52, 41, 63, 72, 89, 94, 61, 44].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-[#C0F53D]/20 hover:bg-[#C0F53D] rounded-t transition-all" style={{ height: `${h}px` }} />
                        <span className="text-[8px] font-mono text-[#FAFFF3]/30">W{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right list card */}
              <div className="lg:col-span-5 bg-[#1A2209]/30 border border-[#FAFFF3]/10 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-serif text-[#FAFFF3] flex items-center gap-2">
                  <Activity className="text-[#C0F53D]" />
                  <span>Ecological Priorities</span>
                </h4>
                
                <div className="space-y-3">
                  {issues.filter(i => i.category === "canopy_decay" || i.category === "hazardous_waste").map(issue => (
                    <div key={issue.id} className="p-3 bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-[#C0F53D] font-bold">{issue.id}</span>
                        <span className="text-[#FAFFF3]/40">{issue.status.toUpperCase()}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#FAFFF3]">{issue.title}</p>
                      <p className="text-[10px] text-[#FAFFF3]/50 truncate">{issue.locationName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Simulator view (Tab: dispatch) */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${activeTab === "dispatch" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block">SIMULATOR COMMAND UNIT</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Dispatch <span className="italic">Simulator</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Simulate routing dispatches, check municipal priority arrays, and forecast estimated restoration durations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Simulator controller */}
              <div className="lg:col-span-6 bg-[#1A2209]/30 border border-[#FAFFF3]/10 rounded-2xl p-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-[#FAFFF3]">Select Node to Run Simulator</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {issues.map(issue => (
                      <button
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedIssueId === issue.id 
                            ? "bg-[#C0F53D]/10 border-[#C0F53D] text-[#C0F53D]" 
                            : "bg-[#0A0D04]/50 border-[#FAFFF3]/10 text-[#FAFFF3]/80 hover:border-[#FAFFF3]/30"
                        }`}
                      >
                        <p className="font-mono text-[9px] font-bold">{issue.id}</p>
                        <p className="text-[10px] truncate font-semibold mt-1">{issue.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl space-y-2">
                  <p className="text-xs text-[#FAFFF3]/60 font-mono uppercase">DISPATCH TELEMETRY DESTINATION</p>
                  <p className="text-sm font-semibold text-[#FAFFF3]">
                    {selectedIssue ? selectedIssue.locationName : "None Selected"}
                  </p>
                </div>

                <button 
                  disabled={simulationActive}
                  onClick={triggerSimulation}
                  className="w-full bg-[#C0F53D] text-[#0A0D04] hover:bg-[#C0F53D]/90 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>{simulationActive ? "Executing Simulation Sequence..." : "Run Dispatch Simulation"}</span>
                </button>
              </div>

              {/* Simulation Live Output terminal console */}
              <div className="lg:col-span-6 bg-[#0A0D04] border border-[#C0F53D]/20 rounded-2xl p-6 flex flex-col justify-between h-[400px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#FAFFF3]/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono text-[#FAFFF3]/80 font-bold uppercase tracking-wider">MUNICIPAL ROUTING LOG</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#FAFFF3]/40">TERM_TTY_2</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs text-emerald-400 h-64 overflow-y-auto">
                    {simulationLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed">
                        &gt; {log}
                      </div>
                    ))}
                    {simulationActive && (
                      <div className="flex items-center gap-2 text-[#C0F53D] animate-pulse">
                        <span>&gt; Running diagnostic calculations...</span>
                        <span className="inline-block w-2 h-4 bg-[#C0F53D]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#FAFFF3]/5 text-[10px] font-mono text-[#FAFFF3]/40">
                  <span>DISPATCH_SYSTEM: CALIBRATED</span>
                  <button 
                    onClick={() => setSimulationLogs([
                      "INITIALIZING: Tactical Eco-Buffer Grid Mapping...",
                      "CONNECTED: Municipal routing telemetry established.",
                    ])}
                    className="text-[#C0F53D]/80 hover:text-[#C0F53D] cursor-pointer"
                  >
                    Clear Terminal
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
