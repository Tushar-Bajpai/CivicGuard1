import React, { useState } from "react";
import { CivicIssue } from "../types";
import { DEPARTMENT_ROUTING } from "../data";
import { functions, handleFirestoreError, OperationType } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { Activity, CheckCircle, Clock } from "lucide-react";

interface DepartmentViewProps {
  issues: CivicIssue[];
}

export default function DepartmentView({ issues }: DepartmentViewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (issueId: string, newStatus: string) => {
    if (!functions) {
      alert("Cloud Functions not initialized.");
      return;
    }
    setLoadingId(issueId);
    try {
      const updateIssueStatus = httpsCallable(functions, 'updateIssueStatus');
      await updateIssueStatus({ issueId, newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${issueId}`);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter issues to only show verified or in_progress
  const relevantIssues = issues.filter(i => i.status === "verified" || i.status === "in_progress");

  // Group by department
  const groupedIssues: Record<string, CivicIssue[]> = {};
  relevantIssues.forEach(issue => {
    const dept = DEPARTMENT_ROUTING[issue.category] || "General Municipal Services";
    if (!groupedIssues[dept]) {
      groupedIssues[dept] = [];
    }
    groupedIssues[dept].push(issue);
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left relative z-10 w-full bg-[#0A0D04]">
      <div>
        <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">ADMIN PANEL</span>
        <h3 className="font-serif text-3xl text-[#FAFFF3] mt-1">Department <span className="italic">View</span></h3>
        <p className="text-sm text-[#FAFFF3]/60 font-light mt-2 max-w-xl">
          Manage routed issues that have been verified by the community. Update status to In Progress or Resolved.
        </p>
      </div>

      {Object.keys(groupedIssues).length === 0 ? (
        <div className="text-center py-12 border border-[#FAFFF3]/10 rounded-2xl bg-[#1A2209]/20">
          <Activity className="w-8 h-8 text-[#FAFFF3]/20 mx-auto animate-pulse" />
          <p className="text-xs text-[#FAFFF3]/40 font-mono mt-3">No verified or in progress issues currently routed.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedIssues).map(([dept, deptIssues]) => (
            <div key={dept} className="space-y-4">
              <h4 className="text-lg font-serif text-[#C0F53D] border-b border-[#FAFFF3]/10 pb-2">{dept}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deptIssues.map((issue) => (
                  <div key={issue.id} className="bg-[#1A2209]/40 border border-[#FAFFF3]/10 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#FAFFF3] font-bold px-2 py-0.5 rounded bg-[#0A0D04] border border-[#FAFFF3]/20">
                          {issue.id}
                        </span>
                        <span className="font-mono text-[10px] text-[#C0F53D] uppercase">{issue.status}</span>
                      </div>
                      <h5 className="text-sm font-semibold text-[#FAFFF3] line-clamp-1">{issue.title}</h5>
                      <p className="text-xs text-[#FAFFF3]/60 font-light line-clamp-2">{issue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        disabled={issue.status === "in_progress" || loadingId === issue.id}
                        onClick={() => updateStatus(issue.id, "in_progress")}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-[9px] font-bold uppercase transition-all ${
                          issue.status === "in_progress" 
                          ? "bg-[#0A0D04] text-[#FAFFF3]/30 border border-[#FAFFF3]/10 cursor-not-allowed" 
                          : "bg-[#1A2209] hover:bg-[#1A2209]/80 text-[#C0F53D] border border-[#C0F53D]/30 cursor-pointer"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>In Progress</span>
                      </button>
                      
                      <button
                        disabled={loadingId === issue.id}
                        onClick={() => updateStatus(issue.id, "resolved")}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-[9px] font-bold uppercase bg-[#C0F53D] hover:bg-[#C0F53D]/90 text-[#0A0D04] transition-all cursor-pointer border border-[#C0F53D]/50"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Resolved</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
