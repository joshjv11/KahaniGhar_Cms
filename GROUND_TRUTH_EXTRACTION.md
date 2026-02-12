# Ground Truth Extraction Report
**Kahani Ghar CMS - Information Extraction Only**

**Date**: 2024  
**Mode**: READ-ONLY - No code changes, suggestions, or refactors

---

## 1. Database Ground Truth

### Tables Used by CMS

#### `stories` Table
**Source**: `README.md` (lines 98-106), `lib/types/database.ts` (lines 8-24), `SCHEMA_UPDATE_NOTES.md`

**Columns (Explicit from README.md)**:
- `id` (UUID, primary key)
- `title` (TEXT, required)
- `description` (TEXT, nullable)
- `cover_image_url` (TEXT, required)
- `language` (TEXT, required: 'en' | 'hi' | 'ta')
- `release_date` (DATE, nullable)
- `is_published` (BOOLEAN, default false)
- `created_at` (TIMESTAMPTZ)

**Additional Columns (Inferred from TypeScript types in `lib/types/database.ts`)**:
- `rank` (number | null) - **Note**: README says removed, but code still uses it
- `is_banner` (boolean)
- `is_new_launch` (boolean)
- `banner_image_url` (string | null)
- `tile_image_url` (string | null)
- `homepage_rank` (number | null)
- `new_launch_rank` (number | null)

**Schema Evolution Notes** (from `SCHEMA_UPDATE_NOTES.md`):
- ✅ Removed: `audio_url`, `slides` (moved to episodes)
- ✅ Renamed: `long_description` → `description`
- ✅ Updated: `is_archived` → `is_published`
- ✅ Updated: `rank` → `release_date` (date field) - **CONTRADICTION**: Code still uses `rank` field

**Primary Key**: `id` (UUID)

**Foreign Keys**: None explicitly documented

**Unique Constraints**: None visible in codebase

**Indexes**: None visible in codebase

**Default Values**:
- `is_published`: default false (from README)
- Other defaults not specified in codebase

#### `episodes` Table
**Source**: `README.md` (lines 108-117), `lib/types/database.ts` (lines 26-36), `SCHEMA_UPDATE_NOTES.md`

**Columns (Explicit from README.md)**:
- `id` (UUID, primary key)
- `story_id` (UUID, foreign key to stories)
- `title` (TEXT, required)
- `description` (TEXT, nullable)
- `audio_url` (TEXT, required)
- `episode_number` (INTEGER, nullable)
- `is_published` (BOOLEAN, default false)
- `slides` (JSONB, array of {image_url, start_time})
- `created_at` (TIMESTAMPTZ)

**Primary Key**: `id` (UUID)

**Foreign Key**: `story_id` → `stories.id` (explicitly documented)

**Unique Constraints**: None visible

**Indexes**: None visible

**Default Values**:
- `is_published`: default false (from README)

**JSONB Structure** (from `lib/types/database.ts`):
```typescript
interface Slide {
  image_url: string;
  start_time: number;
}
slides: Slide[] | null
```

### TypeScript Type Alignment

**Source**: `lib/types/database.ts`

**Stories Table**:
- ⚠️ **MISMATCH RISK**: TypeScript `Story` interface includes fields not in README schema:
  - `rank`, `is_banner`, `is_new_launch`, `banner_image_url`, `tile_image_url`, `homepage_rank`, `new_launch_rank`
- These fields are actively used in `StoryForm.tsx` and database queries
- **Conclusion**: Database likely has these fields, but README schema is incomplete

**Episodes Table**:
- ✅ Types match README schema exactly

### Schema-Dependent Invariants

1. **Language Constraint**: Must be one of: 'en' | 'hi' | 'ta' (enforced in TypeScript, assumed in DB)
2. **Foreign Key**: `episodes.story_id` must reference existing `stories.id`
3. **JSONB Structure**: `episodes.slides` must be array of `{image_url: string, start_time: number}` or null
4. **Required Fields**:
   - Stories: `title`, `cover_image_url`, `language`
   - Episodes: `title`, `audio_url`, `story_id`
5. **Homepage Rank**: Required field in form (`homepage_rank`), defaults to 0 if not provided

---

## 2. Row Level Security (RLS)

### Stories Table RLS Policies
**Source**: `DATABASE_POLICIES.md` (lines 13-31), `SCHEMA_UPDATE_NOTES.md` (line 37)

**Status**: ✅ Policies set up (per `SCHEMA_UPDATE_NOTES.md`)

**Policies** (from `DATABASE_POLICIES.md`):
1. **Policy Name**: `Allow public reads`
   - Operation: `SELECT`
   - Policy Expression: `true`
   - Type: Permissive

2. **Policy Name**: `Allow public inserts`
   - Operation: `INSERT`
   - Policy Expression: `true`
   - Type: Permissive

3. **Policy Name**: `Allow public updates`
   - Operation: `UPDATE`
   - Policy Expression: `true`
   - Type: Permissive

4. **Policy Name**: `Allow public deletes`
   - Operation: `DELETE`
   - Policy Expression: `true`
   - Type: Permissive

**USING Clause**: Not specified (assumed `true` for all)
**WITH CHECK Clause**: Not specified (assumed `true` for all)

### Episodes Table RLS Policies
**Source**: `SCHEMA_UPDATE_NOTES.md` (lines 40-47), `DATABASE_POLICIES.md` (lines 33-38)

**Status**: ⚠️ **RLS is currently DISABLED** (shown as "UNRESTRICTED" in Supabase per `SCHEMA_UPDATE_NOTES.md` line 40)

**Recommended Policies** (if enabled):
- Same 4 policies as stories table (SELECT, INSERT, UPDATE, DELETE all with `true`)

**Current State**: No RLS enforcement on episodes table

### Storage RLS Policies
**Source**: `STORAGE_SETUP.md` (lines 14-37)

**Bucket**: `stories` (public bucket)

**Policies** (Recommended setup):
1. **Policy Name**: `Allow public uploads`
   - Operation: `INSERT`
   - Policy Expression: `true`

2. **Policy Name**: `Allow public reads`
   - Operation: `SELECT`
   - Policy Expression: `true`

3. **Policy Name**: `Allow public updates` (optional)
   - Operation: `UPDATE`
   - Policy Expression: `true`

4. **Policy Name**: `Allow public deletes` (optional)
   - Operation: `DELETE`
   - Policy Expression: `true`

**Alternative**: RLS can be disabled for development (line 42)

**Actual Policy State**: Unknown - documentation only shows recommended setup

### Security Risks Identified

1. **Episodes Table**: RLS disabled = unrestricted access
2. **All Policies Use `true`**: No authentication checks, no user-based restrictions
3. **Storage Policies**: Unknown if actually configured

---

## 3. Environment & Deployment Context

### Environment Variables Referenced

**Source**: Codebase grep for `NEXT_PUBLIC_` and `SUPABASE_`

**Required Variables**:
1. `NEXT_PUBLIC_SUPABASE_URL` 
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, scripts
   - Required: Yes (non-null assertion `!` used)

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, scripts
   - Required: Yes (non-null assertion `!` used)

**Optional Variables**:
3. `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`
   - Used in: `scripts/confirm-user-admin.js` only
   - Required: No (for admin scripts only)

**Environment File**: `.env.local` (referenced in README.md line 80)

### Supabase Project Usage

**Evidence**: Single project assumed
- All code references single `NEXT_PUBLIC_SUPABASE_URL`
- No environment-specific configuration
- No staging/prod separation visible

**Unknown**: 
- Whether multiple Supabase projects exist
- Whether same database used for dev/staging/prod

### Hosting Assumptions

**Framework**: Next.js 14.2.5 (App Router)
- **Source**: `package.json`

**Deployment Platform**: Unknown
- No `vercel.json`, `netlify.toml`, or deployment config files found
- No CI/CD configuration visible
- Next.js compatible with Vercel, Netlify, Node.js servers, or Edge

**Build Commands** (from `package.json`):
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint`

### Environment Separation

**Status**: Unknown
- No explicit dev/staging/prod configuration
- No environment-specific database references
- Single `.env.local` file referenced

**Risk**: If single database used for all environments, data corruption risk

---

## 4. Consumer App Integration

### Data Consumption Method

**Evidence**: Inferred from codebase patterns

**Assumption**: Direct Supabase access (most likely)
- RLS policies allow public reads (`SELECT` with `true`)
- No API layer in CMS codebase
- Storage bucket is public
- Consumer app likely uses same Supabase project

**Alternative Possibilities** (not confirmed):
- Shared database with read-only access
- API endpoints (not visible in CMS codebase)
- Separate read replica

### Fields Intended for Consumer Use

**Source**: Inferred from field names, form labels, and usage patterns

**Publishing Control**:
- `is_published` (boolean) - Controls visibility
  - Used in: StoryCard (shows "Draft" badge), StoriesList (toggle), EpisodeCard (shows "Published"/"Draft")

**Homepage Display**:
- `is_banner` (boolean) - Flag to include in banner
- `banner_image_url` (string | null) - Image for homepage banner
- `homepage_rank` (number | null) - **Required field**, determines homepage section ordering
  - Form label: "Determines which story section (with episodes) appears first on homepage. Lower rank values appear first."
  - Validation: Required in Zod schema

**New Launches Section**:
- `is_new_launch` (boolean) - Flag to include in new launches
- `new_launch_rank` (number | null) - Ordering within new launches section
  - Form label: "Lower rank values appear first. Leave empty to exclude from ranking."

**General Ordering**:
- `rank` (number | null) - General ranking (still used in dashboard query despite schema notes)
  - Dashboard query: `.order("rank", { ascending: true, nullsFirst: false })`
  - Form label: "Rank (for homepage ordering)"
  - **Note**: Schema notes say this was replaced by `release_date`, but code still uses it

**Language Filtering**:
- `language` ('en' | 'hi' | 'ta') - Language selection
  - Consumer app likely filters by this field

**Episode Ordering**:
- `episode_number` (integer | null) - Episode sequence
  - Query: `.order("episode_number", { ascending: true, nullsFirst: false })`

**Content Fields**:
- `title`, `description`, `cover_image_url` - Display content
- `audio_url` - Episode audio playback
- `slides` - Synchronized images with timestamps

### Breaking Change Risks

**High Risk Fields** (if changed, consumer app breaks):
- `is_published` - Consumer app likely filters by this
- `homepage_rank` - Required for homepage display logic
- `language` - Language filtering depends on exact values
- `slides` JSONB structure - Consumer app expects `{image_url, start_time}` format
- `audio_url` - Required for episode playback

**Medium Risk Fields**:
- `rank` - Used in ordering, but schema notes suggest it's deprecated
- `episode_number` - Used for ordering, but nullable

---

## 5. Business Rules & Content Semantics

### Publishing Semantics

**Source**: Code usage patterns, form labels, UI components

**`is_published` Flag**:
- **Meaning**: Controls visibility in consumer app
- **Default**: `false` (draft state)
- **UI Behavior**:
  - Unpublished stories show "Draft" badge
  - Toggle button: "Publish" / "Unpublish"
  - Episodes show "Published" / "Draft" badge
- **Validation**: No explicit validation rules in forms
- **Business Rule**: Stories and episodes can be independently published

### Homepage Semantics

**Source**: `StoryForm.tsx` (lines 245-330), form labels

**`is_banner` Flag**:
- **Meaning**: Include story in homepage banner section
- **Requires**: `banner_image_url` must be provided (required field in form)
- **UI**: Checkbox in form

**`homepage_rank` Field**:
- **Meaning**: Determines ordering of story sections on homepage
- **Required**: Yes (Zod validation requires number)
- **Default**: 0 if not provided (code sets to 0 if NaN)
- **Ordering Rule**: Lower values appear first
- **Form Label**: "Determines which story section (with episodes) appears first on homepage. Lower rank values appear first."
- **Business Rule**: Required for any story that appears on homepage

### New Launch Semantics

**Source**: `StoryForm.tsx` (lines 291-328)

**`is_new_launch` Flag**:
- **Meaning**: Include story in "New Launches" section
- **Requires**: `tile_image_url` must be provided (required field in form)
- **UI**: Checkbox in form

**`new_launch_rank` Field**:
- **Meaning**: Ordering within new launches section
- **Optional**: Yes (nullable)
- **Ordering Rule**: Lower values appear first
- **Business Rule**: Only used if `is_new_launch` is true

### Ranking Semantics

**Source**: `StoryForm.tsx`, `dashboard/page.tsx`, form labels

**`rank` Field**:
- **Meaning**: General ranking for homepage ordering
- **Status**: ⚠️ **CONTRADICTION**: Schema notes say replaced by `release_date`, but code still uses it
- **Usage**: Dashboard query orders by `rank` (ascending, nulls last)
- **Optional**: Yes (nullable)
- **Ordering Rule**: Lower values appear first
- **Form Label**: "Rank (for homepage ordering)"

**`release_date` Field**:
- **Meaning**: Story release date
- **Type**: DATE (nullable)
- **Usage**: Display only (no ordering logic visible)
- **Note**: Schema notes say this replaced `rank`, but `rank` still exists and is used

### Editorial Constraints

**Source**: Form validation (Zod schemas), UI behavior

**Story Constraints**:
1. `title`: Required, minimum 1 character
2. `cover_image_url`: Optional in form, but README says required in DB
3. `language`: Required, must be 'en' | 'hi' | 'ta'
4. `banner_image_url`: Required if using banner feature
5. `tile_image_url`: Required if using new launch feature
6. `homepage_rank`: Required (defaults to 0)

**Episode Constraints**:
1. `title`: Required, minimum 1 character
2. `audio_url`: Required
3. `slides`: Optional, but if provided must be array of `{image_url: string, start_time: number}`
4. `episode_number`: Optional (nullable)

**File Constraints**:
1. Images: Max 10MB, must be image type
2. Audio: Max 100MB, must be audio type

**No Constraints Found For**:
- Duplicate titles
- Duplicate episode numbers within story
- Language-specific uniqueness
- Rank uniqueness

---

## 6. File Lifecycle Rules

### File Upload Locations

**Source**: `lib/utils/storage.ts`, `STORAGE_SETUP.md`

**Storage Bucket**: `stories` (single bucket, public)

**Folder Structure** (automatic, created on upload):
- `stories/covers/` - Story cover images
- `stories/audio/` - Episode audio files
- `stories/slides/` - Slide images
- `stories/banners/` - Banner images (inferred from `ImageUpload` folder prop)
- `stories/tiles/` - Tile images (inferred from `ImageUpload` folder prop)

**Path Generation** (`lib/utils/storage.ts` lines 4-9, 16-18, 40-42):
- Format: `stories/{folder}/{uuid}.{ext}`
- UUID: Custom generator (not `crypto.randomUUID()`)
- Extension: Extracted from original filename
- No collision prevention beyond UUID uniqueness

### File Upload Behavior

**Source**: `components/upload/ImageUpload.tsx`, `components/upload/AudioUpload.tsx`

**Upload Timing**:
- Files uploaded **immediately** on file selection
- Upload happens **before** form submission
- Files uploaded even if form is cancelled

**Upload Settings** (`lib/utils/storage.ts`):
- `cacheControl`: "3600" (1 hour)
- `upsert`: false (no overwrite)

**File Size Limits**:
- Images: 10MB max (`ImageUpload.tsx` line 46)
- Audio: 100MB max (`AudioUpload.tsx` line 46)

**File Type Validation**:
- Images: Must start with `"image/"` MIME type
- Audio: Must start with `"audio/"` MIME type

### File Deletion Behavior

**Source**: `lib/utils/storage.ts` (lines 62-83)

**Deletion Function**: `deleteFile(fileUrl: string)`
- Extracts path from URL by finding "stories" in pathname
- Calls `supabase.storage.from("stories").remove([filePath])`

**When Files Are Deleted**:
- ⚠️ **NOT IMPLEMENTED**: No automatic deletion on:
  - Story deletion
  - Episode deletion
  - Image replacement (old image not deleted)
  - Audio replacement (old audio not deleted)
  - Slide removal (slide images not deleted)

**Manual Deletion**: Function exists but is never called in codebase

### File Reuse Behavior

**Source**: Codebase analysis

**Replacement Behavior**:
- When user uploads new image/audio, old file URL is replaced in database
- **Old file remains in storage** (no cleanup)
- New file gets new UUID, new path

**Reuse**: Files can be referenced by multiple entities if URLs are manually copied (no validation prevents this)

### Storage Cost Implications

**Source**: Inferred from behavior

**Storage Bloat Risks**:
1. No cleanup on entity deletion
2. No cleanup on file replacement
3. No cleanup on form cancellation (files uploaded but never used)
4. UUID-based naming prevents accidental overwrites, but accumulates files

**Unknown**:
- Storage quotas or limits
- Cleanup strategy (manual or automated)
- Cost sensitivity

---

## 7. Concurrency Expectations

### Conflict Handling

**Source**: Codebase analysis

**Status**: **No concurrency handling present**

**Evidence**:
- No locking mechanisms
- No version fields (no `updated_at` used for optimistic locking)
- No conflict detection
- No merge strategies

### Optimistic Updates

**Source**: `components/story/StoriesList.tsx`, `components/episode/EpisodeList.tsx`

**Pattern Found**:
- `StoriesList.handleToggleArchive()`: Updates local state immediately, then syncs with server
  - If server fails, state is already updated (no rollback)
- `EpisodeList.confirmDelete()`: Removes from local state immediately, then deletes from server
  - If server fails, item already removed from UI (no rollback)

**Not Optimistic**:
- Form submissions wait for server response before updating UI
- No optimistic updates for create/edit operations

### Single vs Multiple Editors

**Source**: No explicit documentation

**Assumption**: Single editor expected
- No user assignment to stories/episodes
- No edit history or audit trail
- No "last edited by" fields
- No conflict warnings

**Evidence Against Multiple Editors**:
- No locking
- No versioning
- Optimistic updates could cause conflicts

**Unknown**: Whether multiple simultaneous editors are expected or supported

---

## 8. Risk Tolerance Signals

### Comments Indicating Deferred Work

**Source**: Codebase grep for "will add later", "removed", "disabled"

**Explicit TODOs/Deferred Work**:

1. **Authentication Middleware** (`middleware.ts` line 4):
   ```typescript
   // Auth middleware disabled - will add later
   ```

2. **Dashboard Layout Auth** (`app/(dashboard)/layout.tsx` line 9):
   ```typescript
   // Auth removed - will add later
   ```

3. **Navbar Auth** (`components/layout/Navbar.tsx` line 8):
   ```typescript
   // Auth removed - will add later
   ```

### Production Hardening Deferred

**Source**: Documentation files

**From `DATABASE_POLICIES.md`** (line 48):
- "**Warning:** Only disable RLS for development. Always use policies in production!"

**From `STORAGE_SETUP.md`** (line 43):
- "**Warning:** Only use this for development!"

**From `SCHEMA_UPDATE_NOTES.md`** (lines 40-47):
- Episodes RLS disabled, recommendation to enable for production

### MVP/Speed Over Safety Patterns

**Source**: Code patterns

**Indicators**:
1. **Public RLS Policies**: All policies use `true` (no authentication checks)
2. **No Input Sanitization**: Direct database insertion of user input
3. **No Error Recovery**: Failed uploads leave form in inconsistent state
4. **No File Cleanup**: Storage bloat accepted
5. **Hardcoded Credentials**: Scripts contain email/password (`scripts/create-user.js`)
6. **Custom UUID Generator**: Not using standard `crypto.randomUUID()`
7. **No Validation for Duplicates**: No uniqueness constraints enforced
8. **Optimistic Updates Without Rollback**: State updates before server confirmation

### Risk Tolerance Assessment

**Signals Point To**: **Fast iteration acceptable**
- Security hardening deferred (auth, RLS)
- Error handling minimal
- Data integrity risks accepted (no cleanup, no validation)
- Production warnings suggest "ship now, fix later" mindset

---

## Summary: Confirmed Invariants

### High-Confidence Invariants

1. **Database Schema**:
   - Stories table has fields: id, title, description, cover_image_url, language, release_date, is_published, rank, is_banner, is_new_launch, banner_image_url, tile_image_url, homepage_rank, new_launch_rank, created_at
   - Episodes table has fields: id, story_id, title, description, audio_url, episode_number, is_published, slides (JSONB), created_at
   - Foreign key: episodes.story_id → stories.id

2. **RLS Policies**:
   - Stories: 4 policies (SELECT, INSERT, UPDATE, DELETE) all with `true`
   - Episodes: RLS disabled (unrestricted)
   - Storage: Unknown actual state, documentation shows recommended setup

3. **File Storage**:
   - Single bucket: `stories`
   - Folders: covers/, audio/, slides/, banners/, tiles/
   - Path format: `stories/{folder}/{uuid}.{ext}`
   - Upload happens immediately on file select
   - No automatic deletion

4. **Business Rules**:
   - `is_published` controls visibility
   - `homepage_rank` is required (defaults to 0)
   - Lower rank values appear first
   - Language must be 'en' | 'hi' | 'ta'
   - File limits: 10MB images, 100MB audio

5. **Consumer App Dependencies**:
   - Fields: is_published, homepage_rank, language, slides structure, audio_url
   - Direct Supabase access assumed (public reads allowed)

### Assumptions Inferred from Code

1. **Environment**: Single Supabase project (no evidence of multiple)
2. **Consumer App**: Direct database access (RLS allows public reads)
3. **Concurrency**: Single editor expected (no conflict handling)
4. **File Lifecycle**: Manual cleanup expected (no automatic deletion)
5. **Rank Field**: Still in use despite schema notes saying replaced

### Missing or Unknown Information

1. **Actual RLS Policy State**: Documentation shows recommendations, not actual state
2. **Storage RLS Policies**: Unknown if configured
3. **Environment Separation**: Unknown if dev/staging/prod use same database
4. **Deployment Platform**: Unknown (Vercel, Netlify, self-hosted?)
5. **Consumer App Integration**: Assumed direct access, not confirmed
6. **File Cleanup Strategy**: Unknown if manual or automated
7. **Concurrency Expectations**: Unknown if multiple editors are expected
8. **Database Constraints**: Unknown if unique constraints exist on any fields
9. **Indexes**: Unknown if database has indexes for performance
10. **Actual Schema vs README**: README incomplete (missing homepage fields)

### Areas Requiring Human Confirmation

1. **Database Schema Completeness**: README missing fields that code uses
2. **RLS Policy Actual State**: Documentation shows recommendations, need actual state
3. **Environment Setup**: Single vs multiple Supabase projects
4. **Consumer App Integration**: How does kids app actually access data?
5. **File Cleanup**: Is manual cleanup acceptable, or is automation needed?
6. **Concurrency**: Are multiple simultaneous editors expected?
7. **Rank vs Release Date**: Schema notes contradict code usage
8. **Episodes RLS**: Intentionally disabled or oversight?

---

**Report Complete - Information Extraction Only**
**No code changes, suggestions, or refactors made**
