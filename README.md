# RVA3D

RVA3D is a Next.js + React Three Fiber application boostrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) that renders interactive 3D scenes alongside a standard React UI layer.  

The project uses the App Router, Prisma for database access, Zustand for client-state, and modern Three.js tooling via `@react-three/fiber` and `@react-three/drei`.

This README gives you a **quick overview**, **setup instructions**, and **common workflows**.

---

## 🚀 Features

- **Interactive 3D Scenes** using `@react-three/fiber` + `@react-three/drei`
- **Modular App Router** with `(three)` routes dedicated to 3D views
- **Prisma-powered database layer**
- **Auth-ready** (Next.js route handlers under `app/api/`)
- **Zustand** for lightweight global state
- **Highly structured project architecture** (see `ARCHITECTURE.md`)
- **Strict code quality guidelines** (see `Repository Guidelines.md`)

---

## 📦 Tech Stack

| Layer | Tools |
|------|-------|
| Framework | Next.js App Router, React 18 |
| 3D Engine | Three.js + @react-three/fiber + @react-three/drei |
| State | Zustand |
| Database | Prisma ORM | Notion CMS
| Styling | Tailwind or CSS Modules (depending on the project) |
| Types | TypeScript everywhere |

---

Notion is being used to drive the content in the Portfolio and Portal sections of the site.

For the Portal, there are 4 databases being used:
Notion databases:

Projects (database NOTION_PROJECTS_DB_ID=5081bb38eafa4e9588e15a1245ea8cea)
 Name
 Clients (relation to Companies database)
 Status
 --Inquiry
 --Upcoming
 --Active
 --With Client
 --On Hold
 --Perpetual
 --Ready To Invoice
 --Invoiced
 --Archived
 --Cancelled
 Summary (text)
 Client Visible (formula that outputs checkbox)
 Hide Project (checkbox to completely turn off client visibility)
 Invoices (relation to Invoices database)
 Project Dates (contains start and end date data as well as times of day)
 Category (select)
 --Work Project
 --Passion Project
 --Life Project
 --Admin Work
 Archive Drive (relation to Archive Drives database)
 Job Number (internal string for folder naming in windows)
 Project ID (url permalink name - automation generates once from Name property and does not change)
 Created (there is no property called Published or publishedAt. Notion uses Created instead)
 Blocked By (relation to Projects)
 Is Blocking (erlation to Projects)
 Completion (rollup of Mileston database's Status property calculating percent per group)
 Priority (select)
 --Optional
 --Low Priority
 --Medium Priority
 --Mandatory
 --Top Priority
 Milestones (relation to Milestons database)
 Files & Media (originally intended for delivery files but now using Posts database to store client-viewable media)
 Outputs (redundant and originally for link to hosted video on google drive)
 Parent Project (relation to Projects)
 Portal Page (relation to Portal Pages database)
 
 
 Portal Users (database NOTION_PORTAL_DB_ID=1fba9ba2f2588048a693c5e1ffd85db0)
 Name
 User ID (text, manual entry)
 Status
 --Inactive
 --Active
 --Archived
 username (display-friendly name - Firstname Lastname for example)
 email (email property type - manual entry)
 Notes (text)
 Content (text)
 Work Projects (relation to Projects database)
 Client (rollup from Projects)
 Created (Created time property)
 Slug (text)
 Profile Image (Files and Media for user avatar)
 
 
 Posts (database NOTION_POSTS_DB_ID=2aaa9ba2f25880049ba9c299d0c9607d)
 Name
 Status (for both internal and external approvals)
 --New Content
 --Draft
 --Internal QC
 --CQ Feedback
 --Client Review
 --Client Feedback
 --Approved
 --Rejected
 --Reviewed
 --Void
 Summary (text)
 Caveats (text)
 Internal Notes (text - may opt to have notes be another feedback comment in Post page)
 Tags (multiselect  - not currently being used but may want another way to filter Posts)
 Link (URL link to output/download file)
 Project (relation to Projects database)
 Client (rollup from projects)
 Created (Created time. Notion does not use the term "publish" for this database property)
 Post ID (url permalink name - automation generates once from Name property and does not change)
Passcode (formula that generates a unique passcode for each post)
 Milestone (relation to Milestones database)
 Client Feedback (relation to Client Feedback database)
 Category (select)
 --Internal Post
 --WIP Post
 --Rough for Review
 --Delivery for Review
 --Deliverables 
 
 Client Feedback (database NOTION_FEEDBACK_DB_ID=2aaa9ba2f25880f8845ef13b0094801b)
 Name
 Category (I have not filled out the options for this, nor am I sure if I need it)
 Post (relation to Posts database)
 Message (text)
 Internal Notes (not sure I need this... they could just be comment entries same as the client message. I know the database is called Client Feedback but it could contain internal feedback as well.)
 Status
 --Comment
 --Needs Changes
 --Approved
 Approved (checkbox)
 Author Name (Created by property)
 Author Email (email property)
 Role (select)
 --Studio
 --Client
 Attachments (Files & Media)
 Created (Created time)
 No ID (unique integer generated for each entry in the DB)
 Portal Pages (relation)
 Timecode (Number)
 TimecodeFormatted (formula to display timecode in min:sec)

 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
