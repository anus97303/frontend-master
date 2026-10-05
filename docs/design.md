# Design (UI/UX)

## Principles
- Clean admin-dashboard look; data-heavy screens ke liye readability pehle.
- Consistent patterns: har module = List (table + filters) -> Create/Edit (form drawer ya page) -> Detail.
- Minimal clicks: attendance aur marks entry bulk/grid based.

## Layout
- **Sidebar** (collapsible) role ke hisaab se menu; **Topbar** (academic year switcher, search, profile).
- Content max width fluid; tables horizontal scroll on small screens.

## Theme Tokens (Tailwind)
- Primary: indigo-600 | Success: green-600 | Warning: amber-500 | Danger: red-600 | Neutral: slate scale
- Font: Inter. Radius: `rounded-lg`. Spacing: 4px grid.
- Light mode first; dark mode optional later.
- Status badges: Present=green, Absent=red, Late=amber, Leave=blue; Paid=green, Partial=amber, Unpaid=red.

## Reusable Components
`DataTable` (server-side pagination, sort, search), `FilterBar`, `FormField` (RHF + Zod), `Select/Combobox`, `DatePicker`, `ConfirmDialog`, `StatCard`, `StatusBadge`, `EmptyState`, `PageHeader`, `FileUpload`, `Toast`.

## Key Screens
1. **Login** (role redirect after login)
2. **Dashboard** — admin: total students/teachers, today attendance %, fee collected vs pending, upcoming exams, notices. Teacher: aaj ki classes, attendance pending. Parent: bache ka summary.
3. **Students** — list (class/section/status filters), add/edit form (tabs: Basic, Guardian, Documents), profile page (attendance, fees, results tabs).
4. **Attendance** — class+section+date select -> student grid, default Present, toggle P/A/L/Leave, "Mark all present", save.
5. **Fees** — structure setup, generate vouchers, collect payment (search student -> pending vouchers -> receipt print), pending report.
6. **Exams** — create exam, marks entry grid (subject-wise, keyboard friendly), report card preview/PDF.
7. **Timetable** — weekly grid per class/teacher with conflict warnings.
8. **Reports** — filter + table + Export CSV/PDF.

## UX Rules
- Har form: inline validation errors, disabled submit while loading, success/error toast.
- Destructive actions par confirm dialog.
- Loading = skeletons, empty = EmptyState with CTA.
- Accessible: labels, focus states, keyboard navigation for grids.
