import { z } from "zod";

const urlOptional = z.string().url("Enter a valid URL").optional().or(z.literal(""));

export const boardApplicationSchema = z.object({
  fullName: z.string().min(2,"Name required").max(200),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7,"Phone required").max(30),
  grade: z.string().min(1,"Grade required"),
  section: z.string().min(1,"Section required"),
  studentId: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  profilePhoto: z.string().optional(),
  firstChoicePositionId: z.string().min(1, "Select a position"),
  technicalInterests: z.string().optional(),
  expertise: z.string().optional(),
  experience: z.string().optional(),
  leadershipExperience: z.string().optional(),
  projects: z.string().optional(),
  competitions: z.string().optional(),
  githubUrl: urlOptional,
  portfolioUrl: urlOptional,
  otherLinks: urlOptional,
  motivation: z.string().min(20,"At least 20 characters"),
  positionReason: z.string().min(20,"At least 20 characters"),
  contribution: z.string().min(20,"At least 20 characters"),
  proposedActivities: z.string().min(20,"At least 20 characters"),
  timeCommitment: z.string().min(1,"Select time commitment"),
  confirm: z.literal(true, { message: "You must confirm accuracy" }),
});

export const memberSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  grade: z.string().min(1),
  section: z.string().min(1),
  studentId: z.string().min(1),
  role: z.string().min(1),
  githubUrl: urlOptional,
});

export const hackathonSchema = z.object({
  teamName: z.string().min(2,"Team name required").max(150),
  projectTitle: z.string().min(2,"Project title required").max(200),
  category: z.string().min(1,"Category required"),
  description: z.string().min(20,"At least 20 characters"),
  problemStatement: z.string().optional(),
  solution: z.string().optional(),
  technologyStack: z.string().optional(),
  members: z.array(memberSchema).length(4, "Exactly 4 members required"),
}).superRefine((data, ctx) => {
  const emails = data.members.map(m=>m.email.toLowerCase());
  const ids = data.members.map(m=>m.studentId.toLowerCase());
  if (new Set(emails).size !== 4) ctx.addIssue({ code:"custom", message:"Duplicate email in team", path:["members"]});
  if (new Set(ids).size !== 4) ctx.addIssue({ code:"custom", message:"Duplicate student ID in team", path:["members"]});
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
