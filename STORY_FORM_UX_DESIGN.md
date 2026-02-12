# Story Form UX Design & Planning Document
**Kahani Ghar CMS - "Create New Story" Section**

**Mode**: Design & Planning Only (No Code Changes)  
**Date**: 2024  
**Focus**: UX improvements, editorial safety, admin guidance

---

## 1. UX Problems Identified

### Critical Issues

1. **Cognitive Overload**
   - All fields visible at once (17+ fields)
   - No visual hierarchy between essential vs. optional vs. advanced
   - Homepage controls always visible even when not needed

2. **Confusing Rank Fields**
   - Three different rank fields (`rank`, `homepage_rank`, `new_launch_rank`)
   - Unclear which rank does what
   - No examples or guidance for non-technical admins
   - No collision warnings

3. **Publishing Ambiguity**
   - "Publish this story" checkbox appears early but consequences unclear
   - No pre-publish validation or warnings
   - No distinction between "Save as Draft" vs "Publish Now"

4. **Media Upload Confusion**
   - Banner and tile images always required (even if not using those features)
   - No aspect ratio guidance
   - No preview of how images will appear
   - No size recommendations

5. **Missing Context**
   - No explanation of what happens after creation
   - No guidance for first-time admins
   - Unclear relationship between fields (e.g., `is_banner` vs `banner_image_url`)

6. **Error-Prone Patterns**
   - Can publish without required homepage fields
   - Can set conflicting ranks
   - No validation for duplicate ranks
   - No warnings for incomplete stories

### Medium Priority Issues

7. **Release Date Semantics**
   - Unclear if it's for scheduling or historical record
   - No guidance for future-dated content

8. **Button Labels**
   - "Create Story" doesn't indicate draft state
   - No distinction between save actions

9. **Empty State**
   - No onboarding for first-time story creation
   - No examples or templates

---

## 2. Proposed Improvements (Conceptual)

### A. Progressive Disclosure Architecture

**Principle**: Show only what's needed, when it's needed.

**Structure**:
1. **Core Story Section** (Always Visible)
   - Title, Description, Language, Release Date
   - Cover Image (optional for draft)

2. **Publishing Section** (Always Visible)
   - Publish checkbox with clear consequences
   - Pre-publish checklist (advisory)

3. **Homepage Features** (Conditional)
   - Only show when `is_published` is true OR `is_banner`/`is_new_launch` is checked
   - Collapsible section with clear purpose

4. **Advanced Options** (Collapsible)
   - Rank field (legacy/optional)
   - Internal notes (future)

**Benefits**:
- Reduces cognitive load
- Prevents accidental homepage feature activation
- Makes form feel less overwhelming

### B. Smart Field Grouping

**Group 1: Story Basics** (Required for any story)
- Title, Description, Language
- Cover Image (optional for draft, required for publish)

**Group 2: Publishing** (Clear separation)
- Publish toggle with consequences
- Release date (with semantic clarification)

**Group 3: Homepage Display** (Only if publishing/featuring)
- Banner section (conditional)
- New Launches section (conditional)
- Homepage rank (always visible if publishing)

**Group 4: Advanced** (Collapsible)
- Legacy rank field
- Future: Internal notes, tags

### C. Visual Hierarchy Improvements

**Priority Levels**:
- **Critical** (Red asterisk): Title, Language, Homepage Rank (if publishing)
- **Important** (Blue indicator): Description, Cover Image, Banner/Tile images (if using features)
- **Optional** (No indicator): Release Date, Legacy Rank, New Launch Rank

**Visual Separators**:
- Clear section dividers with icons
- Collapsible sections with expand/collapse
- Color-coded sections (e.g., homepage features in distinct color)

---

## 3. Field-Level Behavior Rules (WHEN/IF Logic)

### Progressive Disclosure Rules

**Rule 1: Homepage Content Controls Visibility**
```
IF (is_published === true OR is_banner === true OR is_new_launch === true)
  THEN show "Homepage Content Controls" section
ELSE
  THEN hide section (or show collapsed with "Enable homepage features" toggle)
```

**Rule 2: Banner Section Visibility**
```
IF (is_banner === true)
  THEN show:
    - Banner image upload (required)
    - "Add to Banner" checkbox (checked)
    - Homepage Section Rank (required)
ELSE
  THEN show:
    - "Add to Banner" checkbox (unchecked)
    - Banner image upload (hidden or optional)
    - Homepage Section Rank (hidden or optional)
```

**Rule 3: New Launch Section Visibility**
```
IF (is_new_launch === true)
  THEN show:
    - Tile image upload (required)
    - "Add to New Launches" checkbox (checked)
    - New Launch Rank field (optional)
ELSE
  THEN show:
    - "Add to New Launches" checkbox (unchecked)
    - Tile image upload (hidden or optional)
    - New Launch Rank field (hidden)
```

**Rule 4: Homepage Rank Requirement**
```
IF (is_published === true)
  THEN homepage_rank is required (enforce validation)
ELSE
  THEN homepage_rank is optional (but warn if missing when publishing)
```

**Rule 5: Cover Image Requirement**
```
IF (is_published === true AND cover_image_url === empty)
  THEN show warning: "Cover image recommended for published stories"
ELSE
  THEN cover_image_url is optional
```

### Conditional Validation Rules

**Rule 6: Banner Image Requirement**
```
IF (is_banner === true AND banner_image_url === empty)
  THEN show error: "Banner image is required when adding to banner"
ELSE
  THEN banner_image_url is optional
```

**Rule 7: Tile Image Requirement**
```
IF (is_new_launch === true AND tile_image_url === empty)
  THEN show error: "Tile image is required when adding to new launches"
ELSE
  THEN tile_image_url is optional
```

**Rule 8: Rank Collision Warning** (Advisory, not blocking)
```
IF (homepage_rank === X AND another story has homepage_rank === X)
  THEN show warning: "Another story already uses rank {X}. Consider using a different rank."
```

---

## 4. Copy & Microtext Suggestions

### Section Headers

**Current**: "Homepage Content Controls"  
**Proposed**: "Homepage Display Settings"  
**Rationale**: More descriptive, less technical

**New Section**: "Story Information" (for core fields)  
**New Section**: "Publishing & Visibility" (for publish controls)

### Field Labels

**Title Field**:
- Label: "Story Title" (add "Story" for context)
- Placeholder: "Enter the story title (e.g., 'The Magic Forest')"
- Help text: "This title will appear in the app and on the homepage"

**Description Field**:
- Label: "Description" (keep)
- Placeholder: "Brief description of the story (optional)"
- Help text: "This description helps users discover your story. Keep it concise (2-3 sentences)."

**Language Field**:
- Label: "Language" (keep)
- Help text: "Select the primary language for this story. Users can filter stories by language."

**Release Date Field**:
- Label: "Release Date"
- Help text: "When was this story released? Leave empty if not applicable. This is for reference only and does not control publishing."
- Placeholder: "Select release date (optional)"

**Rank Field** (Legacy):
- Label: "Legacy Rank (Optional)"
- Help text: "⚠️ This field is deprecated. Use 'Homepage Section Rank' instead for homepage ordering."
- Visual: Show with muted/strikethrough styling

**Homepage Section Rank**:
- Label: "Homepage Section Rank"
- Help text: "Lower numbers appear first on the homepage. Example: Rank 1 appears before Rank 5. Required for published stories."
- Placeholder: "Enter a number (e.g., 1, 2, 3...)"
- Example: "💡 Tip: Use 1 for featured stories, 10+ for regular stories"

**New Launch Rank**:
- Label: "New Launch Rank (Optional)"
- Help text: "Only used if 'Add to New Launches' is enabled. Lower numbers appear first in the New Launches section."
- Placeholder: "Leave empty to exclude from ranking"

### Checkbox Labels

**Publish Checkbox**:
- Current: "Publish this story"
- Proposed: "Publish this story (visible to users)"
- Help text: "When published, this story will be visible in the app. You can unpublish it later."

**Banner Checkbox**:
- Current: "Add to Banner"
- Proposed: "Show in Homepage Banner"
- Help text: "When enabled, this story will appear in the homepage banner carousel. Requires banner image."

**New Launch Checkbox**:
- Current: "Add to New Launches"
- Proposed: "Show in New Launches Section"
- Help text: "When enabled, this story will appear in the 'New Launches' section. Requires tile image."

### Button Labels

**Submit Button** (Create Mode):
- Current: "Create Story"
- Proposed Options:
  - If `is_published === false`: "Save as Draft"
  - If `is_published === true`: "Publish Story"
  - Generic: "Save Story"

**Submit Button** (Edit Mode):
- Current: "Update Story"
- Proposed: "Save Changes"

**Cancel Button**:
- Keep: "Cancel"
- Add tooltip: "Discard changes and return to dashboard"

### Warning/Error Messages

**Pre-Publish Checklist** (Advisory):
```
⚠️ Before publishing, consider:
• Cover image is uploaded
• Description is complete
• Homepage rank is set
• At least one episode is created
```

**Missing Homepage Rank** (Warning):
```
⚠️ Homepage rank is recommended for published stories. Without it, the story may not appear in the expected order.
```

**Rank Collision** (Warning):
```
⚠️ Another story already uses rank {X}. Consider using rank {Y} instead.
```

**Incomplete Story** (Info):
```
ℹ️ This story is saved as a draft. Add episodes and publish when ready.
```

---

## 5. Safety & Error-Prevention Mechanisms

### A. Pre-Publish Checklist (Advisory, Non-Blocking)

**Display When**: User checks "Publish this story" checkbox

**Checklist Items**:
1. ✅ Cover image uploaded
2. ✅ Description provided (recommended)
3. ✅ Homepage rank set (if homepage features enabled)
4. ✅ Banner image uploaded (if banner enabled)
5. ✅ Tile image uploaded (if new launch enabled)
6. ⚠️ At least one episode created (check after save)

**Visual Design**:
- Collapsible panel below publish checkbox
- Green checkmarks for completed items
- Yellow warnings for recommended items
- Red errors for required items (if any)

**Behavior**:
- Non-blocking (user can still publish)
- Updates in real-time as fields are filled
- Dismissible but can be re-opened

### B. Publish Confirmation Dialog

**Trigger**: When user clicks "Publish Story" button AND checklist has warnings

**Dialog Content**:
```
Title: "Publish Story?"
Message: "This story will be visible to users immediately. Some recommended items are missing:
• [List incomplete items]

Do you want to publish anyway or save as draft?"
Actions:
- "Save as Draft" (primary, safe)
- "Publish Anyway" (secondary, proceed)
- "Cancel" (tertiary, stay on form)
```

**Behavior**:
- Only show if warnings exist
- Skip if all items complete
- Remember user preference (optional)

### C. Rank Collision Detection

**When**: User enters a rank value

**Action**: 
- Query existing stories with same rank (client-side or server-side)
- Show warning if collision found
- Suggest next available rank

**Warning Message**:
```
⚠️ Rank {X} is already used by "{Story Title}". 
Suggested rank: {Y}
```

**Behavior**:
- Non-blocking (allow duplicates if intentional)
- Auto-suggest next available rank
- Show list of existing ranks (optional)

### D. Image Upload Validation

**Aspect Ratio Warnings** (Advisory):
- Banner image: "Recommended: 16:9 aspect ratio (e.g., 1920x1080px)"
- Tile image: "Recommended: 1:1 aspect ratio (e.g., 800x800px)"
- Cover image: "Recommended: 4:3 aspect ratio (e.g., 1200x900px)"

**Size Recommendations**:
- Banner: "Optimal size: 1920x1080px, max 2MB"
- Tile: "Optimal size: 800x800px, max 1MB"
- Cover: "Optimal size: 1200x900px, max 2MB"

**Preview**:
- Show thumbnail with aspect ratio overlay
- Warn if image doesn't match recommended ratio
- Non-blocking (allow any valid image)

### E. Draft-First Workflow

**Default Behavior**:
- New stories always start as drafts (`is_published: false`)
- Publish checkbox unchecked by default
- Clear messaging: "This story will be saved as a draft"

**Benefits**:
- Prevents accidental publishing
- Reduces admin anxiety
- Encourages completion before publishing

---

## 6. Media Upload Intelligence

### A. Aspect Ratio Guidance

**Banner Image**:
- **Recommended**: 16:9 (landscape)
- **Example**: 1920x1080px, 1600x900px
- **Use Case**: Homepage banner carousel
- **Visual**: Show overlay with 16:9 frame on preview
- **Warning**: "Image may be cropped if not 16:9"

**Tile Image**:
- **Recommended**: 1:1 (square)
- **Example**: 800x800px, 1000x1000px
- **Use Case**: New Launches grid/tile view
- **Visual**: Show overlay with 1:1 frame on preview
- **Warning**: "Image may be cropped if not square"

**Cover Image**:
- **Recommended**: 4:3 (portrait-friendly)
- **Example**: 1200x900px, 800x600px
- **Use Case**: Story detail page, story cards
- **Visual**: Show overlay with 4:3 frame on preview
- **Warning**: None (more flexible)

### B. Preview Styles

**Banner Preview**:
- Show wide preview (16:9 frame)
- Label: "How it appears in banner"
- Optional: Show on mock homepage banner

**Tile Preview**:
- Show square preview (1:1 frame)
- Label: "How it appears in new launches"
- Optional: Show in grid mockup

**Cover Preview**:
- Show card-style preview (4:3 frame)
- Label: "How it appears in story cards"
- Optional: Show in story card mockup

### C. Upload Guidance Copy

**Banner Image Upload**:
```
Label: "Banner Image"
Help: "Upload a wide image (16:9 ratio) for the homepage banner. 
Recommended: 1920x1080px, max 2MB. 
This image will be displayed prominently on the homepage."
Required: Only if "Show in Homepage Banner" is enabled
```

**Tile Image Upload**:
```
Label: "Tile Image"
Help: "Upload a square image (1:1 ratio) for the new launches section. 
Recommended: 800x800px, max 1MB. 
This image appears in the explore/new launches grid."
Required: Only if "Show in New Launches Section" is enabled
```

**Cover Image Upload**:
```
Label: "Cover Image"
Help: "Upload a cover image for this story. 
Recommended: 1200x900px (4:3 ratio), max 2MB. 
This image appears on story cards and detail pages."
Required: Recommended for published stories
```

---

## 7. Optional Enhancements (Clearly Marked)

### A. Editorial Metadata (Non-Breaking)

**Purpose**: Internal admin tools, not consumer-facing

**Fields** (Future, clearly marked as optional):
1. **Internal Notes** (Textarea)
   - Label: "Internal Notes (Admin Only)"
   - Help: "Private notes for editorial team. Not visible to users."
   - Visual: Distinct styling (muted, smaller)

2. **Tags/Themes** (Multi-select, future)
   - Label: "Tags (Internal)"
   - Help: "Categorize stories for internal organization"
   - Example: ["adventure", "friendship", "nature"]

3. **Target Age Group** (Select, future)
   - Label: "Target Age (Internal)"
   - Options: ["3-5", "5-7", "7-10", "All Ages"]
   - Help: "For editorial organization only"

**Implementation Notes**:
- These fields would require database schema changes (NOT in scope)
- Clearly marked as "Editorial Only" in UI
- Stored separately from consumer-facing fields

### B. Release Date Semantics Clarification

**Current State**: Unclear purpose

**Proposed Clarification**:
- **Option 1**: Historical record only
  - Label: "Original Release Date (Historical)"
  - Help: "When was this story originally created/released? For reference only."
  
- **Option 2**: Scheduling (if supported)
  - Label: "Scheduled Release Date"
  - Help: "Schedule this story to be published on a future date. (Scheduling not yet implemented)"
  - Visual: Disabled/grayed out with "Coming soon" badge

**Recommendation**: Option 1 (historical record) unless scheduling is planned

### C. "What Happens Next?" Section

**Location**: After form submission or as collapsible help section

**Content**:
```
✅ Story Created!

What happens next:
1. Add episodes to your story
2. Upload audio files for each episode
3. Add slides with timestamps
4. Publish when ready

[Button: "Add First Episode"] [Button: "View Story"]
```

**Benefits**:
- Reduces admin confusion
- Guides next steps
- Improves onboarding

### D. Empty State Guidance

**When**: First story creation (detect if no stories exist)

**Content**:
```
Welcome! Create your first story.

A story is a collection of episodes. Each episode has:
• Audio narration
• Synchronized slides with images

Steps:
1. Create the story (you're here)
2. Add episodes with audio
3. Add slides to episodes
4. Publish when ready

[Link: "View Example Story"] [Button: "Continue"]
```

### E. Smart Defaults

**Homepage Rank Auto-Fill**:
- If no stories exist: Default to 1
- If stories exist: Suggest next available rank (e.g., if max is 5, suggest 6)
- Show: "Suggested rank: {X} (next available)"

**Language Default**:
- Remember last selected language (localStorage)
- Default to "en" for new users

**Release Date**:
- Default to today's date (optional, can be cleared)
- Help: "Today's date is pre-filled. Change if needed."

---

## 8. Explicit Constraints & Non-Changes

### What This Design DOES NOT Change

1. **Database Schema**
   - No new fields
   - No field type changes
   - No constraint changes
   - No migration required

2. **Backend Logic**
   - No API changes
   - No validation rule changes (only UI-level warnings)
   - No data processing changes

3. **Authentication & Authorization**
   - No auth changes
   - No permission changes
   - No user role changes

4. **Consumer App Integration**
   - No breaking changes to fields
   - No changes to data format
   - Consumer app behavior unchanged

5. **File Upload Behavior**
   - Upload timing unchanged (still immediate)
   - File storage structure unchanged
   - File deletion behavior unchanged

6. **Form Submission Logic**
   - Same data sent to database
   - Same error handling
   - Same success flow

### What Is Safe to Implement Later

1. **Progressive Disclosure**
   - Pure UI logic (show/hide based on form state)
   - No backend changes
   - Can be implemented incrementally

2. **Pre-Publish Checklist**
   - Client-side validation only
   - Non-blocking (advisory)
   - No database queries required (can use existing data)

3. **Rank Collision Detection**
   - Requires querying existing stories
   - Can be client-side (fetch on mount) or server-side (API call)
   - Non-blocking (warning only)

4. **Copy & Microtext Improvements**
   - Text-only changes
   - No logic changes
   - Can be A/B tested

5. **Image Upload Guidance**
   - Help text and previews only
   - No validation changes
   - Can be added incrementally

6. **Button Label Changes**
   - Conditional text based on form state
   - No behavior changes
   - Low risk

### What Requires Further Planning

1. **Editorial Metadata Fields**
   - Requires database schema changes
   - Requires migration
   - Requires consumer app consideration (if fields are added)

2. **Scheduling Logic** (if Release Date becomes scheduling)
   - Requires backend job/queue system
   - Requires cron or scheduled tasks
   - Major architectural change

3. **Rank Collision Prevention** (if made blocking)
   - Requires unique constraint or validation
   - May require database changes
   - Needs business rule clarification

---

## 9. Implementation Priority Recommendations

### Phase 1: Quick Wins (Low Risk, High Impact)

1. **Copy Improvements**
   - Update field labels and help text
   - Improve button labels
   - Add microtext guidance
   - **Effort**: Low | **Risk**: None | **Impact**: Medium

2. **Progressive Disclosure (Basic)**
   - Hide homepage controls when not publishing
   - Show banner/tile sections only when checkboxes enabled
   - **Effort**: Low | **Risk**: Low | **Impact**: High

3. **Draft-First Messaging**
   - Default to draft, clear messaging
   - Update button text based on publish state
   - **Effort**: Low | **Risk**: None | **Impact**: Medium

### Phase 2: Safety Improvements (Medium Risk, High Impact)

4. **Pre-Publish Checklist**
   - Advisory checklist when publishing
   - Real-time updates
   - **Effort**: Medium | **Risk**: Low | **Impact**: High

5. **Image Upload Guidance**
   - Aspect ratio recommendations
   - Preview overlays
   - **Effort**: Medium | **Risk**: Low | **Impact**: Medium

6. **Rank Collision Warnings**
   - Query existing ranks
   - Show warnings
   - **Effort**: Medium | **Risk**: Medium | **Impact**: Medium

### Phase 3: Enhanced UX (Higher Effort)

7. **"What Happens Next?" Section**
   - Post-creation guidance
   - Next steps
   - **Effort**: Low | **Risk**: None | **Impact**: Low-Medium

8. **Empty State Guidance**
   - First-time user onboarding
   - **Effort**: Low | **Risk**: None | **Impact**: Low

9. **Smart Defaults**
   - Auto-suggest ranks
   - Remember language preference
   - **Effort**: Medium | **Risk**: Low | **Impact**: Low-Medium

### Phase 4: Future Enhancements (Requires Planning)

10. **Editorial Metadata**
    - Requires schema changes
    - Needs product planning
    - **Effort**: High | **Risk**: Medium | **Impact**: TBD

11. **Release Date Scheduling**
    - Requires backend infrastructure
    - Major feature
    - **Effort**: High | **Risk**: High | **Impact**: TBD

---

## 10. Design Principles Applied

1. **Progressive Disclosure**: Show only what's needed
2. **Draft-First**: Safe defaults, explicit publishing
3. **Advisory, Not Blocking**: Warnings guide, don't prevent
4. **Context-Aware**: Fields appear when relevant
5. **Clear Intent**: Every field has purpose and guidance
6. **Error Prevention**: Prevent mistakes before they happen
7. **Admin Guidance**: Help admins make good decisions
8. **Non-Breaking**: All changes are additive or UI-only

---

## Summary

This design document outlines UX improvements for the "Create New Story" form that:
- ✅ Reduce cognitive load through progressive disclosure
- ✅ Prevent errors through validation and warnings
- ✅ Guide admins with clear copy and examples
- ✅ Maintain all existing functionality
- ✅ Require no database or backend changes
- ✅ Can be implemented incrementally

**All proposed changes are UI/UX only and maintain backward compatibility.**

---

**Design complete. Awaiting explicit approval before implementation.**
