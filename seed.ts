import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch, collection } from "firebase/firestore";
import dotenv from "dotenv";

// 1. Load environment variables from .env
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("❌ Seeding failed: VITE_FIREBASE_API_KEY is not defined in your environment.");
  process.exit(1);
}

// 2. Initialize Firebase
console.log("🔄 Initializing Firebase client SDK...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Define Sample Users Data
const sampleUsers = [
  {
    id: "user_01",
    name: "Aarav Mehta",
    email: "aarav.mehta@civicguard.org",
    civicScore: 185,
    badges: ["first_report", "pothole_patrol", "vanguard_voter"],
    reportsCount: 6,
    verifiedCount: 18
  },
  {
    id: "user_02",
    name: "Priya Sharma",
    email: "priya.sharma@civicguard.org",
    civicScore: 240,
    badges: ["first_report", "eco_champion", "neighborhood_hero"],
    reportsCount: 12,
    verifiedCount: 22
  },
  {
    id: "user_03",
    name: "Vikram Singh",
    email: "vikram.singh@civicguard.org",
    civicScore: 90,
    badges: ["first_report", "vanguard_voter"],
    reportsCount: 3,
    verifiedCount: 10
  },
  {
    id: "user_04",
    name: "Ananya Iyer",
    email: "ananya.iyer@civicguard.org",
    civicScore: 310,
    badges: ["first_report", "master_inspector", "neighborhood_hero", "pothole_patrol"],
    reportsCount: 15,
    verifiedCount: 35
  }
];

// Reusable images by category
const images = {
  pothole_or_road_damage: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
  water_leak_or_flooding: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
  streetlight_broken: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
  waste_or_garbage_dump: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
  fallen_tree_or_debris: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600",
};

// 4. Define 16 Realistic Civic Issues Data
const sampleIssues = [
  // --- PENDING ISSUES (~40%) ---
  {
    id: "issue_001",
    reporterId: "user_01",
    category: "pothole_or_road_damage",
    severity: "medium",
    status: "pending",
    title: "Deep Pothole near Andheri Station",
    description: "A hazardous pothole has formed right outside the station exit, posing a risk to auto-rickshaws and pedestrians.",
    imageUrl: images.pothole_or_road_damage,
    location: { lat: 19.1197, lng: 72.8464, name: "Andheri Station Road, Mumbai" },
    confirmCount: 1,
    priorityScore: 45,
    createdAt: new Date("2026-06-30T08:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T08:15:00Z").toISOString()
  },
  {
    id: "issue_002",
    reporterId: "user_02",
    category: "water_leak_or_flooding",
    severity: "high",
    status: "pending",
    title: "Major Pipe Burst Flooding Road",
    description: "Clean drinking water is gushing out of a broken mainline near the market square.",
    imageUrl: images.water_leak_or_flooding,
    location: { lat: 28.5562, lng: 77.1000, name: "Vasant Kunj Market, New Delhi" },
    confirmCount: 2,
    priorityScore: 78,
    createdAt: new Date("2026-06-30T09:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T09:30:00Z").toISOString()
  },
  {
    id: "issue_003",
    reporterId: "user_03",
    category: "streetlight_broken",
    severity: "high",
    status: "pending",
    title: "Three Streetlights Out in a Row",
    description: "The entire block is in darkness, creating a severe safety issue for pedestrians at night.",
    imageUrl: images.streetlight_broken,
    location: { lat: 12.9352, lng: 77.6245, name: "Koramangala 4th Block, Bangalore" },
    confirmCount: 0,
    priorityScore: 82,
    createdAt: new Date("2026-06-30T10:10:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T10:10:00Z").toISOString()
  },
  {
    id: "issue_004",
    reporterId: "user_04",
    category: "waste_or_garbage_dump",
    severity: "medium",
    status: "pending",
    title: "Illegal Garbage Dump on Sidewalk",
    description: "Piles of domestic waste have been accumulating on the sidewalk, forcing people to walk on the busy road.",
    imageUrl: images.waste_or_garbage_dump,
    location: { lat: 19.0600, lng: 72.8400, name: "Bandra West, Mumbai" },
    confirmCount: 1,
    priorityScore: 50,
    createdAt: new Date("2026-06-30T07:45:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T07:45:00Z").toISOString()
  },
  {
    id: "issue_005",
    reporterId: "user_01",
    category: "fallen_tree_or_debris",
    severity: "low",
    status: "pending",
    title: "Small Tree Branches Blocking Path",
    description: "Some branches broke off during last night's wind and are partially blocking the walking path in the park.",
    imageUrl: images.fallen_tree_or_debris,
    location: { lat: 28.5921, lng: 77.2273, name: "Lodhi Garden, New Delhi" },
    confirmCount: 2,
    priorityScore: 25,
    createdAt: new Date("2026-06-29T18:20:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T18:20:00Z").toISOString()
  },
  {
    id: "issue_006",
    reporterId: "user_02",
    category: "pothole_or_road_damage",
    severity: "high",
    status: "pending",
    title: "Crumbling Asphalt near Intersection",
    description: "The road surface is peeling off near the main traffic signal, causing severe congestion.",
    imageUrl: images.pothole_or_road_damage,
    location: { lat: 12.9716, lng: 77.5946, name: "MG Road Intersection, Bangalore" },
    confirmCount: 0,
    priorityScore: 70,
    createdAt: new Date("2026-06-30T11:00:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T11:00:00Z").toISOString()
  },

  // --- VERIFIED ISSUES (~30%) ---
  {
    id: "issue_007",
    reporterId: "user_03",
    category: "streetlight_broken",
    severity: "critical",
    status: "verified",
    title: "Live Wire Hanging from Lamppost",
    description: "A streetlight cover is broken and a live electrical wire is hanging at head height on the sidewalk.",
    imageUrl: images.streetlight_broken,
    location: { lat: 19.0330, lng: 72.8496, name: "Dharavi Main Road, Mumbai" },
    confirmCount: 8,
    priorityScore: 98,
    createdAt: new Date("2026-06-29T08:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T14:30:00Z").toISOString()
  },
  {
    id: "issue_008",
    reporterId: "user_04",
    category: "waste_or_garbage_dump",
    severity: "medium",
    status: "verified",
    title: "Overflowing Public Bins",
    description: "The municipal bins haven't been cleared in 3 days. Garbage is spilling into the street.",
    imageUrl: images.waste_or_garbage_dump,
    location: { lat: 28.5355, lng: 77.2410, name: "Greater Kailash 1, New Delhi" },
    confirmCount: 15,
    priorityScore: 55,
    createdAt: new Date("2026-06-28T09:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T10:00:00Z").toISOString()
  },
  {
    id: "issue_009",
    reporterId: "user_01",
    category: "water_leak_or_flooding",
    severity: "high",
    status: "verified",
    title: "Sewage Overflowing onto Street",
    description: "A blocked drain is causing raw sewage to overflow onto the busy commercial street.",
    imageUrl: images.water_leak_or_flooding,
    location: { lat: 12.9279, lng: 77.6271, name: "BTM Layout, Bangalore" },
    confirmCount: 22,
    priorityScore: 85,
    createdAt: new Date("2026-06-29T07:10:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T11:45:00Z").toISOString()
  },
  {
    id: "issue_010",
    reporterId: "user_02",
    category: "fallen_tree_or_debris",
    severity: "medium",
    status: "verified",
    title: "Uprooted Tree Blocking Sidewalk",
    description: "A medium-sized tree was completely uprooted and is lying across the pedestrian walkway.",
    imageUrl: images.fallen_tree_or_debris,
    location: { lat: 19.1136, lng: 72.8697, name: "Andheri East, Mumbai" },
    confirmCount: 12,
    priorityScore: 60,
    createdAt: new Date("2026-06-29T16:20:00Z").toISOString(),
    updatedAt: new Date("2026-06-30T09:00:00Z").toISOString()
  },
  {
    id: "issue_011",
    reporterId: "user_03",
    category: "pothole_or_road_damage",
    severity: "high",
    status: "verified",
    title: "Dangerous Crater on Highway Ramp",
    description: "A massive pothole at the entrance ramp of the highway is forcing cars to suddenly brake, causing near-misses.",
    imageUrl: images.pothole_or_road_damage,
    location: { lat: 28.5035, lng: 77.0866, name: "NH-48 Ramp, New Delhi" },
    confirmCount: 35,
    priorityScore: 88,
    createdAt: new Date("2026-06-28T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T12:00:00Z").toISOString()
  },

  // --- IN PROGRESS ISSUES (~20%) ---
  {
    id: "issue_012",
    reporterId: "user_04",
    category: "streetlight_broken",
    severity: "medium",
    status: "in_progress",
    title: "Timers Malfunctioning on Main Road",
    description: "The streetlights are staying on all day and turning off at night due to a faulty control box.",
    imageUrl: images.streetlight_broken,
    location: { lat: 12.9784, lng: 77.6408, name: "Indiranagar 100ft Road, Bangalore" },
    confirmCount: 18,
    priorityScore: 65,
    createdAt: new Date("2026-06-27T18:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T09:30:00Z").toISOString()
  },
  {
    id: "issue_013",
    reporterId: "user_01",
    category: "waste_or_garbage_dump",
    severity: "high",
    status: "in_progress",
    title: "Construction Debris Dumped Illegally",
    description: "Trucks have dumped tons of construction debris in the vacant lot, attracting pests and blocking drainage.",
    imageUrl: images.waste_or_garbage_dump,
    location: { lat: 19.1351, lng: 72.8146, name: "Versova Beach Road, Mumbai" },
    confirmCount: 27,
    priorityScore: 72,
    createdAt: new Date("2026-06-26T08:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T14:00:00Z").toISOString()
  },
  {
    id: "issue_014",
    reporterId: "user_02",
    category: "water_leak_or_flooding",
    severity: "critical",
    status: "in_progress",
    title: "Severe Flooding Under Underpass",
    description: "The drainage pumps failed, and the underpass is flooded with 3 feet of water, trapping multiple vehicles.",
    imageUrl: images.water_leak_or_flooding,
    location: { lat: 28.6322, lng: 77.2185, name: "Minto Bridge Underpass, New Delhi" },
    confirmCount: 89,
    priorityScore: 99,
    createdAt: new Date("2026-06-27T14:10:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T09:45:00Z").toISOString()
  },

  // --- RESOLVED ISSUES (~10%) ---
  {
    id: "issue_015",
    reporterId: "user_03",
    category: "fallen_tree_or_debris",
    severity: "high",
    status: "resolved",
    title: "Huge Banyan Tree Blocked Highway",
    description: "A massive old Banyan tree collapsed during the storm, completely blocking the national highway.",
    imageUrl: images.fallen_tree_or_debris,
    location: { lat: 12.8399, lng: 77.6770, name: "Hosur Road, Electronic City, Bangalore" },
    confirmCount: 142,
    priorityScore: 95,
    createdAt: new Date("2026-06-24T05:20:00Z").toISOString(),
    updatedAt: new Date("2026-06-26T18:00:00Z").toISOString(),
    resolutionSummary: "Fallen banyan tree on Hosur Road cleared and safely relocated by Urban Forestry Dept after 2 days, confirmed by 142 residents."
  },
  {
    id: "issue_016",
    reporterId: "user_04",
    category: "pothole_or_road_damage",
    severity: "critical",
    status: "resolved",
    title: "Sinkhole Opened Up on Main Arterial",
    description: "A large 3-meter sinkhole suddenly opened up in the middle of the road, swallowing a parked scooter.",
    imageUrl: images.pothole_or_road_damage,
    location: { lat: 19.0176, lng: 72.8561, name: "Dadar TT Circle, Mumbai" },
    confirmCount: 215,
    priorityScore: 100,
    createdAt: new Date("2026-06-22T12:00:00Z").toISOString(),
    updatedAt: new Date("2026-06-25T10:30:00Z").toISOString(),
    resolutionSummary: "Critical sinkhole at Dadar TT Circle filled and repaved by Transportation & Road Repair after 3 days, confirmed by 215 residents."
  }
];

// We don't necessarily need verifications to seed the demo, but we'll include a few
// for the first issue to ensure the confirmCount matches up visually in the frontend.
const sampleVerifications = [
  { id: "v_01", issueId: "issue_007", voterId: "user_02", voteType: "confirm", createdAt: new Date("2026-06-29T10:30:00Z").toISOString() },
  { id: "v_02", issueId: "issue_007", voterId: "user_04", voteType: "confirm", createdAt: new Date("2026-06-29T11:00:00Z").toISOString() },
];

async function runSeed() {
  try {
    console.log("🚀 Starting seed script...");

    // Seeding Users
    console.log("👤 Seeding 'users' collection...");
    const userBatch = writeBatch(db);
    for (const u of sampleUsers) {
      const userRef = doc(db, "users", u.id);
      userBatch.set(userRef, u);
    }
    await userBatch.commit();
    console.log(`✅ Successfully seeded ${sampleUsers.length} users!`);

    // Seeding Issues
    console.log("🚧 Seeding 'issues' collection...");
    const issueBatch = writeBatch(db);
    for (const issue of sampleIssues) {
      const issueRef = doc(db, "issues", issue.id);
      issueBatch.set(issueRef, issue);
    }
    await issueBatch.commit();
    console.log(`✅ Successfully seeded ${sampleIssues.length} issues!`);

    // Seeding Verifications
    console.log("🗳️ Seeding 'verifications' collection...");
    const verificationBatch = writeBatch(db);
    for (const v of sampleVerifications) {
      const vRef = doc(db, "verifications", v.id);
      verificationBatch.set(vRef, v);
    }
    await verificationBatch.commit();
    console.log(`✅ Successfully seeded ${sampleVerifications.length} verifications!`);

    console.log("\n🎉 Database fully seeded and ready for CivicGuard!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed with error:", error);
    process.exit(1);
  }
}

// Run the script
runSeed();
