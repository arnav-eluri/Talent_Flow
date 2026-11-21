# What Happens When You Click Something

Every action in TalentFlow — clicking a button, submitting a form, loading a page — follows a predictable path. Once you understand the pattern, every feature makes sense.

---

## The Basic Pattern

Here's what happens every time you do anything in the app:

```mermaid
sequenceDiagram
    actor You
    participant App as React App (browser)
    participant Server as Express Server
    participant Files as JSON Files

    You->>App: Click a button or submit a form
    App->>Server: Send request + your login token
    Server->>Server: Check token, check permissions
    Server->>Files: Read or write data
    Files-->>Server: Done
    Server-->>App: Send back the result
    App-->>You: Update what you see (no page reload)
```

The app never reloads the whole page. When something changes, only the affected part of the screen updates — that's what makes it feel fast.

---

## Logging In

The login flow is slightly different because there's no token yet. This is where you get one.

```mermaid
sequenceDiagram
    actor You
    participant App as React App
    participant Server as Express Server

    You->>App: Enter email + password, click Log In
    App->>Server: POST /api/auth/login
    Server->>Server: Find your account, verify password
    
    alt Password correct
        Server-->>App: Here's your token + your profile info
        App->>App: Save token to browser storage
        App-->>You: Redirect to Dashboard
    else Password wrong
        Server-->>App: 401 Unauthorized
        App-->>You: Show error message
    end
```

The token gets attached to every future request automatically. It expires after 7 days, at which point you'll be sent back to the login screen.

---

## Adding a Candidate

Here's the full journey when an HR manager adds a new candidate:

```mermaid
sequenceDiagram
    actor HR as HR Manager
    participant App as React App
    participant Server as Express Server
    participant Files as JSON Files

    HR->>App: Fill out "Add Candidate" form
    HR->>App: Click Save
    App->>Server: POST /api/candidates (+ token)
    Server->>Server: Verify token and role
    Server->>Files: Append new candidate to candidates.json
    Files-->>Server: Saved
    Server-->>App: Return the new candidate record
    App->>App: Refresh candidates list
    App->>App: Refresh analytics (counts update)
    App-->>HR: Candidate appears in the table
```

Notice that the app refreshes both the candidates list AND the analytics dashboard automatically. That's because every time data changes, the app knows which screens might be affected and re-fetches only those.

---

## Moving a Candidate Through the Pipeline

Updating a candidate's status (e.g., from Screening to Interview) is a simple update:

```mermaid
sequenceDiagram
    actor HR as HR Manager
    participant App as React App
    participant Server as Express Server
    participant Files as JSON Files

    HR->>App: Click "Move to Interview" on a candidate
    App->>Server: PUT /api/candidates/:id  { status: "interview" }
    Server->>Files: Update that candidate's record
    Files-->>Server: Done
    Server-->>App: Return updated candidate
    App-->>HR: Status badge updates on screen
```

---

## Scheduling an Interview

```mermaid
sequenceDiagram
    actor HR as HR Manager
    participant App as React App
    participant Server as Express Server
    participant Files as JSON Files

    HR->>App: Fill out "Schedule Interview" form
    App->>Server: POST /api/interviews
    Server->>Files: Save new interview to interviews.json
    Files-->>Server: Done
    Server-->>App: Return new interview record
    App->>App: Refresh interviews list
    App-->>HR: Interview appears in calendar/list
```

After the interview happens, the interviewer submits feedback via `POST /api/interviews/:id/feedback`. The interview status changes to `completed` and the feedback is stored alongside it.

---

## Uploading a Document

Document uploads work a little differently because they carry a file, not just text.

```mermaid
sequenceDiagram
    actor You
    participant App as React App
    participant Server as Express Server
    participant Disk as server/uploads/

    You->>App: Select a file, pick a type, click Upload
    App->>Server: POST /api/documents/upload (multipart form with the file)
    Server->>Server: Check file type (PDF/DOC/DOCX/TXT only) and size (max 10 MB)
    
    alt File is valid
        Server->>Disk: Save file as a unique filename
        Server->>Server: Create a document record with the file's URL
        Server-->>App: Return document record
        App-->>You: File appears in your documents list
    else File is invalid
        Server-->>App: Error (wrong type or too big)
        App-->>You: Show error message
    end
```

The file lives on disk at `server/uploads/`. The database just stores a pointer to it (`/uploads/filename.pdf`). When you click to download, your browser fetches the file directly from that path.

---

## How the Analytics Dashboard Stays Fresh

The analytics numbers (total employees, open positions, hiring trend) are computed live every time the dashboard loads — there's no stored snapshot.

```mermaid
sequenceDiagram
    participant App as React App
    participant Server as Express Server
    participant Files as JSON Files

    App->>Server: GET /api/analytics
    Server->>Files: Read candidates.json
    Server->>Files: Read employees.json
    Server->>Server: Compute: headcount, new hires, turnover rate, hiring trend, etc.
    Server-->>App: Return computed numbers
    App-->>App: Update all dashboard cards and charts
```

This means the dashboard is always accurate. Add an employee → reload the dashboard → headcount is already updated. No sync needed, no background job.

---

## What Gets Refreshed After Each Action

The app tracks which screens are affected by each change and re-fetches only those — not the entire page.

| When you… | The app refreshes… |
|---|---|
| Add / edit / delete a candidate | Candidate list + analytics |
| Schedule / update / cancel an interview | Interview list + analytics |
| Add / edit / remove an employee | Employee list + analytics |
| Complete an onboarding task | Onboarding list |
| Complete an offboarding task | Offboarding list |
| Upload or delete a document | Documents list |
| Update your profile | Your profile display in the header |
