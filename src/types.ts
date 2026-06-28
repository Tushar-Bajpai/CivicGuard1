export type IssueStatus = "active" | "resolved" | "critical";

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
}

export interface NavigationTab {
  id: "hero" | "map" | "community" | "impact";
  label: string;
}
