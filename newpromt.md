You are a senior full-stack engineer working on the ICT Mavi Imiliya Club portal.

IMPORTANT:
This is an EXISTING Next.js project.

DO NOT rebuild the entire application from scratch.

First inspect the existing repository and understand its architecture, components, database layer, authentication, email system, validation, rate limiting, and existing routes.

Then implement the required changes cleanly while preserving existing functionality.

============================================================
PROJECT
============================================================

Project:
ICT Mavi Imiliya Club

Purpose:

1. Board Member Recruitment
2. School Management Hackathon Registration
3. Student Application/Registration Status Tracking
4. Admin Management

The portal should be production-quality but this implementation will initially use a SEPARATE EXPERIMENTAL Neon PostgreSQL database.

============================================================
EXISTING STACK
============================================================

The existing project uses:

- Next.js 16.3.3
- App Router
- Turbopack
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- IBM Plex Sans / IBM Plex Mono
- Neon PostgreSQL
- @neondatabase/serverless
- Drizzle ORM
- Drizzle Kit
- jose JWT authentication
- bcryptjs
- HTTP-only auth cookie
- Nodemailer
- Brevo SMTP
- Zod
- React Hook Form
- ESLint
- Prettier
- tsx

Existing architecture and routes must be inspected before modifying them.

============================================================
EXPERIMENTAL DATABASE
============================================================

IMPORTANT:

Use a NEW Neon PostgreSQL database for this experiment.

DO NOT connect this experimental implementation to any production database.

The database URL must ONLY exist in an environment variable.

Create/update:

.env.local

with:

DATABASE_URL="YOUR_NEW_NEON_DATABASE_URL"

Never hardcode the database URL in:

- TypeScript
- JavaScript
- React components
- Server Actions
- API routes
- Git
- documentation
- client-side code

Never create:

NEXT_PUBLIC_DATABASE_URL

The database connection must remain server-side.

Add .env.local to .gitignore if it is not already ignored.

IMPORTANT SECURITY REQUIREMENT:

The Neon credential supplied by the project owner was exposed during configuration.

Do NOT place that credential directly into source code.

Use a placeholder in documentation and require the developer to place the actual rotated credential into .env.local.

The production database must NEVER be touched.

============================================================
DATABASE CONFIGURATION
============================================================

Use:

process.env.DATABASE_URL

with Neon + Drizzle.

The database must support:

- migrations
- schema generation
- seed data
- local development
- production deployment

Provide working commands:

npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:seed

If the current repository uses a slightly different naming convention, preserve the existing convention while ensuring equivalent commands are available.

============================================================
DATABASE SCHEMA
============================================================

Preserve useful existing schema where possible, but create a clean schema for the experimental database.

Required tables:

users
board_positions
board_applications
hackathon_teams
hackathon_members
settings

------------------------------------------------------------
users
------------------------------------------------------------

Fields:

id
name
email
passwordHash
role
createdAt
updatedAt

Roles:

ADMIN
APPLICANT

Email must be unique.

------------------------------------------------------------
board_positions
------------------------------------------------------------

Fields:

id
name
description
isActive
sortOrder
createdAt
updatedAt

Position names must be configurable.

------------------------------------------------------------
board_applications
------------------------------------------------------------

Fields:

id
applicationNumber
fullName
email
phone
grade
section
studentId
dateOfBirth
profilePhoto

firstChoicePositionId

technicalInterests
expertise
experience
leadershipExperience
projects
competitions

githubUrl
portfolioUrl
otherLinks

motivation
positionReason
contribution
proposedActivities
timeCommitment

status
adminNotes

createdAt
updatedAt

Application number format:

ICT-BOARD-YYYY-XXXX

Statuses:

SUBMITTED
UNDER_REVIEW
SHORTLISTED
INTERVIEW
SELECTED
WAITLISTED
REJECTED

------------------------------------------------------------
hackathon_teams
------------------------------------------------------------

Fields:

id
teamNumber
teamName

projectTitle
category
description
problemStatement
solution
technologyStack

projectIdeaSummary

ideaStatus

finalDemoUrl
repositoryUrl
documentationUrl

aiToolsUsed

originalWorkConfirmed

finalSubmittedAt
isFinalSubmitted

status
adminNotes

createdAt
updatedAt

Team number format:

ICT-HACK-YYYY-XXXX

Idea statuses:

PENDING
APPROVED
NEEDS_REVISION
REJECTED

Team statuses:

REGISTERED
UNDER_REVIEW
IDEA_REVIEW
APPROVED
NEEDS_REVISION
WAITLISTED
REJECTED
CHECKED_IN
FINAL_SUBMITTED
DISQUALIFIED

------------------------------------------------------------
hackathon_members
------------------------------------------------------------

Fields:

id
teamId

fullName
email
phone
grade
section
studentId
role
githubUrl
isLeader

createdAt
updatedAt

Every team MUST contain exactly 3 members.

One member MUST be the Team Leader.

Use:

isLeader = true

for exactly one member.

Database constraints should prevent duplicate student IDs and duplicate emails where appropriate.

============================================================
SETTINGS
============================================================

Use the existing settings table.

Required keys:

club_name
club_description
contact_email

board_opens
board_closes

hackathon_opens
hackathon_closes
hackathon_date
hackathon_categories

hackathon_max_teams
hackathon_members_per_team
hackathon_working_hours
hackathon_break_minutes

============================================================
HACKATHON CONFIGURATION
============================================================

Configure the experimental hackathon as follows:

Theme:

SCHOOL MANAGEMENT

Maximum teams:

9

Members per team:

3

Maximum participants:

27

Students:

Any class

Working time:

4 hours

Break:

30 minutes

Total event duration:

4 hours 30 minutes

Laptop rule:

Only the Team Leader may bring and use a laptop for the team's project.

Project requirement:

Every project must be created from scratch during the hackathon.

Uniqueness:

Every team's project must be unique from the other teams.

Documentation:

Mandatory.

============================================================
HACKATHON RULES
============================================================

The public hackathon rules must clearly state:

GENERAL:

- Theme is School Management.
- Maximum 9 teams.
- Exactly 3 members per team.
- Students from any class can participate.
- Each participant can join only one team.
- Every team must have one Team Leader.

PROJECT:

- Project must relate to School Management.
- Project must be created from scratch during the hackathon.
- Every team must create a unique project.
- Teams cannot copy another team's idea.
- Teams cannot copy another team's code.
- Teams cannot submit a completed pre-existing project.

TEAMWORK:

- All 3 members must contribute.
- Team Leader coordinates the team.
- Team members can collaborate through research, planning, design, testing, documentation, presentation, and feedback.

LAPTOP:

- Participants may bring a laptop only for the hackathon.
- Only the Team Leader may bring/use a laptop for the team's project.
- Other members collaborate without independently developing on another laptop.
- Unauthorized laptops must not be used.

AI:

- AI tools are allowed.
- ChatGPT, Gemini, Claude, GitHub Copilot and similar tools may be used.
- Students must understand their project.
- Judges may ask any team member about the implementation.

DOCUMENTATION:

Documentation is mandatory.

Required documentation:

- Team Name
- Project Name
- Team Members
- Problem Statement
- Target Users
- Proposed Solution
- Main Features
- Technology Stack
- How the Project Works
- Screenshots/Demo
- Challenges Faced
- Future Improvements

FINAL SUBMISSION:

Each team must submit:

- Working project
- Source code/repository
- Documentation
- Demo URL where applicable
- Team information

Once final submission is locked, teams cannot make further changes to required final materials unless an administrator explicitly unlocks the submission.

============================================================
PROJECT CATEGORIES
============================================================

Provide configurable categories such as:

- Student Management
- Attendance
- Teacher Management
- Exam & Results
- Timetable
- Homework & Assignments
- Library Management
- Fee Management
- Parent-School Communication
- Event Management
- Inventory Management
- Transport Management
- Student Performance
- School Analytics
- AI-powered School Management
- Other

Do not force teams to select only these categories.

Allow an "Other" category with custom description.

============================================================
PROJECT UNIQUENESS SYSTEM
============================================================

Uniqueness is a major feature.

During registration, every team must provide:

projectIdeaSummary

The summary should clearly explain:

- What problem they are solving
- Who experiences the problem
- What makes their solution different

Admin must review project ideas.

Admin can set:

PENDING
APPROVED
NEEDS_REVISION
REJECTED

Admin notes should explain why an idea needs revision.

Do NOT attempt to automatically determine uniqueness using unreliable keyword matching.

Admin review is authoritative.

If two teams have substantially similar ideas, the organizer can request one team to modify its idea.

============================================================
MAXIMUM 9 TEAMS
============================================================

There must never be more than 9 valid registered teams.

Server-side validation is mandatory.

Before creating a team:

- Check the current number of registered teams.
- If 9 teams already exist, reject registration.

Show:

"All 9 hackathon team slots have been filled."

Handle race conditions safely.

Do not rely only on frontend counting.

Use database transaction/locking/appropriate constraints where practical.

Admin dashboard must show:

X / 9 teams registered

and:

X / 27 participants

============================================================
TEAM REGISTRATION
============================================================

Route:

/hackathon/register

Build a multi-step form.

STEP 1:

Team Information

Fields:

- Team Name
- Project Title
- Category
- Project Description
- Problem Statement
- Proposed Solution
- Technology Stack
- Project Idea Summary

STEP 2:

Team Leader

Fields:

- Full Name
- Email
- Phone
- Grade/Class
- Section
- Student ID
- GitHub URL
- Role = Team Leader

STEP 3:

Member 2

Fields:

- Full Name
- Email
- Phone
- Grade/Class
- Section
- Student ID
- Role
- GitHub URL

STEP 4:

Member 3

Same fields.

STEP 5:

Confirmation

Display complete team information.

Require:

"I confirm that the information provided is correct."

Require:

"I confirm that this project will be created from scratch during the hackathon."

Submit only after all validations pass.

============================================================
EXACTLY 3 MEMBERS
============================================================

Server must reject:

1 member
2 members
4 members
5+ members

Only exactly 3 members are valid.

The database must contain exactly 3 members for every valid team.

One and only one member must be:

isLeader = true

============================================================
DUPLICATE PREVENTION
============================================================

Prevent:

- Duplicate team name
- Duplicate student ID
- Duplicate email
- Same student joining multiple teams
- Duplicate member inside a team

Use:

- Zod validation
- Server validation
- Database constraints
- Transactions

Do not rely only on client-side checks.

Friendly error:

"This student is already registered in another team."

============================================================
REGISTRATION TRANSACTION
============================================================

Team registration must be atomic.

Use a database transaction:

1. Verify registration is open.
2. Verify fewer than 9 teams.
3. Validate team data.
4. Validate exactly 3 members.
5. Check duplicates.
6. Create team.
7. Create 3 members.
8. Generate team number.
9. Commit transaction.
10. Send confirmation email.

If any database operation fails:

- Roll back the entire registration.
- Do not create a partial team.

============================================================
TEAM NUMBER
============================================================

Generate:

ICT-HACK-YYYY-XXXX

Example:

ICT-HACK-2026-0001

Team number must be unique.

Avoid unsafe sequential generation that can create duplicates during concurrent registration.

============================================================
REGISTRATION STATUS
============================================================

Create:

/hackathon

The page should show:

- Hackathon title
- School Management theme
- Description
- Team limit
- Team size
- Registration status
- Rules
- Judging criteria
- Register button

Registration status:

OPEN
COMING_SOON
CLOSED

Use settings rather than hardcoding.

============================================================
HACKATHON STATUS LOOKUP
============================================================

Route:

/hackathon/status

Allow lookup using:

- Team ID
OR
- Member email

Do not require both.

Example:

ICT-HACK-2026-0001

Display:

- Team name
- Project title
- Registration status
- Project idea status
- Final submission status
- Admin note where appropriate

Do not expose sensitive personal information.

============================================================
SUCCESS PAGE
============================================================

Route:

/hackathon/success?teamNumber=...

Show:

Registration Successful

Team ID:

ICT-HACK-2026-0001

Show:

- Team name
- Project title
- Team leader
- Number of members
- Current status

Tell the Team Leader to save the Team ID.

============================================================
FINAL SUBMISSION
============================================================

Create a final submission flow.

Required:

- Repository URL
- Documentation URL
- Demo URL
- Final project description
- Original work confirmation

Require:

originalWorkConfirmed = true

Set:

isFinalSubmitted = true

Set:

finalSubmittedAt = current timestamp

Once final submission is complete:

- Prevent accidental editing.
- Show "Final Submission Locked".
- Allow admin override if necessary.

============================================================
DOCUMENTATION
============================================================

Documentation submission is mandatory.

The portal should provide a form for:

Project Documentation URL

Required documentation should contain:

1. Team Name
2. Project Name
3. Members
4. Problem Statement
5. Target Users
6. Proposed Solution
7. Main Features
8. Technology Stack
9. System Overview
10. Screenshots/Demo
11. Challenges
12. Future Improvements

Validate documentation URL.

Do not create complex file storage unless the existing infrastructure already supports it.

A URL-based documentation submission is sufficient.

============================================================
ADMIN DASHBOARD
============================================================

Complete:

/admin/teams

and:

/admin/teams/[id]

The current project contains empty team detail placeholders.

Implement them fully.

Admin team list:

- Search
- Pagination
- Status filter
- Category filter
- Idea status filter
- Final submission filter

Columns:

- Team ID
- Team Name
- Project
- Category
- Members
- Idea Status
- Team Status
- Final Submission
- Created At

============================================================
ADMIN TEAM DETAIL
============================================================

Show:

TEAM:

- Team ID
- Team Name
- Project Title
- Category
- Description
- Problem
- Solution
- Technology Stack

IDEA:

- Project Idea Summary
- Idea Status
- Admin Notes

MEMBERS:

- Full Name
- Email
- Phone
- Class
- Section
- Student ID
- Role
- Team Leader indicator

SUBMISSION:

- Repository
- Demo
- Documentation
- AI tools
- Original work confirmation
- Final submission time
- Submission status

ADMIN ACTIONS:

- Approve idea
- Request revision
- Reject idea
- Approve team
- Change status
- Add admin note
- Mark checked-in
- Mark final submitted
- Disqualify

============================================================
ADMIN DASHBOARD STATISTICS
============================================================

Add:

Total Teams
Available Slots
Total Participants
Approved Teams
Pending Ideas
Needs Revision
Final Submissions
Disqualified Teams

Show:

Teams:
7 / 9

Participants:
21 / 27

============================================================
BOARD RECRUITMENT
============================================================

Preserve the existing board recruitment system.

Do not break:

- Board application
- Application status lookup
- Position management
- Admin application management
- Email notifications
- Existing validation

The board recruitment system should continue working independently from the hackathon system.

============================================================
ADMIN AUTHENTICATION
============================================================

Preserve the existing authentication system.

Use:

jose
JWT
HTTP-only auth cookie
bcryptjs

Admin routes must remain protected.

Use:

requireAdmin()

Never trust client-side admin checks.

============================================================
EMAIL SYSTEM
============================================================

Reuse the existing Nodemailer/Brevo architecture.

Create/update templates for:

Hackathon registration received
Idea approved
Idea needs revision
Idea rejected
Team approved
Team rejected
Final submission received
Team disqualified

Send registration confirmation to Team Leader.

Do not create a second email system.

If SMTP is not configured:

- Use existing mock fallback.
- Do not break registration.

============================================================
RATE LIMITING
============================================================

Reuse existing rate limiting.

Protect:

- Hackathon registration
- Status lookup
- Final submission
- Admin broadcast
- Login

Do not introduce an incompatible second rate limiter.

============================================================
SECURITY
============================================================

Follow secure coding practices.

Requirements:

- Server-side authorization
- Server-side validation
- Zod
- Database constraints
- Transactions
- Rate limiting
- HTTP-only cookies
- No secrets in client
- No database URL in client
- No stack traces to users
- No raw database errors to users

Never trust:

- Client-provided admin status
- Client-provided team count
- Client-provided member count
- Client-provided team status

Verify everything server-side.

============================================================
UI/UX
============================================================

Preserve the existing design language.

Use:

- Zinc palette
- Indigo primary CTA
- Rounded 16–20px cards
- IBM Plex Sans
- IBM Plex Mono where appropriate
- Existing UI components
- Touch-friendly controls
- Responsive layouts

Do not redesign the entire website.

The new hackathon pages should feel native to the existing portal.

Registration should be mobile-friendly.

Students should be able to complete registration from a phone.

Use:

- Progress indicators
- Clear labels
- Inline errors
- Loading states
- Empty states
- Success states
- Confirmation dialogs
- Accessible controls

============================================================
PUBLIC HACKATHON RULES
============================================================

Create a clear rules section containing:

GENERAL:

- 9 teams maximum
- 3 members per team
- Any class
- One team per participant
- One Team Leader

PROJECT:

- School Management theme
- Build from scratch
- Unique project required
- No copying

LAPTOP:

- Only Team Leader may bring/use laptop for the project

TIME:

- 4 hours working time
- 30 minute break
- 4 hours 30 minutes total event duration

AI:

- AI tools allowed
- Participants must understand their work

DOCUMENTATION:

- Mandatory

FINAL SUBMISSION:

- Working project
- Source code
- Documentation
- Demo where applicable

============================================================
JUDGING
============================================================

Use these exact criteria:

Problem Understanding — 15%

Originality & Uniqueness — 20%

Innovation & Creativity — 15%

Technical Implementation — 20%

Practical Usefulness — 15%

UI/UX — 5%

Documentation & Presentation — 10%

TOTAL — 100%

Display these publicly.

============================================================
PROHIBITED ACTIVITIES
============================================================

Clearly display:

- Copying another team's project
- Copying source code
- Copying another team's idea
- Submitting a pre-built project
- Unauthorized devices
- Unauthorized outside developers
- Unauthorized access to systems
- Hacking school systems
- Attacking hackathon infrastructure
- Damaging another team's work
- Plagiarism
- Cheating
- Serious misconduct

============================================================
DISQUALIFICATION
============================================================

A team may be disqualified for:

- Plagiarism
- Copied work
- Pre-built project
- More/fewer than 3 members
- Participant joining multiple teams
- Unauthorized device use
- Unauthorized outside assistance
- Hacking
- Interference with another team
- False information
- Serious misconduct
- Rule violations

Organizers and judges have final authority.

============================================================
DATABASE SEED
============================================================

Create safe test seed data.

Seed:

- One test admin
- Board positions
- Club settings
- Hackathon settings
- Hackathon categories

Do NOT seed real student information.

Use clearly fake/test values.

For example:

ADMIN_EMAIL=admin@example.com

Do not expose real credentials in the repository.

============================================================
ENVIRONMENT VARIABLES
============================================================

Create/update:

.env.example

Example:

DATABASE_URL=
AUTH_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=

NEXT_PUBLIC_CLUB_NAME=ICT Mavi Imiliya Club
NEXT_PUBLIC_SITE_URL=http://localhost:3000

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
EMAIL_FROM_NAME=

Do not put real credentials in .env.example.

============================================================
DATABASE COMMANDS
============================================================

Ensure:

npm run db:generate

npm run db:migrate

npm run db:push

npm run db:studio

npm run db:seed

work correctly.

============================================================
TESTING
============================================================

Before declaring the implementation complete, test all of these.

TEAM:

- 1 member rejected
- 2 members rejected
- 3 members accepted
- 4 members rejected

DUPLICATES:

- Duplicate team name rejected
- Duplicate email rejected
- Duplicate student ID rejected
- Same student in another team rejected

LIMIT:

- Teams 1–9 accepted
- Team 10 rejected

IDEA:

- Pending
- Approve
- Request revision
- Reject

SUBMISSION:

- Missing repository rejected
- Missing documentation rejected
- Missing original-work confirmation rejected
- Valid final submission accepted
- Final submission locks correctly

STATUS:

- Team ID lookup
- Email lookup
- Invalid lookup
- Rate limiting

ADMIN:

- Unauthorized user blocked
- Admin can list teams
- Admin can view team
- Admin can update status
- Admin can update idea status
- Admin can add notes
- Admin can review final submission

SECURITY:

- DATABASE_URL not exposed
- Admin routes protected
- Server-side validation active
- Transactions active
- No raw DB errors shown

============================================================
BUILD VALIDATION
============================================================

After implementation:

1. Run TypeScript check.
2. Run ESLint.
3. Run production build.
4. Fix all TypeScript errors.
5. Fix all ESLint errors.
6. Fix all build errors.
7. Verify Drizzle schema.
8. Verify migrations.
9. Verify seed.
10. Verify Neon connection.
11. Verify all public routes.
12. Verify all admin routes.
13. Verify mobile UI.

Do not declare completion while the project has build errors.

============================================================
IMPORTANT EXISTING CODEBASE NOTES
============================================================

The existing project already contains:

- Board recruitment
- Board application form
- Application status lookup
- Hackathon status lookup
- Admin dashboard
- Admin application management
- Admin team management
- Settings
- Email infrastructure
- Rate limiting
- Authentication

The existing hackathon registration is currently disabled.

The existing HackathonForm exists but is not currently used.

The existing hackathon status helper is currently hardcoded CLOSED.

The existing admin team detail page is currently only a placeholder.

Implement the missing functionality instead of creating duplicate systems.

============================================================
EXPECTED FILE STRUCTURE
============================================================

Preserve the existing structure where possible.

Relevant structure:

src/
  app/
    hackathon/
      page.tsx
      register/
      status/
      success/

    admin/
      teams/
        page.tsx
        [id]/
          page.tsx

  components/
    ui.tsx
    Navbar.tsx
    Footer.tsx

  db/
    schema.ts
    index.ts
    seed.ts

  actions/
    hackathon.ts
    admin.ts

  lib/
    validation.ts
    auth.ts
    email.ts
    email-templates.ts
    ratelimit.ts
    utils.ts

Do not duplicate components unnecessarily.

Reuse existing UI components.

============================================================
IMPORTANT DEVELOPMENT PRINCIPLES
============================================================

1. Inspect before changing.
2. Preserve working features.
3. Do not rewrite the entire application.
4. Do not duplicate existing systems.
5. Keep business logic server-side.
6. Use TypeScript strictly.
7. Avoid any unless absolutely necessary.
8. Use reusable components.
9. Use database transactions.
10. Use database constraints.
11. Validate on both client and server.
12. Keep the UI simple and student-friendly.
13. Keep admin functionality powerful but clean.
14. Do not expose secrets.
15. Do not connect to production.
16. Do not leave core features as TODOs or placeholders.

============================================================
FINAL DELIVERABLE
============================================================

Deliver a fully working School Management Hackathon system integrated into the existing ICT Mavi Imiliya Club portal.

The finished system must support:

Student
↓
Register Team
↓
Exactly 3 Members
↓
Unique Project Idea
↓
Server Validation
↓
Neon PostgreSQL Transaction
↓
Team ID
↓
Email Confirmation
↓
Admin Idea Review
↓
Admin Team Review
↓
Hackathon Development
↓
Documentation
↓
Repository + Demo Submission
↓
Final Submission
↓
Judging

The result must be suitable for an actual school hackathon.

At the end, provide:

1. Summary of implementation
2. Files changed
3. Database schema changes
4. Migration commands
5. Seed commands
6. Environment variables
7. Routes added/changed
8. Testing performed
9. Any remaining limitations

Do not expose the actual database password or secrets in the final response.