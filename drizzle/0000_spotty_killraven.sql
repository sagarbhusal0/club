CREATE TABLE "board_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_number" varchar(30) NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"grade" varchar(50) NOT NULL,
	"section" varchar(50) NOT NULL,
	"student_id" varchar(50),
	"date_of_birth" varchar(20),
	"profile_photo" text,
	"first_choice_position_id" uuid,
	"second_choice_position_id" uuid,
	"technical_interests" text,
	"expertise" text,
	"experience" text,
	"leadership_experience" text,
	"projects" text,
	"competitions" text,
	"github_url" text,
	"portfolio_url" text,
	"other_links" text,
	"motivation" text NOT NULL,
	"position_reason" text NOT NULL,
	"contribution" text NOT NULL,
	"proposed_activities" text NOT NULL,
	"time_commitment" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'SUBMITTED' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "board_applications_application_number_unique" UNIQUE("application_number")
);
--> statement-breakpoint
CREATE TABLE "board_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" varchar(10) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "board_positions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hackathon_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"grade" varchar(50) NOT NULL,
	"section" varchar(50) NOT NULL,
	"student_id" varchar(50) NOT NULL,
	"role" varchar(100) NOT NULL,
	"github_url" text,
	"is_leader" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_number" varchar(30) NOT NULL,
	"team_name" varchar(150) NOT NULL,
	"project_title" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"problem_statement" text,
	"solution" text,
	"technology_stack" text,
	"project_idea_summary" text,
	"idea_status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"final_demo_url" text,
	"repository_url" text,
	"documentation_url" text,
	"ai_tools_used" text,
	"original_work_confirmed" boolean DEFAULT false NOT NULL,
	"final_submitted_at" timestamp,
	"is_final_submitted" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'REGISTERED' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hackathon_teams_team_number_unique" UNIQUE("team_number"),
	CONSTRAINT "hackathon_teams_team_name_unique" UNIQUE("team_name")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'ADMIN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "board_applications" ADD CONSTRAINT "board_applications_first_choice_position_id_board_positions_id_fk" FOREIGN KEY ("first_choice_position_id") REFERENCES "public"."board_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_applications" ADD CONSTRAINT "board_applications_second_choice_position_id_board_positions_id_fk" FOREIGN KEY ("second_choice_position_id") REFERENCES "public"."board_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_members" ADD CONSTRAINT "hackathon_members_team_id_hackathon_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."hackathon_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ba_email_idx" ON "board_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ba_status_idx" ON "board_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ba_student_id_idx" ON "board_applications" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hm_student_id_unique" ON "hackathon_members" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hm_email_unique" ON "hackathon_members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "hm_team_id_idx" ON "hackathon_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "ht_status_idx" ON "hackathon_teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ht_category_idx" ON "hackathon_teams" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ht_idea_status_idx" ON "hackathon_teams" USING btree ("idea_status");--> statement-breakpoint
CREATE INDEX "ht_final_submitted_idx" ON "hackathon_teams" USING btree ("is_final_submitted");