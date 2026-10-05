# Tasks
Format: `[ ]` todo, `[~]` in progress, `[x]` done. Ek waqt mein ek task.

## Phase 0 — Foundation
- [ ] 0.1 Monorepo init (pnpm workspace: server, client, packages/shared), tsconfig base, ESLint, Prettier
- [ ] 0.2 Server skeleton: Express app, env validation (Zod), MongoDB connect, pino logger, helmet/cors/rate-limit
- [ ] 0.3 Core utils: ApiError, asyncHandler, error middleware, validate middleware, pagination helper, response helper
- [ ] 0.4 Client skeleton: Vite + React + TS, Tailwind, shadcn/ui, Router, TanStack Query, Axios instance
- [ ] 0.5 Health check endpoint + client se connectivity verify

## Phase 1 — Auth & Users
- [ ] 1.1 User model, register-by-admin, login, refresh (rotation), logout, me
- [ ] 1.2 authenticate + authorize(roles) middleware
- [ ] 1.3 Seed script: first admin user
- [ ] 1.4 Client: Login page, auth store, protected routes, role-based sidebar, DashboardLayout
- [ ] 1.5 Users management (admin): list/create/disable

## Phase 2 — Academic Setup
- [ ] 2.1 Academic Year CRUD (+ current flag)
- [ ] 2.2 Classes & Sections CRUD (capacity, class teacher)
- [ ] 2.3 Subjects CRUD + class mapping
- [ ] 2.4 Client screens for all above

## Phase 3 — Core Modules (MVP)
- [ ] 3.1 Students: model, CRUD, search/filter, admission no. generation, class/section assign, status changes
- [ ] 3.2 Parents: CRUD, link to students, parent user account
- [ ] 3.3 Teachers: CRUD, subject/class assignments, teacher user account
- [ ] 3.4 Attendance: bulk mark, edit, monthly summary, frequent-absentee list (student + teacher)
- [ ] 3.5 Fees: heads, structures, voucher generation, payments, receipts (PDF), pending report, concessions
- [ ] 3.6 Exams: exams, exam subjects, marks entry grid, grade calculation, report card PDF
- [ ] 3.7 Dashboard stats (admin/teacher)
- [ ] 3.8 Audit log for fees/marks/attendance

## Phase 4 — Communication & Portal
- [ ] 4.1 Timetable (conflict detection)
- [ ] 4.2 Notices (audience targeted)
- [ ] 4.3 Reports hub (CSV/PDF export)
- [ ] 4.4 Parent portal (own children only), Student portal

## Phase 5 — Optional
- [ ] 5.1 Staff management  - [ ] 5.2 Library  - [ ] 5.3 Transport  - [ ] 5.4 Events

## Phase 6 — Hardening
- [ ] 6.1 Test coverage on critical flows  - [ ] 6.2 Security review  - [ ] 6.3 Dockerfile + deployment  - [ ] 6.4 Backup process doc
