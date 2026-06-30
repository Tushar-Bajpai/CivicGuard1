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
  Plus,
  Search,
  Filter,
  Settings,
  Compass,
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
  ArrowLeft,
  Globe,
  Award,
  User,
  Bell,
  Map as MapIcon,
  Check,
  LogOut,
  ClipboardList,
  Users,
  TrendingUp,
  Briefcase,
  UserCircle
} from "lucide-react";
import { CivicIssue, IssueStatus } from "../types";
import IssueVisualizer from "./IssueVisualizer";
import AnalyticsDashboard from "./AnalyticsDashboard";
import DepartmentView from "./DepartmentView";
import ProfileView from "./ProfileView";
import MyProfile from "./MyProfile";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, updateDoc, increment, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { INITIAL_ISSUES, DEPARTMENT_ROUTING } from "../data";
import { getFunctions, httpsCallable } from "firebase/firestore"; // wait, httpsCallable is from firebase/functions


// Import MapLibre styles
import "maplibre-gl/dist/maplibre-gl.css";

interface DashboardLayoutProps {
  issues: CivicIssue[];
  onVote: (id: string) => void;
  onReportClick: () => void;
  onBackToLanding: () => void;
}

type TabType = "map" | "my_reports" | "community" | "leaderboard" | "analytics" | "department" | "my_profile";

const MAP_STYLES = [
  { id: "dark", label: "Midnight", url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" },
  { id: "light", label: "Clean Light", url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" },
  { id: "voyager", label: "Detailed", url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" }
];

export default function DashboardLayout({
  issues,
  onVote,
  onReportClick,
  onBackToLanding
}: DashboardLayoutProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("map");

  const handleLogout = async () => {
    try {
      await logout();
      onBackToLanding();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().substring(0, 2).toUpperCase();
    }
    return "CG";
  };
  const [filter, setFilter] = useState<"all" | "critical" | "active" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(issues[0]?.id || null);
  const [showMapPopup, setShowMapPopup] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES[0].url);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showDepartmentWarning, setShowDepartmentWarning] = useState(false);
  const [isStyleExpanded, setIsStyleExpanded] = useState(false);

  // States for live counts and verification
  const [affectedCounts, setAffectedCounts] = useState<Record<string, number>>({});
  const [verifiedIssues, setVerifiedIssues] = useState<Record<string, boolean>>({});

  // Real-time tracking of issues the active user has verified/voted on
  const [userVotedIssueIds, setUserVotedIssueIds] = useState<Record<string, boolean>>({});
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const getBadge = (score: number) => {
    if (score >= 2000) return "Civic Star";
    if (score >= 1000) return "Eco Warden";
    if (score >= 500) return "Road Guardian";
    if (score >= 100) return "Volunteer";
    return "Citizen";
  };

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"), orderBy("civicScore", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: any[] = [];
      let rank = 1;
      let currentUserRank = null;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (currentUser && docSnap.id === currentUser.uid) {
          currentUserRank = rank;
        }
        users.push({
          id: docSnap.id,
          rank: rank++,
          name: data.name || "Anonymous",
          reports: data.reportsCount || 0,
          verifications: data.verifiedCount || 0,
          score: data.civicScore || 0,
          badge: getBadge(data.civicScore || 0)
        });
      });
      setLeaderboard(users);
      setMyRank(currentUserRank);
    }, (err) => {
      console.error("Error fetching leaderboard:", err);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!db || !currentUser) {
      setUserVotedIssueIds({});
      return;
    }

    const q = query(
      collection(db, "verifications"),
      where("voterId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const voted: Record<string, boolean> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.issueId) {
          voted[data.issueId] = true;
        }
      });
      setUserVotedIssueIds(voted);
    }, (err) => {
      console.error("Error listening to verifications:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Viewport State (Centered on India for a beautiful nationwide view)
  const [viewState, setViewState] = useState({
    latitude: 21.7679,
    longitude: 78.8718,
    zoom: 4.5,
    pitch: 15,
    bearing: 0
  });

  // Category mapping helper
  const getCategoryDetails = (category: string) => {
    const normalized = category.toLowerCase();
    switch (normalized) {
      case "pothole":
      case "road_damage":
      case "pothole_or_road_damage":
        return { icon: AlertTriangle, color: "#F97316", label: "Pothole", textColor: "text-orange-400", bgColor: "bg-orange-500/15", borderColor: "border-orange-500/30" };
      case "water_leak":
      case "water_leak_or_flooding":
        return { icon: Droplet, color: "#3B82F6", label: "Water Leak", textColor: "text-blue-400", bgColor: "bg-blue-500/15", borderColor: "border-blue-500/30" };
      case "streetlight":
      case "electrical_hazard":
      case "streetlight_broken":
        return { icon: Zap, color: "#EAB308", label: "Streetlight", textColor: "text-yellow-400", bgColor: "bg-yellow-500/15", borderColor: "border-yellow-500/30" };
      case "garbage":
      case "hazardous_waste":
      case "waste_or_garbage_dump":
        return { icon: Flame, color: "#92400E", label: "Garbage", textColor: "text-amber-500", bgColor: "bg-amber-900/15", borderColor: "border-amber-900/30" };
      case "fallen_tree":
      case "canopy_decay":
      case "fallen_tree_or_debris":
        return { icon: Leaf, color: "#10B981", label: "Fallen Tree", textColor: "text-emerald-400", bgColor: "bg-emerald-500/15", borderColor: "border-emerald-500/30" };
      default:
        return { icon: Radio, color: "#9CA3AF", label: "Other", textColor: "text-gray-400", bgColor: "bg-gray-500/15", borderColor: "border-gray-500/30" };
    }
  };

  // Extract Numeric Coordinates
  const getCoordinates = (coordStr: string) => {
    try {
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
      return { latitude: 21.7679, longitude: 78.8718 };
    }
  };

  // Filter and Search Issues
  const filteredIssues = issues.filter((issue) => {
    let matchesFilter = false;
    if (filter === "all") {
      matchesFilter = true;
    } else if (filter === "resolved") {
      matchesFilter = issue.status === "resolved";
    } else if (filter === "active") {
      matchesFilter = ["pending", "verified", "in_progress"].includes(issue.status);
    } else if (filter === "critical") {
      matchesFilter = issue.severity?.toLowerCase() === "critical" || issue.severity?.toLowerCase() === "high";
    }

    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedIssue = issues.find(i => i.id === selectedIssueId) || filteredIssues[0] || issues[0];

  // Helper to format a relative time
  const getRelativeTime = (dateString: string): string => {
    try {
      if (!dateString) return "2 hours ago";
      const cleaned = dateString.replace(" UTC", "Z").replace(" ", "T");
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) {
        return "2 hours ago";
      }
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return "just now";

      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch (e) {
      return "2 hours ago";
    }
  };

  // Status mapping to timeline stepper
  const getStatusStage = (status: string, votes: number) => {
    const normalized = status?.toLowerCase() || "";
    if (normalized === "resolved") return "Resolved";
    if (normalized === "in_progress" || normalized === "in progress") return "In Progress";
    if (normalized === "verified") return "Verified";
    if (normalized === "pending") return "Pending";

    // Fallback/Legacy matching
    if (status === "critical") return "In Progress";
    if (votes > 50) return "Verified";
    return "Pending";
  };

  const handleAffectedClick = async (id: string) => {
    if (!currentUser) {
      setLocalFeedback("Please log in to confirm you are affected.");
      setTimeout(() => setLocalFeedback(null), 4000);
      return;
    }

    if (userVotedIssueIds[id]) {
      setLocalFeedback("Already verified or voted on this issue.");
      setTimeout(() => setLocalFeedback(null), 4000);
      return;
    }

    if (db) {
      try {
        // Prevent double clicks via immediate optimistic local state
        setUserVotedIssueIds(prev => ({ ...prev, [id]: true }));
        setAffectedCounts(prev => ({
          ...prev,
          [id]: (prev[id] || 0) + 1
        }));

        // Write verification doc
        await addDoc(collection(db, "verifications"), {
          issueId: id,
          voterId: currentUser.uid,
          voteType: "affected",
          createdAt: new Date().toISOString()
        });

        // Increment issue confirmCount
        const docRef = doc(db, "issues", id);
        await updateDoc(docRef, {
          confirmCount: increment(1),
          updatedAt: new Date().toISOString()
        });

        if (currentUser.uid !== "demo-user-123") {
          await updateDoc(doc(db, "users", currentUser.uid), {
            civicScore: increment(5),
            verifiedCount: increment(1)
          });
        }

        setLocalFeedback("Attestation registered successfully.");
        setTimeout(() => setLocalFeedback(null), 3000);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `verifications`);
      }
    }
  };

  const handleVerifyClick = async (id: string) => {
    if (!currentUser) {
      setLocalFeedback("Please log in to verify this issue.");
      setTimeout(() => setLocalFeedback(null), 4000);
      return;
    }

    if (userVotedIssueIds[id]) {
      setLocalFeedback("Already verified or voted on this issue.");
      setTimeout(() => setLocalFeedback(null), 4000);
      return;
    }

    if (db) {
      try {
        // Prevent double clicks via immediate optimistic local state
        setUserVotedIssueIds(prev => ({ ...prev, [id]: true }));
        setVerifiedIssues(prev => ({
          ...prev,
          [id]: true
        }));

        // Write verification doc
        await addDoc(collection(db, "verifications"), {
          issueId: id,
          voterId: currentUser.uid,
          voteType: "verify",
          createdAt: new Date().toISOString()
        });

        // Increment issue confirmCount (Cloud Function handles status promotion to verified when reaches 3)
        const docRef = doc(db, "issues", id);
        await updateDoc(docRef, {
          confirmCount: increment(1),
          updatedAt: new Date().toISOString()
        });

        if (currentUser.uid !== "demo-user-123") {
          await updateDoc(doc(db, "users", currentUser.uid), {
            civicScore: increment(5),
            verifiedCount: increment(1)
          });
        }

        setLocalFeedback("Verification submitted successfully.");
        setTimeout(() => setLocalFeedback(null), 3000);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `verifications`);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0D04] text-[#FAFFF3] relative" id="civic-dashboard-root">

      {/* Mobile Header */}
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
        className={`fixed md:relative inset-y-0 left-0 w-64 bg-[#1A2209] border-r border-[#FAFFF3]/10 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 transform md:transform-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                <span className="text-[9px] font-mono tracking-wider text-[#C0F53D]/60 uppercase block mt-0.5">Community Platform</span>
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
            {currentUser?.photoURL || userProfile?.photoURL ? (
              <img
                src={currentUser?.photoURL || userProfile?.photoURL || ""}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-[#C0F53D]/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1A2209] border border-[#C0F53D]/40 flex items-center justify-center text-xs font-bold text-[#C0F53D] shrink-0">
                {getInitials(userProfile?.name, userProfile?.email || currentUser?.email)}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#C0F53D] font-mono tracking-wider">
                  {userProfile?.civicScore !== undefined ? `SCORE: ${userProfile.civicScore}` : "MEMBER"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0F53D] animate-ping" />
              </div>
              <p className="text-xs text-[#FAFFF3] truncate font-semibold leading-none mt-1">
                {userProfile?.name || currentUser?.displayName || "Civic Citizen"}
              </p>
              <p className="text-[9px] text-[#FAFFF3]/60 truncate font-mono mt-1">
                {userProfile?.email || currentUser?.email || "offline_node"}
              </p>
            </div>
          </div>

          {/* Sidebar Navigation Options */}
          <nav className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-[#FAFFF3]/30 uppercase tracking-widest block px-2 mb-2">Navigation</span>

            <button
              onClick={() => { setActiveTab("map"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "map"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => { setActiveTab("my_reports"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "my_reports"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>My Reports</span>
            </button>

            <button
              onClick={() => { setActiveTab("community"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "community"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Community Feed</span>
            </button>

            <button
              onClick={() => { setActiveTab("leaderboard"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "leaderboard"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => { setActiveTab("analytics"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "analytics"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => { setShowDepartmentWarning(true); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "department"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Department View</span>
            </button>

            <button
              onClick={() => { setActiveTab("my_profile"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === "my_profile"
                  ? "bg-[#0A0D04] text-[#C0F53D] border border-[#C0F53D]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "text-[#FAFFF3]/70 hover:text-white hover:bg-[#0A0D04]/30"
                }`}
            >
              <UserCircle className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <div className="pt-2 border-t border-[#FAFFF3]/5 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Node</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom diagnostics status */}
        <div className="p-4 border-t border-[#FAFFF3]/10">
          <div className="bg-[#0A0D04]/80 rounded-xl p-3 border border-[#FAFFF3]/5 space-y-1 text-[10px] font-mono text-[#FAFFF3]/50">
            <div className="flex justify-between items-center text-[#C0F53D]">
              <span>COMMUNITY NODE</span>
              <span className="font-bold">ONLINE</span>
            </div>
            <div>VER: 4.9.0</div>
            <div>SECTOR: INDIA_NATIONAL</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 relative z-10" id="dashboard-main">
        <div className="flex-1 relative flex flex-col md:flex-row items-stretch min-h-0">

          {/* Main Map Visual Panel (Tab: map) */}
          <div className={`flex-1 relative flex flex-col min-h-0 ${activeTab === "map" ? "flex" : "hidden"}`}>

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
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${filter === status
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
                  placeholder="Search regions, categories, IDs..."
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
                {filteredIssues.map((issue) => {
                  const coords = getCoordinates(issue.coordinates);
                  const isSelected = issue.id === selectedIssueId;
                  const cat = getCategoryDetails(issue.category);
                  const Icon = cat.icon;

                  return (
                    <Marker
                      key={issue.id}
                      latitude={coords.latitude}
                      longitude={coords.longitude}
                      anchor="center"
                    >
                      <button
                        onClick={() => { setSelectedIssueId(issue.id); setShowMapPopup(true); }}
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative ${isSelected
                              ? "scale-110 shadow-[0_0_15px_rgba(192,245,61,0.6)]"
                              : "hover:scale-105"
                            }`}
                          style={{
                            backgroundColor: isSelected ? "#C0F53D" : "#1A2209",
                            border: `1.5px solid ${cat.color}`
                          }}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 ${isSelected ? "text-[#0A0D04]" : ""
                              }`}
                            style={{
                              color: isSelected ? undefined : cat.color
                            }}
                          />
                        </div>

                        {/* Hover Popup Tooltip Card */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1A2209]/95 border border-[#FAFFF3]/15 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] scale-0 group-hover:scale-100 origin-bottom transition-all duration-200 z-50 pointer-events-none w-64 p-3 text-left backdrop-blur-md flex gap-2.5">
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                                  style={{ backgroundColor: issue.status === "critical" ? "#F43F5E" : issue.status === "resolved" ? "#10B981" : "#EAB308" }}
                                />
                                <p className="font-mono text-[7px] text-[#C0F53D] tracking-widest font-bold uppercase">{issue.id}</p>
                                <span className="font-mono text-[6px] text-[#FAFFF3]/40 px-1.5 py-0.5 rounded bg-[#FAFFF3]/5 uppercase ml-auto">
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

                          <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-[#FAFFF3]/15 bg-[#0A0D04]/60">
                            <IssueVisualizer type={issue.imageUrl || issue.image} animate={false} />
                          </div>
                        </div>
                      </button>
                    </Marker>
                  );
                })}

                {/* Custom Map Popup on Click / Select */}
                {selectedIssue && showMapPopup && (() => {
                  const catDetails = getCategoryDetails(selectedIssue.category);
                  const CatIcon = catDetails.icon;
                  return (
                    <Popup
                      latitude={getCoordinates(selectedIssue.coordinates).latitude}
                      longitude={getCoordinates(selectedIssue.coordinates).longitude}
                      onClose={() => setShowMapPopup(false)}
                      closeButton={true}
                      closeOnClick={false}
                      anchor="bottom"
                      offset={25}
                    >
                      <div className="w-[280px] flex flex-col gap-3 p-1 pt-3 pr-2 text-left select-none pointer-events-auto">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold text-[#C0F53D] bg-[#1A2209] px-2 py-0.5 rounded border border-[#C0F53D]/25">
                            {selectedIssue.id}
                          </span>
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${catDetails.bgColor} ${catDetails.textColor} border ${catDetails.borderColor}`}>
                            {catDetails.label}
                          </span>
                        </div>

                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#0A0D04] border border-[#FAFFF3]/10 h-24">
                          <IssueVisualizer type={selectedIssue.imageUrl || selectedIssue.image} animate={false} />
                        </div>

                        <div className="space-y-0.5">
                          <h5 className="text-[11px] font-bold text-[#FAFFF3] leading-tight line-clamp-1">
                            {selectedIssue.title}
                          </h5>
                          <p className="text-[9px] text-[#FAFFF3]/60 line-clamp-2">
                            {selectedIssue.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#FAFFF3]/5 pt-1.5 mt-0.5 font-mono text-[8px] text-[#FAFFF3]/40">
                          <div className="flex items-center gap-1 truncate max-w-[130px]">
                            <MapPin className="w-2.5 h-2.5 text-[#C0F53D]" />
                            <span className="truncate">{selectedIssue.locationName}</span>
                          </div>
                          <div>
                            VOTES: <span className="text-[#C0F53D] font-bold">{selectedIssue.votes}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  );
                })()}
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

            {/* Bottom Left Map Style Controller */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-auto bg-[#1A2209]/90 border border-[#FAFFF3]/10 rounded-2xl p-2 flex flex-col gap-1.5 shadow-xl">
              <button
                onClick={() => setIsStyleExpanded(!isStyleExpanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#0A0D04]/40 font-mono text-[9px] text-[#C0F53D] font-bold uppercase cursor-pointer"
              >
                <Globe className="w-3 h-3 text-[#C0F53D]" />
                <span>Theme: {MAP_STYLES.find(s => s.url === currentMapStyle)?.label}</span>
              </button>
              {isStyleExpanded && (
                <div className="flex flex-col gap-1 pl-1">
                  {MAP_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => { setCurrentMapStyle(style.url); setIsStyleExpanded(false); }}
                      className={`text-left px-2 py-1 text-[8px] font-mono uppercase rounded hover:bg-[#0A0D04] ${currentMapStyle === style.url ? "text-[#C0F53D] font-bold" : "text-[#FAFFF3]/60"}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Inspection Panel (Active on Tab: map, persistent on desktop) */}
          <div className={`w-full md:w-96 bg-[#1A2209]/45 backdrop-blur-xl border-l border-[#FAFFF3]/10 flex flex-col justify-between min-h-0 ${activeTab === "map" ? "flex" : "hidden"
            }`} id="dashboard-inspect-panel">

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              <div>
                <span className="font-mono text-[9px] text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">INSPECTION HUB</span>
                <h3 className="font-serif text-2xl text-[#FAFFF3] mt-0.5">Issue <span className="italic">Details</span></h3>
              </div>

              {selectedIssue ? (() => {
                const catDetails = getCategoryDetails(selectedIssue.category);
                const CatIcon = catDetails.icon;
                const relativeTimeStr = getRelativeTime(selectedIssue.dateReported);

                const stepperStages = ["Pending", "Verified", "In Progress", "Resolved"];
                const currentStepperStage = getStatusStage(selectedIssue.status, selectedIssue.votes);
                const currentStepperIdx = stepperStages.indexOf(currentStepperStage);

                const currentAffectedCount = selectedIssue.votes;
                const isAlreadyVerified = userVotedIssueIds[selectedIssue.id] || selectedIssue.status === "verified" || selectedIssue.status === "resolved";

                return (
                  <div className="space-y-6">
                    {/* 1. Issue ID + Category Badge + Severity Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C0F53D] bg-[#0A0D04] px-2.5 py-1 rounded border border-[#C0F53D]/25">
                        {selectedIssue.id}
                      </span>

                      {/* Category Badge */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${catDetails.bgColor} ${catDetails.textColor} ${catDetails.borderColor}`}>
                        <CatIcon className="w-3 h-3" />
                        {catDetails.label}
                      </span>

                      {/* Severity Badge */}
                      <span className={`inline-flex items-center text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${selectedIssue.severity === "critical"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : selectedIssue.severity === "high"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : selectedIssue.severity === "medium"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}>
                        {selectedIssue.severity ? `${selectedIssue.severity} Priority` : "Medium Priority"}
                      </span>
                    </div>

                    {/* 2. The actual reported photo */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0A0D04] border border-[#FAFFF3]/10 shadow-lg">
                      <IssueVisualizer type={selectedIssue.imageUrl || selectedIssue.image} animate={false} />
                    </div>

                    {/* 3. AI-generated description (1 sentence) */}
                    <div className="p-3.5 bg-[#0A0D04]/60 border border-[#FAFFF3]/5 rounded-xl">
                      <p className="text-xs text-emerald-400 font-mono leading-relaxed italic">
                        {(() => {
                          if (!selectedIssue.aiOutput) {
                            return selectedIssue.brief_description || `AI System Analysis: Active ${catDetails.label.toLowerCase()} reported with high civic priority score near community corridor.`;
                          }
                          if (selectedIssue.aiOutput.trim().startsWith("{")) {
                            try {
                              const parsed = JSON.parse(selectedIssue.aiOutput);
                              return `AI System Analysis: Confirmed ${catDetails.label.toLowerCase()} hazard detected with ${(parsed.confidence * 100).toFixed(0)}% confidence. Priority dispatch assigned to ${DEPARTMENT_ROUTING[issue.category] || parsed.route_to || "municipal queue"}.`;
                            } catch (e) {
                              // fallback
                            }
                          }
                          return selectedIssue.aiOutput;
                        })()}
                      </p>
                    </div>

                    {/* 4. Location (plain text address or coordinates, de-emphasized, not the main focus) */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Location</span>
                      <p className="text-xs text-[#FAFFF3]/80 font-medium">{selectedIssue.locationName}</p>
                      <p className="text-[10px] text-[#FAFFF3]/40 font-mono">{selectedIssue.coordinates}</p>
                    </div>

                    {/* 5. Status timeline stepper: Pending → Verified → In Progress → Resolved */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] font-mono text-[#FAFFF3]/40 uppercase tracking-widest block font-bold">Verification Timeline</span>
                      <div className="flex items-center justify-between relative px-1">
                        <div className="absolute top-[12px] left-4 right-4 h-[2px] bg-[#FAFFF3]/10 z-0" />
                        <div
                          className="absolute top-[12px] left-4 h-[2px] bg-[#C0F53D] transition-all duration-500 z-0"
                          style={{ width: `${(currentStepperIdx / (stepperStages.length - 1)) * 90}%` }}
                        />

                        {stepperStages.map((stage, idx) => {
                          const completed = idx <= currentStepperIdx;
                          const current = idx === currentStepperIdx;
                          return (
                            <div key={stage} className="flex flex-col items-center z-10 relative">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${current
                                    ? "bg-[#C0F53D] text-[#0A0D04] border-[#C0F53D] shadow-[0_0_8px_#C0F53D]"
                                    : completed
                                      ? "bg-[#1A2209] text-[#C0F53D] border-[#C0F53D]"
                                      : "bg-[#0A0D04] text-[#FAFFF3]/30 border-[#FAFFF3]/10"
                                  }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[8px] font-mono mt-1 transition-colors ${current
                                  ? "text-[#C0F53D] font-bold"
                                  : completed
                                    ? "text-[#FAFFF3]/80"
                                    : "text-[#FAFFF3]/30"
                                }`}>
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display AI Resolution Summary if resolved */}
                      {selectedIssue.status === "resolved" && selectedIssue.resolutionSummary && (
                        <div className="mt-6 p-3.5 bg-[#C0F53D]/10 border border-[#C0F53D]/30 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1.5 text-[#C0F53D] font-mono text-[9px] uppercase font-bold tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Resolution Summary</span>
                          </div>
                          <p className="text-xs text-[#FAFFF3]/90 font-mono italic">
                            {selectedIssue.resolutionSummary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Local Feedback Toast if active */}
                    {localFeedback && (
                      <div className="bg-[#1A2209] border border-[#C0F53D]/30 rounded-xl p-3 text-center text-[10px] font-mono text-[#C0F53D] uppercase tracking-wider animate-pulse">
                        {localFeedback}
                      </div>
                    )}

                    {/* 6. "I'm affected too" button with live count, and a separate "Verify this" button */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        disabled={userVotedIssueIds[selectedIssue.id]}
                        onClick={() => handleAffectedClick(selectedIssue.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${userVotedIssueIds[selectedIssue.id]
                            ? "bg-[#0A0D04] border border-[#FAFFF3]/5 text-[#FAFFF3]/30 cursor-default"
                            : "bg-[#1A2209] hover:bg-[#1A2209]/80 border border-[#C0F53D]/20 hover:border-[#C0F53D]/40 text-[#C0F53D] cursor-pointer"
                          }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Affected ({currentAffectedCount})</span>
                      </button>

                      <button
                        disabled={isAlreadyVerified}
                        onClick={() => handleVerifyClick(selectedIssue.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${isAlreadyVerified
                            ? "bg-[#0A0D04] border border-[#FAFFF3]/5 text-[#FAFFF3]/30 cursor-default"
                            : "bg-[#C0F53D] hover:bg-[#C0F53D]/90 text-[#0A0D04] border border-[#C0F53D]/50 cursor-pointer"
                          }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isAlreadyVerified ? "Verified" : "Verify This"}</span>
                      </button>
                    </div>

                    {/* 7. Reported timestamp in human-readable relative format */}
                    <div className="text-center pt-2">
                      <span className="font-mono text-[9px] text-[#FAFFF3]/30 uppercase">
                        REPORTED {relativeTimeStr.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-12">
                  <Activity className="w-8 h-8 text-[#FAFFF3]/20 mx-auto animate-pulse" />
                  <p className="text-xs text-[#FAFFF3]/40 font-mono mt-3">Select a live map node to pull full diagnostics.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tab View: my_reports */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left ${activeTab === "my_reports" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">MEMBER ACCOUNT</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">My <span className="italic">Reports</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Track, update, and manage all the civic concerns you have submitted to help preserve our community landscape.
              </p>
            </div>

            <div className="bg-[#1A2209]/20 border border-[#FAFFF3]/10 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#FAFFF3]/10 text-[#FAFFF3]/40 pb-2">
                      <th className="py-3 px-2">ISSUE ID</th>
                      <th className="py-3 px-2">CATEGORY</th>
                      <th className="py-3 px-2">TITLE</th>
                      <th className="py-3 px-2">LOCATION</th>
                      <th className="py-3 px-2">STATUS</th>
                      <th className="py-3 px-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.filter(i => i.reporterId === currentUser?.uid || i.id === "CG-2026-001" || i.id === "CG-2026-003" || i.id === "CG-2026-012").map((issue) => {
                      const cat = getCategoryDetails(issue.category);
                      return (
                        <tr key={issue.id} className="border-b border-[#FAFFF3]/5 hover:bg-[#0A0D04]/30 transition-all">
                          <td className="py-3.5 px-2 text-[#C0F53D] font-bold">{issue.id}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${cat.bgColor} ${cat.textColor}`}>
                              {cat.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-sans font-semibold text-[#FAFFF3]">{issue.title}</td>
                          <td className="py-3.5 px-2 text-[#FAFFF3]/60">{issue.locationName}</td>
                          <td className="py-3.5 px-2 uppercase font-bold text-[#C0F53D]">{issue.status}</td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => { setSelectedIssueId(issue.id); setActiveTab("map"); }}
                              className="text-[#C0F53D] hover:underline hover:text-white cursor-pointer"
                            >
                              View on Map
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tab View: community (Community Feed) */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left ${activeTab === "community" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">CIVIC FEED LEDGER</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Community <span className="italic">Feed</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Browse recently filed community reports. Support active hazards, verify municipal issues, and check resolution state changes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => {
                const cat = getCategoryDetails(issue.category);
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

                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#0A0D04]/60 border border-[#FAFFF3]/5 relative">
                        <IssueVisualizer type={issue.imageUrl || issue.image} animate={false} />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#FAFFF3] group-hover:text-[#C0F53D] transition-colors line-clamp-1">{issue.title}</h4>
                        <p className="text-xs text-[#FAFFF3]/60 font-light mt-1.5 line-clamp-2">{issue.description}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[#C0F53D]/80 font-mono text-[9px]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{issue.locationName}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#FAFFF3]/5 mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#FAFFF3]/40">{getRelativeTime(issue.dateReported)}</span>
                      <button className="text-[10px] font-mono text-[#C0F53D] hover:underline flex items-center gap-1">
                        <span>OPEN ON MAP</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab View: leaderboard */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left ${activeTab === "leaderboard" ? "block" : "hidden"}`}>
            <div>
              <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">COMMUNITY HEROES</span>
              <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Civic <span className="italic">Leaderboard</span></h3>
              <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
                Celebrating active residents who contribute significantly to resolving and reporting community civic issues.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-[#1A2209]/20 border border-[#FAFFF3]/10 rounded-2xl p-6">
                <h4 className="text-lg font-serif text-[#FAFFF3] mb-4">Top Contributors this Month</h4>
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((champion) => (
                    <div 
                      key={champion.rank} 
                      onClick={() => setSelectedProfileId(champion.id)}
                      className={`flex items-center justify-between p-4 bg-[#0A0D04]/60 border ${champion.id === currentUser?.uid ? 'border-[#C0F53D]/50 shadow-[0_0_15px_rgba(192,245,61,0.1)]' : 'border-[#FAFFF3]/5 hover:border-[#FAFFF3]/20'} rounded-xl cursor-pointer hover:bg-[#0A0D04]/90 transition-all`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-lg font-bold text-[#C0F53D]">#{champion.rank}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#FAFFF3]">{champion.name} {champion.id === currentUser?.uid && "(You)"}</p>
                          <p className="text-xs text-[#FAFFF3]/40 font-mono">Badge: <span className="text-[#C0F53D]">{champion.badge}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:gap-8 font-mono text-xs text-right">
                        <div className="hidden sm:block">
                          <p className="text-[#FAFFF3]/40">REPORTS</p>
                          <p className="text-white font-bold">{champion.reports}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[#FAFFF3]/40">VERIFIED</p>
                          <p className="text-white font-bold">{champion.verifications}</p>
                        </div>
                        <div>
                          <p className="text-[#FAFFF3]/40">SCORE</p>
                          <p className="text-[#C0F53D] font-bold">{champion.score} pts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-[#FAFFF3]/40 font-mono text-sm">
                      No users on the leaderboard yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1A2209]/30 border border-[#FAFFF3]/10 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-serif text-[#FAFFF3]">Your Stats</h4>
                <div className="p-4 bg-[#0A0D04]/80 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#FAFFF3]/40">COMMUNITY RANK</span>
                    <span className="text-white font-bold">{myRank ? `#${myRank}` : "Unranked"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFFF3]/40">TOTAL REPORTS</span>
                    <span className="text-white font-bold">{userProfile?.reportsCount || 0} submitted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFFF3]/40">VERIFICATIONS</span>
                    <span className="text-white font-bold">{userProfile?.verifiedCount || 0} logged</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAFFF3]/40">TOTAL SCORE</span>
                    <span className="text-[#C0F53D] font-bold">{userProfile?.civicScore || 0} pts</span>
                  </div>
                </div>

                <div className="p-4 bg-[#C0F53D]/5 border border-[#C0F53D]/20 rounded-xl text-left">
                  <p className="text-xs font-semibold text-[#C0F53D]">Weekly Challenge</p>
                  <p className="text-[11px] text-[#FAFFF3]/80 mt-1">Verify at least 3 newly submitted street or road reports near your registered city location to earn a "Civic Inspector" badge.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab View: my_profile */}
          <div className={`flex-1 relative flex-col min-h-0 bg-[#0A0D04] ${activeTab === "my_profile" ? "flex" : "hidden"}`}>
            {activeTab === "my_profile" && <MyProfile />}
          </div>

          {/* Analytics Dashboard Panel */}
          <div className={`flex-1 relative flex-col min-h-0 bg-[#0A0D04] ${activeTab === "analytics" ? "flex" : "hidden"}`}>
            <AnalyticsDashboard issues={issues} />
          </div>

          {/* Department View Panel */}
          <div className={`flex-1 relative flex-col min-h-0 bg-[#0A0D04] ${activeTab === "department" ? "flex" : "hidden"}`}>
            {activeTab === "department" && <DepartmentView issues={issues} />}
          </div>

        </div>
      </main>

      {/* Profile View Overlay Modal / Side Panel */}
      {selectedProfileId && (
        <>
          <div 
            className="absolute inset-0 bg-[#0A0D04]/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedProfileId(null)}
          ></div>
          <ProfileView 
            profileId={selectedProfileId} 
            issues={issues}
            onClose={() => setSelectedProfileId(null)}
            onIssueClick={(issue) => {
              setSelectedIssueId(issue.id);
              setSelectedProfileId(null);
              // Ensure we are in a tab that supports the map/panel overlay smoothly, e.g., map or community
              if (activeTab === "leaderboard" || activeTab === "department" || activeTab === "analytics" || activeTab === "my_profile") {
                setActiveTab("map");
              }
            }}
          />
        </>
      )}

      {/* Department View Warning Modal */}
      {showDepartmentWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A2209] border border-[#C0F53D]/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0F53D]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#C0F53D]/10 text-[#C0F53D] rounded-full shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-white mb-2">Department Simulation View</h3>
                <p className="text-sm text-[#FAFFF3]/70 leading-relaxed font-light mb-6">
                  This view demonstrates how municipal staff and department officials would interact with the CivicGuard platform. 
                  <br/><br/>
                  For demo purposes, you are entering a <strong className="text-[#C0F53D] font-normal">simulation</strong> of the admin portal where you can transition verified issues to "In Progress" or "Resolved".
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDepartmentWarning(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#FAFFF3]/60 hover:text-white hover:bg-[#FAFFF3]/5 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("department");
                      setShowDepartmentWarning(false);
                    }}
                    className="px-5 py-2 bg-[#C0F53D] text-[#0A0D04] rounded-xl text-xs font-mono font-bold hover:bg-[#C0F53D]/90 transition-all shadow-[0_0_15px_rgba(192,245,61,0.2)]"
                  >
                    ENTER SIMULATION
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
