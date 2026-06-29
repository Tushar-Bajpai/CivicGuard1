export type IssueStatus = "active" | "resolved" | "critical" | "pending" | "verified" | "in_progress" | "rejected";

export interface CivicIssue {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  coordinates: string;
  status: IssueStatus;
  votes: number;
  locationName: string;
  dateReported: string;
  image: string;
  aiOutput?: string;
  severity?: string;
  brief_description?: string;
  imageUrl?: string;
  reporterId?: string;
  updatedAt?: string;
  escalationNote?: string;
  escalatedAt?: string;
}

export interface NavigationTab {
  id: "hero" | "map" | "community" | "impact";
  label: string;
}
