# Permissions Reference

TalentFlow has three roles. Each role has a fixed access level, except Employee whose permissions are assigned individually by HR.

---

## Roles

| Role | Access level |
|---|---|
| **HR** | Full access — every module, every action, plus user management |
| **Manager** | Standard access — a fixed preset covering day-to-day operations |
| **Employee** | Assigned access — toggled per user in Settings → Permissions |

---

## Permissions Matrix

| Module | Action | HR | Manager | Employee |
|---|---|:---:|:---:|:---:|
| Candidates | View | ✅ | ✅ | Assigned |
| Candidates | Manage | ✅ | ❌ | Assigned |
| Interviews | View | ✅ | ✅ | Assigned |
| Interviews | Manage | ✅ | ✅ | Assigned |
| Employees | View | ✅ | ✅ | Assigned |
| Employees | Manage | ✅ | ❌ | Assigned |
| Onboarding | View | ✅ | ✅ | Assigned |
| Onboarding | Manage | ✅ | ✅ | Assigned |
| Offboarding | View | ✅ | ✅ | Assigned |
| Offboarding | Manage | ✅ | ✅ | Assigned |
| Documents | View | ✅ | ✅ | Assigned |
| Documents | Manage | ✅ | ❌ | Assigned |
| Analytics | View | ✅ | ✅ | Assigned |

---

## How permissions are stored

- **HR and Manager** permissions are derived from the role — nothing is stored per user.
- **Employee** permissions are stored as a `permissions` array on the user record (e.g. `["candidates_view", "interviews_view"]`). An empty array means no access beyond the defaults the app enforces.

## Changing permissions

Only HR users can change permissions. Go to **Settings → Permissions**:

1. Find the user in the list.
2. Use the role dropdown to change their role (HR, Manager, Employee). You cannot change your own role.
3. For employees, toggle the per-module checkboxes to grant or revoke view/manage access.
4. Click **Save Changes**.

Role changes and permission changes are saved together in one request.
