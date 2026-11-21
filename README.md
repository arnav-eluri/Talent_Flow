# TalentFlow

> Modern HR management — from sourcing to offboarding, in one place.

![MIT License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff)

TalentFlow is a full-stack HR SaaS application for managing the complete employee lifecycle — candidate tracking, interview scheduling, onboarding, offboarding, and document management. It ships with role-based access control for HR managers, department heads, and employees, and a real-time analytics dashboard driven entirely by live data.

---

## Screenshot

> Add a screenshot here (`public/screenshot.png`) once the app is running.

---

## Features

- 🧑‍💼 **Candidate Pipeline** — track applicants from sourcing through offer with AI-scored profiles
- 📅 **Interview Management** — schedule phone, video, on-site, and AI interviews; record structured feedback
- 👥 **Employee Directory** — full employee records with performance scores and department grouping
- ✅ **Onboarding Workflows** — task checklists across documentation, training, equipment, and compliance
- 🚪 **Offboarding Workflows** — structured exit process including asset return and access revocation
- 📄 **Document Management** — upload and classify HR documents with per-role access control
- 📊 **Analytics Dashboard** — live metrics: headcount, time-to-hire, turnover rate, hiring trend chart
- 🔐 **Role-Based Access** — HR Manager, Department Manager, and Employee roles with scoped views
- 💾 **Zero-Config Persistence** — JSON file store, no database setup required
- 🎨 **Design System** — deep forest teal palette, Aptos font, shadcn/ui components

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui (Radix), React Query, React Router v6, Recharts |
| **Backend** | Node.js 20, Express.js, TypeScript (ESM), tsx watch |
| **Auth** | JWT (Bearer token), bcryptjs |
| **Storage** | JSON file persistence (`data/*.json`), multer for file uploads |
| **Font** | Aptos (Windows 11 system font), Segoe UI fallback |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+ (or bun)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/talentflow.git
cd talentflow

# 2. Install frontend dependencies
npm install

# 3. Install server dependencies
cd server && npm install && cd ..
```

### Environment Variables

Copy `.env.example` to `.env` in the server directory and set a JWT secret:

```bash
cp .env.example server/.env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Express server port |
| `JWT_SECRET` | — | Secret key for signing JWTs (**required in production**) |
| `VITE_API_URL` | `http://localhost:3001` | Backend URL used by the Vite dev proxy |

### Running the App

Open two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev
# → http://localhost:3001

# Terminal 2 — frontend
npm run dev
# → http://localhost:5173
```

Both servers must be running. The frontend proxies `/api/*` to the backend.

---

## Demo Credentials

Two accounts are seeded automatically on first run:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `demo123` | HR Manager |
| `manager@example.com` | `demo123` | Department Manager |

You can switch roles at any time using the **Role** switcher in the top-right header without logging out.

---

## Project Structure

```
talentflow/
├── docs/                   # Architecture and design documentation
│   ├── HLD.md              # High Level Design
│   ├── LLD.md              # Low Level Design
│   ├── DATAFLOW.md         # Data flow diagrams
│   └── USER_FLOW.md        # User journey flows
│
├── public/                 # Static assets served by Vite
│   ├── favicon.svg
│   └── robots.txt
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # Route handlers (auth, candidates, employees, …)
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── data.ts         # In-memory arrays seeded from JSON
│   │   ├── store.ts        # JSON persistence helpers
│   │   ├── types.ts        # Shared TypeScript types
│   │   └── index.ts        # Express entry point
│   ├── uploads/            # Uploaded files (gitignored)
│   └── package.json
│
├── src/                    # React frontend
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── layout/         # AppLayout, Header, Sidebar
│   │   └── dashboard/      # Dashboard widgets
│   ├── contexts/           # AuthContext
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client (api.ts), utilities
│   ├── pages/              # Page components
│   ├── types/              # Frontend TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── data/                   # JSON persistence files (gitignored, auto-created)
├── .env.example            # Environment variable template
├── LICENSE
└── README.md
```

---

## Documentation

Detailed technical documentation lives in [`docs/`](docs/):

| Document | Description |
|---|---|
| [High Level Design](docs/HLD.md) | System architecture, component boundaries, RBAC, design decisions |
| [Low Level Design](docs/LLD.md) | Data models, full API reference, component tree, state management |
| [Data Flow](docs/DATAFLOW.md) | Request lifecycle, auth token flow, pipeline transitions, cache invalidation |
| [User Flow](docs/USER_FLOW.md) | HR Manager journey, candidate pipeline, onboarding/offboarding, role switching |

---

## Configuration

The following config files live in the **project root** by convention — this is required by their respective tools and is not disorganization:

| File | Tool | Why it must be in root |
|---|---|---|
| `vite.config.ts` | Vite | Vite resolves config relative to `process.cwd()` |
| `tailwind.config.ts` | Tailwind CSS | PostCSS plugin resolves from project root |
| `postcss.config.js` | PostCSS | Loaded by Vite's CSS pipeline from root |
| `tsconfig.json` | TypeScript | `tsc` and IDE tooling look for it in the working directory |
| `tsconfig.app.json` | TypeScript | Extended by `tsconfig.json` via relative path |
| `tsconfig.node.json` | TypeScript | Used by `vite.config.ts` compilation |
| `eslint.config.js` | ESLint | Flat config format, resolved from root |
| `components.json` | shadcn/ui CLI | Required in root for `npx shadcn add` to work |

Moving any of these would require non-trivial build tooling changes. Keep them in root.

---

## License

MIT — see [LICENSE](LICENSE).
