## Plan: Backend NestJS + Prisma + SQLite pentru AI3

Planul recomandat este să construiești API-ul ca modular monolith NestJS, pornind cu autentificare
și RBAC, apoi modulele de business în ordinea dependențelor. Prisma va acoperi majoritatea
modelării, iar regulile care nu pot fi exprimate direct (CTI exclusiv, limite redeem, reguli
condiționale) se implementează în migrații SQL manuale.

**Steps**

1. Faza 0: Setup proiect backend și standarde de lucru
2. Faza 1: Modelare Prisma inițială pentru Identity + Membership + Meetups + Dojo + General Assembly
3. Faza 2: Generarea tipurilor TypeScript
4. Faza 3: Implementare NestJS Auth + RBAC
5. Faza 4: Implementare module core (Profiles, Members, Meetups, Dojo, General Assembly)
6. Faza 5: Modelare Prisma pentru Festival + Blog
7. Faza 6: Migrarea 0002 festival și trigger redeem limit
8. Faza 7: Implementare module Festival + Blog
9. Faza 8: Validare finală, seed, testare și hardening

## Faza 0: Setup proiect backend și standarde de lucru

0. Configurare prettier pentru consistență.

```
// .prettierrc
{
  "trailingComma": "none",
  "tabWidth": 2,
  "useTabs": true,
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "printWidth": 100,
  "proseWrap": "always",
  "bracketSpacing": true
}
```

1. Inițializezi proiectul NestJS și dependințele principale:
   - nest new ai3-backend
   - npm i @prisma/client prisma
   - npm install @prisma/adapter-better-sqlite3
   - npm i @nestjs/config class-validator class-transformer
   - npm i @nestjs/jwt @nestjs/passport passport passport-jwt argon2

2. Configurezi Prisma cu SQLite: 
    - npx prisma init 
    - în .env setezi DATABASE_URL="file:./name.db" 
    - în prisma/schema.prisma setezi provider sqlite
   <a href="https://docs.nestjs.com/recipes/prisma"><small>Documentatie Prisma/NestJS</small></a>
   <a href="https://docs.nestjs.com/techniques/configuration"><small>Config Module pentru
   .env</small></a> <br>

3. Workflow standard pentru fiecare modul (adaptat pe stilul tău Mongo):
   - definești modelele în Prisma
   - rulezi migrarea dupa fiecare model nou sau modificat
    - npx prisma migrate dev --name nume_migrare
   - generezi modul, service, controller NestJS
   - creezi DTO-uri cu validări explicite
   - implementezi service
   - implementezi controller
   - protejezi endpoint-urile cu guard-uri

4. Structură recomandată src:
   - src/common (pipes, guards, decorators, filters)
   - src/auth
   - src/rbac
   - src/profiles
   - src/members
   - src/meetups
   - src/dojo
   - src/general-assemblies
   - src/festival
   - src/blog
   - src/prisma

## Faza 1: Modelare Prisma pentru Core

1. Definești modelul central Profile și User/RBAC (cu mapare la tabele SQL din README).
2. Definești CTI pentru Member prin 3 modele: Member, AspiringMember, FullMember.
3. Definești Meetups cu submodele Workshop și AntiWorkshop.
4. Definești Dojo (mentori, tutori, ninjas, documente, semnături).
5. Definești General Assembly.

### Tabele și chei pentru Core (de implementat în Prisma)

Identity + RBAC:

- profiles: PK id; coloane name, email, phone, birth_date, created_at, updated_at
- users: PK id; FK profile_id -> profiles.id (UNIQUE), username UNIQUE, password_hash, created_at,
  updated_at
- roles: PK id; name UNIQUE
- user_roles: PK compus (user_id, role_id); FK user_id -> users.id; FK role_id -> roles.id

Members (CTI):

- members: PK id; FK profile_id -> profiles.id (UNIQUE), joined_at, created_at, updated_at
- aspiring_members: PK/FK member_id -> members.id
- full_members: PK/FK member_id -> members.id; full_member_kind CHECK founder|honorary|regular
```
<!-- Using an enum -->
enum FullMemberKind {
    FOUNDER
    HONORARY
    REGULAR
}
```
- membership_fees: PK id; FK member_id -> members.id; year, amount, status; UNIQUE(member_id, year)
```
<!-- enum for status -->
enum MembershipFeeStatus {
    PAID
    UNPAID
}
```

Meetups:

- meetups: PK id; starts_at, location, created_at, updated_at
- meetup_workshops: PK id; FK meetup_id -> meetups.id (UNIQUE), FK presenter_id -> profiles.id,
  title, theme CHECK demo_your_stack|fup_nights|meet_the_business
```
<!-- enum for theme -->
enum WorkshopTheme {
    DEMO_YOUR_STACK
    FUP_NIGHTS
    MEET_THE_BUSINESS
}
```
- meetup_anti_workshops: PK id; FK meetup_id -> meetups.id (UNIQUE), agenda

Dojo:

- dojo_mentors: PK id; FK profile_id -> profiles.id, description
- dojo_tutors: PK id; FK profile_id -> profiles.id
- dojo_ninjas: PK id; FK profile_id -> profiles.id; FK tutor_id -> dojo_tutors.id (UNIQUE); useful_info
  - a tutor can't exist without a ninja, but a ninja can exist without a tutor (e.g. if they are just starting)
- dojo_sessions: PK id; starts_at, location, theme, FK mentor_id -> dojo_mentors.id
- agreement_documents: PK id; name - for display, slug UNIQUE - for URL
- mentor_agreement_signatures: PK id; FK mentor_id -> dojo_mentors.id; FK document_id ->
  agreement_documents.id; signed_at; UNIQUE(mentor_id, document_id)
- tutor_agreement_signatures: PK id; FK tutor_id -> dojo_tutors.id; FK document_id ->
  agreement_documents.id; signed_at; UNIQUE(tutor_id, document_id)

General Assembly:

- general_assemblies: PK id; year, announced_at, held_at, location, min_quorum,
  - activity_report_document_id, minutes_document_id (later phase)
- general_assembly_attendees: PK compus (assembly_id, member_id); FK assembly_id ->
  general_assemblies.id; FK member_id -> members.id; attended

## Faza 2: Generarea tipurilor TypeScript

Generezi tipurile TypeScript pentru Prisma Client:
- npx prisma generate


## Faza 3: Auth + RBAC (prima implementare în NestJS)

1. Creezi modulele:

- auth, users, roles

2. Implementare auth recomandată:

- JWT access + refresh tokens
- parole hash cu bcrypt
- JwtAuthGuard + RolesGuard
- decorator Roles pentru endpoint-uri

3. Endpoint-uri minime:

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /auth/me

4. DTO-uri și validări (model de lucru):

- RegisterDto: username IsString + MinLength(3) + MaxLength(50); password IsString + MinLength(8) +
  MaxLength(128); profileId IsInt + Min(1)
- LoginDto: username IsString + MinLength(3); password IsString + MinLength(8)
- AssignRoleDto: userId IsInt + Min(1); role IsString + Matches pe naming role

5. Activezi ValidationPipe global cu whitelist, forbidNonWhitelisted și transform.

## Faza 4: Module Core business

Ordine recomandată în implementare:

1. Profiles
2. Members
3. Meetups
4. Dojo
5. General Assemblies

Workflow repetabil per modul:

- generezi modul/service/controller
- creezi dto/create, dto/update, dto/query
- implementezi service cu Prisma
- implementezi controller
- pui guard-uri pe operații de scriere

DTO validări recomandate pe entități core:

- Profile DTO: name IsString MinLength(2) MaxLength(120); email IsOptional IsEmail; phone IsOptional
  Matches regex telefon; birthDate IsOptional IsDateString
- Member DTO: profileId IsInt Min(1); joinedAt IsDateString; memberType IsIn aspiring|full;
  fullMemberKind IsOptional IsIn founder|honorary|regular
- MembershipFee DTO: memberId IsInt Min(1); year IsInt Min(2000) Max(2100); amount IsNumber
  MaxDecimalPlaces(2) Min(0); status IsIn pending|paid|waived
- Meetup DTO: startsAt IsDateString; location IsString MinLength(2) MaxLength(255)
- MeetupWorkshop DTO: meetupId IsInt; presenterId IsInt; title IsString MinLength(3) MaxLength(150);
  theme IsIn demo_your_stack|fup_nights|meet_the_business
- AntiWorkshop DTO: meetupId IsInt; agenda IsOptional IsString MaxLength(5000)
- DojoMentor DTO: profileId IsInt; description IsOptional IsString MaxLength(2000)
- DojoTutor DTO: profileId IsInt
- DojoNinja DTO: profileId IsInt; tutorId IsInt; usefulInfo IsOptional IsString MaxLength(2000)
- DojoSession DTO: startsAt IsDateString; location IsString MinLength(2) MaxLength(255); theme
  IsOptional IsString MaxLength(255); mentorId IsInt
- AgreementSignature DTO: mentorId/tutorId IsInt; documentId IsInt; signedAt IsDateString
- GeneralAssembly DTO: year IsInt Min(2020) Max(2100); announcedAt IsOptional IsDateString; heldAt
  IsOptional IsDateString; location IsOptional IsString MaxLength(255); minQuorum IsOptional IsInt
  Min(1)
- AssemblyAttendee DTO: assemblyId IsInt; memberId IsInt; attended IsBoolean

## Faza 5: Modelare Prisma pentru Festival + Blog

1. Adaugi modelele festival/blog în schema Prisma.
2. Menții enums ca Prisma enum acolo unde se poate.
3. Păstrezi convenția pentru fișiere: coloanele stochează doar file name.

### Tabele și chei pentru Festival + Blog

Blog:

- blog_tags: PK id; name UNIQUE
- blog_posts: PK id; title, slug UNIQUE, summary, body, published_at, created_at, updated_at
- blog_post_tags: PK compus (post_id, tag_id); FK post_id -> blog_posts.id; FK tag_id ->
  blog_tags.id

Festival base:

- festival_editions: PK id; year UNIQUE; title, theme, branding files/colors, after_video_file, FK
  blog_tag_id -> blog_tags.id
- festival_edition_gallery_photos: PK id; FK edition_id -> festival_editions.id; photo_file UNIQUE;
  caption; sort_order

Festival structure:

- festival_sections: PK id; FK edition_id -> festival_editions.id; name
- festival_activities: PK id; FK section_id -> festival_sections.id; title; description;
  activity_type CHECK; audience CHECK

Festival people + location:

- festival_volunteers: PK id; FK edition_id -> festival_editions.id; FK profile_id -> profiles.id;
  UNIQUE(edition_id, profile_id)
- festival_locations: PK id; FK edition_id -> festival_editions.id; name, address, description; FK
  coordinator_id -> festival_volunteers.id
- festival_staff_members: PK compus (edition_id, member_id); FK edition_id -> festival_editions.id;
  FK member_id -> members.id
- festival_guests: PK id; FK edition_id -> festival_editions.id; FK profile_id -> profiles.id
- festival_guest_roles: PK compus (guest_id, role); FK guest_id -> festival_guests.id; role CHECK
  speaker|workshop_org|artist|other

Festival program + sponsori + ticketing:

- festival_program: PK id; FK edition_id -> festival_editions.id; FK location_id ->
  festival_locations.id; FK activity_id -> festival_activities.id; starts_at; ends_at
- festival_program_presenters: PK compus (program_id, guest_id); FK program_id ->
  festival_program.id; FK guest_id -> festival_guests.id
- festival_sponsors: PK id; FK edition_id -> festival_editions.id; name; sponsorship_type CHECK;
  sponsorship_level CHECK; logo_file; website
- festival_sponsor_discount_locations: PK id; FK sponsor_id -> festival_sponsors.id; name; address;
  discount_percent CHECK 1..100; redeem_max CHECK >=1
- festival_tickets: PK id; FK edition_id -> festival_editions.id; FK holder_profile_id ->
  profiles.id; code; guest_count CHECK 0..5; UNIQUE(edition_id, code)
- festival_discount_redeemings: PK id; FK ticket_id -> festival_tickets.id; FK discount_location_id
  -> festival_sponsor_discount_locations.id; redeemed_at; UNIQUE(ticket_id, discount_location_id)

## Faza 6: Migrarea 0002 Festival

1. Rulezi migrare festival:

- npx prisma migrate dev --name 0002_festival_difffusion

2. Adaugi trigger manual în SQL pentru redeem_max:

- înainte de insert în festival_discount_redeemings verifici count per discount_location_id vs
  redeem_max

3. Regenerare și verificare:

- npx prisma generate
- teste de integrare pentru scenariu limită redeem

## Faza 7: Implementare module Festival + Blog

Ordine recomandată:

1. blog-tags + blog-posts
2. festival-editions + gallery
3. festival-sections + activities
4. festival-volunteers + locations + staff
5. festival-guests + guest-roles
6. festival-program + presenters
7. festival-sponsors + discount-locations
8. festival-tickets + redeemings

DTO validări cheie festival:

- Edition DTO: year IsInt Min(2020) Max(2100); title/theme IsString MaxLength(255); culori Matches
  regex hex; file fields IsOptional IsString MaxLength(255)
- Section DTO: editionId IsInt; name IsString MinLength(2) MaxLength(120)
- Activity DTO: sectionId IsInt; title IsString MaxLength(200); description IsOptional IsString
  MaxLength(5000); activityType IsIn enum; audience IsIn public|guests|staff
- Volunteer DTO: editionId IsInt; profileId IsInt
- Location DTO: editionId IsInt; name IsString MaxLength(200); address IsOptional IsString
  MaxLength(255); coordinatorId IsOptional IsInt
- Guest DTO: editionId IsInt; profileId IsInt
- GuestRole DTO: guestId IsInt; role IsIn speaker|workshop_org|artist|other
- Program DTO: editionId IsInt; locationId IsInt; activityId IsInt; startsAt IsDateString; endsAt
  IsOptional IsDateString
- Sponsor DTO: editionId IsInt; name IsString MaxLength(200); sponsorshipType IsIn enum;
  sponsorshipLevel IsIn enum; website IsOptional IsUrl
- DiscountLocation DTO: sponsorId IsInt; name IsString; address IsOptional IsString; discountPercent
  IsInt Min(1) Max(100); redeemMax IsInt Min(1)
- Ticket DTO: editionId IsInt; holderProfileId IsInt; code IsString MinLength(6) MaxLength(64);
  guestCount IsInt Min(0) Max(5)
- Redeeming DTO: ticketId IsInt; discountLocationId IsInt; redeemedAt IsDateString

## Faza 8: Verificare, seed, testare și hardening

1. Seed inițial:

- roles implicite (admin, member, mentor, volunteer)
- user admin
- date minime pentru validare flux

2. Testare recomandată:

- unit tests pe servicii cu reguli de business
- integration tests pentru trigger-dependent flows
- e2e pentru auth + guards + endpoint-uri principale

3. Checklist de validare:

- migration reset și recreate DB fără erori
- toate endpoint-urile de write au ValidationPipe + guard
- constrângerile de business sunt dublate: validator în service + trigger în DB
- documentație Swagger pe DTO-uri

## Modul de lucru cu Prisma + SQLite (workflow practic zilnic)

1. Editezi modelul în prisma/schema.prisma.
2. Rulezi prisma format.
3. Rulezi prisma migrate dev --name nume_migrare.
4. Dacă ai reguli avansate, modifici SQL-ul migrației generate.
5. Rulezi prisma generate.
6. Verifici cu prisma studio.
7. Implementezi service/controller în NestJS.
8. Rulezi testele și e2e.

## Scope inclus și exclus

Incluse:

- proiectare backend completă NestJS + Prisma + SQLite
- ordine de implementare pe module
- modelare DB, migrații, trigger-e, validări DTO
- auth-first cu guard-uri

Excluse:

- implementare front-end
- deployment cloud, CI/CD detaliat, observability avansat
- optimizări post-MVP (cache distribuit, read replicas)

**Relevant files**

- d:/Universitate/Anul 2/Semestrul 2/SGBD/AI3-project/AI3-backend/README.md — sursa de cerințe
  domeniu și constrângeri

**Verification**

1. Confirmi că toate tabelele din README au mapare explicită în modele Prisma.
2. Confirmi că trigger-ele critice sunt în migrații SQL (0001 și 0002).
3. Confirmi că fiecare modul NestJS are DTO-uri cu validări pe toate câmpurile de input.
4. Rulezi fluxul complet local: migrate, generate, start, e2e smoke pentru auth + câte un endpoint
   per modul.

**Decisions**

- Auth strategy: JWT access + refresh tokens.
- Nivel de detaliu: mediu.
- Scope inițial: totul din start (core + festival), dar implementat în faze pentru controlul
  complexității.

**Further Considerations**

1. Recomandare practică: folosește două migrații SQL exacte (0001 core, 0002 festival) și nu
   fragmenta excesiv trigger-ele; debugging-ul devine mult mai simplu.
2. Recomandare API: păstrează endpoint-uri separate pentru subtipuri CTI (aspiring/full) ca să eviți
   payload-uri ambigue.
