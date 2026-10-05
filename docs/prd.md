# PRD — School Management System (SMS)

## 1. Goal
Ek web-based system jo school ke academic, administrative aur financial kaam digitally manage kare: students, teachers, classes, attendance, fees, exams, timetable, parents, communication, reports.

## 2. Users & Roles
| Role | Access |
|---|---|
| Super Admin / Admin | Sab kuch, users + settings |
| Principal | Read-all, reports, notices |
| Teacher | Apni classes, attendance, marks entry, timetable |
| Accountant | Fees, receipts, fee reports |
| Parent | Sirf apne bachon ka data (attendance, fees, results, notices) |
| Student (optional, Phase 4) | Apna result, timetable, notices |
| Librarian (Phase 5) | Library module |

## 3. Scope — Phases
**MVP (Phase 1–3)** — pehle yahi ship karna hai:
1. Auth + RBAC + Users
2. Academic setup: Academic Year, Classes, Sections, Subjects
3. Students (admission, profile, class/section assignment, promotion/transfer/withdrawal)
4. Parents/Guardians (linked to students)
5. Teachers (profile, subject/class assignment)
6. Attendance (student + teacher; present/absent/late/leave; monthly summary)
7. Fees (fee structure, vouchers, payments, receipts, pending, concession/scholarship)
8. Exams & Results (exam, marks entry, grade, report card PDF)

**Phase 4:** Timetable (conflict detection), Notices/Communication, Reports hub, Parent/Student portal
**Phase 5 (optional):** Staff (non-teaching), Library, Transport, Events
**Out of scope (abhi):** Payment gateway, SMS/WhatsApp gateway, mobile app, multi-school (SaaS) tenancy, biometric attendance.

## 4. Functional Requirements (key)
- **Student:** unique admission no., roll no. per class-section, status (active/promoted/transferred/withdrawn), documents upload.
- **Attendance:** ek student ka ek din ka ek record (unique index). Teacher sirf apni assigned class ka mark kare. Bulk mark UI.
- **Fees:** fee head -> fee structure per class -> monthly voucher generation -> payment (partial allowed) -> receipt. Paid/partial/unpaid status. Concession per student.
- **Results:** exam -> subject-wise total marks -> marks entry -> auto total/percentage/grade -> report card. Grade scale configurable.
- **Timetable:** teacher ya room same period mein double-book nahi ho sakta.
- **Reports:** CSV + PDF export; filters (class, section, date range, status).
- **Audit:** create/update/delete on fees, marks, attendance ka audit log.

## 5. Non-Functional
- TypeScript strict, end-to-end.
- Pagination + search + filter har list par.
- API response < 500ms for typical list (indexed queries).
- Password hashing (bcrypt/argon2), JWT access + refresh, rate limiting, input validation (Zod) har endpoint par.
- Responsive UI (desktop first, tablet usable).
- Daily DB backup (documented process).

## 6. Success Criteria (MVP)
- Admin ek class ka poora admission -> attendance -> fee voucher -> exam result cycle bina manual register ke chala sake.
- Parent login karke apne bache ki attendance/fee/result dekh sake.

## 7. Open Questions (decide before Phase 3)
- Single school hai ya multi-school? (Default: single school.)
- Fee voucher monthly auto-generate chahiye ya manual button?
- Grading scale (A+/A/B...) aur pass percentage kya hai?
- Language: English UI only ya Urdu bhi?
