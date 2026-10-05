# Architecture

## Stack
- **Backend:** Node.js 20+, Express, TypeScript (strict), Mongoose, Zod (validation), JWT, bcrypt, pino (logging), helmet, cors, express-rate-limit
- **Frontend:** React 18 + Vite + TypeScript, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS, shadcn/ui (or equivalent), Axios, Zustand (auth/UI state only)
- **DB:** MongoDB (Atlas or local), Mongoose ODM
- **Tooling:** pnpm workspaces, ESLint, Prettier, Vitest/Jest + Supertest (API), Husky (optional)
- **PDF/Export:** pdfkit or puppeteer (report cards, receipts), csv via fast-csv

## Monorepo Layout
```
sms/
├─ docs/                 # prd, architecture, design, rules, task, memory
├─ packages/
│  └─ shared/            # shared Zod schemas, types, enums, constants
├─ server/
│  ├─ src/
│  │  ├─ config/         # env.ts (zod-validated), db.ts
│  │  ├─ middlewares/    # auth, rbac, validate, error, rateLimit
│  │  ├─ modules/
│  │  │  └─ <module>/    # model.ts, schema.ts, controller.ts, service.ts, routes.ts, tests
│  │  ├─ utils/          # ApiError, asyncHandler, pagination, pdf
│  │  ├─ app.ts
│  │  └─ server.ts
│  └─ package.json
├─ client/
│  ├─ src/
│  │  ├─ api/            # axios instance + per-module hooks
│  │  ├─ components/     # ui/ (primitives), common/ (DataTable, FormField...)
│  │  ├─ features/<module>/  # pages, components, hooks, types
│  │  ├─ layouts/        # AuthLayout, DashboardLayout
│  │  ├─ routes/         # route config + guards
│  │  ├─ store/
│  │  └─ main.tsx
│  └─ package.json
└─ package.json / pnpm-workspace.yaml
```

## Backend Layering
`route -> validate(zod) -> auth -> rbac -> controller -> service -> model`
- Controller: req/res only. Business logic **service** mein. DB access service/model mein.
- Sab errors `ApiError` throw karein; ek central error middleware JSON format return kare.
- Standard response: `{ success, data, message?, meta? }` ; errors: `{ success:false, error:{ code, message, details? } }`

## Auth
- Access token (15m) in memory/Authorization header; refresh token (7d) httpOnly secure cookie, rotated, hash DB mein store.
- RBAC: `authorize(...roles)` middleware + resource-level checks (teacher -> apni class; parent -> apne bache).

## Data Model (core collections)
| Collection | Key fields | Notes |
|---|---|---|
| users | email, passwordHash, role, isActive, linkedId | role-based login |
| academicYears | name, start, end, isCurrent | |
| classes | name, order | Grade 1.. |
| sections | classId, name, capacity, classTeacherId | unique(classId,name) |
| subjects | name, code, classIds[] | |
| students | admissionNo, name, dob, gender, classId, sectionId, rollNo, parentIds[], status, documents[] | unique admissionNo; unique(sectionId, rollNo) |
| parents | name, relation, phone, email, cnic?, studentIds[], userId | |
| teachers | name, qualification, experience, subjectIds[], assignments[{classId,sectionId,subjectId}], userId | |
| attendance | date, entityType(student/teacher), entityId, classId?, sectionId?, status, remarks | unique(entityType, entityId, date) |
| feeHeads | name, type(monthly/one-time) | |
| feeStructures | classId, academicYearId, items[{headId, amount}] | |
| feeVouchers | studentId, month, items[], total, concession, paid, status, dueDate | unique(studentId, month) |
| payments | voucherId, amount, method, receiptNo, receivedBy, date | receiptNo sequential |
| exams | name, academicYearId, classId, startDate, endDate | |
| examSubjects | examId, subjectId, totalMarks, passMarks | |
| marks | examId, studentId, subjectId, obtained | unique(examId, studentId, subjectId) |
| timetables | classId, sectionId, day, period, subjectId, teacherId, roomId | unique teacher/room per (day,period) |
| notices | title, body, audience[], publishedAt, createdBy | |
| auditLogs | userId, action, entity, entityId, before, after, at | |
(Library, Transport, Staff, Events: Phase 5 — design tab banega jab shuru ho.)

## API Conventions
- Base: `/api/v1/<module>`; REST (GET list with `?page&limit&search&sort&filters`, GET :id, POST, PATCH :id, DELETE :id — soft delete jahan records important hon).
- IDs: Mongo ObjectId string. Dates ISO 8601 UTC.

## Environment
`server/.env`: PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, NODE_ENV
`client/.env`: VITE_API_URL
Env hamesha Zod se validate ho startup par.

## Deployment (later)
Server: Docker/VPS ya Render/Railway. Client: Vercel/Netlify. DB: MongoDB Atlas. CI: lint + typecheck + test on PR.
