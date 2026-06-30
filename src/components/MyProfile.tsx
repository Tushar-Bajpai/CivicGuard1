import React, { useState, useEffect } from "react";
import { useAuth, UserProfile } from "../AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Shield, Eye, Trophy, Megaphone, CheckCircle, Save, User as UserIcon, Loader2, Lock } from "lucide-react";

export default function MyProfile() {
  const { currentUser, userProfile, signInAsDemo } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.name) {
      setNameInput(userProfile.name);
    }
  }, [userProfile?.name]);

  const handleSaveName = async () => {
    if (!currentUser || !nameInput.trim() || nameInput.trim() === userProfile?.name) {
      setIsEditing(false);
      return;
    }

    if (currentUser.uid === "demo-user-123") {
      signInAsDemo(nameInput.trim(), currentUser.email || undefined);
      setSaveMessage("Demo name updated!");
      setIsEditing(false);
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      if (db) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          name: nameInput.trim()
        });
        setSaveMessage("Name updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update name:", err);
      setSaveMessage("Failed to update name.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Fixed badge list and thresholds
  const BADGES = [
    { 
      id: "civic_scout", 
      name: "Civic Scout", 
      icon: Shield, 
      isEarned: (u: UserProfile) => u.civicScore >= 0, 
      desc: "Unlocked at civicScore >= 0" 
    },
    { 
      id: "neighborhood_watch", 
      name: "Neighborhood Watch", 
      icon: Eye, 
      isEarned: (u: UserProfile) => u.civicScore >= 50, 
      desc: "Unlocked at civicScore >= 50" 
    },
    { 
      id: "civic_champion", 
      name: "Civic Champion", 
      icon: Trophy, 
      isEarned: (u: UserProfile) => u.civicScore >= 200, 
      desc: "Unlocked at civicScore >= 200" 
    },
    { 
      id: "first_responder", 
      name: "First Responder", 
      icon: Megaphone, 
      isEarned: (u: UserProfile) => u.reportsCount >= 1, 
      desc: "Unlocked after reporting 1 issue" 
    },
    { 
      id: "community_verifier", 
      name: "Community Verifier", 
      icon: CheckCircle, 
      isEarned: (u: UserProfile) => u.verifiedCount >= 5, 
      desc: "Unlocked after 5 verifications" 
    }
  ];

  if (!userProfile) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center bg-[#0A0D04]">
        <Loader2 className="w-8 h-8 text-[#C0F53D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-left bg-[#0A0D04] relative z-10 w-full h-full">
      <div>
        <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">ACCOUNT DASHBOARD</span>
        <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">My <span className="italic">Profile</span></h3>
        <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
          Manage your personal details and view the badges you've earned through civic engagement.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        
        {/* Edit Name Section */}
        <div className="bg-[#1A2209]/20 border border-[#FAFFF3]/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0F53D]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <h4 className="text-lg font-serif text-white flex items-center gap-2 mb-6">
            <UserIcon className="w-5 h-5 text-[#C0F53D]" />
            Personal Details
          </h4>

          <div className="space-y-4 max-w-sm relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#FAFFF3]/40 tracking-wider">DISPLAY NAME</label>
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 bg-[#0A0D04] border border-[#C0F53D]/50 text-white px-3 py-2.5 rounded-xl font-semibold outline-none focus:ring-1 focus:ring-[#C0F53D]"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="bg-[#C0F53D] text-[#0A0D04] p-2.5 rounded-xl hover:bg-[#C0F53D]/90 transition-colors disabled:opacity-50"
                    title="Save"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#0A0D04]/60 border border-[#FAFFF3]/5 px-3 py-2.5 rounded-xl">
                  <span className="text-white font-semibold">{userProfile.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#C0F53D] text-xs font-mono hover:underline uppercase font-bold px-2"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5 opacity-60">
              <label className="text-[10px] font-mono text-[#FAFFF3]/40 tracking-wider">EMAIL ADDRESS (Read-only)</label>
              <div className="bg-[#0A0D04]/30 border border-[#FAFFF3]/5 px-3 py-2.5 rounded-xl text-[#FAFFF3]/80">
                {userProfile.email}
              </div>
            </div>

            {saveMessage && (
              <p className="text-xs font-mono text-[#C0F53D] mt-2 animate-fade-in">{saveMessage}</p>
            )}
          </div>
        </div>

        {/* Earned Badges Section */}
        <div className="bg-[#1A2209]/20 border border-[#FAFFF3]/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-serif text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C0F53D]" />
              Civic Badges
            </h4>
            <div className="text-xs font-mono text-[#FAFFF3]/40">
              SCORE: <span className="text-[#C0F53D] font-bold">{userProfile.civicScore} PTS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              const earned = badge.isEarned(userProfile);
              
              return (
                <div 
                  key={badge.id}
                  className={`relative p-5 rounded-xl border transition-all flex flex-col items-center text-center gap-3
                    ${earned 
                      ? 'bg-[#C0F53D]/5 border-[#C0F53D]/30 shadow-[0_4px_20px_rgba(192,245,61,0.05)]' 
                      : 'bg-[#0A0D04]/60 border-[#FAFFF3]/5 opacity-60 grayscale'
                    }`}
                >
                  {!earned && (
                    <div className="absolute top-2.5 right-2.5 text-[#FAFFF3]/30">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-full ${earned ? 'bg-[#C0F53D]/20 text-[#C0F53D]' : 'bg-[#FAFFF3]/5 text-[#FAFFF3]/30'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <h5 className={`font-semibold ${earned ? 'text-white' : 'text-[#FAFFF3]/60'}`}>
                      {badge.name}
                    </h5>
                    <p className="text-[10px] font-mono mt-1 text-[#FAFFF3]/40">
                      {earned ? "UNLOCKED" : badge.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
