import { z } from "zod";
import en from "./i18n/en";
import type { Dict } from "./i18n/en";

type V = Dict["validation"];

const isHttpUrl = (v: string) => {
  try { return ["http:", "https:"].includes(new URL(v).protocol); } catch { return false; }
};

// English-only enforcement: reject Devanagari characters in free-text fields.
const hasDevanagari = (v: string) => /[\u0900-\u097F]/.test(v);
const englishOnly = (m: V) => (v: string) => !v || !hasDevanagari(v);

const isHttpUrlOf = (_m: V) => (v: string) => isHttpUrl(v);

const urlOptional = (m: V) => z.string().url(m.urlInvalid).refine(isHttpUrlOf(m), m.urlHttp).optional().or(z.literal(""));
const urlRequired = (m: V) => z.string().min(1, m.required).url(m.urlInvalid).refine(isHttpUrlOf(m), m.urlHttp);

export function buildBoardApplicationSchema(m: V = en.validation) {
  return z.object({
    fullName: z.string().min(2, m.nameRequired).max(200),
    email: z.string().email(m.emailInvalid),
    phone: z.string().min(7, m.phoneRequired).max(30),
    grade: z.string().min(1, m.gradeRequired),
    section: z.string().min(1, m.sectionRequired),
    studentId: z.string().optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    profilePhoto: z.string().optional(),
    firstChoicePositionId: z.string().min(1, m.selectPosition),
    technicalInterests: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    expertise: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    experience: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    leadershipExperience: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    projects: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    competitions: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    githubUrl: urlOptional(m),
    portfolioUrl: urlOptional(m),
    otherLinks: urlOptional(m),
    motivation: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly),
    positionReason: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly),
    contribution: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly),
    proposedActivities: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly),
    timeCommitment: z.string().min(1, m.required),
    confirm: z.literal(true, { message: m.confirmAccuracy }),
  });
}

export function buildMemberSchema(m: V = en.validation) {
  return z.object({
    fullName: z.string().min(2, m.fullNameRequired).max(200),
    email: z.string().email(m.emailInvalid),
    phone: z.string().min(7, m.phoneRequired).max(30),
    grade: z.string().min(1, m.gradeRequired),
    section: z.string().min(1, m.sectionRequired),
    studentId: z.string().min(1, m.studentIdRequired).max(50),
    role: z.string().min(1, m.roleRequired),
    githubUrl: urlOptional(m),
    isLeader: z.boolean().optional(),
  });
}

export function buildHackathonSchema(m: V = en.validation) {
  return z.object({
    teamName: z.string().min(2, m.teamNameRequired).max(150),
    projectTitle: z.string().min(2, m.projectTitleRequired).max(200),
    category: z.string().min(1, m.categoryRequired),
    description: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly),
    problemStatement: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    solution: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    technologyStack: z.string().refine(englishOnly(m), m.englishOnly).optional(),
    projectIdeaSummary: z.string().min(20, m.ideaSummaryRequired).refine(englishOnly(m), m.englishOnly),
    members: z.array(buildMemberSchema(m)).length(3, m.exactly3Members),
    confirmInfo: z.literal(true, { message: m.confirmInfo }),
    confirmScratch: z.literal(true, { message: m.confirmScratch }),
  }).superRefine((data, ctx) => {
    const emails = data.members.map(x=>x.email.toLowerCase());
    const ids = data.members.map(x=>x.studentId.toLowerCase());
    if (new Set(emails).size !== 3) ctx.addIssue({ code:"custom", message:m.dupEmail, path:["members"]});
    if (new Set(ids).size !== 3) ctx.addIssue({ code:"custom", message:m.dupStudentId, path:["members"]});
    const leaders = data.members.filter(x=>x.isLeader || x.role==="Team Leader");
    if (leaders.length !== 1) ctx.addIssue({ code:"custom", message:m.oneLeader, path:["members"]});
    if (!(data.members[0]?.isLeader || data.members[0]?.role==="Team Leader")) ctx.addIssue({ code:"custom", message:m.firstLeader, path:["members"]});
  });
}

export function buildFinalSubmissionSchema(m: V = en.validation) {
  return z.object({
    repositoryUrl: urlRequired(m),
    documentationUrl: urlRequired(m),
    finalDemoUrl: urlOptional(m),
    finalDescription: z.string().min(20, m.minLength20).refine(englishOnly(m), m.englishOnly).optional().or(z.literal("")),
    aiToolsUsed: z.string().refine(englishOnly(m), m.englishOnly).optional().or(z.literal("")),
    originalWorkConfirmed: z.literal(true, { message: m.confirmOriginal }),
  });
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// English defaults (used by server actions without a locale and by admin flows).
export const boardApplicationSchema = buildBoardApplicationSchema();
export const memberSchema = buildMemberSchema();
export const hackathonSchema = buildHackathonSchema();
export const finalSubmissionSchema = buildFinalSubmissionSchema();
