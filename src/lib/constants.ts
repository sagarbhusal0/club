export const BOARD_STATUSES = ["SUBMITTED","UNDER_REVIEW","SHORTLISTED","INTERVIEW","SELECTED","WAITLISTED","REJECTED"] as const;
export const BOARD_POSITIONS_FALLBACK: { id:string; name:string; description:string }[] = [
  { id: "fallback-treasurer", name: "Treasurer", description: "Manage finances" },
  { id: "fallback-member", name: "Member", description: "General member — contribute across club activities" },
];
export const BOARD_OPEN_POSITION_NAMES = ["Treasurer", "Member"] as const;
export const HACKATHON_STATUSES = ["REGISTERED","UNDER_REVIEW","APPROVED","WAITLISTED","REJECTED","CHECKED_IN"] as const;
export const MEMBER_ROLES = ["Team Leader","Developer","Designer","Researcher","AI/ML","Cybersecurity","Other"] as const;
export const DEFAULT_CATEGORIES = ["AI/ML","Cybersecurity","Web Development","Software Development","Cloud/DevOps","Open Source","General"];
export const TIME_COMMITMENTS = ["2-4 hrs/week","4-6 hrs/week","6-10 hrs/week","10+ hrs/week"] as const;
