import React, { useMemo } from "react";
import { motion } from "motion/react";
import { CivicIssue } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Activity, Clock, ShieldCheck, MapPin, AlertCircle } from "lucide-react";

interface AnalyticsDashboardProps {
  issues: CivicIssue[];
}

export default function AnalyticsDashboard({ issues }: AnalyticsDashboardProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } catch {
      return false;
    }
  };

  // 1. Bar Chart: Issue count by category (current month)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach(issue => {
      if (isCurrentMonth(issue.dateReported)) {
        let label = "Other";
        const cat = (issue.category || "").toLowerCase();
        if (cat.includes("pothole") || cat.includes("road")) label = "Potholes";
        else if (cat.includes("water") || cat.includes("leak")) label = "Water/Flooding";
        else if (cat.includes("streetlight") || cat.includes("light")) label = "Streetlights";
        else if (cat.includes("garbage") || cat.includes("waste")) label = "Waste/Garbage";
        else if (cat.includes("tree") || cat.includes("debris")) label = "Fallen Trees";
        
        counts[label] = (counts[label] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [issues]);

  // 2. Stat Cards
  const stats = useMemo(() => {
    const totalReports = issues.length;
    let resolvedThisMonth = 0;
    let totalResolutionTimeMs = 0;
    let resolvedCountForAvg = 0;

    issues.forEach(issue => {
      if (issue.status === "resolved") {
        if (isCurrentMonth(issue.dateReported) || (issue.updatedAt && isCurrentMonth(issue.updatedAt))) {
          resolvedThisMonth++;
        }
        
        if (issue.updatedAt) {
          const created = new Date(issue.dateReported).getTime();
          const updated = new Date(issue.updatedAt).getTime();
          if (updated > created) {
            totalResolutionTimeMs += (updated - created);
            resolvedCountForAvg++;
          }
        }
      }
    });

    let avgResolutionDisplay = "N/A";
    if (resolvedCountForAvg > 0) {
      const avgMs = totalResolutionTimeMs / resolvedCountForAvg;
      const hours = avgMs / (1000 * 60 * 60);
      if (hours > 24) {
        avgResolutionDisplay = `${(hours / 24).toFixed(1)} Days`;
      } else {
        avgResolutionDisplay = `${hours.toFixed(1)} Hours`;
      }
    }

    return { totalReports, resolvedThisMonth, avgResolutionDisplay };
  }, [issues]);

  // 3. Top Hotspot Areas
  const hotspots = useMemo(() => {
    const clusters: Record<string, { count: number, name: string }> = {};
    
    issues.forEach(issue => {
      if (!issue.coordinates) return;
      const [latStr, lngStr] = issue.coordinates.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Round to 2 decimal places to cluster nearby issues (~1km resolution)
        const clusterLat = lat.toFixed(2);
        const clusterLng = lng.toFixed(2);
        const key = `${clusterLat},${clusterLng}`;
        
        if (!clusters[key]) {
          // Keep the first location name as representative
          clusters[key] = { count: 0, name: issue.locationName || `Lat: ${clusterLat}, Lng: ${clusterLng}` };
        }
        clusters[key].count++;
      }
    });

    return Object.values(clusters)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3
  }, [issues]);

  // 4. Escalated Issues
  const escalatedIssues = useMemo(() => {
    return issues
      .filter(issue => issue.escalationNote)
      .map(issue => {
        let daysSince = 0;
        if (issue.updatedAt) {
          const updated = new Date(issue.updatedAt).getTime();
          daysSince = Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24));
        }
        return { ...issue, daysSince };
      })
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [issues]);

  const COLORS = ["#C0F53D", "#A3E635", "#84CC16", "#65A30D", "#4D7C0F", "#3F6212"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A2209]/95 border border-[#FAFFF3]/15 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-[#FAFFF3] font-mono text-xs mb-2 font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || "#C0F53D" }} />
              <span className="text-[#FAFFF3]/70 capitalize">Count:</span>
              <span className="text-[#FAFFF3] font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 overflow-y-auto w-full h-full text-left">
      <div>
        <span className="font-mono text-[10px] text-[#C0F53D] tracking-[0.2em] uppercase block font-bold">
          IMPACT ANALYTICS
        </span>
        <h2 className="font-serif text-3xl text-[#FAFFF3] mt-1">
          Civic <span className="italic text-[#C0F53D]">Telemetry</span>
        </h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-[#FAFFF3]/10 relative overflow-hidden">
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-[#C0F53D]/10" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase mb-2">Total Reports</p>
          <p className="text-4xl font-serif text-[#FAFFF3]">{stats.totalReports.toLocaleString()}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-[#FAFFF3]/10 relative overflow-hidden">
          <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-[#C0F53D]/10" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase mb-2">Resolved This Month</p>
          <p className="text-4xl font-serif text-[#FAFFF3]">{stats.resolvedThisMonth.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-[#FAFFF3]/10 relative overflow-hidden">
          <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-[#C0F53D]/10" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase mb-2">Avg Resolution Time</p>
          <p className="text-4xl font-serif text-[#FAFFF3]">{stats.avgResolutionDisplay}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Category Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-[#FAFFF3]/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-[#C0F53D]" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase">
              REPORTS BY CATEGORY (THIS MONTH)
            </span>
          </div>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(250,255,243,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(250,255,243,0.3)" tick={{ fill: "rgba(250,255,243,0.5)", fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "rgba(250,255,243,0.7)", fontSize: 10, fontFamily: 'monospace' }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(250,255,243,0.05)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-mono text-[#FAFFF3]/50">
                No reports this month.
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Top Hotspot Areas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-[#FAFFF3]/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-[#C0F53D]" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C0F53D] uppercase">
              TOP HOTSPOT ZONES
            </span>
          </div>
          
          <div className="space-y-4">
            {hotspots.length > 0 ? hotspots.map((spot, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-[#0A0D04]/50 border border-[#FAFFF3]/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#C0F53D]/10 text-[#C0F53D] flex items-center justify-center font-bold font-mono text-xs">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-[#FAFFF3] text-sm font-semibold truncate max-w-[200px]" title={spot.name}>
                      {spot.name}
                    </h4>
                    <p className="text-[10px] text-[#FAFFF3]/50 font-mono mt-0.5">HIGH DENSITY ZONE</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#C0F53D] font-mono text-lg font-bold">{spot.count}</p>
                  <p className="text-[9px] text-[#FAFFF3]/40 uppercase tracking-wider">Reports</p>
                </div>
              </div>
            )) : (
              <div className="w-full py-12 flex items-center justify-center text-sm font-mono text-[#FAFFF3]/50">
                Insufficient location data.
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* 4. Escalated Issues (Needs Attention) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A2209]/40 backdrop-blur-md rounded-2xl p-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
      >
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-red-500 uppercase font-bold">
            NEEDS ATTENTION (ESCALATED)
          </span>
        </div>

        <div className="space-y-4">
          {escalatedIssues.length > 0 ? escalatedIssues.map((issue, index) => (
            <div key={index} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <h4 className="text-[#FAFFF3] text-sm font-semibold">{issue.title}</h4>
                  <p className="text-[10px] text-red-400 font-mono mt-1 flex items-center gap-2">
                    <span>{issue.category.replace(/_/g, ' ')}</span>
                    <span className="w-1 h-1 rounded-full bg-red-400"></span>
                    <span>{issue.locationName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <p className="text-red-400 font-mono text-sm font-bold">{issue.daysSince} DAYS</p>
                    <p className="text-[9px] text-red-400/60 uppercase tracking-wider">Unresolved</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A0D04]/60 p-3 rounded-lg border border-red-500/20">
                <p className="text-xs text-red-300/90 italic">
                  "{issue.escalationNote}"
                </p>
              </div>
            </div>
          )) : (
            <div className="w-full py-8 flex flex-col items-center justify-center text-sm font-mono text-[#FAFFF3]/50">
              <ShieldCheck className="w-8 h-8 text-[#C0F53D]/30 mb-2" />
              <span>No stale verified issues. All clear.</span>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
