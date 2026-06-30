import React, { useEffect, useState } from "react";
import { CivicIssue } from "../types";
import { UserProfile } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { X, Award, MapPin, ChevronRight, Activity, Calendar, FileText } from "lucide-react";

interface ProfileViewProps {
  profileId: string;
  issues: CivicIssue[];
  onClose: () => void;
  onIssueClick: (issue: CivicIssue) => void;
}

export default function ProfileView({ profileId, issues, onClose, onIssueClick }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter global issues to only those reported by this user
  const userIssues = issues.filter((i) => i.reporterId === profileId);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        if (!db) {
          throw new Error("Firestore not initialized");
        }
        const docRef = doc(db, "users", profileId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Fallback if not in Firestore (e.g., deleted or not seeded correctly)
          setProfile({
            id: profileId,
            name: "Unknown Citizen",
            email: "",
            photoURL: null,
            civicScore: 0,
            badges: [],
            reportsCount: userIssues.length,
            verifiedCount: 0,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [profileId, userIssues.length]);

  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-[480px] bg-[#0A0D04] border-l border-[#FAFFF3]/10 shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-[#FAFFF3]/10 flex items-center justify-between shrink-0 bg-[#0A0D04]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#C0F53D]" />
          <h2 className="font-serif text-lg text-white">Civic Profile</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-[#FAFFF3]/50 hover:text-white rounded-lg hover:bg-[#FAFFF3]/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Profile Card */}
        {loading ? (
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FAFFF3]/10"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[#FAFFF3]/10 rounded"></div>
              <div className="h-3 w-24 bg-[#FAFFF3]/10 rounded"></div>
            </div>
          </div>
        ) : profile ? (
          <div className="bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0F53D]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} className="w-16 h-16 rounded-full border-2 border-[#C0F53D]/30 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-[#C0F53D]/30 bg-[#0A0D04] flex items-center justify-center text-xl font-serif text-[#C0F53D]">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                  <span className="text-[#C0F53D] font-bold bg-[#C0F53D]/10 px-2 py-0.5 rounded border border-[#C0F53D]/20">
                    {profile.civicScore} PTS
                  </span>
                  <span className="text-[#FAFFF3]/40 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-[#FAFFF3]/10 relative z-10">
              <div className="bg-[#0A0D04]/60 p-3 rounded-xl border border-[#FAFFF3]/5">
                <div className="flex items-center gap-1.5 text-[#FAFFF3]/40 font-mono text-[9px] mb-1">
                  <FileText className="w-3 h-3" />
                  <span>REPORTS</span>
                </div>
                <div className="text-lg font-bold text-white">{profile.reportsCount}</div>
              </div>
              <div className="bg-[#0A0D04]/60 p-3 rounded-xl border border-[#FAFFF3]/5">
                <div className="flex items-center gap-1.5 text-[#FAFFF3]/40 font-mono text-[9px] mb-1">
                  <Activity className="w-3 h-3" />
                  <span>VERIFIED</span>
                </div>
                <div className="text-lg font-bold text-white">{profile.verifiedCount}</div>
              </div>
            </div>

            {profile.badges && profile.badges.length > 0 && (
              <div className="mt-5 relative z-10">
                <span className="text-[10px] font-mono text-[#FAFFF3]/40 mb-2 block">EARNED BADGES</span>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, idx) => (
                    <span key={idx} className="text-[10px] font-mono font-semibold text-[#FAFFF3]/80 bg-[#FAFFF3]/5 border border-[#FAFFF3]/10 px-2 py-1 rounded-md">
                      {badge.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* User's Reported Issues */}
        <div>
          <h4 className="text-sm font-semibold text-[#FAFFF3] mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C0F53D]" />
            Reported by {profile?.name.split(" ")[0] || "Citizen"}
          </h4>

          {userIssues.length === 0 ? (
            <div className="text-center py-8 bg-[#1A2209]/20 rounded-xl border border-[#FAFFF3]/5">
              <p className="text-[#FAFFF3]/40 font-mono text-xs">No issues reported yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue)}
                  className="bg-[#1A2209]/30 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/30 rounded-xl p-4 cursor-pointer transition-all hover:bg-[#1A2209]/60 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase
                      ${issue.status === 'resolved' ? 'bg-[#C0F53D] text-[#0A0D04]' : 
                        issue.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                        issue.status === 'verified' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-yellow-500/20 text-yellow-300'}`}>
                      {issue.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#FAFFF3]/40 flex items-center gap-1 group-hover:text-[#C0F53D] transition-colors">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  
                  <h5 className="text-sm font-semibold text-white mb-1.5 line-clamp-1">{issue.title}</h5>
                  
                  <div className="flex items-center gap-1 text-[#FAFFF3]/50 font-mono text-[9px]">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{issue.locationName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
