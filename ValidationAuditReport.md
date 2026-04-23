# Backend Technical Audit Report

> Scope: Phase 5+ (Festival, Blog, Admin UI, File Uploads) with cross‑cutting
> notes on earlier phases where they affect later ones.
> Method: Static review of Prisma schema, module layout, bootstrap, DTOs,
> and controller/service patterns. No runtime inspection performed.

---

## Summary

The backend follows a disciplined modular-monolith NestJS structure that mirrors
the phased plan in `PLAN.md`. Prisma schema is well split per domain and
respects most of the target relational model. Phase 5 (Festival + Blog) is
structurally complete, and an Admin UI built on Handlebars exists as a parallel
surface under `/admin`.

However, the audit surfaced several **critical gaps** that must be addressed
before the system can be considered production-ready:

1. **Global validation is not enabled.** `main.ts` does not call
   `app.useGlobalPipes(new ValidationPipe(...))`, which means every DTO in the
   project is effectively decorative. This single issue invalidates a large part
   of the security posture the DTOs try to provide.
2. **The file upload subsystem has multiple integrity and security gaps** —
   orphaned uploads, missing MIME/size enforcement at the controller level, and
   no transactional coupling between "upload to S3" and "persist entity".
3. **Several RBAC boundaries are implicit** rather than enforced at the
   controller layer (admin UI routes, write endpoints for festival/blog).
4. **Data-integrity invariants expressed in `PLAN.md`** (e.g. sponsor discount
   `1..100`, ticket `guestCount 0..5`, program `endsAt > startsAt`,
   `FestivalProgram` activity/location must belong to the same edition) are
   **not enforced** either in Prisma (no `CHECK`) or consistently in services.
5. A naming/typo issue in the module tree (`fesival-locations`) will cause
   long‑term friction and is best fixed early.

The system is close to being solid — the gaps are mostly "hardening" work, not
fundamental redesigns.

---

## Critical Issues (must fix)

### C1. `ValidationPipe` is never registered globally
- **File**: `src/main.ts`
- **Problem**: The bootstrap registers `GlobalExceptionFilter`, cookie parser,
  and CORS, but does **not** call
  `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))`.
  Phase 3 of the plan explicitly requires this.
- **Why it is a problem**: Every `class-validator` decorator in every DTO
  (`RegisterDto`, `MemberDto`, all Festival/Blog DTOs) is silently ignored.
  Requests can:
    - bypass `@IsEmail`, `@IsEnum`, `@MinLength`, `@IsPhoneNumber` etc.;
    - pass arbitrary extra fields that then flow into Prisma `create`/`update`
      if services spread the DTO (`data: dto`);
    - pass wrong types (string where int is expected), causing 500s instead of
      400s.
- **Suggested fix**: Add in `bootstrap()`:
  ```ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false }
    })
  )
  ```
  Then grep the codebase for `data: dto` / `...dto` in `prisma.*.create` calls
  and make sure those DTOs are strict.

### C2. File uploads are not transactionally coupled to entity persistence
- **Files**: `src/s3/s3.service.ts`, any controller calling it (e.g.
  `festival-editions`, `festival-editions-gallery-photos`, `blog-posts`,
  `festival-sponsors`, `agreement-documents`).
- **Problem**: The typical flow is: upload to S3/Filebase → then insert the DB
  row referencing the filename. If the DB insert fails (unique constraint,
  validation, FK error) the S3 object remains, producing **orphaned storage**.
  The inverse — DB row inserted first but S3 upload fails — leaves a row
  pointing to a non-existent file.
- **Why it is a problem**: Over time, storage grows with garbage, and listing
  endpoints produce broken image/video references. This also becomes a minor
  cost issue on paid buckets (Filebase).
- **Suggested fix**:
    - Upload to S3 **after** building the DB transaction intent, using a
      content-addressed key (e.g. `sha256(file)` + ext). On DB failure, delete
      the S3 object in a `finally`/compensating step.
    - Better: stage the file in a `tmp/` prefix, then on successful commit move
      it (or just record that prefix). Implement a scheduled job that removes
      `tmp/` objects older than N minutes and files that are not referenced by
      any entity.
    - On `delete` of an entity that owns files, explicitly delete the S3
      object — I could not find cascade deletion of S3 files in the service
      layer; Prisma `onDelete: Cascade` removes DB rows but does **not** touch
      the bucket.

### C3. No server-side file validation (MIME / size / extension)
- **Files**: controllers that accept `@UploadedFile()` for festival edition
  branding (logo, hero image, after video), gallery photos, sponsor logos,
  agreement document PDFs, blog post bodies.
- **Problem**: There is no evidence of `FileTypeValidator` / `MaxFileSizeValidator`
  being applied via `ParseFilePipe`. The `MimeType`/size is presumably trusted
  from the multipart client.
- **Why it is a problem**:
    - A user can upload an `.exe`, `.html`, or SVG with embedded JS labeled as
      an image; if the public endpoint later serves it directly via
      `useStaticAssets(public)` or a proxied S3 URL, this enables stored XSS
      and drive-by downloads.
    - No max size means a single request can DoS the server process (Nest
      buffers in memory unless you stream).
- **Suggested fix**: Use `ParseFilePipe` per endpoint:
  ```ts
  @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
      new FileTypeValidator({ fileType: /image\/(png|jpeg|webp)/ })
    ]
  })) file: Express.Multer.File
  ```
  Do the same for PDFs (agreement docs) and videos (after_video_file) with
  appropriately higher limits. Also sniff the actual bytes server-side
  (`file-type` npm) — do not trust the client-supplied MIME.

### C4. Path traversal / filename overwrite risk
- **Files**: S3 upload usages, plus any places that derive a filename from
  client input.
- **Problem**: Prisma stores "only file name" per `PLAN.md §Faza 5`. If the S3
  key is built as `editions/${slug}/${file.originalname}` without sanitization,
  an attacker can submit `../../otherEdition/hero.jpg` as the original name and
  **overwrite** an unrelated entity's asset (S3 treats the key as a flat string
  but the DB row would persist whatever string you saved).
- **Why it is a problem**: Silent cross-entity overwrites, enumeration of other
  editions, and admin UI rendering unexpected files.
- **Suggested fix**:
    - Never use `originalname` for the key. Use `cuid()`/`uuid()` + extracted
      extension based on sniffed MIME.
    - Store only the final key the server generated, never a client string.
    - If you must keep the original name for display, store it in a separate
      `displayName` column.

### C5. `FestivalProgram` has no cross-entity integrity constraint
- **File**: `prisma/schema/festival-program.prisma`
- **Problem**: `FestivalProgram` has `editionId`, `locationId`, `activityId`
  but nothing guarantees that `location.editionId == program.editionId` and
  that `activity.section.editionId == program.editionId`. Same concern for
  `FestivalProgramPresenter.guest.editionId == program.editionId`.
- **Why it is a problem**: A program can reference a location or activity from
  a different festival edition, producing an inconsistent timetable that the
  admin UI will happily render.
- **Suggested fix**:
    - Enforce in the service: load location/activity/guest and assert
      `editionId` equality inside the create/update transaction.
    - Optionally add a composite FK pattern in Prisma: make
      `@@unique([id, editionId])` on `FestivalLocation` / `FestivalActivity` /
      `FestivalGuest` and have `FestivalProgram` reference the composite
      `(locationId, editionId)` tuple. SQLite supports this.
    - Add a SQL trigger in the Phase 5 migration (the plan says
      "constrângerile de business sunt dublate: validator în service + trigger
      în DB").

### C6. Missing `CHECK` / domain constraints the plan explicitly calls out
- **File**: `prisma/schema/festival-sponsors.prisma`,
  `prisma/schema/festival-tickets.prisma`,
  `prisma/schema/festival-program.prisma`
- **Problem**:
    - `FestivalSponsorDiscountLocation.discountPercent` is `Int` with no
      `CHECK 1..100`; `redeemMax` has no `CHECK >= 1`. The plan
      (§Faza 5) requires both.
    - `FestivalTicket.guestCount` has no `CHECK 0..5`.
    - `FestivalProgram.endsAt` has no guarantee of being after `startsAt`.
    - `FestivalEdition` has color fields (`mainColor`, `accentColor`) with no
      format guarantee at DB level.
- **Why it is a problem**: DB is supposed to be the final defender of
  invariants. With only DTO validators (which, per C1, aren't even active), a
  bad seed script, admin script, or future import job can write impossible
  rows.
- **Suggested fix**: Add raw SQL CHECK constraints in the Phase 5 migration
  (as explicitly planned in `PLAN.md` §Faza 8.3) and mirror them in DTOs. Keep
  `IsInt + Min(0) + Max(100)` etc. at the DTO layer.

### C7. Admin UI routes are excluded from the global `/api` prefix but RBAC is not visibly enforced at bootstrap
- **File**: `src/main.ts`, `src/admin/*.controller.ts`
- **Problem**: `setGlobalPrefix('api', { exclude: ['admin', 'admin/(.*)', ...] })`
  means every controller under `src/admin` is a sibling of `/api`, served via
  Handlebars. There is no global guard; each admin controller must individually
  use `@Auth('admin')` (or similar). A missing decorator on a single admin
  controller = a publicly reachable admin page.
- **Why it is a problem**: Forgetting an `@UseGuards(JwtAuthGuard, RolesGuard)`
  on any of the 7 admin controllers is indistinguishable from a working admin
  route during dev (the browser is already logged in).
- **Suggested fix**:
    - Register `APP_GUARD` + `APP_GUARD` (Jwt + Roles) globally and opt-out
      with `@Public()` where needed (register, login, static marketing pages).
    - Or add a module-level guard on `AdminModule` using
      `{ provide: APP_GUARD, useClass: AdminOnlyGuard }` pattern scoped to the
      module, so every controller inside it is protected by default.

---

## High Priority Issues

### H1. Inconsistent `memberType` / CTI validation in `MemberDto`
- **File**: `src/members/dto/member.dto.ts`
- **Problem**: `MemberDto` permits `fullMemberKind` to be omitted only when
  `memberType !== FULL`, but there is no inverse check — a payload with
  `memberType = ASPIRING` and `fullMemberKind = REGULAR` will be accepted,
  then the service must know to ignore the stray field. Also the DTO does not
  cover `profileId` although the plan says `profileId IsString`.
- **Why it is a problem**: Silent acceptance of contradictory state and
  reliance on service to strip fields. With C1 unfixed, the `whitelist` won't
  strip them either.
- **Suggested fix**:
    - Add `@ValidateIf(o => o.memberType !== MemberType.FULL) @IsEmpty()` on
      `fullMemberKind` to enforce the negative case.
    - Ensure `profileId` is present in the DTO (or document explicitly that
      profile creation happens in a parent DTO and `profileId` is derived).

### H2. `RegisterDto` has no uniqueness/availability check for username or email
- **Files**: `src/auth/auth.service.ts` (register flow), `src/auth/dto/register.dto.ts`
- **Problem**: DTO only validates format. Registration must catch unique
  violations on `users.username` and `profiles.email` and translate them to
  `409 Conflict`. If this is done via a generic Prisma exception filter, fine
  — but `GlobalExceptionFilter` should be reviewed to ensure
  `P2002` is mapped to 409 with the offending field.
- **Why it is a problem**: Generic 500s during registration are both a bad UX
  and a potential user enumeration issue (different errors for taken vs.
  not-taken usernames).
- **Suggested fix**: Make sure `GlobalExceptionFilter` handles `P2002` with a
  consistent 409 response that does **not** leak which field was the
  duplicate, OR intentionally leak it only on a non-security-sensitive field
  (username is already enumerable via login; email is more sensitive).

### H3. Race condition on `MembershipFee` uniqueness
- **File**: `src/membership-fees/membership-fees.service.ts` (create path)
- **Problem**: `UNIQUE(member_id, year)` exists in Prisma — good — but if the
  service first does `findUnique` then `create`, two concurrent requests can
  both pass the check and one will crash with `P2002`.
- **Why it is a problem**: Non-deterministic behavior and log noise.
- **Suggested fix**: Skip the pre-check; rely on the DB, catch `P2002` and
  translate to 409. Same pattern applies to
  `GeneralAssemblyAttendee`, `FestivalVolunteer`, `FestivalGuest`,
  `FestivalProgramPresenter`, `FestivalStaffMember`,
  `FestivalDiscountRedeeming`, all `AgreementSignature` tables, and
  `BlogPostTag`.

### H4. Festival ticket `code` collision handling
- **File**: `prisma/schema/festival-tickets.prisma`,
  `src/festival-tickets/festival-tickets.service.ts`
- **Problem**: `code` uses `@default(cuid())` so server-side collisions are
  astronomically unlikely — fine. But the DTO (per plan) also allows the
  client to pass `code` with `MinLength(6) MaxLength(64)`. If client-provided
  codes are accepted, the service must ensure uniqueness per edition
  (`@@unique([editionId, code])` covers this, see H3) and forbid collisions
  with `cuid()`-shaped strings.
- **Why it is a problem**: Mixing client-set and server-generated codes
  creates unpredictable UX — two tickets for different editions with the same
  code is technically OK per schema but confusing for QR flows.
- **Suggested fix**: Pick one: either codes are always server-generated and
  DTO forbids `code`, or client may propose one and uniqueness violations
  return 409.

### H5. `FestivalDiscountRedeeming` doesn't enforce `redeemMax`
- **File**: `src/festival-tickets/festival-tickets.service.ts` (or the
  redeeming service, wherever redeem creates happen)
- **Problem**: `FestivalSponsorDiscountLocation.redeemMax` is stored but
  nothing aggregates current redemptions to stop creation past the max. The
  `UNIQUE(ticket_id, discount_location_id)` only stops the same ticket from
  redeeming twice; it does not cap total usages.
- **Why it is a problem**: Business rule violated silently; sponsors can be
  "over-redeemed".
- **Suggested fix**: Wrap creation in a transaction:
  `count(redeemings where discountLocationId = X) < redeemMax` then insert,
  otherwise 409. Consider an SQL trigger that rejects inserts violating this.

### H6. `FestivalProgram.endsAt > startsAt` not validated
- **Files**: `src/festival-programs/dto/*.ts`,
  `src/festival-programs/festival-programs.service.ts`
- **Problem**: No cross-field validator checks `endsAt > startsAt`, and no
  check for overlapping programs in the same `locationId`.
- **Why it is a problem**: Inverted intervals and double-booked rooms will
  render as garbage in the admin timetable UI.
- **Suggested fix**: Add a class-level `@ValidatorConstraint` for ordering
  plus service-side overlap check.

### H7. Consistency of file-path columns
- **Files**: all schemas that use `*File` columns
  (`custom_logo_file`, `hero_image_file`, `after_video_file`,
  `photo_file`, `logo_file`, agreement documents).
- **Problem**: Some columns are `UNIQUE` (e.g. `photo_file`) and others are
  not (e.g. `logoFile` on `FestivalSponsor`). Conventions are inconsistent,
  and nothing prevents two rows from pointing to the same S3 key.
- **Why it is a problem**: Deleting one row then cleaning its S3 object will
  silently break the other row.
- **Suggested fix**: Pick a convention and enforce it. Either (a) every file
  column is `UNIQUE` and the service copies files when entities share assets,
  or (b) track references in a `FileAsset` table with a reference count.

### H8. Module naming typo `fesival-locations`
- **Files**: `src/fesival-locations/*`, `src/app.module.ts`
  (`FesivalLocationsModule`)
- **Problem**: Typo `fesival` (missing `t`). It's a directory, module name,
  service and controller class.
- **Why it is a problem**: Future greps, imports, and contributor onboarding
  will be confused, and any URL path inheriting the name (less likely since
  routes are set by decorators) will be user-visible.
- **Suggested fix**: Rename to `festival-locations` consistently and run
  `npm run build` + tests.

---

## Medium / Low Priority Issues

### M1. Response shapes likely expose internal fields
- **Files**: almost every `*.service.ts` that returns `prisma.X.findMany()`
  directly.
- **Problem**: Without explicit `select` or a `plainToInstance(ResponseDto)`
  step, services return all Prisma fields, including `passwordHash` in the
  `users` case unless specifically excluded.
- **Suggested fix**: For `UsersService`, verify that `passwordHash` is never
  returned. Create `select` presets per entity and prefer them in controllers
  feeding the public API. Handlebars admin views can keep richer payloads but
  ideally use the same safe shapes.

### M2. Missing index coverage on common admin queries
- **Files**: Prisma schemas.
- **Problem**: Fields frequently filtered or sorted in admin lists typically
  lack `@@index`: `Meetup.startsAt`, `DojoSession.startsAt`,
  `FestivalProgram.startsAt`, `BlogPost.publishedAt`, `Member.joinedAt`,
  `MembershipFee.year`.
- **Why it is a problem**: Even on SQLite, admin "latest X" pagination will
  get slower as the DB grows. Cheap to fix now.
- **Suggested fix**: Add `@@index([startsAt])` etc. to each respective model.

### M3. `@updatedAt` on join tables without updatable columns
- **Files**: `FestivalProgramPresenter`, `FestivalStaffMember`,
  `FestivalGuestRole` (only has `createdAt` not `updatedAt`, actually — but
  the others do).
- **Problem**: `@updatedAt` on a pure join table is dead weight.
- **Why it is a problem**: Adds write overhead and implies the row mutates.
- **Suggested fix**: Remove `updatedAt` from join tables that have no
  updatable column.

### M4. `BlogPost.body IsJson` planned but storage is `String`
- **Files**: `prisma/schema/blog.prisma` (not read, inferred from plan),
  `src/blog-posts/dto/*`.
- **Problem**: Storing structured JSON as `String` with only `@IsJson` at DTO
  level means the DB cannot query/validate. If you ever want to index or
  search post bodies, this is a migration blocker.
- **Suggested fix**: Either switch to a proper JSON field
  (SQLite supports JSON1 via raw), or store `summary` + `body` as plain text
  and keep content blocks in a separate table.

### M5. Handlebars helper `json` can dump PII into admin views
- **File**: `src/main.ts`
- **Problem**: `hbs.registerHelper('json', ctx => JSON.stringify(ctx))`. If a
  template invokes `{{{json user}}}` and the object still contains
  `passwordHash` or refresh tokens, it leaks into the admin DOM source.
- **Why it is a problem**: Even for admin-only screens, this is a defense-in-
  depth hole.
- **Suggested fix**: In `json` helper, always strip a known blacklist
  (`passwordHash`, `refreshTokenHash`, `secret*`). Better: feed the template
  only explicitly shaped view models.

### L1. CORS origin hardcoded
- **File**: `src/main.ts`
- **Problem**: `origin: ['http://localhost:3000']` is baked in, while admin
  runs on port 4200 using same-origin. Any future front-end on a different
  origin will silently fail.
- **Suggested fix**: Read allowed origins from env (`CORS_ORIGINS` as CSV).

### L2. `app.listen(process.env.PORT ?? 4200)` without parse
- **File**: `src/main.ts`
- **Problem**: `PORT` is a string; `listen` accepts it, but type-wise this is
  brittle. Also, no bind host is specified.
- **Suggested fix**: `Number(process.env.PORT ?? 4200)` and allow `HOST` env
  for deployment flexibility.

### L3. Missing `seed.ts` validation of idempotency
- **File**: `prisma/seed.ts`
- **Problem**: Not inspected in this audit, but Phase 8 requires admin user +
  default roles. Verify it uses `upsert` for all seeded rows so re-running
  does not duplicate.

---

## Security Concerns

### S1. Admin UI authentication model is unclear
- **Files**: `src/admin/*.controller.ts`, `src/auth/*`, `src/main.ts`.
- **Concern**: The admin controllers render Handlebars views, which implies a
  cookie-based session (browser). The rest of the API uses JWT access +
  refresh tokens (Phase 3). Mixing the two without clear separation is a
  classic source of auth bypass. Questions to answer:
    - Is the JWT stored in an HttpOnly cookie so Handlebars views can use it?
    - Is there CSRF protection on admin POST endpoints? (cookie-auth + no
      CSRF = CSRF vulnerability on every admin mutation.)
    - Is `SameSite=Strict` or `Lax` set on the access-token cookie?
- **Recommendation**:
    - Use HttpOnly + Secure + SameSite=Lax cookies for admin;
    - Add a CSRF token (`csurf` or a double-submit token) on admin POST/PUT/
      DELETE routes;
    - Document the threat model in README.

### S2. Static assets served from `public`
- **File**: `src/main.ts` — `app.useStaticAssets(join(__dirname, '..', 'public'))`
- **Concern**: If uploads are ever persisted to `public/uploads`, any
  validated-but-malicious file (e.g. `.html` with script) is directly
  executable in the user's origin. Given Filebase/S3 is in use, `public/`
  should host only static branding assets and admin JS/CSS.
- **Recommendation**: Document that `public/` is **only** for immutable
  project-shipped assets; user uploads must go to S3/Filebase.

### S3. No rate limiting
- **Files**: no `@nestjs/throttler` present in `app.module.ts`.
- **Concern**: `/auth/login`, `/auth/register`, and ticket `code` lookups are
  all high-value endpoints that can be brute-forced.
- **Recommendation**: Install `@nestjs/throttler` and apply stricter limits to
  `POST /auth/login` (e.g. 5/min/IP) and to ticket redemption endpoints.

### S4. JWT refresh-token rotation not verified
- **Files**: `src/auth/auth.service.ts`, `src/auth/auth.controller.ts`.
- **Concern**: The plan mentions JWT access + refresh. Audit should verify:
    - Refresh tokens are persisted hashed (argon2) with revocation support;
    - `POST /auth/login/refresh` rejects replay (rotate on use);
    - Logout invalidates the stored hash.
  Without access to the file I cannot confirm, but it is a common missed item.

### S5. `GlobalExceptionFilter` may leak stack traces in non-prod mode
- **File**: `src/common/filters/global-exception.filter.ts`
- **Concern**: Confirm that production responses contain
  `{ statusCode, message }` only, never `stack` or Prisma error metadata that
  includes column names / query fragments.

---

## Suggested Backend Improvements for UI/UX

These are *backend-only* endpoints / response improvements that would make the
Handlebars admin noticeably better without touching the frontend plan.

1. **Aggregated dashboards** — single endpoint per admin section returning
   counts and "latest N" in one call, to avoid the admin view making many
   round trips:
    - `GET /admin/stats/overview` → members, aspiring/full split, fees paid
      this year, upcoming meetups, upcoming dojo sessions, next assembly.
    - `GET /admin/stats/festival/:editionId` → sponsor count per level,
      ticket count, volunteers/staff, sections/activities/programs counts.
2. **Cascading dropdown endpoints** — to populate related selects quickly:
    - `GET /festival-editions/:id/locations` (already implicit via filter,
      but a canonical endpoint documents the intent);
    - `GET /festival-editions/:id/activities` and
      `GET /festival-editions/:id/guests` feeding the program form.
3. **Profile search** — many admin forms need a picker:
    - `GET /profiles?search=&notMemberOf=festivalEdition:xyz&limit=20` to
      avoid N+1 list reloads.
4. **Ticket validation endpoint for door scanning**:
    - `POST /festival-tickets/scan { code, editionId }` returning holder
      profile summary and remaining discount redemption capacity per sponsor
      location.
5. **Bulk fee generation**:
    - `POST /membership-fees/bulk-generate { year, amount }` creating UNPAID
      fees for all current members not already having that year's fee. Admin
      UI can trigger once per year instead of N requests.
6. **Pagination and filtering consistency** — standardize query parameters
   (`page`, `pageSize`, `sortBy`, `sortDir`, `q`) across all list endpoints.
   Currently each controller appears to have a bespoke convention (inferred
   from module variety), which complicates the admin templates.
7. **Pre-signed upload URLs** — issue a short-lived S3 POST policy from the
   backend so the admin can upload large videos (festival `afterVideoFile`)
   directly to Filebase without transiting the Nest process. Reduces memory
   pressure and prevents the upload-size DoS noted in C3.
8. **Soft delete / archival** — for `FestivalEdition`, `BlogPost`, `Member`
   (especially with FK constraints), expose `archived` endpoints rather than
   destructive deletes; gives the admin a recycle bin without losing history.

---

## Cross-phase notes (earlier phases that affect Phase 5+)

- **Phase 3 (Auth)**: C1 (no `ValidationPipe`) and S4 (refresh token
  rotation) originate here and cascade into every later phase.
- **Phase 4 (Members / Meetups / Dojo)**: H1 (`MemberDto` ambiguity), H3
  (`MembershipFee` race), and M2 (missing indexes on `startsAt`) originate
  here and are inherited patterns that Phase 5 copies.
- **Phase 5 (Festival / Blog)**: C5, C6, H4, H5, H6, H7 are phase-5-specific.

---

## Recommended remediation order

1. **Day 1** — C1 (ValidationPipe) + S5 (filter response sanity) + S3 (rate
   limit) + S1 (CSRF/cookie review). These are < 1 day total and close the
   largest doors.
2. **Day 2-3** — C2, C3, C4 (upload hardening) and H7 (file column
   consistency).
3. **Day 4-5** — C5, C6, H5, H6 (DB-level business rules + service checks)
   and H3 (race conditions).
4. **Day 6+** — H1, H4, M*, L*, plus UI-facing aggregate endpoints from the
   last section.
