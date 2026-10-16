# School Management System (MERN) & TailAdmin React Pro

A full-stack, enterprise-grade **School Management System** built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Node.js**, **Express**, and **MongoDB (Mongoose)**.

---

## 🌟 Key Features

- **Multi-Role Access Control (RBAC)**: Distinct permissions for `admin`, `teacher`, `student`, and `parent`.
- **School Dashboard**: Live KPI cards (Students, Teachers, Classes, Fees), weekly attendance charts (ApexCharts), recent admissions, upcoming exam term widgets, and institutional noticeboard.
- **Students Management**:
  - Full CRUD with automated ID generator (`STU-YYYY-XXXX`).
  - Search, class filter, pagination, student avatar uploads, guardian contact info.
  - Dedicated **Student Profile Page**: Tabular bio, attendance percentage tracker, exam report cards, and fee payment history.
- **Teachers & Faculty**:
  - Full CRUD with automated ID generator (`TCH-YYYY-XXXX`).
  - Department filtering, class teacher designations, contact info, and assigned classes.
- **Classes & Sections**:
  - Manage classes, sections, room numbers, student capacities, and assigned class teachers.
  - Subject mappings with weekly period allocations.
- **Daily Attendance System**:
  - Class-wise daily attendance roster.
  - Statuses: `Present`, `Absent`, `Late`, `Leave`.
  - One-click "Mark All Present" & bulk database sync.
  - Duplicate check: strict one attendance record per student per date.
- **Examinations & Marksheet Matrix**:
  - Exam term scheduling (Midterm, Final, Quarterly).
  - Class marksheet grid with live auto-grading:
    - `A+` ($\ge 90\%$)
    - `A` ($\ge 80\%$)
    - `B` ($\ge 70\%$)
    - `C` ($\ge 60\%$)
    - `D` ($\ge 50\%$)
    - `F` ($< 50\%$)
  - **Printable Student Report Card Modal** with total marks, percentage, and teacher remarks.
- **Fee Management**:
  - Auto-generated receipt numbers (`REC-YYYY-XXXX`).
  - Record full or partial payments across cash, card, bank transfer, and online.
  - Status tracking: `Paid`, `Partial`, `Pending`, `Cancelled`.
  - Soft-cancellation with mandatory audit reason (fee records are immutable).
  - **Printable Payment Receipt Modal**.
- **Notice Board / Announcements**:
  - Role-targeted broadcasts (`All`, `Teacher`, `Student`, `Parent`).
  - Priority levels (`Low`, `Medium`, `High`).
- **Institutional Settings**:
  - School profile, logo/seal, academic year, grading scale, and multi-language switching (`en`, `ar`, `es`, `de`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>= 20.19.0` or `>= 22.12.0`
- **MongoDB**: Local MongoDB community server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

---

### Step 1: Backend Setup & Database Seeding

1. Navigate to the backend directory:
   ```bash
   cd server
   ```

2. Dependencies are already installed (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`, `dotenv`, `express-validator`, `helmet`, `express-rate-limit`, `morgan`).
   If starting fresh:
   ```bash
   npm install
   ```

3. Ensure `.env` is configured (a pre-configured `.env` and `.env.example` are provided):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/school_management
   JWT_SECRET=supersecretjwtkey_school_management_2026_antigravity
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **Seed the database** with sample data:
   ```bash
   node seed/seed.js
   ```
   *Creates 1 Admin, 3 Teachers, 4 Classes, 8 Subjects, 20 Students, 30 days of attendance, exam marks, fees, and notices.*

5. **Start the backend server**:
   ```bash
   npm run dev
   # or
   node server.js
   ```
   Backend runs at: `http://localhost:5000`

---

### Step 2: Frontend Setup

1. In the root directory (`frontend-master/`):
   ```bash
   npm install
   ```

2. Run the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

3. Or build for production:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔑 Demo Login Accounts

The database seed provides ready-to-test demo credentials:

| Role | Email | Password | Quick Login |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | Click **"Demo Admin"** on the Sign In page |
| **Teacher** | `sarah.johnson@school.com` | `teacher123` | Click **"Demo Teacher"** on the Sign In page |
| **Student** | `student1@school.com` | `student123` | Click **"Demo Student"** on the Sign In page |

---

## 📁 Repository Structure

```
frontend-master/
├── server/                               # Node.js + Express + MongoDB Backend
│   ├── config/db.js                      # Mongoose database connection
│   ├── controllers/                      # auth, dashboard, student, teacher, class,
│   │                                     # attendance, exam, fee, notice, settings
│   ├── models/                           # User, Student, Teacher, Class, Subject,
│   │                                     # Attendance, Exam, Result, Fee, Notice, Settings
│   ├── routes/                           # Express REST route definitions
│   ├── middleware/                       # auth (JWT), role guard, validator, upload, error
│   ├── utils/                            # response standardizer, idGenerator, gradeCalculator
│   ├── seed/seed.js                      # Comprehensive database seeder
│   ├── .env                              # Backend configuration
│   └── server.js                         # Express entrypoint
├── src/                                  # React 19 Frontend
│   ├── pages/School/                     # School module pages
│   │   ├── SchoolDashboard.tsx           # Institutional dashboard & analytics
│   │   ├── Students/                     # StudentList.tsx, StudentProfile.tsx
│   │   ├── Teachers/                     # TeacherList.tsx
│   │   ├── Classes/                      # ClassList.tsx
│   │   ├── Attendance/                   # AttendanceManage.tsx
│   │   ├── Exams/                        # ExamList.tsx
│   │   ├── Fees/                         # FeeManage.tsx
│   │   ├── Notices/                      # NoticeList.tsx
│   │   └── Settings/                     # SchoolSettings.tsx
│   ├── components/school/                # Modals, Skeletons, EmptyStates, Printable Views
│   ├── services/api.ts                   # Native fetch client with auto Bearer token
│   ├── context/AuthContext.tsx           # Authentication state & role checks
│   ├── routes/ProtectedRoute.tsx         # Route protection & role guard
│   └── locales/                          # Full i18n support in en, ar, es, de
├── API.md                                # Complete REST API specification
└── School_Management_System.postman_collection.json # Exported Postman collection
```

---

## 🧪 Testing with Postman

1. Open Postman and import `School_Management_System.postman_collection.json`.
2. The collection is configured with `{{baseUrl}}` pointing to `http://localhost:5000/api`.
3. Running the **Auth > Login (Admin)** request automatically extracts the JWT token and saves it into the collection variable `{{token}}` for all subsequent requests.

---

## 🛡️ Coding & Architectural Standards

- **Strict AGENTS.md Compliance**:
  - CSS logical properties used throughout (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`).
  - No physical direction utilities (`ml-*`, `mr-*`, `left-*`, `right-*`).
  - Tailwind v4 `@theme` tokens only.
  - Dark mode supported on all screens (`dark:` variants).
  - Native browser `fetch` used in `src/services/api.ts` without extra dependencies.
- **Security**:
  - Helmet security headers, CORS origin restriction, rate-limiting on authentication routes.
  - Passwords hashed with `bcryptjs` (salt rounds: 10), never returned in responses.
  - Soft deletion (`isActive: false`) preserves database integrity.
  - Fee transactions have an immutable audit trail.
