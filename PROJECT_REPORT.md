# Kahani Ghar CMS — Project Report

**Purpose:** Snapshot of the UI and implementation status so you can continue building.  
**Last updated:** February 16, 2025

---

## 1. Project Overview

**Kahani Ghar CMS** is a full-stack Content Management System for managing story-based audio content for the Kahani Ghar kids app. Editors use it to create stories, add episodes with audio and slides, control visibility (homepage banner, new launch, rankings), and view usage/feedback.

- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS, design tokens in `app/globals.css`
- **UI:** shadcn/ui (Radix primitives), Framer Motion, Lucide icons
- **Forms:** React Hook Form + Zod
- **State:** Zustand (`lib/store/auth-store.ts`), server components + client where needed
- **TypeScript:** Used throughout

---

## 2. Design System & UI Theme

### 2.1 Visual identity

- **Theme name:** Blue–Black–Gold
- **Light mode:** Blue-tinted background (`#EFF6FF`), navy text, gold accents (`#FFB800`)
- **Dark mode:** Deep blue-black (`#0A0E27`), light slate text, same gold accent
- **Fonts:** Inter (body), Plus Jakarta Sans (display), loaded in `app/layout.tsx` via `--font-inter` and `--font-jakarta`
- **Tailwind:** Custom colors in `tailwind.config.ts` — `gold` (50–900), `blue-primary`, `blue-dark`, `navy`, plus standard shadcn semantic tokens (`background`, `foreground`, `card`, `primary`, etc.)

### 2.2 Layout and chrome

- **Root layout** (`app/layout.tsx`): `ThemeProvider` (next-themes), Toaster, font variables on `<body>`.
- **Dashboard layout** (`app/(dashboard)/layout.tsx`):
  - Full-page gradient background (`from-blue-100 via-blue-900 to-black` in light; dark variants).
  - Gold accent lines (top/bottom/sides), corner blur circles, radial gold glow.
  - **Navbar** (top): “Kahani Ghar CMS” logo + theme toggle. Fixed; border and gradient styling.
  - **Sidebar** (left, fixed `w-64`): Sections — Overview; Content (Stories, Episodes); Discovery (Ranking & Visibility); Usage & Activity (Listening Progress, Child Profiles, Favorites); Content Control (Ranking & Visibility, Archive & Delete); Feedback. Active state uses blue–gold gradient; hover scale/transition.
  - **Main:** `ml-64`, min-height `calc(100vh-73px)`, subtle top/bottom border glow. Content uses `container mx-auto py-10 px-8 max-w-7xl` where applicable.

### 2.3 Reusable UI building blocks

Location: `components/ui/`.

| Component       | Notes |
|----------------|--------|
| `button`       | Variants (default, outline, ghost, etc.). Used with optional sound. |
| `sound-button` | Wraps Button; supports `soundType` ('click', 'success', etc.) and `playHoverSound`; uses `lib/utils/sounds.ts`. |
| `card`, `card-header`, `card-content`, `card-title` | Used for stats, story cards, list items. |
| `badge`        | Status, language, counts. |
| `input`, `textarea`, `label` | Forms. |
| `checkbox`    | Ranking/visibility toggles. |
| `select`      | Radix Select; language and filters. |
| `dialog`, `alert-dialog` | Modals and confirmations. |
| `dropdown-menu` | Story card actions (edit, archive, etc.). |
| `toast` / `use-toast` / `toaster` | Success/error feedback. |
| `breadcrumb`   | Admin and story flows. |
| `skeleton`     | Loading states (e.g. ranking page). |

### 2.4 Theming and motion

- **ThemeProvider** (`components/theme/ThemeProvider.tsx`): `class` strategy, `enableSystem`, transition enabled.
- **ThemeToggle** (`components/theme/ThemeToggle.tsx`): In Navbar.
- **Motion:** Framer Motion used on ranking-visibility and elsewhere; `tailwindcss-animate` for enter/leave. Custom timing in Tailwind: `ease-out-smooth`, `ease-ultra-smooth`, etc. GPU-friendly classes: `gpu-accelerated`, `will-change-transform`.
- **Sound:** Optional click/hover sounds via `lib/utils/sounds.ts`; initialized on first user interaction on ranking page; `SoundButton` and direct `playSound()` on cards/buttons.

---

## 3. Routes & Pages (Implementation Status)

### 3.1 Entry and auth

| Route            | Purpose              | Status |
|------------------|----------------------|--------|
| `/`              | Redirects to `/dashboard` | Done |
| `/(auth)/login`  | Login (Supabase); redirect if already logged in | Done (UI simple gray centering) |
| `/(auth)/signup` | Sign up              | Page exists |

**Note:** Dashboard layout comment says “Auth removed - will add later”. Middleware (`middleware.ts`) is present but only passes through (no auth check). So all dashboard routes are currently **unprotected**.

### 3.2 Dashboard (overview)

| Route            | Purpose              | Status |
|------------------|----------------------|--------|
| `/dashboard`     | Overview dashboard   | **Done** |

**Implemented:**

- **Stats cards:** Total Stories, Published vs Draft, Stories with 0 Episodes, Recently Updated (last 7 days).
- **Next Actions panel** (if any): Published stories with no episodes; drafts not updated in 30+ days; homepage stories missing banner/tile images. Lists up to 3 titles + “+N more”.
- **Recently Updated Stories:** Last 7 days, max 12; rendered via `StoriesList` (story cards with cover, title, language badge, status, actions).
- **CTAs:** “Manage Rankings” → `/admin/ranking-visibility`, “Add New Story” → `/stories/new`. Buttons use `SoundButton` / sound where applicable.

### 3.3 Stories (CRUD and episodes)

| Route                                   | Purpose                | Status |
|----------------------------------------|------------------------|--------|
| `/stories/new`                         | Create story           | Done (form) |
| `/stories/[id]`                        | Story detail + episode list | Done |
| `/stories/[id]/edit`                   | Edit story             | Done |
| `/stories/[id]/new-episode`            | Create episode         | Done |
| `/stories/[id]/episodes/[episodeId]/edit` | Edit episode        | Done |

- **Story detail:** Back link, card with title, language, draft badge, description, cover image, “Edit Story”, episode list via `EpisodeList` (add episode + episode cards).
- **Story form:** `StoryForm` — title, description, cover (ImageUpload), language, publish, rank, banner/new-launch flags, banner/tile image URLs (uploads). Create/Edit use same form pattern.
- **Episode form:** `EpisodeForm` — title, description, audio (AudioUpload), episode number, publish, slides via `SlideEditor` (image + start_time per slide).

### 3.4 Admin (read-only and tools)

| Route                         | Purpose                     | Status |
|------------------------------|-----------------------------|--------|
| `/admin/stories`             | All stories list (read-only) | Done (cards, episode count, badges, link to ranking) |
| `/admin/episodes`            | All episodes list           | Done (table/list with story relation) |
| `/admin/ranking-visibility`  | Homepage ranking & visibility | **Done (full)** |
| `/admin/archive-delete`      | Archive/delete stories      | Done (client page with list and actions) |
| `/admin/feedback`            | Feedback messages list      | Done (from `feedback_messages`, with story/episode titles) |
| `/admin/favorites`           | Favorites data              | Done (read view) |
| `/admin/child-profiles`      | Child profiles              | Done (read view) |
| `/admin/listening-progress`  | Listening progress           | Done (read view) |

**Ranking & Visibility** (`/admin/ranking-visibility`) is the most advanced:

- Fetch stories with episode counts; filters (status, visibility, language).
- Edit homepage rank, new-launch rank; toggles for “Show on Homepage” (banner), “New Launch”; banner and tile image uploads.
- Optimistic updates with rollback on error; conflict detection for ranks; safety warnings; **Homepage Preview** (`HomepagePreview`); skeleton loaders; sound on first interaction.
- Uses `SafetyWarnings`, `ContentStateBadge`, `ImageUpload`, `HomepagePreview`, `Breadcrumb`.

---

## 4. Components Inventory

### 4.1 Layout

- **`layout/Navbar.tsx`** — Logo, theme toggle.
- **`layout/Sidebar.tsx`** — Navigation sections and links; active state by pathname.
- **`layout/PageTransitionWrapper.tsx`** / **`PageTransition.tsx`** — For animated page transitions (if used).

### 4.2 Story

- **`story/StoryCard.tsx`** — Cover, title, language, ContentStateBadge, banner/new-launch chips, dropdown (View, Edit, Archive/Restore). Hover sound.
- **`story/StoriesList.tsx`** — Renders list of StoryCards; archive toggle handler.
- **`story/StoryForm.tsx`** — Create/edit story fields and uploads.
- **`story/HomepageControlDashboard.tsx`** — Homepage control (used where needed).
- **`story/LanguageSelect.tsx`** — Language selector (en/hi/ta).

### 4.3 Episode

- **`episode/EpisodeCard.tsx`** — Single episode display.
- **`episode/EpisodeList.tsx`** — List of episodes for a story; add episode link.
- **`episode/EpisodeForm.tsx`** — Create/edit episode (audio, slides, etc.).

### 4.4 Slide

- **`slide/SlideEditor.tsx`** — Edit slides (image_url, start_time) for an episode.

### 4.5 Upload

- **`upload/ImageUpload.tsx`** — Image upload (Supabase Storage); used for covers, banner, tile, slides.
- **`upload/AudioUpload.tsx`** — Audio upload for episodes.

### 4.6 Content helpers

- **`content/HomepagePreview.tsx`** — Preview of homepage layout (used on ranking page).
- **`content/SafetyWarnings.tsx`** — Warnings (e.g. missing images, unpublished).
- **`content/ContentStateBadge.tsx`** — Badge for published/draft/archived state.

### 4.7 Auth

- **`auth/LoginForm.tsx`** — Email/password login (Supabase).
- **`auth/SignupForm.tsx`** — Sign up.

---

## 5. Data Model (Types & Supabase)

**Location:** `lib/types/database.ts`.

- **Language:** `"en" | "hi" | "ta"`.
- **Slide:** `{ image_url: string; start_time: number }`.
- **Story:** id, title, description, cover_image_url, language, release_date, is_published, rank, is_banner, is_new_launch, banner_image_url, tile_image_url, homepage_rank, new_launch_rank, created_at.
- **Episode:** id, story_id, title, description, audio_url, episode_number, is_published, slides (array), created_at.
- **StoryInsert / StoryUpdate / EpisodeInsert / EpisodeUpdate** — For create/update calls.

Supabase: `stories`, `episodes`, `feedback_messages` (and any tables for favorites, child_profiles, listening_progress). Storage: `stories/covers/`, `stories/audio/`, `stories/slides/` (and equivalent for banner/tile if used).

---

## 6. What’s Done vs Placeholder

### Done

- **UI shell:** Navbar, Sidebar, dashboard layout, theme (light/dark), fonts, design tokens.
- **Dashboard:** Stats, Next Actions, recently updated stories, links to ranking and new story.
- **Stories:** Create, edit, detail, episode list; StoryCard with archive and visibility indicators.
- **Episodes:** Create, edit; audio upload; SlideEditor for slides.
- **Admin:** Stories list, Episodes list, Ranking & Visibility (full), Archive & Delete, Feedback, Favorites, Child Profiles, Listening Progress (all at least read views).
- **Auth:** Login/signup pages and Supabase integration; middleware and layout note that protection is “to add later”.
- **UX:** Toasts, breadcrumbs, skeletons on ranking, optional sound, Framer Motion where used.

### Explicitly deferred / placeholder

- **Auth:** Middleware and dashboard layout say auth is disabled; re-enable when ready.
- **Login/signup UI:** Functional but minimal (e.g. login is centered on gray); can be restyled to match Blue–Gold theme.

---

## 7. Suggested Next Steps (To Continue Building)

1. **Re-enable auth**
   - In middleware: validate Supabase session and redirect unauthenticated users to `/login`.
   - In dashboard layout: optionally guard or show user state from `createClient()` / `getUser()`.

2. **Align login/signup with design system**
   - Use same gradient background, card style, and gold/blue accents as dashboard.

3. **New features**
   - Any new admin screens: follow existing pattern (Breadcrumb, Card, filters, then table/cards); use `createClient()` in server components or client `createClient()` in client components.
   - New story/episode fields: add to `lib/types/database.ts`, StoryForm/EpisodeForm, and Supabase schema/migrations.

4. **Performance / DX**
   - Consider React Server Components for heavy lists; keep client components for forms and interactive ranking/archive.
   - Add error boundaries or a global error page if not already present.

5. **Storage and validation**
   - Keep using `ImageUpload` / `AudioUpload` for new media; ensure Supabase buckets and RLS match. Validate file types/sizes in forms (Zod) and in Storage rules.

Use this report as the single reference for “what’s built and where” when adding new UI or features.
