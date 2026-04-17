# FRONTEND PLAN — Admin Dashboard (Server-Rendered)

> **Status**: APPROVED — ready for implementation

---

## 1. Project Status Analysis

### ✅ Implemented (Phase 0–4)

| Module                          | Endpoints                                                                        | Notes                              |
| ------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| **Auth**                        | login, register, refresh, logout                                                 | JWT access + refresh, cookie-based |
| **Users**                       | list, getById, getByUsername, resetPassword, changeUsername, assignRoles, delete   | RBAC: ADMIN for list/delete/roles  |
| **Roles**                       | list                                                                             | Enum: USER, ADMIN, MEMBER, MENTOR  |
| **Profiles**                    | list, getById, update                                                            | Central entity, linked everywhere. getAll includes related entities (member, dojoMentor, dojoTutor, dojoNinja) |
| **Members**                     | list (filtered), getById, update                                                 | CTI: AspiringMember / FullMember. Auto-created when MEMBER role is assigned |
| **Membership Fees**             | list, getById, getByMember, create, update, delete                               | Unique per (member, year)          |
| **Meetups**                     | list, getById, createWorkshop, createAntiWorkshop, updateWorkshop, updateAntiWorkshop, delete | Two subtypes via separate endpoints |
| **Dojo Mentors**                | list, getById, update                                                            | Linked to Profile. Auto-created when MENTOR role is assigned |
| **Dojo Tutors**                 | list, getById, create, delete                                                    | Linked to Profile                  |
| **Dojo Ninjas**                 | list, getByTutor, getById, create, update, delete                                | Linked to Tutor + Profile          |
| **Dojo Sessions**               | list, getById, create, update, delete                                            | Linked to Mentor                   |
| **Agreement Documents**         | list, getById, getBySlug, createWithUploadIntent, confirmUpload, updateName, delete | S3 file upload integration       |
| **Mentor Agreement Signatures** | list, getByMentor, getById, create, delete                                       | Unique per (mentor, document)      |
| **Tutor Agreement Signatures**  | list, getByTutor, getById, create, delete                                        | Unique per (tutor, document)       |
| **S3**                          | Service only (no controller)                                                     | Filebase-compatible S3             |

### 🔲 Not Implemented (Phase 5–8)

- **Blog**: tags, posts, post-tags
- **Festival**: editions, gallery, sections, activities, volunteers, locations, staff, guests, guest roles, program, presenters, sponsors, discount locations, tickets, redeemings
- Seed data, tests, hardening

---

## 2. UI Library Choice: Bootstrap 5 (CDN)

- ✅ Works perfectly with server-rendered HTML (no build step)
- ✅ Built-in dark theme support (`data-bs-theme="dark"`)
- ✅ Native modal, toast, accordion, table components
- ✅ Zero config — just CDN links in the layout
- ✅ JavaScript components work via `data-bs-*` attributes

---

## 3. Dependencies & Installation

### NPM packages

```bash
npm install hbs express-handlebars
npm install --save-dev @types/hbs
```

### CDN links (in layout.hbs)

```html
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

<!-- Bootstrap 5 JS Bundle (includes Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 4. NestJS Configuration for Handlebars

### Changes to `main.ts`

```typescript
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Handlebars setup
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('hbs')

  // Static assets (custom CSS/JS)
  app.useStaticAssets(join(__dirname, '..', 'public'))

  // ... existing config (CORS, cookie-parser, etc.)
}
```

### Changes to `nest-cli.json`

```json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      {
        "include": "../views/**/*",
        "outDir": "dist/views",
        "watchAssets": true
      },
      {
        "include": "../public/**/*",
        "outDir": "dist/public",
        "watchAssets": true
      }
    ]
  }
}
```

> The existing `app.setGlobalPrefix('api')` stays — it only affects API controllers. Admin controllers use `/admin` prefix explicitly.

---

## 5. Access Control

### Who can access the Admin Dashboard

| Role       | Can View Pages | Can Create/Edit/Delete | Exceptions                               |
| ---------- | -------------- | ---------------------- | ---------------------------------------- |
| **ADMIN**  | ✅ All         | ✅ All                 | —                                        |
| **MENTOR** | ✅ All         | ❌ Read-only           | ✅ Can create, edit, delete Dojo Sessions |
| **MEMBER** | ✅ All         | ❌ Read-only           | —                                        |
| **USER**   | ❌ No access   | ❌ No access           | —                                        |

### Implementation

- Admin guard checks JWT and verifies user has ADMIN, MENTOR, or MEMBER role
- Action buttons (Create, Edit, Delete) are conditionally rendered based on role
- API-level guards remain unchanged (existing `@Auth('ADMIN')` etc.)
- Dojo Sessions controllers already allow `@Auth('ADMIN', 'MENTOR')`

---

## 6. Routing Structure

### URL Separation

```
/api/*       → existing REST API (JSON responses, JWT auth)
/admin/*     → admin dashboard (HTML responses, JWT cookie auth)
```

### Admin Routes

| Route                              | View                   | Description                      |
| ---------------------------------- | ---------------------- | -------------------------------- |
| `GET /admin/login`                 | `admin/login`          | Login page                       |
| `POST /admin/login`                | (redirect)             | Process login                    |
| `GET /admin/logout`                | (redirect)             | Logout                           |
| `GET /admin`                       | `admin/dashboard`      | Bento grid stats overview        |
| `GET /admin/users`                 | `admin/users`          | Users table                      |
| `GET /admin/members`               | `admin/members`        | Members table + fees accordion   |
| `GET /admin/meetups`               | `admin/meetups`        | Meetups table                    |
| `GET /admin/coderdojo/mentors`     | `admin/dojo/mentors`   | Mentors table + signatures       |
| `GET /admin/coderdojo/tutors`      | `admin/dojo/tutors`    | Tutors table + ninjas accordion + signatures |
| `GET /admin/coderdojo/sessions`    | `admin/dojo/sessions`  | Sessions table                   |
| `GET /admin/agreements`            | `admin/agreements`     | Documents table (no signatures)  |
| `GET /admin/general-assemblies`    | `admin/assemblies`     | Assemblies table + attendees     |

> Future routes: `/admin/blog`, `/admin/festival`

### How Controllers Render Views

```typescript
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('admin/users')
  async listUsers() {
    const users = await this.usersService.getAll()
    return { users, pageTitle: 'Users' }
  }
}
```

Admin controllers inject **existing services** directly — no HTTP self-calls.

### Form Submission Pattern (Option B — fetch)

```
User clicks "Save" in modal
  → fetch('/api/users/:id/roles', { method: 'PUT', body, headers })
  → On success → show Bootstrap toast → reload table data
  → On error → show error toast
```

All CUD operations go through existing `/api/*` endpoints via `fetch()` from `admin.js`. Pages only use `GET` for initial server-side rendering.

---

## 7. Views Structure

```
views/
├── layouts/
│   └── admin.hbs                    ← main layout (dark theme, sidebar, navbar)
├── partials/
│   ├── sidebar.hbs                  ← navigation sidebar with CoderDojo dropdown
│   ├── navbar.hbs                   ← top navbar (AI3 logo, user info, role badge, logout)
│   ├── toast.hbs                    ← toast notification container
│   ├── confirm-modal.hbs            ← reusable delete confirmation modal
│   ├── profile-modal.hbs            ← profile edit modal (opened from any entity)
│   ├── user-settings-modal.hbs      ← password/username change modal (navbar)
│   └── pagination.hbs               ← reusable pagination
├── admin/
│   ├── login.hbs                    ← login page (standalone, no sidebar)
│   ├── dashboard.hbs                ← bento grid with entity counts
│   ├── users.hbs                    ← users table + role assignment modal
│   ├── members.hbs                  ← members table + fees accordion + modals
│   ├── meetups.hbs                  ← meetups table + create/edit modals
│   ├── dojo/
│   │   ├── mentors.hbs              ← mentors table + signature modal
│   │   ├── tutors.hbs               ← tutors table + ninjas accordion + signature modal
│   │   └── sessions.hbs             ← sessions table + create/edit modal
│   ├── agreements.hbs               ← documents table (no signatures)
│   └── assemblies.hbs               ← assemblies table + attendees modal
public/
├── css/
│   └── admin.css                    ← dark theme overrides, teal accent, scrollbar styling
└── js/
    └── admin.js                     ← fetch helpers, toast triggers, modal handlers
```

---

## 8. Design System

### Branding

- **Logo**: `AI3` — bold, white text — upper left corner of the sidebar/navbar
- **Accent color**: Teal (`#0d9488` / Bootstrap teal-500 range)
- **Dark theme**: `<html data-bs-theme="dark">` + custom overrides

### Role Badge Colors

| Role     | Badge Color                           |
| -------- | ------------------------------------- |
| ADMIN    | `bg-danger` (red)                     |
| MENTOR   | `bg-info` (teal/cyan)                 |
| MEMBER   | `bg-success` (green)                  |
| USER     | `bg-secondary` (gray) — not on admin |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  AI3 (bold white)          Admin Name  [ADMIN] 🔒  Logout  │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Sidebar  │            Main Content Area                     │
│          │                                                  │
│ Dashboard│   ┌──────────────────────────────────────┐       │
│ Users    │   │  Page Title          [+ Create]      │       │
│ Members  │   │  ┌──────────────────────────────┐    │       │
│ Meetups  │   │  │       DATA TABLE             │    │       │
│ ▼CoderDojo│  │  │  row → accordion / actions   │    │       │
│  Mentors │   │  └──────────────────────────────┘    │       │
│  Tutors  │   └──────────────────────────────────────┘       │
│  Sessions│                                                  │
│ Agreements│          Toast Container (bottom-end)           │
│ Gen.Assem│                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

- Sidebar: collapsible on small screens (hamburger toggle)
- **Not mobile-responsive** — designed for small laptops and up
- Clicking user name in navbar opens **User Settings Modal** (change password, change username)
- Clicking user profile icon opens **Profile Edit Modal** (name, email, phone, birthDate)

### Custom Scrollbar (for near-fullscreen modals)

```css
/* admin.css */
.modal-body::-webkit-scrollbar { width: 8px; }
.modal-body::-webkit-scrollbar-track { background: #1a1d21; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #0d9488; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: #0f766e; }
```

### UX Components

| Component      | Bootstrap Class                                   | Usage                                      |
| -------------- | ------------------------------------------------- | ------------------------------------------ |
| **Tables**     | `.table.table-dark.table-striped.table-hover`     | All list views                             |
| **Modals**     | `.modal.modal-xl` or `.modal-fullscreen-lg-down`  | Create/Edit forms, near-fullscreen as needed |
| **Toasts**     | `.toast` (position: bottom-end)                   | Success/error notifications for all CUD    |
| **Accordions** | `.accordion.accordion-flush`                      | Fees under members, ninjas under tutors    |
| **Badges**     | `.badge`                                          | Roles, status (PAID/UNPAID), member type   |
| **Cards**      | `.card`                                           | Dashboard bento grid                       |
| **Dropdowns**  | `.dropdown` in sidebar                            | CoderDojo sub-menu                         |
| **Buttons**    | `.btn.btn-sm`                                     | Actions in table rows                      |
| **Spinners**   | `.spinner-border.spinner-border-sm`               | Loading states on attendee check/uncheck   |

---

## 9. Module-by-Module UI Design

### 9.1 Dashboard (`/admin`)

**Bento grid** with count cards for all entities:

```
┌──────────┬──────────┬──────────┬──────────┐
│  Users   │ Members  │ Mentors  │  Tutors  │
│   42     │   28     │   8      │   12     │
├──────────┼──────────┼──────────┼──────────┤
│  Ninjas  │ Meetups  │ Sessions │ Assemblies│
│   35     │   15     │   22     │   3      │
├──────────┼──────────┴──────────┼──────────┤
│Documents │    Membership Fees  │  Roles   │
│   6      │       89            │   4      │
└──────────┴─────────────────────┴──────────┘
```

Each card: icon + count + entity name. Clickable → navigates to that page.

---

### 9.2 Users (`/admin/users`)

**Table columns**: Username | Profile Name | Email | Roles (badges with colors) | Created | Actions

**Actions per row** (ADMIN only):
- 🔧 Assign Roles → **Modal** with checkbox list of available roles
- ✏️ Edit Profile → **Profile Edit Modal** (name, email, phone, birthDate)
- 🗑️ Delete → **Confirm modal**

**No create button** — users register via `/api/auth/register`

**Notes**:
- Members are auto-created when MEMBER role is assigned
- Mentors are auto-created when MENTOR role is assigned
- Role badges use the colors from the role badge table

---

### 9.3 Members (`/admin/members`)

**Table columns**: Profile Name | Type (badge: ASPIRING/FULL) | Full Member Kind (badge) | Joined At | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit Member → **Modal** (change type, fullMemberKind)
- ✏️ Edit Profile → **Profile Edit Modal**

**Membership Fees accordion** — shown **only** for FullMembers with kind `REGULAR`:
- Expand row → shows fees sub-table
- Columns: Year | Amount | Status (badge: PAID green / UNPAID red) | Actions
- ➕ Add Fee → **Modal** (year, amount, status)
- ✏️ Edit Fee → **Modal**
- 🗑️ Delete Fee → **Confirm modal**

---

### 9.4 Meetups (`/admin/meetups`)

**Table columns**: Date | Location | Type (badge: WORKSHOP / ANTI_WORKSHOP) | Title or Agenda preview | Presenter | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit → **Modal** (fields depend on type)
- 🗑️ Delete → **Confirm modal**

**Create** (ADMIN only — top button, dropdown split):
- ➕ New Workshop → **Modal** (startsAt, location, title, theme enum, presenterId dropdown)
- ➕ New Anti-Workshop → **Modal** (startsAt, location, agenda)

**Presenter dropdown** (for Workshop):
- Shows all profiles from `getAll()` which now returns related entities
- Each option: `Profile Name [MENTOR]` / `Profile Name [MEMBER]` / `Profile Name [TUTOR]` / `Profile Name [NINJA]` / `Profile Name` (no entity)
- **Filter toggles** at the top of dropdown by entity type: Mentor ✅ | Member ✅ | Tutor ☐ | Ninja ☐
- Tutor and Ninja unchecked by default (visible only when needed)

---

### 9.5 CoderDojo — Mentors (`/admin/coderdojo/mentors`)

**Table columns**: Profile Name | Email | Description | Sessions Count | Signed Documents | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit Description → **Modal**
- ✏️ Edit Profile → **Profile Edit Modal**
- 📝 Manage Signatures → **Signatures Modal**

**Signatures Modal**:
- Lists ALL agreement documents
- Each document row shows: Document Name | Status
- If **not signed**: `[Sign]` button → calls POST to create signature → updates row
- If **signed**: Sign button disabled, text shows "Signed on {date}" + `[Remove]` button → calls DELETE → updates row
- All actions via fetch() with loading states

---

### 9.6 CoderDojo — Tutors (`/admin/coderdojo/tutors`)

**Table columns**: Profile Name | Email | Ninjas Count | Signed Documents | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit Profile → **Profile Edit Modal**
- ➕ Add Ninja → **Modal** (select profile, usefulInfo)
- 📝 Manage Signatures → **Signatures Modal** (same pattern as Mentors)
- 🗑️ Delete Tutor → **Confirm modal**

**Create** (ADMIN only):
- ➕ New Tutor → **Modal** (select profileId)

**Ninjas accordion** (inside each tutor row):
- Expand → shows ninjas sub-table
- Columns: Profile Name | Useful Info | Actions
- ✏️ Edit Ninja → **Modal** (usefulInfo, tutorId)
- ✏️ Edit Profile → **Profile Edit Modal**
- 🗑️ Delete Ninja → **Confirm modal**
- ➕ Create Ninja → **Modal** (select profileId, usefulInfo) — adds to this tutor

---

### 9.7 CoderDojo — Sessions (`/admin/coderdojo/sessions`)

**Table columns**: Date | Location | Theme | Mentor Name | Actions

**Actions per row** (ADMIN and MENTOR):
- ✏️ Edit → **Modal** (startsAt, location, theme, mentorId)
- 🗑️ Delete → **Confirm modal**

**Create** (ADMIN and MENTOR):
- ➕ New Session → **Modal** (startsAt, location, theme, mentorId dropdown)

---

### 9.8 Agreement Documents (`/admin/agreements`)

**Table columns**: Name | Slug | Created At | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit Name → **Modal** (name field only)
- 📥 Download → opens presigned S3 URL
- 🗑️ Delete → **Confirm modal**

**Create** (ADMIN only):
- ➕ New Document → **Modal** (name, slug, file picker)

**Document Upload Flow** (two-step via existing API):

```
1. Admin fills in name, slug, selects file → clicks "Save"
2. Modal shows full-overlay loader:
   ├── Spinner + "Uploading..."
   │   → POST /api/agreement-documents/create-with-upload-intent
   │   → Returns { documentId, presignedUploadUrl }
   │   → PUT file to presignedUploadUrl (S3 upload)
   │
   ├── Spinner text changes to "Confirming upload..."
   │   → POST /api/agreement-documents/:id/confirm-upload
   │
   ├── ✅ Success → hide loader → close modal → show success toast
   └── ❌ Failure at any step → hide loader → show error toast with message
```

- The loader covers the entire modal to prevent double-clicks
- If the upload fails mid-way, the document record may exist without a file — handle gracefully

**No signatures listed here** — signatures are managed from Mentors and Tutors pages.

---

### 9.9 General Assemblies (`/admin/general-assemblies`)

**Table columns**: Year | Announced At | Held At | Location | Min Quorum | Attendees Count | Actions

**Actions per row** (ADMIN only):
- ✏️ Edit → **Modal** (year, announcedAt, heldAt, location, minQuorum)
- 👥 Manage Attendees → **Attendees Modal**
- 🗑️ Delete → **Confirm modal**

**Create** (ADMIN only):
- ➕ New Assembly → **Modal**

**Attendees Modal**:
- Lists ALL members with checkboxes
- ✅ Checked = already an attendee
- On **check**: immediately calls POST to add attendee + shows spinner on that row (blocks further actions until done)
- On **uncheck**: immediately calls DELETE to remove attendee + shows spinner on that row
- One operation at a time — spinner prevents concurrent modifications

---

## 10. Navbar — User Info Area

### Top Right Layout

```
[User Full Name]  [ADMIN]  [⚙️]  [🚪 Logout]
```

- **User Full Name**: clickable → opens **Profile Edit Modal** for the authenticated user
- **Role Badge**: color-coded badge showing the user's highest role
- **⚙️ Settings icon**: opens **User Settings Modal**
- **Logout button**: calls logout and redirects to login

### Profile Edit Modal (reusable)

Used everywhere a profile needs editing (users page, members page, mentors, tutors, ninjas, navbar).

- Fields: Name, Email, Phone, Birth Date
- Calls `PUT /api/profiles/:id`
- On success → toast + reload relevant data

### User Settings Modal (navbar only)

- **Change Username**: current username (readonly) + new username field
- **Change Password**: old password + new password fields
- Calls respective `/api/users/*` endpoints

---

## 11. Admin Module Architecture

```
src/
└── admin/
    ├── admin.module.ts                       ← imports all needed service modules
    ├── admin.controller.ts                   ← dashboard + login/logout
    ├── admin-users.controller.ts             ← /admin/users
    ├── admin-members.controller.ts           ← /admin/members (includes fees)
    ├── admin-meetups.controller.ts           ← /admin/meetups
    ├── admin-dojo-mentors.controller.ts      ← /admin/coderdojo/mentors
    ├── admin-dojo-tutors.controller.ts       ← /admin/coderdojo/tutors (includes ninjas)
    ├── admin-dojo-sessions.controller.ts     ← /admin/coderdojo/sessions
    ├── admin-agreements.controller.ts        ← /admin/agreements
    ├── admin-assemblies.controller.ts        ← /admin/general-assemblies
    └── guards/
        └── admin-auth.guard.ts              ← JWT cookie check, allows ADMIN/MENTOR/MEMBER
```

### Rendering Pattern

```typescript
// GET requests → server-render the page with data
@Get()
@Render('admin/users')
async listUsers(@Req() req) {
  const users = await this.usersService.getAll()
  return {
    users,
    pageTitle: 'Users',
    currentUser: req.user,
    canEdit: req.user.roles.includes('ADMIN')
  }
}
```

### CUD Pattern (client-side)

All create/update/delete operations happen via `fetch()` in `admin.js`:

```javascript
// admin.js
async function apiCall(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends JWT cookie
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

// Show Bootstrap toast after action
function showToast(message, type = 'success') { ... }
```

---

## 12. Sidebar Structure

```
 AI3  (bold, white, top-left)
─────────────────────────
 📊  Dashboard
 👤  Users
 🏅  Members
 📅  Meetups
 ▼ 🥋 CoderDojo
    ├── Mentors
    ├── Tutors
    └── Sessions
 📄  Agreements
 🏛️  General Assemblies
─────────────────────────
```

- CoderDojo is a collapsible dropdown/accordion in the sidebar
- Active page is highlighted with teal accent
- Sidebar collapses to hamburger on screens < 992px (lg breakpoint)
- Dashboard is NOT mobile-optimized — minimum supported: small laptops (~1024px)

---

## 13. Future Modules (Scalability)

### Blog (`/admin/blog`) — Phase 7

- `/admin/blog/tags` → tags table + create/edit modal
- `/admin/blog/posts` → posts table + create/edit (near-fullscreen modal for body)

### Festival (`/admin/festival`) — Phase 7

- `/admin/festival/editions` → editions table + sub-views
- Consider sub-routes: `/admin/festival/:editionId/sections`
- Heavy use of accordions for nested data

### Template for new modules

Every new module follows the same pattern:
1. Create `admin-{module}.controller.ts` in `src/admin/`
2. Create `views/admin/{module}.hbs`
3. Add route to `sidebar.hbs` partial
4. Reuse same modal/toast/table/accordion patterns
5. Pass `canEdit` flag based on user role

---

## 14. Implementation Phases

| Phase | Scope                                                            | Size   |
| ----- | ---------------------------------------------------------------- | ------ |
| F1    | Setup: hbs config, layout, sidebar, navbar, dark theme, admin.css/js, teal accent | Small  |
| F2    | Login page + admin auth guard (JWT cookie, ADMIN/MENTOR/MEMBER)  | Small  |
| F3    | Dashboard — bento grid with entity counts                        | Small  |
| F4    | Users page — table + role modal + profile modal + delete         | Medium |
| F5    | Members page — table + fees accordion (REGULAR only) + modals    | Medium |
| F6    | Meetups page — table + workshop/anti-workshop modals + presenter dropdown | Medium |
| F7    | CoderDojo Mentors — table + signatures modal                     | Medium |
| F8    | CoderDojo Tutors — table + ninjas accordion + signatures modal   | Large  |
| F9    | CoderDojo Sessions — table + create/edit modal                   | Small  |
| F10   | Agreements page — documents table + upload flow                  | Medium |
| F11   | General Assemblies — table + attendees checkbox modal            | Medium |
| F12   | Blog admin (future)                                              | Medium |
| F13   | Festival admin (future)                                          | Large  |
