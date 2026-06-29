import React, { useState, useEffect } from "react";
import { INITIAL_ISSUES } from "./data";
import { CivicIssue } from "./types";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import ProcessGrid from "./components/ProcessGrid";
import LiveMap from "./components/LiveMap";
import CommunityFeed from "./components/CommunityFeed";
import ImpactMetrics from "./components/ImpactMetrics";
import ReportIssueModal from "./components/ReportIssueModal";
import Footer from "./components/Footer";
import DashboardLayout from "./components/DashboardLayout";
import { AnimatePresence, motion } from "motion/react";
import { ShieldAlert, Check } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, increment } from "firebase/firestore";

export default function App() {
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [activeSection, setActiveSection] = useState("hero");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync issues with Firestore
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(
      collection(db, "issues"),
      (snapshot) => {
        const items: CivicIssue[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            category: data.category || "",
            title: data.title || "",
            description: data.description || "",
            confidence: data.confidence ?? 0.95,
            coordinates: data.location ? `${data.location.lat}, ${data.location.lng}` : "0, 0",
            status: data.status || "pending",
            votes: data.confirmCount || 0,
            locationName: data.location?.name || "",
            dateReported: data.createdAt ? (typeof data.createdAt === "string" ? data.createdAt : (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt.seconds * 1000).toISOString())) : new Date().toISOString(),
            image: data.imageUrl || data.category || "other_infrastructure",
            imageUrl: data.imageUrl || "",
            severity: data.severity || "medium",
            brief_description: data.description || "",
            aiOutput: data.aiOutput || `AI Analysis: Severity is ${data.severity || "normal"}.`
          });
        });
        // Sort by date reported (newest first)
        items.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
        setIssues(items);
      },
      (error) => {
        console.error("Error loading issues from Firestore in App.tsx:", error);
      }
    );

    return () => unsubscribe();
  }, []);
  
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname === "/dashboard" || window.location.hash === "#dashboard" 
      ? "dashboard" 
      : "landing";
  });

  // Monitor URL history state changes
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === "/dashboard" || window.location.hash === "#dashboard") {
        setCurrentView("dashboard");
      } else {
        setCurrentView("landing");
      }
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigateToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    setCurrentView("dashboard");
  };

  const navigateToLanding = () => {
    window.history.pushState({}, "", "/");
    setCurrentView("landing");
  };

  // Monitor scrolling to highlight active Navigation pill (only on landing page)
  useEffect(() => {
    if (currentView !== "landing") return;

    const handleScroll = () => {
      const sections = ["hero", "map", "community", "impact"];
      const scrollPosition = window.scrollY + 250;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  const handleVote = async (id: string) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === id ? { ...issue, votes: issue.votes + 1 } : issue
      )
    );
    showNotification(`Attestation logged for node ${id}`);
    
    if (db) {
      try {
        const docRef = doc(db, "issues", id);
        await updateDoc(docRef, {
          confirmCount: increment(1),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error upvoting in Firestore:", err);
      }
    }
  };

  const handleNewReportSubmit = async (newReport: {
    category: string;
    title: string;
    description: string;
    coordinates: string;
    locationName: string;
    severity: string;
    image: string;
  }) => {
    // Generate high fidelity report package ID
    const reportId = `CG-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const dateStr = new Date().toISOString();
    
    const [latStr, lngStr] = newReport.coordinates.split(",");
    const lat = parseFloat(latStr || "19.0760");
    const lng = parseFloat(lngStr || "72.8777");

    // Standard AI output representation
    const aiOutputObj = {
      category: newReport.category,
      confidence: 0.98,
      severity: newReport.severity.toLowerCase(),
      priority_score: `${Math.floor(Math.random() * 15 + 85)}/100`,
      metrics: {
        depth_cm: Math.random() > 0.5 ? 12.8 : undefined,
        saturation: Math.random() > 0.5 ? 0.91 : undefined,
        voltage_v: Math.random() > 0.5 ? 240 : undefined,
      },
      route_to: `MUNI-AUTO-${Math.floor(Math.random() * 8000 + 1000)}`
    };

    const firestoreData = {
      reporterId: "user_01",
      category: newReport.category,
      severity: newReport.severity.toLowerCase(),
      status: "pending",
      title: newReport.title,
      description: newReport.description,
      imageUrl: newReport.image.startsWith("http") ? newReport.image : "",
      location: {
        lat: lat,
        lng: lng,
        name: newReport.locationName
      },
      confirmCount: 1,
      priorityScore: Math.floor(Math.random() * 15 + 85),
      createdAt: dateStr,
      updatedAt: dateStr,
      aiOutput: JSON.stringify(aiOutputObj, null, 2)
    };

    if (db) {
      try {
        await setDoc(doc(db, "issues", reportId), firestoreData);
        showNotification(`Successfully routed ${reportId} to Municipal Dispatch`);
      } catch (err) {
        console.error("Error creating issue in Firestore:", err);
        // Fallback local update if Firestore fails
        const fallbackReport: CivicIssue = {
          id: reportId,
          category: newReport.category,
          title: newReport.title,
          description: newReport.description,
          confidence: 0.98,
          coordinates: newReport.coordinates,
          status: "pending",
          votes: 1,
          locationName: newReport.locationName,
          dateReported: dateStr,
          image: newReport.image,
          severity: newReport.severity.toLowerCase(),
          aiOutput: JSON.stringify(aiOutputObj, null, 2)
        };
        setIssues((prev) => [fallbackReport, ...prev]);
        showNotification(`Successfully routed ${reportId} to Municipal Dispatch (Offline Mode)`);
      }
    } else {
      // Fallback local update if DB is not initialized
      const fallbackReport: CivicIssue = {
        id: reportId,
        category: newReport.category,
        title: newReport.title,
        description: newReport.description,
        confidence: 0.98,
        coordinates: newReport.coordinates,
        status: "pending",
        votes: 1,
        locationName: newReport.locationName,
        dateReported: dateStr,
        image: newReport.image,
        severity: newReport.severity.toLowerCase(),
        aiOutput: JSON.stringify(aiOutputObj, null, 2)
      };
      setIssues((prev) => [fallbackReport, ...prev]);
      showNotification(`Successfully routed ${reportId} to Municipal Dispatch`);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0D04] text-[#FAFFF3] overflow-x-hidden selection:bg-[#C0F53D] selection:text-[#0A0D04]">
      {/* Absolute background tactical grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 tactical-grid z-0" />

      <AnimatePresence mode="wait">
        {currentView === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DashboardLayout 
              issues={issues}
              onVote={handleVote}
              onReportClick={() => setIsReportOpen(true)}
              onBackToLanding={navigateToLanding}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Floating Pill Navigation */}
            <Navigation 
              onReportClick={navigateToDashboard} 
              activeSection={activeSection}
              onNavigate={(id) => {
                if (id === "map") {
                  navigateToDashboard();
                } else {
                  setActiveSection(id);
                  const element = document.getElementById(id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
            />

            {/* Hero Header Presentation */}
            <Hero 
              onReportClick={navigateToDashboard} 
              onViewMapClick={navigateToDashboard}
            />

            {/* Process / Workflow Grid */}
            <ProcessGrid />

            {/* Live Map Telemetry Console */}
            <LiveMap issues={issues} onVote={handleVote} />

            {/* Community Transmission Ledger */}
            <CommunityFeed 
              issues={issues}
              onVote={handleVote}
              onOpenReport={navigateToDashboard}
            />

            {/* Impact Statistics */}
            <ImpactMetrics />

            {/* Footer Branding Navigation */}
            <Footer onNavigate={(id) => {
              if (id === "map") {
                navigateToDashboard();
              } else {
                setActiveSection(id);
                const element = document.getElementById(id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Report Wizard Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <ReportIssueModal 
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            onSubmitReport={handleNewReportSubmit}
          />
        )}
      </AnimatePresence>

      {/* Global Interactive Notification Toast */}
      <AnimatePresence>
        {notification && (
          <div className="fixed bottom-6 right-6 z-50" id="notification-toast">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#1A2209] border border-[#C0F53D]/40 text-[#C0F53D] font-mono text-xs rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <Check className="w-4 h-4 text-[#C0F53D]" />
              <span>{notification}</span>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
