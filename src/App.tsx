import React, { useState, useEffect } from "react";
import { INITIAL_ISSUES, DEPARTMENT_ROUTING } from "./data";
import { CivicIssue } from "./types";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import ProcessGrid from "./components/ProcessGrid";
import LiveMap from "./components/LiveMap";
import CommunityFeed from "./components/CommunityFeed";
import ImpactMetrics from "./components/ImpactMetrics";
import ProblemStatement from "./components/ProblemStatement";
import FeaturesGrid from "./components/FeaturesGrid";
import GamificationTeaser from "./components/GamificationTeaser";
import OurVision from "./components/OurVision";
import FinalCTA from "./components/FinalCTA";
import ReportIssueModal from "./components/ReportIssueModal";
import LandingPage from "./components/LandingPage";
import Footer from "./components/Footer";
import DashboardLayout from "./components/DashboardLayout";
import ScoreToast from "./components/ScoreToast";
import { AnimatePresence, motion } from "motion/react";
import { ShieldAlert, Check } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, query, where, getDocs } from "firebase/firestore";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthPage from "./components/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
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
            aiOutput: data.aiOutput || `AI Analysis: Severity is ${data.severity || "normal"}.`,
            reporterId: data.reporterId || "",
            updatedAt: data.updatedAt ? (typeof data.updatedAt === "string" ? data.updatedAt : (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date(data.updatedAt.seconds * 1000).toISOString())) : undefined,
            escalationNote: data.escalationNote || undefined,
            escalatedAt: data.escalatedAt || undefined,
            resolutionSummary: data.resolutionSummary || undefined,
            flaggedForReview: data.flaggedForReview || false
          });
        });
        // Sort by date reported (newest first)
        items.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
        setIssues(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "issues");
      }
    );

    return () => unsubscribe();
  }, []);

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === "/dashboard" || hash === "#dashboard") {
      return "dashboard";
    }
    if (path === "/login" || hash === "#login") {
      return "login";
    }
    return "landing";
  });

  // Monitor URL history state changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/dashboard" || hash === "#dashboard") {
        setCurrentView("dashboard");
      } else if (path === "/login" || hash === "#login") {
        setCurrentView("login");
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

  const navigateToLogin = () => {
    window.history.pushState({}, "", "/login");
    setCurrentView("login");
  };

  // Redirect logged-in users away from the login page
  useEffect(() => {
    if (!loading && currentUser && currentView === "login") {
      navigateToDashboard();
    }
  }, [currentUser, loading, currentView]);

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

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0A0D04] text-[#FAFFF3] flex flex-col items-center justify-center font-mono text-xs selection:bg-[#C0F53D] selection:text-[#0A0D04]">
        <div className="absolute inset-0 pointer-events-none opacity-40 tactical-grid z-0" />
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-[#C0F53D] animate-spin mb-4" />
        <span className="animate-pulse tracking-widest text-[#C0F53D]">SYNCHRONIZING CIVICGUARD NODE...</span>
      </div>
    );
  }

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
        handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
      }
    }
  };

  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Radius of Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

    const isWithin30Days = (dateStr?: string) => {
      if (!dateStr) return true;
      const daysOld = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld <= 30;
    };

    // 1. Perform Duplicate Check before Firestore write
    let duplicateId: string | null = null;

    if (db) {
      try {
        const q = query(
          collection(db, "issues"),
          where("category", "==", newReport.category)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          if (duplicateId) return;
          const data = docSnap.data();
          if (data.status === "rejected" || data.status === "resolved" || data.status === "in_progress") return;
          if (!isWithin30Days(data.createdAt)) return;
          
          const loc = data.location;
          if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
            const dist = getHaversineDistance(lat, lng, loc.lat, loc.lng);
            if (dist <= 15) {
              duplicateId = docSnap.id;
            }
          }
        });
      } catch (err) {
        console.warn("Firestore duplicate check query failed, using in-memory:", err);
      }
    }

    // Double check with in-memory state or use as offline fallback
    if (!duplicateId) {
      const matched = issues.find((issue) => {
        if (issue.status === "rejected" || issue.status === "resolved" || issue.status === "in_progress") return false;
        if (issue.category !== newReport.category) return false;
        if (!isWithin30Days(issue.createdAt)) return false;
        
        const [issueLatStr, issueLngStr] = issue.coordinates.split(",");
        const issueLat = parseFloat(issueLatStr);
        const issueLng = parseFloat(issueLngStr);
        if (!isNaN(issueLat) && !isNaN(issueLng)) {
          const dist = getHaversineDistance(lat, lng, issueLat, issueLng);
          return dist <= 15;
        }
        return false;
      });
      if (matched) {
        duplicateId = matched.id;
      }
    }

    // If duplicate found, increment vote count instead of creating a new report
    if (duplicateId) {
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === duplicateId ? { ...issue, votes: (issue.votes || 0) + 1 } : issue
        )
      );
      showNotification("This was already reported nearby. We've added your confirmation instead of creating a duplicate.");

      if (db) {
        try {
          await updateDoc(doc(db, "issues", duplicateId), {
            confirmCount: increment(1),
            updatedAt: dateStr
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `issues/${duplicateId}`);
        }
      }
      return;
    }

    const severityLower = newReport.severity.toLowerCase();
    const severityWeight =
      severityLower === "critical" ? 1.0 :
        severityLower === "high" ? 0.75 :
          severityLower === "medium" ? 0.5 : 0.25;
    const computedPriorityScore = Math.round((severityWeight * 0.6 + (1 / 10) * 0.4) * 100);

    // Standard AI output representation
    const aiOutputObj = {
      category: newReport.category,
      confidence: 0.98,
      severity: severityLower,
      priority_score: `${computedPriorityScore}/100`,
      metrics: {
        depth_cm: Math.random() > 0.5 ? 12.8 : undefined,
        saturation: Math.random() > 0.5 ? 0.91 : undefined,
        voltage_v: Math.random() > 0.5 ? 240 : undefined,
      },
      route_to: DEPARTMENT_ROUTING[newReport.category] || "General Municipal Services"
    };

    const firestoreData = {
      reporterId: currentUser ? currentUser.uid : "user_01",
      category: newReport.category,
      severity: severityLower,
      status: "pending",
      title: newReport.title,
      description: newReport.description,
      imageUrl: (newReport.image.startsWith("http") || newReport.image.startsWith("data:")) ? newReport.image : "",
      location: {
        lat: lat,
        lng: lng,
        name: newReport.locationName
      },
      confirmCount: 1,
      priorityScore: computedPriorityScore,
      createdAt: dateStr,
      updatedAt: dateStr,
      aiOutput: JSON.stringify(aiOutputObj, null, 2)
    };

    if (db) {
      try {
        await setDoc(doc(db, "issues", reportId), firestoreData);
        if (currentUser && currentUser.uid !== "demo-user-123") {
          await updateDoc(doc(db, "users", currentUser.uid), {
            civicScore: increment(10),
            reportsCount: increment(1)
          });
        }
        showNotification(`Successfully routed ${reportId} to Municipal Dispatch`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `issues/${reportId}`);
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
        aiOutput: JSON.stringify(aiOutputObj, null, 2),
        reporterId: currentUser ? currentUser.uid : "user_01"
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
          <ProtectedRoute onRedirectToLogin={navigateToLogin}>
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
          </ProtectedRoute>
        ) : currentView === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AuthPage
              onBackToLanding={navigateToLanding}
              onSuccess={navigateToDashboard}
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

            <ProblemStatement />

            <FeaturesGrid />

            {/* Process / Workflow Grid */}
            <ProcessGrid />

            <GamificationTeaser />

            <OurVision />

            <FinalCTA onReportClick={navigateToDashboard} />

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ScoreToast />
    </AuthProvider>
  );
}
