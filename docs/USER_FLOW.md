# User Flow

## 1. Authentication Flow

```
User visits app
       │
       ▼
App.tsx checks localStorage
  talentflow_token present?
       │
  ┌────┴────┐
  │   YES   │                      │   NO   │
  ▼         │                      ▼        │
Verify token│               Redirect to /login
(AuthContext│                      │
 hydrates)  │               ┌──────▼──────┐
  │         │               │  Login page │
  ▼         │               │  (pre-filled│
Redirect to /               │  demo creds)│
  │         │               └──────┬──────┘
  ▼         │                      │
Dashboard   │               User submits form
            │                      │
            │               POST /api/auth/login
            │                      │
            │               ┌──────┴──────────┐
            │               │  success        │  failure
            │               ▼                 ▼
            │         Store JWT         Show error toast
            │         Redirect to /     Stay on /login
            └─────────────────────┘
```

---

## 2. HR Manager Journey

The core end-to-end HR workflow from first contact to active employee:

```
Step 1 — Add Candidate
  /candidates → "Add Candidate" button
  Fill: name, email, position, department, skills, experience
  POST /api/candidates → status: 'new'

Step 2 — Move Through Pipeline
  Candidates page → find candidate → edit status
  new → screening → interview
  PUT /api/candidates/:id  { status: 'screening' }
  PUT /api/candidates/:id  { status: 'interview' }

Step 3 — Schedule Interview
  /interviews → "Schedule Interview"
  Select candidate, set date/time, pick type (video/phone/onsite/ai)
  Add interviewers
  POST /api/interviews → status: 'scheduled'

Step 4 — Record Feedback
  /interviews → find interview → "Add Feedback"
  Rate 1–5, add strengths/weaknesses, pick recommendation
  POST /api/interviews/:id/feedback → status: 'completed'

Step 5 — Extend Offer
  PUT /api/candidates/:id  { status: 'offer' }

Step 6 — Hire
  PUT /api/candidates/:id  { status: 'hired' }

Step 7 — Create Employee Record
  /employees → "Add Employee"
  Pre-fill from candidate data
  POST /api/employees → status: 'onboarding'

Step 8 — Assign Onboarding Tasks
  /onboarding → "New Task"
  Link to employee, set category, due date, assignee
  POST /api/onboarding (repeat for each task)

Step 9 — Track & Complete Onboarding
  Mark tasks in_progress → completed
  PUT /api/onboarding/:id  { status: 'completed' }
  When all done: PUT /api/employees/:id  { status: 'active' }
```

---

## 3. Candidate Pipeline Stages

```
┌──────────┬───────────────────────────────────────────────────────┐
│  Stage   │  Available Actions                                     │
├──────────┼───────────────────────────────────────────────────────┤
│ new      │  View profile · Edit details · Move to screening ·    │
│          │  Reject · Send email (mailto:) · View resume           │
├──────────┼───────────────────────────────────────────────────────┤
│ screening│  View profile · Edit details · Move to interview ·    │
│          │  Reject · Schedule interview                           │
├──────────┼───────────────────────────────────────────────────────┤
│ interview│  View profile · View interviews · Add feedback ·      │
│          │  Move to offer · Reject                                │
├──────────┼───────────────────────────────────────────────────────┤
│ offer    │  View profile · Mark as hired · Reject                 │
├──────────┼───────────────────────────────────────────────────────┤
│ hired    │  View profile · Convert to employee                    │
├──────────┼───────────────────────────────────────────────────────┤
│ rejected │  View profile · Reopen (move back to any stage)       │
└──────────┴───────────────────────────────────────────────────────┘
```

**Filtering:** The candidates table supports filtering by status tab, department dropdown, and free-text search across name, position, and department.

---

## 4. Employee Onboarding Journey

```
Employee created (status: 'onboarding')
         │
         ▼
HR / Manager creates onboarding tasks
  Categories: documentation · training · equipment
              introduction · compliance

  Typical task set:
  ┌──────────────────────────────┬──────────────┐
  │ Task                         │ Category     │
  ├──────────────────────────────┼──────────────┤
  │ Sign employment contract     │ documentation│
  │ Complete tax forms (W-4/P45) │ compliance   │
  │ Set up laptop + accounts     │ equipment    │
  │ Complete security training   │ training     │
  │ Meet the team                │ introduction │
  └──────────────────────────────┴──────────────┘
         │
         ▼
Assignees update task status
  pending → in_progress → completed

         │  (all tasks completed)
         ▼
HR updates employee status
  PUT /api/employees/:id  { status: 'active' }

         │
         ▼
Employee appears in active directory
Analytics: headcount increments, new hire counted
```

---

## 5. Employee Offboarding Journey

```
HR initiates offboarding
  PUT /api/employees/:id  { status: 'offboarding' }
         │
         ▼
HR creates offboarding tasks
  Categories: exit_interview · asset_return · knowledge_transfer
              access_revoke · final_pay

  Typical task set:
  ┌──────────────────────────────┬──────────────────┐
  │ Task                         │ Category         │
  ├──────────────────────────────┼──────────────────┤
  │ Conduct exit interview       │ exit_interview   │
  │ Collect laptop + badge       │ asset_return     │
  │ Document handover            │ knowledge_transfer│
  │ Revoke system access         │ access_revoke    │
  │ Process final paycheck       │ final_pay        │
  └──────────────────────────────┴──────────────────┘
         │
         ▼
Tasks completed by assignees

         │  (all tasks completed)
         ▼
HR updates employee status
  PUT /api/employees/:id  { status: 'inactive' }

         │
         ▼
Employee removed from active headcount
Analytics: turnover rate recalculated on next fetch
```

---

## 6. Document Management Flow

```
Upload:
  /documents → "Upload Document"
  Select file (PDF/DOC/DOCX/TXT, max 10MB)
  Choose type: resume | contract | policy | certificate | other
  Enter display name
  POST /api/documents/upload  (multipart)
  → File stored in server/uploads/
  → Document record created with /uploads/<filename> URL

Access by role:
  HR Manager     → sees all documents
  Dept Manager   → sees all documents
  Employee       → sees only documents they uploaded
                   or linked to their employee record

Download:
  Document list → click document name
  → browser navigates to http://localhost:3001/uploads/<filename>
  → served by Express static middleware

Delete:
  Document list → delete icon (HR/Manager only)
  DELETE /api/documents/:id
  → record removed from store
  → file remains on disk (manual cleanup required)
```

---

## 7. Role Switching (Demo)

TalentFlow ships with a **Role** switcher in the top-right header for demo purposes.

```
Header → "Role: hr" button → dropdown
  ○ HR Manager
  ○ Department Manager
  ● Employee          ← click to switch

What changes:
┌────────────────────────────┬─────────────────────────────────────┐
│ HR Manager                 │ Full sidebar, all features           │
├────────────────────────────┼─────────────────────────────────────┤
│ Department Manager         │ No offboarding in sidebar           │
├────────────────────────────┼─────────────────────────────────────┤
│ Employee                   │ No candidates, interviews, onboarding│
│                            │ analytics, or offboarding            │
│                            │ Employees page shows own record only │
└────────────────────────────┴─────────────────────────────────────┘
```

> In the demo, switching role re-issues a JWT with the new role claim. In a production system, role changes would require admin approval and re-authentication.

---

## 8. Settings & Profile

```
/settings → Profile tab

  Displays:
    Name  (editable)
    Email (editable)
    Role  (read-only)

  User edits name or email → "Save Changes"
    PUT /api/users/me  { name, email }
    → server checks email uniqueness
    → updates user record
    → persists to data/users.json
    → returns updated user (no password)

  Client:
    AuthContext.updateUser(updatedUser)
    → updates localStorage['talentflow_user']
    → header avatar and name update immediately

  Other settings tabs (Notifications, Security, Appearance):
    UI-only — no backend integration yet
```
