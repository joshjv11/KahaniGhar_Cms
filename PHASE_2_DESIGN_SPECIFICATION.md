# Phase 2 Design Specification
**Kahani Ghar CMS - Homepage Curation Separation**

**Mode**: Design & Planning Only (No Code Changes)  
**Date**: 2024  
**Focus**: Separate content creation from homepage curation

---

## 1. Design Principles

### Core Philosophy

**"Content creation and homepage curation are distinct editorial tasks that require different mental models and UI surfaces."**

### Principles Applied

1. **Separation of Concerns**
   - Story creation = Content management
   - Homepage curation = Editorial placement
   - These must not be mixed in the same form

2. **Intentionality**
   - Homepage changes require explicit navigation
   - No accidental homepage exposure
   - Clear entry/exit points

3. **Editorial Intelligence**
   - Provide guidance, not enforcement
   - Show readiness, don't block
   - Support decision-making, not automate it

4. **Progressive Disclosure**
   - Main form shows only essentials
   - Advanced features in dedicated surfaces
   - Clear navigation between surfaces

5. **Non-Breaking Evolution**
   - All existing data structures preserved
   - All backend behavior unchanged
   - Only UI/UX reorganization

---

## 2. Main Story Editor (Before vs After)

### Current State (Phase 1)

**Problems**:
- 17+ fields visible at once
- Homepage controls mixed with story creation
- Cognitive overload
- Accidental homepage activation possible
- Unclear what's required vs optional

**Field Mix**:
- Story basics (title, description, language)
- Publishing control
- Homepage controls (banner, tile, ranks)
- Legacy fields

### Phase 2: Redesigned Main Story Editor

#### Visual Structure

```
┌─────────────────────────────────────────────────┐
│  Create New Story / Edit Story                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  📝 Story Information                            │
│  ┌──────────────────────────────────────────┐   │
│  │ Title *                                   │   │
│  │ [Input field]                             │   │
│  │ ℹ️ This title appears in the app          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Description (Optional)                    │   │
│  │ [Textarea]                                │   │
│  │ ℹ️ Helps users discover your story        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Language *                                 │   │
│  │ [English ▼]                                │   │
│  │ ℹ️ Primary language for this story        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Release Date (Optional)                   │   │
│  │ [Date picker]                             │   │
│  │ ℹ️ Historical reference only              │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  📢 Publishing & Visibility                     │
│  ┌──────────────────────────────────────────┐   │
│  │ ☐ Publish this story (visible to users)   │   │
│  │                                           │   │
│  │ ℹ️ When published, story is visible in    │   │
│  │    the app. You can unpublish later.      │   │
│  │                                           │   │
│  │ 💡 This story will be saved as a draft.  │   │
│  │    Add episodes and publish when ready.   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  🏠 Homepage Content Controls                    │
│  ┌──────────────────────────────────────────┐   │
│  │                                           │   │
│  │  [Manage Homepage Placement →]            │   │
│  │                                           │   │
│  │  ℹ️ Configure how this story appears on   │   │
│  │     the homepage (banner, new launches,  │   │
│  │     section ordering)                     │   │
│  │                                           │   │
│  │  Status: Not configured                   │   │
│  │                                           │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Save as Draft]  [Cancel]                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Key Changes

1. **Removed from Main Form**:
   - Banner image upload
   - Tile image upload
   - "Add to Banner" checkbox
   - "Add to New Launches" checkbox
   - Homepage section rank
   - New launch rank
   - Legacy rank field

2. **Added to Main Form**:
   - Single "Manage Homepage Placement" button/link
   - Status indicator showing homepage configuration state
   - Clear separation with visual divider

3. **Field Grouping**:
   - **Story Information**: Core content fields only
   - **Publishing & Visibility**: Simple publish toggle
   - **Homepage Content Controls**: Entry point only

4. **Copy Improvements**:
   - "Story Title" instead of "Title"
   - Clear help text for each field
   - Draft-first messaging
   - Status indicators

#### Benefits

- **Reduced Cognitive Load**: 4-5 fields visible vs 17+
- **Clear Intent**: Story creation is separate from homepage curation
- **Error Prevention**: Cannot accidentally enable homepage features
- **Focused Workflow**: Editors focus on content, not placement
- **Scalability**: Easy to add more homepage features without cluttering main form

---

## 3. Homepage Control Dashboard - Section-by-Section Design

### Surface Type Recommendation

**Recommended**: **Modal/Drawer** (Slide-in from right)

**Rationale**:
- Keeps context (story form remains visible in background)
- Clear entry/exit points
- Focused, intentional interaction
- Can be dismissed without losing story form state
- Mobile-friendly

**Alternative Considered**: Full-page navigation
- **Pros**: More space, can show more detail
- **Cons**: Loses context, requires navigation back
- **Decision**: Modal preferred for intentional, focused curation

### Modal Structure

```
┌─────────────────────────────────────────────────────────┐
│  Homepage Content Controls                    [× Close] │
│  Story: "The Magic Forest"                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section A: Homepage Eligibility                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section B: Homepage Section Placement             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section C: Banner Configuration                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section D: New Launches Configuration            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section E: Homepage Readiness Summary            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Save Homepage Settings]  [Cancel]                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Section A: Homepage Eligibility

#### Purpose
Determine if story should appear on homepage at all.

#### Design

```
┌──────────────────────────────────────────────────────┐
│  Homepage Eligibility                                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ☐ Show this story on homepage                       │
│                                                       │
│  ℹ️ When enabled, this story will be eligible for    │
│     homepage display. You can configure specific     │
│     placements below.                                 │
│                                                       │
│  Status Indicators:                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✅ Story is published                         │   │
│  │ ✅ At least one episode exists                │   │
│  │ ⚠️  Homepage rank not set                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  Current Status: [Not Configured]                     │
│  └─ Not eligible for homepage                        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Behavior Rules

**When "Show on homepage" is unchecked**:
- All other sections (B, C, D) are hidden or disabled
- Status shows "Not configured"
- Homepage rank, banner, new launch settings are ignored (but preserved)

**When "Show on homepage" is checked**:
- Sections B, C, D become visible
- Status updates to show readiness
- Homepage rank becomes required

#### Status Indicators

**Eligibility Checks** (Read-only, informational):
- ✅ Story is published (`is_published === true`)
- ✅ At least one episode exists (query episodes count)
- ⚠️ Homepage rank set (`homepage_rank !== null`)

**Status States**:
- **Not Configured**: Toggle off, no homepage placement
- **Incomplete**: Toggle on, but missing required fields
- **Ready**: Toggle on, all required fields set

#### Why This Prevents Errors

- **Explicit Intent**: Must check box to enable homepage features
- **Clear Status**: Visual indicators show what's missing
- **No Accidental Activation**: Cannot enable homepage without intention
- **Editorial Control**: Editors decide eligibility first, then configure

---

### Section B: Homepage Section Placement

#### Purpose
Control where story appears in homepage story sections (not banner, not new launches).

#### Design

```
┌──────────────────────────────────────────────────────┐
│  Homepage Section Placement                          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Homepage Section Rank *                              │
│  [Input: 5]                                           │
│                                                       │
│  ℹ️ Determines order of story sections on homepage.  │
│     Lower numbers appear first.                       │
│                                                       │
│  💡 Examples:                                         │
│     • Rank 1 = Featured section (top)                │
│     • Rank 5 = Regular section                        │
│     • Rank 10+ = Lower priority                       │
│                                                       │
│  Visual Ordering Guide:                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ Homepage Story Sections (by rank):           │   │
│  │                                             │   │
│  │  Rank 1  ──►  [Story A]                    │   │
│  │  Rank 3  ──►  [Story B]                    │   │
│  │  Rank 5  ──►  [Story C] ← This story       │   │
│  │  Rank 7  ──►  [Story D]                    │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ⚠️ Warning: Another story uses rank 5              │
│     Consider using rank 6 instead                   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Behavior Rules

**Rank Input**:
- Required when "Show on homepage" is enabled
- Number input with validation
- Real-time collision detection (query existing ranks)

**Visual Ordering Guide**:
- Shows current story's position relative to others
- Updates in real-time as rank changes
- Highlights current story
- Shows up to 5-7 nearby stories for context

**Collision Warning**:
- Non-blocking warning if rank is already used
- Suggests next available rank
- Allows override (editorial decision)

#### Why This Prevents Errors

- **Visual Context**: Editors see where story will appear
- **Collision Awareness**: Prevents duplicate ranks (with warning)
- **Clear Examples**: Non-technical editors understand ranking
- **Intentional Placement**: Editors make informed decisions

---

### Section C: Banner Configuration

#### Purpose
Configure story for homepage banner carousel.

#### Design

```
┌──────────────────────────────────────────────────────┐
│  Banner Configuration                                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ☐ Add to Homepage Banner                            │
│                                                       │
│  ℹ️ When enabled, this story appears in the         │
│     homepage banner carousel. Requires banner image. │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Banner Image *                               │   │
│  │ [Upload area with preview]                   │   │
│  │                                               │   │
│  │ 📐 Recommended: 16:9 aspect ratio           │   │
│  │    Optimal size: 1920x1080px                 │   │
│  │    Max size: 2MB                             │   │
│  │                                               │   │
│  │ Preview: [Wide banner preview frame]          │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  Status: [Not Configured]                            │
│  └─ Banner image required when enabled              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Behavior Rules

**Toggle Behavior**:
- When checked: Banner image upload becomes required
- When unchecked: Banner image optional (but preserved if uploaded)
- Status updates based on image presence

**Image Upload**:
- Standard upload component
- Aspect ratio guidance (16:9)
- Size recommendations
- Preview with 16:9 frame overlay

**Status States**:
- **Not Configured**: Toggle off
- **Incomplete**: Toggle on, no image
- **Ready**: Toggle on, image uploaded

#### Why This Prevents Errors

- **Explicit Activation**: Must check box to enable banner
- **Clear Requirements**: Image required when enabled
- **Visual Guidance**: Aspect ratio and size recommendations
- **Status Feedback**: Editors know what's missing

---

### Section D: New Launches Configuration

#### Purpose
Configure story for "New Launches" section.

#### Design

```
┌──────────────────────────────────────────────────────┐
│  New Launches Configuration                          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ☐ Add to New Launches Section                      │
│                                                       │
│  ℹ️ When enabled, this story appears in the          │
│     "New Launches" grid. Requires tile image.        │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Tile Image *                                 │   │
│  │ [Upload area with preview]                   │   │
│  │                                               │   │
│  │ 📐 Recommended: 1:1 aspect ratio (square)   │   │
│  │    Optimal size: 800x800px                   │   │
│  │    Max size: 1MB                             │   │
│  │                                               │   │
│  │ Preview: [Square tile preview frame]         │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  New Launch Rank (Optional)                           │
│  [Input: Leave empty for no rank]                    │
│                                                       │
│  ℹ️ Only used if "Add to New Launches" is enabled.  │
│     Lower numbers appear first.                      │
│                                                       │
│  Status: [Not Configured]                            │
│  └─ Tile image required when enabled                 │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Behavior Rules

**Toggle Behavior**:
- When checked: Tile image upload becomes required
- When unchecked: Tile image optional (but preserved if uploaded)
- New launch rank only visible when enabled

**Image Upload**:
- Standard upload component
- Aspect ratio guidance (1:1 square)
- Size recommendations
- Preview with 1:1 frame overlay

**Rank Field**:
- Optional (can leave empty)
- Only shown when toggle is enabled
- Used for ordering within new launches section

**Status States**:
- **Not Configured**: Toggle off
- **Incomplete**: Toggle on, no image
- **Ready**: Toggle on, image uploaded

#### Why This Prevents Errors

- **Explicit Activation**: Must check box to enable new launches
- **Clear Requirements**: Image required when enabled
- **Visual Guidance**: Square aspect ratio guidance
- **Optional Ranking**: Rank is optional, reducing complexity

---

### Section E: Homepage Readiness Summary

#### Purpose
Provide clear summary before exiting dashboard.

#### Design

```
┌──────────────────────────────────────────────────────┐
│  Homepage Readiness Summary                          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Overall Status: [Ready for Homepage]                │
│                                                       │
│  Checklist:                                          │
│  ✅ Story is published                                │
│  ✅ Homepage eligibility enabled                     │
│  ✅ Homepage section rank set                        │
│  ✅ Banner configured (optional)                     │
│  ✅ New launches configured (optional)               │
│                                                       │
│  What happens when you save:                         │
│  • Story will appear in homepage sections            │
│  • Banner will show if configured                    │
│  • New launches will show if configured             │
│                                                       │
│  ⚠️ Note: Story must be published for homepage       │
│     visibility. Currently: Draft                     │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Behavior Rules

**Real-time Updates**:
- Updates as user changes settings
- Shows current state, not just saved state
- Color-coded (green = ready, amber = incomplete, red = missing)

**Status Calculation**:
- **Ready**: All required fields set, story published
- **Incomplete**: Some required fields missing
- **Not Configured**: Homepage eligibility disabled

**What Happens Section**:
- Explains consequences of current settings
- Updates dynamically
- Warns if story is not published

#### Why This Prevents Errors

- **Clear Summary**: Editors see complete state before saving
- **Consequence Awareness**: Understands what will happen
- **Missing Item Visibility**: Clearly shows what's missing
- **Confidence**: Editors can proceed with certainty

---

### Dashboard Entry/Exit Flow

#### Entry Point (from Story Form)

**Button/Link**: "Manage Homepage Placement →"

**Behavior**:
- Opens modal/drawer
- Loads current homepage settings
- Shows current status
- Story form remains in background (not lost)

#### Exit Points

**Save Homepage Settings**:
- Validates required fields
- Shows warnings for incomplete setup
- Saves to database
- Closes modal
- Returns to story form
- Shows success toast

**Cancel**:
- Shows confirmation if changes made
- Discards unsaved changes
- Closes modal
- Returns to story form

**X Button**:
- Same as Cancel (with confirmation if changes)

#### Why This Flow Prevents Errors

- **Intentional Entry**: Must click button to access
- **Context Preservation**: Story form state preserved
- **Clear Exit**: Save or cancel, no ambiguity
- **Change Confirmation**: Prevents accidental loss of work

---

## 4. Editorial Intelligence Features

### Story Readiness Score

#### Purpose
Provide overall story completeness indicator (not homepage-specific).

#### Design Location
**Main Story Editor** (below publish checkbox or in sidebar)

#### Design

```
┌─────────────────────────────────────────┐
│  Story Readiness                        │
├─────────────────────────────────────────┤
│                                         │
│  Overall: 75% Complete                  │
│  [Progress bar]                         │
│                                         │
│  ✅ Title provided                      │
│  ✅ Language selected                   │
│  ⚠️  Description recommended            │
│  ❌ Cover image missing                 │
│  ❌ No episodes yet                     │
│                                         │
│  💡 Add episodes to complete story      │
│                                         │
└─────────────────────────────────────────┘
```

#### Calculation

**Factors** (all weighted equally or by importance):
- Title provided (required)
- Description provided (recommended)
- Language selected (required)
- Cover image uploaded (recommended)
- At least one episode exists (recommended)
- Release date set (optional)

**Score Display**:
- Percentage (0-100%)
- Progress bar visualization
- Checklist of items
- Color-coded (green/amber/red)

#### Behavior Rules

- **Read-only**: Does not block publishing
- **Advisory**: Guides editor, doesn't enforce
- **Real-time**: Updates as fields change
- **Contextual**: Shows next steps

#### Why This Helps

- **Editorial Guidance**: Editors know what's missing
- **Quality Control**: Encourages complete stories
- **Non-Blocking**: Doesn't prevent publishing
- **Transparency**: Clear what makes a story "ready"

---

### Homepage Readiness Score

#### Purpose
Separate indicator for homepage placement readiness.

#### Design Location
**Homepage Control Dashboard** (Section E, or separate section)

#### Design

```
┌─────────────────────────────────────────┐
│  Homepage Readiness                    │
├─────────────────────────────────────────┤
│                                         │
│  Score: 60% Ready                      │
│  [Progress bar]                         │
│                                         │
│  ✅ Story published                     │
│  ✅ Homepage eligibility enabled        │
│  ✅ Homepage rank set                   │
│  ⚠️  Banner not configured              │
│  ⚠️  New launches not configured        │
│                                         │
│  Status: Ready for basic homepage       │
│                                         │
└─────────────────────────────────────────┘
```

#### Calculation

**Factors**:
- Story published (required)
- Homepage eligibility enabled (required)
- Homepage rank set (required)
- Banner configured (optional)
- New launches configured (optional)
- Episodes exist (recommended)

**Score Display**:
- Percentage (0-100%)
- Progress bar
- Checklist
- Overall status message

#### Behavior Rules

- **Separate from Story Readiness**: Homepage-specific
- **Advisory**: Guides homepage configuration
- **Real-time**: Updates as settings change
- **Contextual**: Shows what's needed for homepage

#### Why This Helps

- **Homepage-Specific**: Focuses on homepage requirements
- **Clear Status**: Editors know homepage readiness
- **Guided Configuration**: Shows what's missing
- **Non-Blocking**: Doesn't prevent saving

---

### Internal Editorial Status

#### Purpose
Editor-only status tracking (not consumer-facing).

#### Design Location
**Main Story Editor** (new section, or in sidebar)

#### Design

```
┌─────────────────────────────────────────┐
│  Editorial Status (Internal)            │
├─────────────────────────────────────────┤
│                                         │
│  Status: [Draft ▼]                     │
│                                         │
│  Options:                               │
│  • Draft                                │
│  • Needs Review                         │
│  • Ready to Publish                     │
│  • Published                            │
│                                         │
│  ℹ️ Internal status for editorial team. │
│     Not visible to users.               │
│                                         │
└─────────────────────────────────────────┘
```

#### Status Options

1. **Draft**
   - Default for new stories
   - Work in progress
   - Not ready for review

2. **Needs Review**
   - Story complete, needs editorial review
   - Episodes added, content ready
   - Awaiting approval

3. **Ready to Publish**
   - Reviewed and approved
   - Ready for publication
   - Can be published

4. **Published**
   - Currently published
   - Visible to users
   - Can be unpublished

#### Behavior Rules

- **Editorial Only**: Not stored in database (or stored separately)
- **Non-Blocking**: Does not affect publishing
- **Workflow Support**: Helps editorial team coordinate
- **Optional**: Can be ignored if not needed

#### Implementation Note

**Option 1**: Client-side only (localStorage, not persisted)
- Pros: No database changes, simple
- Cons: Lost on refresh, not shared

**Option 2**: New database field (requires schema change)
- Pros: Persistent, shared
- Cons: Requires migration

**Recommendation**: Start with Option 1, migrate to Option 2 if needed

#### Why This Helps

- **Workflow Support**: Editorial team coordination
- **Status Tracking**: Know where story is in process
- **Non-Breaking**: Doesn't affect existing behavior
- **Optional**: Can be ignored if not needed

---

### Internal Notes

#### Purpose
Editor-only notes (not consumer-facing).

#### Design Location
**Main Story Editor** (new section, collapsible)

#### Design

```
┌─────────────────────────────────────────┐
│  Internal Notes (Editor Only)           │
│  [Collapsible section]                  │
├─────────────────────────────────────────┤
│                                         │
│  [Textarea for notes]                   │
│                                         │
│  ℹ️ Private notes for editorial team.   │
│     Not visible to users.               │
│                                         │
│  Examples:                              │
│  • "Needs audio quality check"          │
│  • "Waiting for final episode"          │
│  • "Content approved by Sarah"         │
│                                         │
└─────────────────────────────────────────┘
```

#### Behavior Rules

- **Editorial Only**: Not visible to consumers
- **Optional**: Can be left empty
- **Persistent**: Saved with story
- **Searchable**: Can search notes (future)

#### Implementation Note

**Option 1**: New database field `internal_notes` (TEXT, nullable)
- Requires schema change
- Simple implementation

**Option 2**: Separate editorial metadata table
- More scalable
- Requires more complex implementation

**Recommendation**: Option 1 for Phase 2, Option 2 for future if needed

#### Why This Helps

- **Editorial Communication**: Team can leave notes
- **Context Preservation**: Important info saved with story
- **Non-Breaking**: Doesn't affect consumer app
- **Optional**: Can be ignored if not needed

---

## 5. Publishing Semantics (Clarity, Not Logic Changes)

### Publishing Scenarios

#### Scenario 1: Publishing Story NOT on Homepage

**Current Behavior**: Story published, not on homepage

**UX Messaging**:

```
✅ Story Published

Your story "The Magic Forest" is now visible to users.

• Story is live in the app
• Users can find it by browsing or searching
• Story is NOT on homepage (homepage placement not configured)

[Manage Homepage Placement] [View Story] [Add Episodes]
```

**Why This Helps**:
- **Clear Status**: Editor knows story is published
- **Homepage Clarity**: Explicitly states homepage status
- **Next Steps**: Clear actions available

---

#### Scenario 2: Publishing Story IS on Homepage

**Current Behavior**: Story published, homepage configured

**UX Messaging**:

```
✅ Story Published & Homepage Configured

Your story "The Magic Forest" is now visible to users.

• Story is live in the app
• Story appears on homepage (rank: 5)
• Banner enabled: Yes
• New launches enabled: Yes

[View Story] [Edit Homepage Placement] [Add Episodes]
```

**Why This Helps**:
- **Complete Status**: Shows all placements
- **Homepage Details**: Shows rank and features
- **Quick Access**: Easy to edit homepage settings

---

#### Scenario 3: Publishing with Incomplete Homepage Setup

**Current Behavior**: Story published, homepage eligibility enabled but incomplete

**UX Messaging**:

```
✅ Story Published

Your story "The Magic Forest" is now visible to users.

⚠️ Homepage Configuration Incomplete

• Story is live in the app
• Homepage eligibility is enabled, but:
  - Homepage rank is missing (required)
  - Banner image not uploaded (optional)

Story will NOT appear on homepage until configuration is complete.

[Complete Homepage Setup] [View Story] [Add Episodes]
```

**Why This Helps**:
- **Clear Warning**: Editor knows homepage won't work
- **Specific Issues**: Lists what's missing
- **Quick Fix**: Direct link to homepage dashboard

---

### Publish Confirmation Dialog

#### When to Show

**Trigger**: User clicks "Publish Story" button

**Conditions**:
- Show if homepage eligibility enabled but incomplete
- Show if story readiness score < 50%
- Optional: Always show for first-time publishers

#### Dialog Design

```
┌─────────────────────────────────────────────┐
│  Publish Story?                             │
├─────────────────────────────────────────────┤
│                                             │
│  This story will be visible to users        │
│  immediately.                               │
│                                             │
│  Current Status:                            │
│  ✅ Story information complete              │
│  ⚠️  Homepage configuration incomplete      │
│  ⚠️  No episodes yet                        │
│                                             │
│  What happens:                              │
│  • Story will be published                  │
│  • Story will NOT appear on homepage        │
│    (configuration incomplete)               │
│  • Users can find story by browsing         │
│                                             │
│  [Save as Draft] [Publish Anyway] [Cancel] │
│                                             │
└─────────────────────────────────────────────┘
```

#### Behavior Rules

- **Non-Blocking**: "Publish Anyway" always available
- **Informative**: Shows current state
- **Clear Consequences**: Explains what will happen
- **Safe Default**: "Save as Draft" is primary action

#### Why This Helps

- **Intentional Publishing**: Editors make informed decision
- **Awareness**: Knows what's missing
- **Confidence**: Understands consequences
- **Safety**: Can choose draft if not ready

---

## 6. Safety & Error Prevention

### Warning Mechanisms (Non-Blocking)

#### Homepage Configuration Warnings

**Location**: Homepage Control Dashboard

**Warning Types**:

1. **Missing Required Field**
   ```
   ⚠️ Homepage rank is required for homepage placement
   ```

2. **Incomplete Setup**
   ```
   ⚠️ Homepage configuration incomplete. Story will not appear on homepage.
   ```

3. **Rank Collision**
   ```
   ⚠️ Another story already uses rank 5. Consider using rank 6 instead.
   ```

4. **Missing Image**
   ```
   ⚠️ Banner image required when "Add to Banner" is enabled.
   ```

**Behavior**:
- Visual warnings (amber/yellow)
- Non-blocking (can save anyway)
- Specific guidance
- Dismissible

---

#### Publishing Warnings

**Location**: Main Story Editor (pre-publish checklist)

**Warning Types**:

1. **Low Readiness Score**
   ```
   ⚠️ Story readiness: 40%. Consider completing before publishing.
   ```

2. **No Episodes**
   ```
   ⚠️ No episodes yet. Users won't be able to listen to this story.
   ```

3. **Incomplete Homepage Setup**
   ```
   ⚠️ Homepage configuration incomplete. Story will not appear on homepage.
   ```

**Behavior**:
- Advisory only
- Non-blocking
- Clear next steps
- Color-coded

---

### Confirmation Messages

#### Homepage Settings Save

**Trigger**: User clicks "Save Homepage Settings" with incomplete setup

**Message**:
```
⚠️ Save Homepage Settings?

Some required fields are missing:
• Homepage rank is required

Story will not appear on homepage until configuration is complete.

[Save Anyway] [Cancel and Complete]
```

**Behavior**:
- Non-blocking (can save incomplete)
- Lists missing items
- Clear consequences
- Safe default (cancel)

---

#### Discard Changes

**Trigger**: User tries to close homepage dashboard with unsaved changes

**Message**:
```
⚠️ Discard Changes?

You have unsaved changes to homepage settings.

[Save Changes] [Discard] [Cancel]
```

**Behavior**:
- Prevents accidental loss
- Clear options
- Safe default (save)

---

### Visual Cues

#### Status Indicators

**Color Coding**:
- 🟢 Green: Complete, ready
- 🟡 Amber: Incomplete, needs attention
- 🔴 Red: Missing required field
- ⚪ Gray: Not configured, disabled

**Icons**:
- ✅ Complete
- ⚠️ Warning
- ❌ Missing
- ℹ️ Information

#### Progress Indicators

**Story Readiness**:
- Progress bar (0-100%)
- Color-coded segments
- Checklist items

**Homepage Readiness**:
- Separate progress bar
- Homepage-specific items
- Overall status message

---

## 7. What Phase 2 Explicitly Does NOT Change

### Database Schema

**No Changes**:
- No new fields added
- No field types changed
- No constraints modified
- No migrations required

**Preserved**:
- All existing fields (`is_banner`, `is_new_launch`, `homepage_rank`, etc.)
- All existing data types
- All existing relationships

---

### Backend Logic

**No Changes**:
- No API modifications
- No validation rule changes (only UI-level warnings)
- No data processing changes
- No business logic changes

**Preserved**:
- Form submission behavior
- Database insert/update logic
- File upload behavior
- Ranking semantics

---

### Consumer App Integration

**No Changes**:
- No field changes
- No data format changes
- No breaking changes
- Consumer app behavior unchanged

**Preserved**:
- All field names and types
- All data structures
- All consumer app dependencies

---

### Authentication & Authorization

**No Changes**:
- No auth changes
- No permission changes
- No user role changes

---

### Storage & File Management

**No Changes**:
- No storage path changes
- No upload behavior changes
- No file deletion changes

---

### Publishing Semantics

**No Changes**:
- `is_published` behavior unchanged
- Publishing logic unchanged
- Visibility rules unchanged

**Only Clarified**:
- UX messaging about publishing
- Warnings about incomplete setup
- Status indicators

---

## 8. Risks Avoided by This Design

### Risk 1: Accidental Homepage Exposure

**Problem**: Editors accidentally enable homepage features while creating story

**Solution**:
- Homepage controls moved to separate dashboard
- Explicit entry point required
- Cannot accidentally enable

**Risk Mitigation**: ✅ Eliminated

---

### Risk 2: Cognitive Overload

**Problem**: Too many fields visible at once, editors overwhelmed

**Solution**:
- Main form reduced to 4-5 essential fields
- Homepage controls in separate surface
- Progressive disclosure

**Risk Mitigation**: ✅ Significantly Reduced

---

### Risk 3: Ranking Mistakes

**Problem**: Editors don't understand ranking, create conflicts

**Solution**:
- Visual ordering guide
- Collision warnings
- Clear examples
- Dedicated section for ranking

**Risk Mitigation**: ✅ Reduced (warnings prevent most mistakes)

---

### Risk 4: Incomplete Homepage Setup

**Problem**: Stories published with incomplete homepage configuration

**Solution**:
- Homepage readiness summary
- Clear warnings
- Status indicators
- Guided configuration

**Risk Mitigation**: ✅ Reduced (warnings + guidance)

---

### Risk 5: Breaking Changes

**Problem**: Changes break consumer app or existing functionality

**Solution**:
- No database changes
- No backend changes
- Only UI/UX reorganization
- All existing data preserved

**Risk Mitigation**: ✅ Eliminated

---

### Risk 6: Editor Confusion

**Problem**: Editors don't understand new system

**Solution**:
- Clear entry/exit points
- Status indicators
- Help text and guidance
- Visual cues

**Risk Mitigation**: ✅ Reduced (clear design + guidance)

---

### Risk 7: Scalability Issues

**Problem**: System doesn't scale as homepage features grow

**Solution**:
- Separate dashboard can grow
- Main form stays clean
- Modular design
- Easy to add features

**Risk Mitigation**: ✅ Improved (better architecture)

---

## Summary

### Phase 2 Achievements

1. **Separation of Concerns**: Content creation separated from homepage curation
2. **Intentional Design**: Homepage changes require explicit navigation
3. **Editorial Intelligence**: Readiness scores and status tracking
4. **Error Prevention**: Warnings, confirmations, visual cues
5. **Non-Breaking**: All changes are UI/UX only

### Key Design Decisions

1. **Modal/Drawer for Homepage Dashboard**: Keeps context, focused interaction
2. **Draft-First Workflow**: Safe defaults, explicit publishing
3. **Advisory Intelligence**: Guides without blocking
4. **Progressive Disclosure**: Show only what's needed
5. **Status-Driven UX**: Clear indicators of state

### Implementation Readiness

**Phase 2 is ready for implementation** with:
- Clear design specifications
- Section-by-section breakdown
- Behavior rules defined
- Safety mechanisms designed
- Non-breaking approach confirmed

---

**Phase 2 design complete. Awaiting explicit approval before implementation.**
