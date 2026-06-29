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

// 4. Define 12 Realistic Civic Issues Data
const sampleIssues = [
  {
    id: "issue_001",
    reporterId: "user_01",
    category: "pothole_or_road_damage",
    severity: "critical",
    status: "pending",
    title: "15cm Deep Pothole on Carter Road",
    description: "A dangerous 15cm deep pothole has formed in the middle lane of Carter Road, Bandra, causing vehicles to swerve unpredictably. Multiple two-wheeler riders have lost balance here.",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 19.0760,
      lng: 72.8777,
      name: "Carter Road, Bandra West, Mumbai"
    },
    confirmCount: 14,
    priorityScore: 92,
    createdAt: new Date("2026-06-28T22:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T22:15:00Z").toISOString()
  },
  {
    id: "issue_002",
    reporterId: "user_02",
    category: "streetlight_broken",
    severity: "high",
    status: "verified",
    title: "Flickering Pedestrian Crosswalk Light",
    description: "The overhead sodium street lamp at Connaught Place outer circle has been failing repeatedly, leaving the major pedestrian crosswalk in complete darkness at night.",
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 28.6139,
      lng: 77.2090,
      name: "Outer Circle, Connaught Place, New Delhi"
    },
    confirmCount: 22,
    priorityScore: 78,
    createdAt: new Date("2026-06-29T00:10:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T01:30:00Z").toISOString()
  },
  {
    id: "issue_003",
    reporterId: "user_04",
    category: "water_leak_or_flooding",
    severity: "high",
    status: "in_progress",
    title: "Burst Mainline Water Pipe Bursting",
    description: "A major clean water pipe burst has been bubbling up through the pavement joint, wasting thousands of liters of clean drinking water and flooding the nearby shopfront sidewalk.",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 12.9716,
      lng: 77.5946,
      name: "100 Feet Road, Indiranagar, Bangalore"
    },
    confirmCount: 31,
    priorityScore: 84,
    createdAt: new Date("2026-06-28T14:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T18:00:00Z").toISOString()
  },
  {
    id: "issue_004",
    reporterId: "user_03",
    category: "waste_or_garbage_dump",
    severity: "medium",
    status: "pending",
    title: "Uncollected Public Dump Pile",
    description: "A massive pile of household and organic waste has accumulated near the bridge approach road, blocking the walk corridor and attracting stray animals and insects.",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 22.5726,
      lng: 88.3639,
      name: "Howrah Bridge Approach Road, Kolkata"
    },
    confirmCount: 9,
    priorityScore: 48,
    createdAt: new Date("2026-06-28T08:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T08:30:00Z").toISOString()
  },
  {
    id: "issue_005",
    reporterId: "user_01",
    category: "fallen_tree_or_debris",
    severity: "medium",
    status: "resolved",
    title: "Heavy Tree Branch Blocking Lane",
    description: "A large Gulmohar tree branch snapped off during yesterday's monsoon thunderstorm, completely obstructing the left-side vehicle lane and sidewalk.",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 13.0827,
      lng: 80.2707,
      name: "East Coast Road, Thiruvanmiyur, Chennai"
    },
    confirmCount: 45,
    priorityScore: 10, // low because it is resolved
    createdAt: new Date("2026-06-27T10:11:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T16:00:00Z").toISOString()
  },
  {
    id: "issue_006",
    reporterId: "user_04",
    category: "streetlight_broken",
    severity: "critical",
    status: "pending",
    title: "Dangerous Hanging Live Power Line",
    description: "A cluster of electrical overhead wires has snapped and is dangling dangerously close to the public wet pavement, posing a fatal shock risk to local pedestrians.",
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 28.6562,
      lng: 77.2300,
      name: "Main Bazar Road, Chandni Chowk, New Delhi"
    },
    confirmCount: 52,
    priorityScore: 98,
    createdAt: new Date("2026-06-28T17:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T17:15:00Z").toISOString()
  },
  {
    id: "issue_007",
    reporterId: "user_02",
    category: "pothole_or_road_damage",
    severity: "medium",
    status: "verified",
    title: "Cracked Walkway and Broken Pavement Tiles",
    description: "Sidewalk granite slabs are severely cracked, loose, and lifting up, presenting a severe tripping hazard for elderly people and blind pedestrians navigating this busy sector.",
    imageUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 12.9116,
      lng: 77.6346,
      name: "Sector 2, HSR Layout, Bangalore"
    },
    confirmCount: 16,
    priorityScore: 54,
    createdAt: new Date("2026-06-28T11:20:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T00:05:00Z").toISOString()
  },
  {
    id: "issue_008",
    reporterId: "user_03",
    category: "water_leak_or_flooding",
    severity: "medium",
    status: "pending",
    title: "Clogged Storm Drain Grate Flooding",
    description: "Plastic litter and organic leaves have completely sealed the metal storm water inlet grate, creating a massive puddle of stagnant water across half the road during light showers.",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 17.3850,
      lng: 78.4867,
      name: "Road No. 36, Jubilee Hills, Hyderabad"
    },
    confirmCount: 8,
    priorityScore: 45,
    createdAt: new Date("2026-06-28T19:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T19:30:00Z").toISOString()
  },
  {
    id: "issue_009",
    reporterId: "user_02",
    category: "waste_or_garbage_dump",
    severity: "high",
    status: "verified",
    title: "Scattered Plastics and Micro-waste on Beachfront",
    description: "A heavy concentration of commercial plastic waste, beverage bottles, and snack packs have washed up on the public beachfront, degrading marine ecosystem health and visual appeal.",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 19.1060,
      lng: 72.8277,
      name: "Juhu Beachfront, Juhu, Mumbai"
    },
    confirmCount: 29,
    priorityScore: 74,
    createdAt: new Date("2026-06-28T16:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T02:00:00Z").toISOString()
  },
  {
    id: "issue_010",
    reporterId: "user_01",
    category: "fallen_tree_or_debris",
    severity: "low",
    status: "resolved",
    title: "Broken Walkway Bench Wood Splinters",
    description: "The wooden slats on a public park bench have splintered and broken completely. Some sharp wood spikes are protruding from the iron frame.",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 12.9716,
      lng: 77.5946,
      name: "Cubbon Park Walkway, Bangalore"
    },
    confirmCount: 5,
    priorityScore: 5,
    createdAt: new Date("2026-06-25T08:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-27T12:00:00Z").toISOString()
  },
  {
    id: "issue_011",
    reporterId: "user_04",
    category: "other_infrastructure",
    severity: "medium",
    status: "in_progress",
    title: "Vandalized Public Bus Shelter Glass",
    description: "The rear safety glass panels of the public bus transit shelter have been smashed. Fine glass shards are scattered all over the bench seating area.",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 18.5204,
      lng: 73.8567,
      name: "Fergusson College Road, Pune"
    },
    confirmCount: 18,
    priorityScore: 58,
    createdAt: new Date("2026-06-28T09:15:00Z").toISOString(),
    updatedAt: new Date("2026-06-29T02:30:00Z").toISOString()
  },
  {
    id: "issue_012",
    reporterId: "user_04",
    category: "other_infrastructure",
    severity: "critical",
    status: "pending",
    title: "Collapsed Public Walkway Safety Railing",
    description: "A critical 4-meter section of the pedestrian guardrail has collapsed near the scenic harbor walk, leaving an open drop directly into the high-tide shoreline waves.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
    location: {
      lat: 9.9312,
      lng: 76.2673,
      name: "Fort Kochi Beach walkway, Kochi"
    },
    confirmCount: 38,
    priorityScore: 94,
    createdAt: new Date("2026-06-28T15:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-28T15:30:00Z").toISOString()
  }
];

// 5. Define Sample Verifications Data
const sampleVerifications = [
  { id: "v_01", issueId: "issue_001", voterId: "user_02", voteType: "confirm", createdAt: new Date("2026-06-28T22:30:00Z").toISOString() },
  { id: "v_02", issueId: "issue_001", voterId: "user_03", voteType: "confirm", createdAt: new Date("2026-06-28T23:00:00Z").toISOString() },
  { id: "v_03", issueId: "issue_002", voterId: "user_01", voteType: "confirm", createdAt: new Date("2026-06-29T00:30:00Z").toISOString() },
  { id: "v_04", issueId: "issue_002", voterId: "user_04", voteType: "confirm", createdAt: new Date("2026-06-29T01:00:00Z").toISOString() },
  { id: "v_05", issueId: "issue_003", voterId: "user_01", voteType: "confirm", createdAt: new Date("2026-06-28T15:00:00Z").toISOString() },
  { id: "v_06", issueId: "issue_003", voterId: "user_02", voteType: "confirm", createdAt: new Date("2026-06-28T15:30:00Z").toISOString() },
  { id: "v_07", issueId: "issue_006", voterId: "user_01", voteType: "confirm", createdAt: new Date("2026-06-28T18:00:00Z").toISOString() },
  { id: "v_08", issueId: "issue_007", voterId: "user_03", voteType: "confirm", createdAt: new Date("2026-06-28T13:00:00Z").toISOString() },
  { id: "v_09", issueId: "issue_009", voterId: "user_03", voteType: "confirm", createdAt: new Date("2026-06-28T18:00:00Z").toISOString() },
  { id: "v_10", issueId: "issue_012", voterId: "user_02", voteType: "confirm", createdAt: new Date("2026-06-28T17:00:00Z").toISOString() },
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
