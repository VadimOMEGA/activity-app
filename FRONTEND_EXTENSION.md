# FRONTEND EXTENSION — Blog & Festival Admin

> **Status**: APPROVED — all questions resolved (Section 8)
> **Extends**: FRONTEND_PLAN.md (Phases F1–F11)

---

## 1. Overview

This document extends the existing Admin Dashboard with two new modules:

- **Blog** — Tags management + Posts with rich-text JSON editor
- **Festival** — Editions list → Edition detail (bento grid) → sub-entity management

All patterns from the existing plan are preserved: Handlebars server-rendering, Bootstrap 5 dark theme, `fetch()`-based CUD via `/api/*`, modals for forms, accordions for nested data, toasts for feedback.

### New CDN Dependency: Editor.js

Blog post `body` is stored as `Json` in Prisma. We need a block-styled editor that natively outputs JSON.

**Choice: [Editor.js](https://editorjs.io/)** — a block-based editor producing clean JSON. No React/Vue required.

```html
<!-- Editor.js (blog post body) -->
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@2.30.8"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@2.8.8"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/list@2.0.2"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@2.7.4"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/delimiter@1.4.2"></script>

<!-- SortableJS (gallery photo reordering) -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js"></script>

<!-- GLightbox (gallery photo zoom/lightbox) -->
<link href="https://cdn.jsdelivr.net/npm/glightbox@3.3.0/dist/css/glightbox.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/glightbox@3.3.0/dist/js/glightbox.min.js"></script>
```

**Why Editor.js over alternatives:**

| Criteria | Editor.js | TinyMCE | Quill |
|---|---|---|---|
| Native JSON output | ✅ Yes | ❌ HTML | ❌ Delta JSON (proprietary) |
| No framework needed | ✅ Vanilla JS | ✅ | ✅ |
| CDN-only usage | ✅ | ✅ (needs API key) | ✅ |
| Block-based editing | ✅ | ❌ | ❌ |
| Dark theme compatible | ✅ CSS overrides | ✅ | Partial |

---

## 2. Updated Sidebar Structure

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
─── NEW ──────────────────
 ▼ 📝 Blog
    ├── Tags
    └── Posts
 🎪  Festival Editions        ← single link, not dropdown
─────────────────────────
```

- **Blog** is a collapsible dropdown (same pattern as CoderDojo)
- **Festival Editions** is a single top-level link → opens the editions list page
- Edition detail is accessed via the "View" action in the table (not a sidebar sub-link)

---

## 3. New Routes

| Route | View | Description |
|---|---|---|
| `GET /admin/blog/tags` | `admin/blog/tags` | Tags table |
| `GET /admin/blog/posts` | `admin/blog/posts` | Posts table |
| `GET /admin/festival/editions` | `admin/festival/editions` | Editions list table |
| `GET /admin/festival/editions/:id` | `admin/festival/edition-detail` | Bento grid for one edition |
| `GET /admin/festival/editions/:id/schedule` | `admin/festival/schedule` | Program/schedule table |
| `GET /admin/festival/editions/:id/tickets` | `admin/festival/tickets` | Tickets + redeemings |
| `GET /admin/festival/editions/:id/sponsors` | `admin/festival/sponsors` | Sponsors + discount locations |

### New Admin Controllers

```
src/admin/
├── admin-blog.controller.ts          ← /admin/blog/tags + /admin/blog/posts
├── admin-festival.controller.ts      ← /admin/festival/editions (list)
├── admin-festival-detail.controller.ts ← /admin/festival/editions/:id (detail + sub-pages)
```

### New Views

```
views/admin/
├── blog/
│   ├── tags.hbs
│   └── posts.hbs
├── festival/
│   ├── editions.hbs
│   ├── edition-detail.hbs
│   ├── schedule.hbs
│   ├── tickets.hbs
│   └── sponsors.hbs
```

---

## 4. Blog Module

### 4.1 Blog Tags (`/admin/blog/tags`)

**Table columns**: Name | Posts Count | Editions Count | Created At | Actions

**Actions** (ADMIN only):
- ✏️ Edit → **Modal** (name field)
- 🗑️ Delete → **Confirm modal** — message includes: "This tag is used by X editions and Y posts. Deleting it will remove all associations." (counts from `_count`)

**Create**: ➕ New Tag → **Modal** (name)

**Accordion per tag row**: Expand to show linked posts (title, published badge) and linked editions (year). Read-only — management happens on their respective pages.

**API endpoints used**:
- `GET /api/blog-tags` (includes `_count`, `blogPostTags`, `festivalEditions`)
- `POST /api/blog-tags`
- `PUT /api/blog-tags/:id`
- `DELETE /api/blog-tags/:id`

---

### 4.2 Blog Posts (`/admin/blog/posts`)

**Table columns**: Title | Slug | Tags (badges) | Status (badge: PUBLISHED green / DRAFT gray) | Published At | Actions

**Actions** (ADMIN only):
- ✏️ Edit → **Fullscreen modal** with Editor.js
- 👁️ Preview → **Preview modal** — renders Editor.js JSON blocks into formatted HTML (read-only)
- 📢 Publish / 📥 Unpublish → toggle via fetch (no modal)
- 🗑️ Delete → **Confirm modal**

**Create**: ➕ New Post → **Fullscreen modal**

#### Blog Post Editor Modal (`.modal-fullscreen`)

```
┌──────────────────────────────────────────────────────────┐
│  Create / Edit Blog Post                          [✕]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Title:    [________________________]                    │
│  Slug:     [________________________]  [Auto-generate]   │
│  Summary:  [________________________]                    │
│  Tags:     [multi-select checkboxes]                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │              Editor.js Block Area                  │   │
│  │                                                    │   │
│  │  [H] Heading block                                │   │
│  │  [P] Paragraph block                              │   │
│  │  [L] List block                                   │   │
│  │  [Q] Quote block                                  │   │
│  │  [—] Delimiter                                    │   │
│  │                                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│                    [Cancel]  [Preview]  [Save as Draft]   │
└──────────────────────────────────────────────────────────┘
```

#### Editor.js JSON Schema (stored in `body` column)

```json
{
  "time": 1714000000000,
  "blocks": [
    { "type": "header", "data": { "text": "Welcome", "level": 2 } },
    { "type": "paragraph", "data": { "text": "Some text..." } },
    { "type": "list", "data": { "style": "unordered", "items": ["A", "B"] } }
  ],
  "version": "2.30.8"
}
```

#### Editor.js Integration in `admin.js`

```javascript
// Initialize editor
let editor = null;
function initEditor(containerId, existingData = null) {
  editor = new EditorJS({
    holder: containerId,
    tools: {
      header: Header, list: List, quote: Quote, delimiter: Delimiter
    },
    data: existingData || {},
    placeholder: 'Start writing...'
  });
}

// On save
async function saveBlogPost(postId) {
  const outputData = await editor.save();
  const body = { title, slug, summary, tagIds, body: outputData };
  await apiCall(postId ? `/api/blog-posts/${postId}` : '/api/blog-posts',
    postId ? 'PUT' : 'POST', body);
}
```

#### Editor.js Dark Theme CSS (in `admin.css`)

```css
.ce-block__content, .ce-toolbar__content { max-width: 100%; }
.codex-editor { color: #e0e0e0; }
.ce-block--selected .ce-block__content { background: rgba(13,148,136,0.1); }
.ce-toolbar__plus, .ce-toolbar__settings-btn { color: #0d9488; }
```

**Auto-slug**: When the title field loses focus and slug is empty, auto-generate slug from title: `title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`. No client-side uniqueness validation — server 400 error is sufficient.

#### Blog Post Preview Modal

A read-only modal (`.modal-xl`) that renders the Editor.js JSON into formatted HTML:

```javascript
function renderPreview(editorData) {
  return editorData.blocks.map(block => {
    switch (block.type) {
      case 'header': return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
      case 'paragraph': return `<p>${block.data.text}</p>`;
      case 'list': return block.data.style === 'ordered'
        ? `<ol>${block.data.items.map(i => `<li>${i}</li>`).join('')}</ol>`
        : `<ul>${block.data.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
      case 'quote': return `<blockquote>${block.data.text}<cite>${block.data.caption}</cite></blockquote>`;
      case 'delimiter': return '<hr>';
      default: return '';
    }
  }).join('');
}
```

The preview opens as a nested modal from the editor fullscreen modal — Bootstrap 5 supports stacked modals natively.

**API endpoints used**:
- `GET /api/blog-posts` (includes tags)
- `GET /api/blog-posts/:id`
- `POST /api/blog-posts`
- `PUT /api/blog-posts/:id`
- `DELETE /api/blog-posts/:id`
- `PATCH /api/blog-posts/:id/publish`
- `PATCH /api/blog-posts/:id/unpublish`
- `GET /api/blog-tags` (for tag multi-select)

---

## 5. Festival Module

### 5.1 Editions List (`/admin/festival/editions`)

**Table columns**: Year | Title | Theme | Colors (2 dots) | Blog Tag | Actions

**Color dots**: Two small circles showing `mainColor` and `accentColor` inline.

**Actions** (ADMIN only):
- 👁️ View → navigates to `/admin/festival/editions/:id`
- ✏️ Edit Metadata → **Modal** (title, theme, shortDescription, longDescription, mainColor, accentColor, blogTagId dropdown)
- 🗑️ Delete → **Confirm modal** (warns about cascade)

**Create**: ➕ New Edition → **Modal**
- Fields: year, title, theme, shortDescription, longDescription, mainColor (`<input type="color">` with hex text display), accentColor (`<input type="color">` with hex text display), blogTagId (dropdown of existing tags)
- Color picker: native HTML5 `<input type="color">` — outputs hex by default. Display the hex value next to the picker as a readonly text field for visibility.
- File uploads are NOT part of creation — handled in the detail view
- ✅ Confirmed: backend DTO and Prisma schema have all file fields as optional (`String?`), and `validateFilesExist` only checks files that are provided (`if (url)`). Creating editions without files is fully supported.

**API endpoints used**:
- `GET /api/festival-editions`
- `POST /api/festival-editions`
- `PUT /api/festival-editions/:id`
- `DELETE /api/festival-editions/:id`
- `GET /api/blog-tags` (for blogTagId dropdown)

---

### 5.2 Edition Detail — Bento Grid (`/admin/festival/editions/:id`)

Server-rendered using `GET /api/festival-editions/full/:id` which returns all related data in one query.

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  [← Editions]   Overview | Schedule | Sponsors | Tickets  │
├────────────────────────────────────────────────────────────┤
│              Edition {Year} — {Title}                      │
══════════════════════════════════════════════════════════════

┌─────────────────────────────────┬──────────────────────────┐
│  📸 EDITION ASSETS              │  📊 QUICK STATS          │
│                                 │                          │
│  Logo: [thumb] [Replace]        │  Sections: 4             │
│  Hero: [thumb] [Replace]        │  Activities: 12          │
│  Secondary: [thumb] [Replace]   │  Locations: 3            │
│  Accent: [thumb] [Replace]      │  Volunteers: 28          │
│  Video: [filename] [Replace]    │  Staff: 8                │
│                                 │  Guests: 15              │
│                                 │  Sponsors: 6             │
│                                 │  Tickets: 120            │
│                                 │  Gallery: 45 photos      │
└─────────────────────────────────┴──────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  🖼️ GALLERY                                    [Manage →]  │
│  [photo] [photo] [photo] [photo] [photo]  ... (+40 more)  │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬──────────────────────────┐
│  📍 LOCATIONS         [+ Add]   │  👥 PEOPLE               │
│                                 │                          │
│  Name | Coordinator | Actions   │  Volunteers: 28  [Manage]│
│  ┄ (inline table, max 5 rows)   │  Staff: 8        [Manage]│
│  [View All if > 5]              │  Guests: 15      [Manage]│
│                                 │                          │
├─────────────────────────────────┤                          │
│  📂 SECTIONS & ACTIVITIES [+]   │                          │
│                                 │                          │
│  ▶ Section A (3 activities)     │                          │
│  ▶ Section B (5 activities)     │                          │
│  (accordion → activities list)  │                          │
└─────────────────────────────────┴──────────────────────────┘
```

#### Tab Bar Navigation

All edition sub-pages share a common tab bar at the top:

```html
<ul class="nav nav-tabs mb-3">
  <li class="nav-item"><a class="nav-link active" href="/admin/festival/editions/:id">Overview</a></li>
  <li class="nav-item"><a class="nav-link" href="/admin/festival/editions/:id/schedule">Schedule</a></li>
  <li class="nav-item"><a class="nav-link" href="/admin/festival/editions/:id/sponsors">Sponsors</a></li>
  <li class="nav-item"><a class="nav-link" href="/admin/festival/editions/:id/tickets">Tickets</a></li>
</ul>
```

The active tab is highlighted. `[← Editions]` is a back-link to the list, not a tab.

#### What lives INSIDE the bento grid (inline / accordion):

| Entity | Display | Interaction |
|---|---|---|
| **Assets** | Thumbnails + filenames | Replace per-file via upload intent modal |
| **Stats** | Count badges | Read-only, clickable → navigate |
| **Gallery** | First 5 thumbnails | "Manage" → Gallery modal |
| **Locations** | Compact table (max 5) | Add/Edit/Delete via modals |
| **Sections** | Accordion, each section expands to activities | Add/Edit/Delete sections + activities via modals |
| **People counts** | Volunteer/Staff/Guest counts | "Manage" → opens accordion modal |

#### What gets its OWN page (too complex for inline):

| Entity | Why separate | Route |
|---|---|---|
| **Schedule** | Multi-entity (location + activity + time + presenters), overlap validation | `/admin/festival/editions/:id/schedule` |
| **Sponsors** | Upload intents for logos + nested discount locations | `/admin/festival/editions/:id/sponsors` |
| **Tickets** | Nested redeemings accordion, search by code | `/admin/festival/editions/:id/tickets` |

---

### 5.3 Edition Assets Management

Each asset (logo, hero, secondary, accent, video) has its own **Replace** button in the Assets card.

**Replace flow** (per file):
```
1. Click [Replace] next to "Hero Image"
2. File picker opens → select file
3. POST /api/festival-editions/upload-intents
   body: { year, files: [{ role: "hero", originalFileName, contentType }] }
4. Returns presigned URL
5. PUT file → S3 presigned URL
6. PUT /api/festival-editions/:id
   body: { heroImageFile: publicUrl }
7. Toast success → refresh thumbnail
```

Multiple files can be replaced simultaneously — each triggers its own intent.

---

### 5.4 Gallery Modal

Triggered from "Manage" button on Gallery card. Uses `.modal-xl`.

**Layout**: Grid of photo thumbnails with caption underneath.

**Actions per photo**: 🔍 Zoom (lightbox) | Edit Caption (inline input) | 🗑️ Delete | Drag to reorder.

**Photo Zoom (GLightbox)**: Clicking a photo thumbnail opens it in a full-screen lightbox overlay using GLightbox. Supports entering/exiting zoom and optional prev/next navigation between photos.

```javascript
// Initialize lightbox on gallery thumbnails
const lightbox = GLightbox({
  selector: '.gallery-thumb',
  touchNavigation: true,
  loop: true,
  closeOnOutsideClick: true
});
```

**Add photos**: File picker (multiple files). For each file:
```
POST /api/festival-editions-gallery-photos/edition/:editionId/upload-intent
→ PUT to S3
→ POST /api/festival-editions-gallery-photos/:id/confirm-upload
```

**Reorder**: Drag-and-drop using **SortableJS** → on drop, call `PATCH /api/festival-editions-gallery-photos/reorder`.

```javascript
Sortable.create(document.getElementById('gallery-grid'), {
  animation: 150,
  onEnd: async function () {
    const items = [...this.el.children].map((el, i) => ({ id: el.dataset.id, sortOrder: i }));
    await apiCall('/api/festival-editions-gallery-photos/reorder', 'PATCH', { items });
    showToast('Gallery reordered');
  }
});
```

---

### 5.5 Locations (Inline in Bento Grid)

**Table columns**: Name | Address | Coordinator Name | Actions

**Actions**: ✏️ Edit (Modal) | 🗑️ Delete (Confirm)

**Create**: ➕ Add Location → **Modal** (name, address, coordinatorId dropdown of volunteers)

---

### 5.6 Sections & Activities (Accordion in Bento Grid)

**Sections accordion**: Each section row expands to show its activities.

**Section actions**: ✏️ Edit Name (Modal) | 🗑️ Delete (Confirm) | ➕ Add Activity

**Activity sub-table columns**: Name | Description | Actions

**Activity actions**: ✏️ Edit (Modal) | 🗑️ Delete (Confirm)

---

### 5.7 People Management (Modals from Bento Grid)

#### Volunteers Modal
**Table**: Profile Name | Email | Phone | Actions
**Actions**: ✏️ Edit Profile (Profile Modal) | 🗑️ Delete (Confirm)
**Create**: ➕ Add Volunteer → Modal (profile fields: name, email, phone, birthDate)

#### Staff Modal
**Table**: Member Name | Email | Actions
**Actions**: 🗑️ Delete (Confirm)
**Create**: ➕ Add Staff → Modal (memberId dropdown from all members)

#### Guests Modal
**Table**: Profile Name | Email | Roles (badges) | Actions
**Actions**: ✏️ Edit Roles (checkbox modal with GuestRole enum) | ✏️ Edit Profile | 🗑️ Delete
**Create**: ➕ Add Guest → Modal (profile fields + roles multi-select)

**Guest Role Badge Colors**:

| Role | Badge |
|---|---|
| SPEAKER | `bg-primary` |
| PANELIST | `bg-info` |
| PERFORMER | `bg-warning` |
| WORKSHOP_HOST | `bg-success` |
| MODERATOR | `bg-danger` |

---

### 5.8 Schedule Page (`/admin/festival/editions/:id/schedule`)

Full-page table sorted by `startsAt`.

**Table columns**: Time (start–end) | Location | Activity (Section > Name) | Presenters (badges) | Actions

**Actions**: ✏️ Edit (Modal) | 👥 Manage Presenters | 🗑️ Delete

**Create**: ➕ New Program Entry → **Modal** (locationId dropdown, activityId dropdown, startsAt datetime, endsAt datetime)
- Dropdowns are filtered to this edition's locations and activities
- Backend validates time overlap automatically

**Presenters sub-action** (per program row):
- Click "Manage Presenters" → opens **Presenters Modal**
- Lists this edition's guests with checkboxes (same pattern as General Assembly attendees)
- Check → `POST /api/festival-programs/:programId/presenters` with `{ guestId }`
- Uncheck → `DELETE /api/festival-programs/:programId/presenters` with `{ guestId }`
- Spinner on each row during operation

**Tab bar** at top (Overview | **Schedule** | Sponsors | Tickets) — Schedule tab is active.

---

### 5.9 Sponsors Page (`/admin/festival/editions/:id/sponsors`)

**Table columns**: Logo (thumbnail) | Name | Type (badge) | Level (badge) | Website | Discount Locations Count | Actions

**Actions**: ✏️ Edit (Modal — shows current logo thumbnail with [Replace] button next to it) | 🗑️ Delete (Confirm)

**Create**: ➕ New Sponsor → **Modal with upload**:
```
1. Fill name, type, level, website
2. Select logo file
3. POST /api/festival-sponsors/edition/:editionId/upload-intents
4. PUT file → S3
5. POST /api/festival-sponsors { editionId, name, type, level, logoFile: publicUrl, website }
6. Toast + refresh
```

**Discount Locations accordion** (per sponsor row):
- Expand → sub-table: Name | Address | Discount % | Max Redeems | Actions
- ➕ Add Location → Modal (name, address, discountPercent, redeemMax)
- ✏️ Edit → Modal
- 🗑️ Delete → Confirm

**Sponsorship Level Badge Colors**:

| Level | Badge |
|---|---|
| WHISPERER | `bg-secondary` |
| CHARMER | `bg-info` |
| LOUDSPEAKER | `bg-warning` |
| DIFFUSION_VOICE | `bg-danger` |

**Tab bar** at top (Overview | Schedule | **Sponsors** | Tickets) — Sponsors tab is active.

---

### 5.10 Tickets Page (`/admin/festival/editions/:id/tickets`)

**Search bar** at top: search by ticket code (client-side filter on the table).

**Table columns**: Code | Holder Name | Email | Guest Count | Redeemings Count | Actions

**Actions**: ✏️ Edit Guest Count (Modal with single int field) | 🗑️ Delete (Confirm)

**Create**: ➕ New Ticket → **Modal** (profile fields: name, email, phone, birthDate + guestCount)
- Backend upserts profile by email
- **Email warning**: On email field blur, check against profiles list. If match found, show inline warning: "⚠️ This email belongs to [Profile Name]. The ticket will be linked to their existing profile."

**Redeemings accordion** (per ticket row):
- Expand → sub-table: Discount Location (Sponsor > Location Name) | Redeemed At | Actions
- ➕ Add Redeeming → Modal (discountLocationId dropdown, filtered to edition's sponsors' locations)
- 🗑️ Delete Redeeming → Confirm modal → `DELETE /api/festival-tickets/redeemings/:id`
- No edit — redeemings are immutable once created

**Tab bar** at top (Overview | Schedule | Sponsors | **Tickets**) — Tickets tab is active.

---

## 6. Reusable Component Patterns

### Pattern A: Standard Table Page
Used by: Tags, Posts, Editions list
```
Page Title                    [+ Create]
┌─────────────────────────────────────┐
│  col1 | col2 | col3 | Actions      │
│  ───────────────────────────────    │
│  data  data   data   [✏️][🗑️]      │
└─────────────────────────────────────┘
Toast container (bottom-end)
```

### Pattern B: Table + Accordion
Used by: Sponsors+Locations, Tickets+Redeemings, Sections+Activities
```
│  row data...           [✏️][🗑️][▼]  │
│  ┌─ accordion ─────────────────┐   │
│  │  sub-row1    [✏️][🗑️]       │   │
│  │  sub-row2    [✏️][🗑️]       │   │
│  │  [+ Add sub-item]           │   │
│  └─────────────────────────────┘   │
```

### Pattern C: Checkbox Management Modal
Used by: Schedule Presenters, Guest Roles
Same pattern as General Assemblies attendees — checkbox list with per-row spinner.

### Pattern D: Upload Intent Modal
Used by: Edition Assets, Sponsor Logos, Gallery Photos
```
1. Select file → 2. Get presigned URL → 3. PUT to S3 → 4. Save record with publicUrl
Full-overlay spinner during upload to prevent double-clicks.
```

### Pattern E: Bento Grid Detail Page
Used by: Edition Detail
Bootstrap `.row` with `.col-md-6` and `.col-12` cards. Each card has a header with title + action button.

---

## 7. Backend Endpoints Status

All required endpoints are now implemented:

| Endpoint | Status |
|---|---|
| `GET /api/festival-sponsor-discount-locations/sponsor/:sponsorId` | ✅ Implemented |
| `DELETE /api/festival-tickets/redeemings/:id` | ✅ Implemented |
| `GET /api/festival-editions/full/:id` | ✅ Implemented — returns all sub-entity counts |

> **No missing endpoints.** All frontend features can be built with the current API surface.

---

## 8. Resolved Decisions

All open questions have been answered:

| # | Topic | Decision |
|---|---|---|
| 1 | Tag deletion | Show generic warning: "This tag is used by X editions and Y posts" — no detailed list |
| 2 | Post preview | ✅ Yes — preview button in editor modal, opens nested preview modal rendering JSON → HTML |
| 3 | Slug uniqueness | No client-side validation — server 400 error is sufficient |
| 4 | Edition creation | Files are optional at creation — upload later from detail view. ✅ Backend confirmed compatible |
| 5 | Gallery reorder | ✅ Use SortableJS (CDN) for drag-and-drop |
| 6 | Schedule time | 24h format (`14:00–16:00`), native `<input type="datetime-local">` |
| 7 | Profile reuse | No profile reuse — profiles are treated as reusable field containers, not shared entities |
| 8 | Ticket email | ✅ Warn admin on email match: "This email belongs to [Name]. Ticket will be linked to their profile." |
| 9 | Sponsor logo edit | ✅ Show current logo thumbnail + [Replace] button in edit modal |
| 10 | Dashboard | Add only **Blog Posts** count and **Festival Editions** count — sub-entity counts live on their detail pages |
| 11 | Color picker | Native `<input type="color">` with hex value displayed as readonly text next to it |
| 12 | Back navigation | ✅ Tab bar: Overview \| Schedule \| Sponsors \| Tickets — shared across all sub-pages |
| 13 | Gallery bulk ops | No bulk delete — individual operations only. ✅ Add GLightbox for photo zoom (enter/exit + optional prev/next navigation) |

---

## 9. Updated Dashboard Counts

Add two new cards to the existing bento grid (minimal — sub-entity counts belong on their respective pages):

```
┌──────────┬──────────┬──────────┬──────────┐
│  Users   │ Members  │ Mentors  │  Tutors  │
├──────────┼──────────┼──────────┼──────────┤
│  Ninjas  │ Meetups  │ Sessions │Assemblies│
├──────────┼──────────┴──────────┼──────────┤
│Documents │   Membership Fees   │  Roles   │
├──────────┼─────────────────────┼──────────┤  ← NEW ROW
│ Editions │     Blog Posts      │          │
└──────────┴─────────────────────┴──────────┘
```

---

## 10. Implementation Phases

| Phase | Scope | Size | Dependencies |
|---|---|---|---|
| F12 | Blog Tags — table + accordion + CRUD modals | Small | — |
| F13 | Blog Posts — table + fullscreen Editor.js modal + publish/unpublish | Large | F12 (tags for multi-select) |
| F14 | Festival Editions list — table + create/edit modals | Medium | — |
| F15 | Edition Detail bento grid — stats + assets + gallery | Large | F14 |
| F16 | Edition Detail: Sections accordion + Activities | Medium | F15 |
| F17 | Edition Detail: Locations table + People modals (volunteers, staff, guests) | Medium | F15 |
| F18 | Schedule page — program table + presenters checkbox modal | Large | F16, F17 (needs locations, activities, guests) |
| F19 | Sponsors page — table + logo upload + discount locations accordion | Large | F15 |
| F20 | Tickets page — table + search + redeemings accordion | Medium | F19 (needs discount locations for redeeming dropdown) |
| F21 | Dashboard update — add blog + festival counts | Small | F12–F20 |
