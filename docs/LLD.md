# Low Level Design

## 1. Data Models

### User

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string | unique, UUID | Primary identifier |
| `email` | string | unique, required | Login credential |
| `password` | string | required, bcrypt hashed | Never returned to client |
| `name` | string | required | Display name |
| `role` | `'hr' \| 'manager' \| 'employee'` | required | Determines access level |
| `avatar` | string? | optional | URL to avatar image |
| `department` | string? | optional | Department name |

### Candidate

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string | unique | Primary identifier |
| `name` | string | required | Full name |
| `email` | string | required | Contact email |
| `phone` | string | required | Contact phone |
| `position` | string | required | Role applied for |
| `department` | string | required | Target department |
| `status` | enum | required | `new \| screening \| interview \| offer \| hired \| rejected` |
| `aiScore` | number | 0–100 | AI-computed fit score |
| `skills` | string[] | required | Tagged skill set |
| `experience` | number | years | Years of experience |
| `resumeUrl` | string? | optional | URL to uploaded resume |
| `appliedAt` | string | ISO 8601 | Application timestamp |
| `notes` | string? | optional | HR notes |

### Interview

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string | unique | Primary identifier |
| `candidateId` | string | FK → Candidate.id | Related candidate |
| `candidateName` | string | denormalised | For display without join |
| `position` | string | denormalised | For display without join |
| `scheduledAt` | string | ISO 8601 | Interview datetime |
| `duration` | number | minutes | Planned duration |
| `type` | enum | required | `phone \| video \| onsite \| ai` |
| `status` | enum | required | `scheduled \| completed \| cancelled` |
| `interviewers` | string[] | required | Interviewer names |
| `feedback` | InterviewFeedback? | optional | Added after completion |

### InterviewFeedback

| Field | Type | Description |
|---|---|---|
| `rating` | number (1–5) | Overall rating |
| `strengths` | string[] | Positive observations |
| `weaknesses` | string[] | Areas of concern |
| `recommendation` | enum | `strong_hire \| hire \| not_sure \| no_hire \| strong_no_hire` |
| `notes` | string | Free-form notes |

### Employee

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string | unique | Primary identifier |
| `name` | string | required | Full name |
| `email` | string | required | Work email |
| `phone` | string | required | Contact phone |
| `position` | string | required | Job title |
| `department` | string | required | Department |
| `manager` | string? | optional | Manager name |
| `startDate` | string | ISO 8601 | Employment start |
| `status` | enum | required | `active \| onboarding \| offboarding \| inactive` |
| `avatar` | string? | optional | Avatar URL |
| `skills` | string[] | required | Skill tags |
| `performanceScore` | number? | 0–5 | Last review score |

### OnboardingTask / OffboardingTask

| Field | Type | Description |
|---|---|---|
| `id` | string | Primary identifier |
| `employeeId` | string | FK → Employee.id |
| `title` | string | Task name |
| `description` | string | Details |
| `category` | enum | Onboarding: `documentation \| training \| equipment \| introduction \| compliance`; Offboarding: `exit_interview \| asset_return \| knowledge_transfer \| access_revoke \| final_pay` |
| `status` | enum | `pending \| in_progress \| completed` |
| `dueDate` | string | ISO 8601 deadline |
| `assignedTo` | string? | Assignee name |

### Document

| Field | Type | Description |
|---|---|---|
| `id` | string | Primary identifier |
| `name` | string | Display name |
| `type` | enum | `resume \| contract \| policy \| certificate \| other` |
| `uploadedBy` | string | Uploader's user ID |
| `uploadedAt` | string | ISO 8601 |
| `size` | number | File size in bytes |
| `url` | string | Served path (`/uploads/<filename>`) |
| `filename` | string? | Stored filename on disk |
| `employeeId` | string? | Associated employee |

---

## 2. API Reference

All authenticated endpoints require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | None | `{ email, password }` | `{ token, user }` | Log in, receive JWT |
| POST | `/api/auth/register` | None | `{ email, password, name, role }` | `{ token, user }` | Create account |

### Candidates

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/candidates` | ✅ | — | `Candidate[]` | List all candidates |
| POST | `/api/candidates` | ✅ | `Candidate` (minus id) | `Candidate` | Create candidate |
| PUT | `/api/candidates/:id` | ✅ | Partial `Candidate` | `Candidate` | Update candidate |
| DELETE | `/api/candidates/:id` | ✅ | — | `{ success }` | Delete candidate |

### Interviews

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/interviews` | ✅ | — | `Interview[]` | List all interviews |
| POST | `/api/interviews` | ✅ | `Interview` (minus id) | `Interview` | Schedule interview |
| PUT | `/api/interviews/:id` | ✅ | Partial `Interview` | `Interview` | Update interview |
| DELETE | `/api/interviews/:id` | ✅ | — | `{ success }` | Cancel interview |
| POST | `/api/interviews/:id/feedback` | ✅ | `InterviewFeedback` | `Interview` | Submit feedback |

### Employees

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/employees` | ✅ | — | `Employee[]` | List all employees |
| POST | `/api/employees` | ✅ | `Employee` (minus id) | `Employee` | Add employee |
| PUT | `/api/employees/:id` | ✅ | Partial `Employee` | `Employee` | Update employee |
| DELETE | `/api/employees/:id` | ✅ | — | `{ success }` | Remove employee |

### Onboarding / Offboarding

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/onboarding` | ✅ | — | `OnboardingTask[]` | List all tasks |
| POST | `/api/onboarding` | ✅ | `OnboardingTask` (minus id) | `OnboardingTask` | Create task |
| PUT | `/api/onboarding/:id` | ✅ | Partial `OnboardingTask` | `OnboardingTask` | Update task |
| GET | `/api/offboarding` | ✅ | — | `OffboardingTask[]` | List all tasks |
| POST | `/api/offboarding` | ✅ | `OffboardingTask` (minus id) | `OffboardingTask` | Create task |
| PUT | `/api/offboarding/:id` | ✅ | Partial `OffboardingTask` | `OffboardingTask` | Update task |

### Documents

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/documents` | ✅ | — | `Document[]` | List documents |
| POST | `/api/documents/upload` | ✅ | `multipart/form-data` (file, type, name) | `Document` | Upload file |
| DELETE | `/api/documents/:id` | ✅ | — | `{ success }` | Delete document |

### Analytics

| Method | Path | Auth | Response | Description |
|---|---|---|---|---|
| GET | `/api/analytics` | ✅ | `AnalyticsData` | Computed HR metrics |

`AnalyticsData` shape:
```ts
{
  totalEmployees: number;
  newHires: number;           // employees added in last 30 days
  openPositions: number;      // candidates with active status
  avgTimeToHire: number;      // days (placeholder, 0 when no data)
  turnoverRate: number;       // inactive / total * 100
  departmentMetrics: { name, headcount, openPositions, avgPerformance, turnoverRate }[];
  hiringTrend: { month, hires, departures }[];  // last 6 months
}
```

### Users

| Method | Path | Auth | Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/api/users/me` | ✅ | — | `User` (no password) | Get own profile |
| PUT | `/api/users/me` | ✅ | `{ name?, email? }` | `User` (no password) | Update own profile |

---

## 3. Frontend Component Tree

```
App
└── QueryClientProvider
    └── TooltipProvider
        ├── Toaster (shadcn toast)
        ├── Sonner (sonner toast)
        ├── Preloader (initial load only)
        └── BrowserRouter
            └── AuthProvider
                └── Routes
                    ├── /login         → Login
                    ├── /signup        → SignUp
                    └── ProtectedRoute → AppLayout
                        ├── Sidebar
                        │   ├── Logo / collapse button
                        │   ├── NavGroups (Main / Workflows / Other)
                        │   └── UserFooter (avatar, name, role, logout)
                        ├── Header
                        │   ├── Page title (dynamic, from route)
                        │   ├── Search input
                        │   ├── Role switcher dropdown
                        │   └── Avatar menu
                        └── <main>  (scrollable)
                            ├── /              → Dashboard
                            │   ├── StatCard ×4
                            │   ├── HiringChart
                            │   ├── DepartmentMetrics
                            │   ├── RecentCandidates
                            │   └── UpcomingInterviews
                            ├── /candidates    → CandidatesPage
                            ├── /interviews    → Interviews
                            ├── /employees     → Employees
                            ├── /onboarding    → Onboarding
                            ├── /offboarding   → Offboarding
                            ├── /documents     → Documents
                            ├── /analytics     → Analytics
                            ├── /settings      → Settings
                            └── *              → NotFound
```

---

## 4. State Management

### Server State — React Query

| Query Key | Source | Refetch trigger |
|---|---|---|
| `['analytics']` | `GET /api/analytics` | Manual invalidation |
| `['candidates']` | `GET /api/candidates` | After create/update/delete |
| `['interviews']` | `GET /api/interviews` | After create/update/delete/feedback |
| `['employees']` | `GET /api/employees` | After create/update/delete |
| `['onboarding']` | `GET /api/onboarding` | After create/update |
| `['offboarding']` | `GET /api/offboarding` | After create/update |
| `['documents']` | `GET /api/documents` | After upload/delete |

### Client State — AuthContext

```ts
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<boolean>;
  logout(): void;
  switchRole(role: UserRole): void;   // demo only
  updateUser(updates: Partial<User>): void;
}
```

Token and user are persisted to `localStorage` under keys `talentflow_token` and `talentflow_user`. On app load, AuthContext re-hydrates from localStorage before rendering any protected routes.

---

## 5. Authentication Flow

```
1. User submits login form
   POST /api/auth/login  { email, password }

2. Server
   a. Finds user by email in users array
   b. bcrypt.compare(password, user.password)
   c. Signs JWT: { userId, email, role }  exp: 7d
   d. Returns { token, user (no password) }

3. Client
   a. Stores token in localStorage['talentflow_token']
   b. Stores user in localStorage['talentflow_user']
   c. AuthContext sets isAuthenticated = true
   d. React Router redirects to /

4. Subsequent requests
   api.ts prepends: Authorization: Bearer <token>

5. Server JWT middleware (every protected route)
   a. Reads Authorization header
   b. jwt.verify(token, JWT_SECRET)
   c. Sets req.user = decoded payload
   d. 401 if missing or invalid

6. 401 handling (client)
   AuthContext.logout() clears localStorage → redirect to /login
```

---

## 6. File Upload Flow

```
1. User selects file in Documents page
   <input type="file" accept=".pdf,.doc,.docx,.txt">

2. Component builds FormData
   formData.append('file', file)
   formData.append('type', selectedType)
   formData.append('name', fileName)

3. api.uploadDocument(file, type, name)
   POST /api/documents/upload
   Content-Type: multipart/form-data
   Authorization: Bearer <token>

4. Server — multer middleware
   - Validates MIME type (pdf, word, text only)
   - Enforces 10MB size limit
   - Writes to server/uploads/<uuid>-<originalname>

5. Route handler
   - Creates Document record with url = /uploads/<filename>
   - Pushes to documents array
   - persist('documents', documents)

6. Response
   { id, name, type, url, size, uploadedAt, uploadedBy }

7. Client
   - React Query invalidates ['documents']
   - File appears in documents list with download link
```

---

## 7. Persistence Layer

`server/src/store.ts` provides two functions:

```ts
// Load entity array from JSON, seeding with defaults on first run
load<T>(name: string, seed: T[]): T[]

// Write entity array to JSON after every mutation
persist(name: string, data: unknown): void
```

**File path resolution:**
```
server/src/store.ts
  → path.join(__dirname, '../../data', `${name}.json`)
  → resolves to: <project-root>/data/<name>.json
```

**Startup sequence:**
```
1. server/src/data.ts imports from store.ts
2. load('users', defaultUsers) — reads data/users.json if exists, else writes seed
3. load('candidates', [])      — reads data/candidates.json if exists, else creates empty
4. ... (same for all entities)
5. Module-level arrays are ready; server starts accepting requests
```

**Write path (example — create candidate):**
```ts
candidates.push(newCandidate);     // mutate in-memory array
persist('candidates', candidates); // write to data/candidates.json synchronously
res.json(newCandidate);
```

The `data/` directory is gitignored. It is created automatically by the first `persist()` call.
