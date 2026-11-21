# High Level Design

## 1. System Overview

TalentFlow is a role-based HR management platform covering the full employee lifecycle: sourcing candidates, scheduling interviews, converting hires into employees, managing onboarding/offboarding workflows, and storing HR documents. It is designed as a single-tenant SaaS with three user roles (HR Manager, Department Manager, Employee) and a real-time analytics layer computed from live data.

**Primary users:**
- HR Managers — full platform access, owns the hiring pipeline and compliance workflows
- Department Managers — manage candidates and employees within their department
- Employees — view their own record and upload personal documents

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               React SPA (Vite / port 5173)           │  │
│  │                                                      │  │
│  │  AuthContext ──► React Query ──► api.ts (fetch)      │  │
│  │       │                │                             │  │
│  │  localStorage      Query Cache                       │  │
│  │  (JWT token)       (invalidated on mutation)         │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │  HTTP / JSON  (port 3001)
                              │  Authorization: Bearer <jwt>
┌─────────────────────────────┼───────────────────────────────┐
│                        SERVER (Node.js)                      │
│                                                             │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │               Express API (port 3001)                │  │
│  │                                                      │  │
│  │  JWT Middleware ──► Route Handlers                   │  │
│  │                         │                            │  │
│  │              ┌──────────┴──────────┐                │  │
│  │              ▼                     ▼                 │  │
│  │        In-memory arrays      multer middleware       │  │
│  │        (data.ts)             (file uploads)          │  │
│  │              │                     │                 │  │
│  │        store.ts                    │                 │  │
│  └──────────────┬────────────────────┼─────────────────┘  │
└─────────────────┼────────────────────┼─────────────────────┘
                  │                    │
        ┌─────────▼──────┐   ┌────────▼────────┐
        │  data/*.json   │   │  server/uploads/ │
        │  (persistence) │   │  (binary files)  │
        └────────────────┘   └─────────────────┘
```

---

## 3. Component Boundaries

| Layer | Responsibility | Technology |
|---|---|---|
| **React SPA** | Rendering, routing, local auth state, server-state cache | React 18, React Router v6, React Query, Tailwind, shadcn/ui |
| **Express API** | Business logic, auth, validation, file handling | Express.js, TypeScript ESM, multer, jsonwebtoken, bcryptjs |
| **Persistence Layer** | Durable storage of all entity data | JSON files via custom `store.ts` |
| **File Storage** | Binary document storage | Local disk (`server/uploads/`) |
| **Auth** | Stateless token-based identity | JWT (HS256), bcryptjs (salt rounds 10) |

---

## 4. Tech Stack Rationale

| Choice | Rationale |
|---|---|
| **React Query** | Eliminates manual loading/error state, automatic background refetch, mutation-triggered cache invalidation — the right tool for server-state management |
| **JSON file persistence** | Zero external dependencies, works without a running database, persists across server restarts; suitable for single-tenant deployments and development |
| **JWT (stateless auth)** | No server-side session store needed; token carries role claim so every request is self-contained |
| **shadcn/ui** | Copies source into the project (not a black-box dependency), built on Radix primitives for accessibility, fully Tailwind-compatible |
| **Express ESM + tsx** | Native ES modules for consistent import semantics across frontend and backend; tsx watch replaces ts-node for faster restarts |
| **Recharts** | Composable chart primitives that integrate naturally with React state; lighter than Chart.js for this use case |

---

## 5. Role-Based Access Control

| Feature | HR Manager | Department Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard / Analytics | ✅ | ✅ | ❌ |
| Candidates — view | ✅ | ✅ | ❌ |
| Candidates — create/edit/delete | ✅ | ✅ | ❌ |
| Interviews — view | ✅ | ✅ | ❌ |
| Interviews — schedule/feedback | ✅ | ✅ | ❌ |
| Employees — view all | ✅ | ✅ | own record only |
| Employees — create/edit | ✅ | ✅ | ❌ |
| Onboarding workflows | ✅ | ✅ | ❌ |
| Offboarding workflows | ✅ | ❌ | ❌ |
| Documents — view | ✅ | ✅ | own only |
| Documents — upload | ✅ | ✅ | ✅ |
| Settings — own profile | ✅ | ✅ | ✅ |

Role is encoded in the JWT payload and enforced at the route level on the server. The frontend additionally hides nav items and UI controls not applicable to the current role.

---

## 6. Key Design Decisions

- **Computed analytics, not stored snapshots** — `GET /api/analytics` reads the live candidates and employees arrays on every request and computes all metrics in memory. This keeps analytics always accurate without a background job or denormalized counters.
- **In-memory arrays as the working set** — `data.ts` loads JSON files into module-level arrays at startup. All reads hit memory (fast); `store.ts` writes to disk after every mutation (durable). This avoids per-request file I/O.
- **Single JWT claim for role** — the role is embedded in the token at login. Role switches in the demo work by issuing a new token; in production this would require re-authentication.
- **multer to local disk** — uploaded files are served back via `express.static`. No third-party storage service is required for local/development use.
- **React Query as the only client cache** — there is no Redux or Zustand. All server state lives in the React Query cache; only auth (token + user object) lives in a React Context backed by localStorage.

---

## 7. Scalability Considerations

TalentFlow's current architecture is intentionally simple. Here is what changes at each scale threshold:

| Threshold | Bottleneck | Migration Path |
|---|---|---|
| Multi-user concurrency | JSON file writes are not atomic | Replace `store.ts` with PostgreSQL (pg or Drizzle ORM); in-memory arrays become DB queries |
| Multi-tenant | Single shared data directory | Add tenant ID to all entities; namespace JSON files or use row-level security in Postgres |
| File storage at scale | Local disk not shared across instances | Move `server/uploads/` to S3-compatible object storage (AWS S3, Cloudflare R2) |
| Session revocation | JWTs cannot be invalidated before expiry | Add Redis token blocklist, or switch to short-lived access tokens + refresh tokens |
| Analytics performance | Full in-memory scan on every request | Materialise metrics into a summary table on mutation, serve pre-computed snapshot |
| Horizontal scaling | In-memory arrays diverge across instances | Remove in-memory arrays entirely; all reads go to the database |
