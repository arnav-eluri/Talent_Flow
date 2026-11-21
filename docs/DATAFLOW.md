# Data Flow

## 1. Request Lifecycle

Every UI interaction that reads or writes data follows this path:

```
User action (click, form submit)
        │
        ▼
React component
  calls useQuery() or useMutation() hook
        │
        ▼
React Query
  checks cache (useQuery) or fires immediately (useMutation)
        │
        ▼
api.ts  ──  request(path, options)
  prepends Authorization: Bearer <token>
  sets Content-Type: application/json
        │
        ▼
fetch()  →  http://localhost:3001/api/<path>
        │
        ▼
Express middleware stack
  cors()
  express.json()
  jwtMiddleware  →  verifies token, sets req.user
        │
        ▼
Route handler  (e.g. candidates.ts)
  reads / mutates in-memory array
  calls persist() after mutation
        │
        ▼
JSON response  { data }  or  { error }
        │
        ▼
React Query
  on success: updates cache, triggers re-render
  on mutation: calls invalidateQueries([key])
        │
        ▼
UI re-renders with fresh data
```

---

## 2. Authentication Token Flow

```
┌──────────────┐        POST /api/auth/login         ┌──────────────┐
│   Login form │  ─────────────────────────────────► │   Express    │
│              │  { email, password }                 │   /auth      │
│              │ ◄──────────────────────────────────  │              │
│              │  { token, user }                     │  bcrypt.compare
└──────┬───────┘                                      │  jwt.sign    │
       │                                              └──────────────┘
       │ store in localStorage
       │   talentflow_token = <jwt>
       │   talentflow_user  = { id, name, role, … }
       │
       ▼
┌──────────────┐
│ AuthContext  │  isAuthenticated = true
│              │  user = { id, name, role, … }
└──────┬───────┘
       │
       │  Every API call thereafter:
       ▼
┌──────────────┐        GET /api/candidates           ┌──────────────┐
│   api.ts     │  ─────────────────────────────────► │   Express    │
│              │  Authorization: Bearer <jwt>         │   JWT check  │
│              │                                      │              │
│              │ ◄────────────────────────────────── │  req.user =  │
│              │  200 { data }                        │  { userId,   │
└──────────────┘                                      │   role }     │
                                                      └──────────────┘

On 401:
  AuthContext.logout()
    → clears localStorage
    → React Router redirects to /login
```

---

## 3. Candidate Pipeline Flow

A candidate progresses through six statuses. Each transition is a `PUT /api/candidates/:id` call with the new `status` field.

```
                    ┌─────────┐
  Apply             │   new   │  Initial state on creation
  ──────────────►   └────┬────┘
                         │  HR reviews application
                         ▼
                    ┌──────────┐
  Screen            │screening │  Phone screen / resume review
  ──────────────►   └────┬─────┘
                         │  Invite to interview
                         ▼
                    ┌───────────┐
  Interview         │ interview │  One or more interview rounds
  ──────────────►   └─────┬─────┘
                          │  POST /api/interviews/:id/feedback
                          │  (feedback.recommendation drives next step)
                          ▼
                    ┌────────┐
  Extend offer      │ offer  │  Offer letter sent
  ──────────────►   └───┬────┘
                        │
              ┌─────────┴───────────┐
              ▼                     ▼
         ┌────────┐           ┌──────────┐
         │ hired  │           │ rejected │
         └────┬───┘           └──────────┘
              │
              │  Convert to employee
              │  POST /api/employees
              ▼
         Employee record created
         Status: 'onboarding'

At any stage:
  PUT /api/candidates/:id  { status: 'rejected' }
  → moves directly to rejected
```

---

## 4. Interview Scheduling & Feedback Flow

```
1. SCHEDULE
   HR creates interview
   POST /api/interviews
   { candidateId, scheduledAt, type, interviewers, duration }
   → Interview.status = 'scheduled'

2. CONDUCT
   Interview takes place (outside the system)

3. RECORD FEEDBACK
   POST /api/interviews/:id/feedback
   {
     rating: 4,
     strengths: ['clear communicator'],
     weaknesses: ['limited backend experience'],
     recommendation: 'hire',
     notes: '...'
   }
   → Interview.status = 'completed'
   → Interview.feedback = { … }

4. ANALYTICS UPDATE
   Next GET /api/analytics recomputes hiringTrend
   using interviews with status='completed' timestamps
```

---

## 5. Document Upload Flow

```
Browser                    api.ts              Express            Disk
   │                          │                   │                │
   │  user picks file         │                   │                │
   │  <input type="file">     │                   │                │
   │                          │                   │                │
   │  uploadDocument(         │                   │                │
   │    file, type, name)     │                   │                │
   │─────────────────────────►│                   │                │
   │                          │  POST             │                │
   │                          │  /api/documents   │                │
   │                          │  /upload          │                │
   │                          │  multipart/form-  │                │
   │                          │  data             │                │
   │                          │──────────────────►│                │
   │                          │                   │  multer:       │
   │                          │                   │  validate MIME │
   │                          │                   │  enforce 10MB  │
   │                          │                   │───────────────►│
   │                          │                   │  write file    │
   │                          │                   │  uuid-name.pdf │
   │                          │                   │◄───────────────│
   │                          │                   │                │
   │                          │                   │  create Document
   │                          │                   │  record        │
   │                          │                   │  persist to    │
   │                          │                   │  data/documents│
   │                          │                   │  .json         │
   │                          │◄──────────────────│                │
   │                          │  { id, name, url }│                │
   │◄─────────────────────────│                   │                │
   │                          │                   │                │
   │  invalidateQueries        │                   │                │
   │  (['documents'])          │                   │                │
   │  → list re-fetches        │                   │                │
```

---

## 6. Analytics Computation Flow

The analytics endpoint performs a full in-memory scan on every request. There is no stored snapshot.

```
GET /api/analytics
       │
       ▼
Route handler reads from module-level arrays:
  candidates[]    (loaded from data/candidates.json at startup)
  employees[]     (loaded from data/employees.json at startup)
       │
       ▼
Compute metrics:

  totalEmployees  = employees.filter(e => e.status !== 'inactive').length

  newHires        = employees.filter(e =>
                      new Date(e.startDate) > 30 days ago
                    ).length

  openPositions   = candidates.filter(c =>
                      ['new','screening','interview','offer'].includes(c.status)
                    ).length

  turnoverRate    = (inactive / total) * 100

  departmentMetrics = group employees by department → {
                      name, headcount, openPositions,
                      avgPerformance, turnoverRate
                    }

  hiringTrend     = last 6 calendar months → {
                      month: 'Jan',
                      hires: employees started that month,
                      departures: employees set inactive that month (0 if not tracked)
                    }
       │
       ▼
Return AnalyticsData JSON — no DB query, no cache
```

> **Note:** Because analytics is computed at request time, adding an employee or updating a candidate status is immediately reflected on the next dashboard load without any extra invalidation.

---

## 7. React Query Cache Invalidation

After every mutation, the client tells React Query which cached queries are now stale. React Query refetches them automatically on the next render.

| Mutation | Invalidated queries |
|---|---|
| Create / update / delete candidate | `['candidates']`, `['analytics']` |
| Create / update / delete / feedback interview | `['interviews']`, `['analytics']` |
| Create / update / delete employee | `['employees']`, `['analytics']` |
| Create / update onboarding task | `['onboarding']` |
| Create / update offboarding task | `['offboarding']` |
| Upload / delete document | `['documents']` |
| Update own profile | `['users', 'me']` |

**Pattern used in every mutation:**
```ts
const mutation = useMutation({
  mutationFn: (data) => api.createCandidate(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  },
});
```
