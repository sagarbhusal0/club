import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("ADMIN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const boardPositions = pgTable("board_positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: varchar("sort_order", { length: 10 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const boardApplications = pgTable(
  "board_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationNumber: varchar("application_number", { length: 30 }).notNull().unique(),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    grade: varchar("grade", { length: 50 }).notNull(),
    section: varchar("section", { length: 50 }).notNull(),
    studentId: varchar("student_id", { length: 50 }),
    dateOfBirth: varchar("date_of_birth", { length: 20 }),
    profilePhoto: text("profile_photo"),
    firstChoicePositionId: uuid("first_choice_position_id").references(() => boardPositions.id),
    secondChoicePositionId: uuid("second_choice_position_id").references(() => boardPositions.id),
    technicalInterests: text("technical_interests"),
    expertise: text("expertise"),
    experience: text("experience"),
    leadershipExperience: text("leadership_experience"),
    projects: text("projects"),
    competitions: text("competitions"),
    githubUrl: text("github_url"),
    portfolioUrl: text("portfolio_url"),
    otherLinks: text("other_links"),
    motivation: text("motivation").notNull(),
    positionReason: text("position_reason").notNull(),
    contribution: text("contribution").notNull(),
    proposedActivities: text("proposed_activities").notNull(),
    timeCommitment: varchar("time_commitment", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("SUBMITTED"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("ba_email_idx").on(t.email),
    index("ba_status_idx").on(t.status),
    index("ba_student_id_idx").on(t.studentId),
  ]
);

export const hackathonTeams = pgTable(
  "hackathon_teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamNumber: varchar("team_number", { length: 30 }).notNull().unique(),
    teamName: varchar("team_name", { length: 150 }).notNull().unique(),
    projectTitle: varchar("project_title", { length: 200 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    description: text("description").notNull(),
    problemStatement: text("problem_statement"),
    solution: text("solution"),
    technologyStack: text("technology_stack"),
    projectIdeaSummary: text("project_idea_summary"),
    ideaStatus: varchar("idea_status", { length: 20 }).notNull().default("PENDING"),
    ideaReviewNotes: text("idea_review_notes"),
    finalDescription: text("final_description"),
    finalDemoUrl: text("final_demo_url"),
    repositoryUrl: text("repository_url"),
    documentationUrl: text("documentation_url"),
    aiToolsUsed: text("ai_tools_used"),
    originalWorkConfirmed: boolean("original_work_confirmed").notNull().default(false),
    finalSubmittedAt: timestamp("final_submitted_at"),
    isFinalSubmitted: boolean("is_final_submitted").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("REGISTERED"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("ht_status_idx").on(t.status),
    index("ht_category_idx").on(t.category),
    index("ht_idea_status_idx").on(t.ideaStatus),
    index("ht_final_submitted_idx").on(t.isFinalSubmitted),
  ]
);

export const hackathonMembers = pgTable(
  "hackathon_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => hackathonTeams.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    grade: varchar("grade", { length: 50 }).notNull(),
    section: varchar("section", { length: 50 }).notNull(),
    studentId: varchar("student_id", { length: 50 }).notNull(),
    role: varchar("role", { length: 100 }).notNull(),
    githubUrl: text("github_url"),
    isLeader: boolean("is_leader").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("hm_student_id_unique").on(t.studentId),
    uniqueIndex("hm_email_unique").on(t.email),
    index("hm_team_id_idx").on(t.teamId),
  ]
);

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hackathonTeamsRelations = relations(hackathonTeams, ({ many }) => ({
  members: many(hackathonMembers),
}));
export const hackathonMembersRelations = relations(hackathonMembers, ({ one }) => ({
  team: one(hackathonTeams, { fields: [hackathonMembers.teamId], references: [hackathonTeams.id] }),
}));
