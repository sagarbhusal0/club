export const BOARD_STATUSES = ["SUBMITTED","UNDER_REVIEW","SHORTLISTED","INTERVIEW","SELECTED","WAITLISTED","REJECTED"] as const;
export const BOARD_POSITIONS_FALLBACK: { id:string; name:string; description:string }[] = [
  { id: "fallback-member", name: "Member", description: "General member — contribute across club activities" },
];
export const BOARD_OPEN_POSITION_NAMES = ["Member"] as const;
export const HACKATHON_STATUSES = ["REGISTERED","UNDER_REVIEW","IDEA_REVIEW","APPROVED","NEEDS_REVISION","WAITLISTED","REJECTED","CHECKED_IN","FINAL_SUBMITTED","DISQUALIFIED"] as const;
export const HACKATHON_IDEA_STATUSES = ["PENDING","APPROVED","NEEDS_REVISION","REJECTED"] as const;
export const MEMBER_ROLES = ["Team Leader","Developer","Designer","Researcher","AI/ML","Cybersecurity","Other"] as const;
export const DEFAULT_CATEGORIES = ["Student Management","Attendance","Teacher Management","Exam & Results","Timetable","Homework & Assignments","Library Management","Fee Management","Parent-School Communication","Event Management","Inventory Management","Transport Management","Student Performance","School Analytics","AI-powered School Management","Other"];
export const TIME_COMMITMENTS = ["2-4 hrs/week","4-6 hrs/week","6-10 hrs/week","10+ hrs/week"] as const;
export const HACKATHON_MAX_TEAMS = 9;
export const HACKATHON_MEMBERS_PER_TEAM = 3;
export const JUDGING_CRITERIA = [
  { label: "Problem Understanding", weight: 15 },
  { label: "Originality & Uniqueness", weight: 20 },
  { label: "Innovation & Creativity", weight: 15 },
  { label: "Technical Implementation", weight: 20 },
  { label: "Practical Usefulness", weight: 15 },
  { label: "UI/UX", weight: 5 },
  { label: "Documentation & Presentation", weight: 10 },
] as const;
