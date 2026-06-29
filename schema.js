/**
 * CivicGuard Firestore Database Schema Reference
 * 
 * This file serves as the official schema definition and reference guide 
 * for the Firestore collections and document structures in CivicGuard.
 * 
 * Collection Overview:
 * 1. `users`         - Citizen profiles, stats, scores, and gamification achievements.
 * 2. `issues`        - Crowd-sourced civic infrastructure reports.
 * 3. `verifications` - Upvotes, verification votes, and peer review logs.
 */

/**
 * ---------------------------------------------------------------------------
 * 1. USERS COLLECTION
 * ---------------------------------------------------------------------------
 * Path: `/users/{userId}`
 * Description: Stores citizen accounts, gamification metrics (civicScore), 
 * and community stats.
 * 
 * Document Structure:
 */
const UserSchema = {
  // Unique Identifier (matches Firebase Auth UID)
  id: "string", 

  // Basic Profile Info
  name: "string",       // Display name of the user
  email: "string",      // Email address associated with their account

  // Gamification Metrics
  civicScore: 120,      // Integer: Accumulation of positive contributions (reports & verifications)
  badges: [             // Array of strings: Earned civic titles/medals
    "first_report",     // Earned on submitting their first issue
    "pothole_patrol",   // Earned after 5 verified road damage reports
    "vanguard_voter"    // Earned after participating in 20 verifications
  ],

  // Community Statistics
  reportsCount: 8,      // Integer: Total issues reported by this user
  verifiedCount: 15,    // Integer: Total peer verifications performed by this user
};


/**
 * ---------------------------------------------------------------------------
 * 2. ISSUES COLLECTION
 * ---------------------------------------------------------------------------
 * Path: `/issues/{issueId}`
 * Description: Main collection for civic infrastructure reports. Stores detailed
 * report content, location, status, and computed priority metrics.
 * 
 * Document Structure:
 */
const IssueSchema = {
  // Unique Identifier
  id: "string",

  // Reporter Reference
  reporterId: "string", // References a User Document ID (Auth UID)

  // Categorization
  // Must be one of the following exact string values:
  // - "pothole_or_road_damage"
  // - "water_leak_or_flooding"
  // - "streetlight_broken"
  // - "waste_or_garbage_dump"
  // - "fallen_tree_or_debris"
  // - "other_infrastructure"
  category: "pothole_or_road_damage",

  // Severity Level
  // - "low"
  // - "medium"
  // - "high"
  // - "critical"
  severity: "critical",

  // Current Resolution Lifecycle Status
  // - "pending"     : Newly reported, awaiting peer votes
  // - "verified"    : Validated by the community (met required confirmCount)
  // - "in_progress" : Assigned or actively being addressed by community/agency
  // - "resolved"    : Successfully fixed and closed
  // - "rejected"    : Voted down as spam, duplicate, or non-issue
  status: "pending",

  // Descriptive details
  title: "string",       // Short, clear title of the issue
  description: "string", // Multi-sentence detailed description of the infrastructure issue
  imageUrl: "string",    // Direct link to the evidence photograph (Unsplash or Cloud Storage)

  // Geographic Information
  location: {
    lat: 19.0760,        // Float: Latitude coordinate
    lng: 72.8777,        // Float: Longitude coordinate
    name: "string"       // Human-readable address or neighborhood name
  },

  // Social & Validation Metrics
  confirmCount: 14,      // Integer: Total count of verified community upvotes/verifications
  priorityScore: 85,     // Integer/Float: Weighted priority index based on severity & confirmCount

  // Lifecycle Timestamps
  createdAt: "timestamp", // ISO String or Firestore Timestamp when document was created
  updatedAt: "timestamp"  // ISO String or Firestore Timestamp of last modification
};


/**
 * ---------------------------------------------------------------------------
 * 3. VERIFICATIONS COLLECTION
 * ---------------------------------------------------------------------------
 * Path: `/verifications/{verificationId}`
 * Description: Records historical peer votes to prevent duplicate voting, 
 * validate reports, and calculate rewards.
 * 
 * Document Structure:
 */
const VerificationSchema = {
  // Unique Identifier (e.g., "{issueId}_{voterId}")
  id: "string",

  // References
  issueId: "string", // References the target Issue Document ID
  voterId: "string", // References the voting User Document ID (Auth UID)

  // Verification Vote Type
  // - "confirm" : Confirms the issue is real, active, and correctly categorized
  // - "dismiss" : Flags the issue as spam, resolved already, or invalid
  voteType: "confirm",

  // Timestamp
  createdAt: "timestamp" // ISO String or Firestore Timestamp when the vote was cast
};

module.exports = {
  UserSchema,
  IssueSchema,
  VerificationSchema
};
