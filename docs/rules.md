# Rules (AI Coding Agent + Team)

## General
1. Kaam shuru karne se pehle `prd.md`, `architecture.md`, `task.md`, `memory.md` parho. Jo in files mein nahi hai woh assume mat karo — poochho.
2. Ek waqt mein **ek task** (task.md se). Scope se bahar features mat banao.
3. Har task ke baad `task.md` update karo (checkbox) aur `memory.md` mein decisions/changes likho.
4. Naya package install karne se pehle justify karo; already available option prefer karo.

## TypeScript
- `strict: true`. `any` mana hai (zaroorat ho to `unknown` + narrowing, aur comment likho kyun).
- Shared types/schemas `packages/shared` mein; client aur server dono wahi use karein. Types duplicate mat karo.
- No unused vars/imports; ESLint + Prettier clean hona chahiye.

## Backend
- Layering follow karo: route -> controller -> service -> model. Controller mein business logic nahi.
- Har endpoint par Zod validation (body, params, query).
- Har protected route par `authenticate` + `authorize(roles)`. Resource-level ownership check (teacher/parent).
- Errors: `ApiError` + central handler. Raw `try/catch` + `res.status` har jagah mat likho; `asyncHandler` use karo.
- Passwords/tokens/secrets kabhi log ya response mein nahi.
- Mongoose: indexes explicitly define karo (unique constraints architecture.md ke mutabiq). List queries mein pagination mandatory, `.lean()` jahan read-only.
- Money: integers (paisa/rupee whole) store karo, floats nahi. Dates UTC.
- Important changes (fees, marks, attendance edit, delete) audit log mein jayen.
- Multi-document updates (payment + voucher status) par transaction ya atomic update use karo.

## Frontend
- Server data = TanStack Query; Zustand sirf auth/UI state ke liye.
- Forms = React Hook Form + shared Zod schema.
- API calls sirf `src/api` ke through; components mein direct axios nahi.
- Feature-based folders; reusable UI `components/` mein.
- Har list: loading, empty, error state handle ho.

## Naming & Style
- Files: `kebab-case.ts` (components `PascalCase.tsx`). Variables camelCase, types PascalCase, constants UPPER_SNAKE.
- Collections plural camelCase; routes plural kebab (`/fee-vouchers`).
- Commits: Conventional Commits (`feat(students): add admission form`).
- Comments sirf "kyun" batane ke liye, "kya" nahi.

## Testing
- Services ke liye unit tests; critical flows (auth, fee payment, attendance unique rule, marks calc) ke liye API integration tests.
- Naya bug fix = pehle failing test.

## Security
- helmet, CORS whitelist (CLIENT_URL), rate limit on auth routes, refresh token rotation, input sanitize, file upload type/size limit.

## Definition of Done
Code compile ho (no TS errors), lint clean, tests pass, endpoint/screen manually verify, task.md + memory.md updated.

## Don't
- Hardcoded secrets, `console.log` leftovers, giant files (>300 lines split karo), copy-paste duplicate logic, schema change bina architecture.md update kiye.
