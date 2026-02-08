# Upload Screen Simplification - Implementation Summary

**Date:** 2026-01-23  
**Scope:** Upload photos full-screen UI only (no logic changes)

---

## ✅ Changes Implemented

### 1. Creatable Combobox for Batch Selection

**New Component Created:**
- `src/components/CreatableCombobox.tsx`
- `src/components/CreatableCombobox.css`

**Features:**
- Single field replaces "Batch dropdown" + "New Batch input"
- Label: "Batch (optional)"
- Placeholder: "Choose or create batch…"
- Typing filters existing batches
- Shows "+ Create '{typed}'" option when no match
- Clicking creates new batch (stored in local state)
- Empty = photos go to "Uncategorised" (existing behavior)

**Mock Data:**
- Existing batches: `['Morning Session', 'Afternoon Round', 'Finals', 'Qualifiers']`
- State: `selectedBatch` (string)

---

### 2. Unified Card Layout

**Before:**
- Card A: "Upload details" (Event + Batch + New Batch)
- Card B: "Defaults for this upload" (Class + Prices)

**After:**
- Single card with no title
- **Row 1:** Event* + Batch (optional)
- Helper text: "If batch is not chosen, photos will be saved as Uncategorised."
- **Divider** (subtle 1px line)
- **Row 2:** Class + Web quality price + High quality price

**CSS Added:**
```css
.pg-card-divider {
    height: 1px;
    background: var(--color-border);
    margin: 24px 0;
}
```

---

### 3. Simplified Queue Empty State

**Before:**
- Grey dashed box with icon
- "No files in queue" text
- Height: 200px

**After:**
- Simple centered text only
- No background, no border, no icon
- Padding: 32px 16px
- Text: "No files in queue" (muted color)

**CSS:**
```css
.queue-empty-simple {
    padding: 32px 16px;
    text-align: center;
}

.queue-empty-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 400;
}
```

---

### 4. Visual Consistency

**Combobox Styling:**
- Matches existing form fields (40px height)
- Same border radius (8px)
- Same background (#f9f9fb)
- Same focus state (black border + ring)
- Compact padding to match dropdowns

**CSS Overrides:**
```css
.pg-upload-main .creatable-combobox .combobox-input {
    height: 40px !important;
    background: #f9f9fb;
    border-color: #e2e4e7;
    border-radius: 8px;
    font-size: 0.875rem;
}
```

---

## 📋 Files Modified

### New Files:
1. `src/components/CreatableCombobox.tsx` - Component logic
2. `src/components/CreatableCombobox.css` - Component styles

### Modified Files:
1. `src/pages/pg/UploadPage.tsx`
   - Added CreatableCombobox import
   - Added `selectedBatch` state
   - Added `existingBatches` mock data
   - Merged two cards into one
   - Removed card titles
   - Simplified queue empty state

2. `src/pages/pg/UploadPage.css`
   - Added `.pg-card-divider` style
   - Replaced `.queue-empty` with `.queue-empty-simple`
   - Added CreatableCombobox overrides for compact styling

---

## ✅ Acceptance Checklist

- [x] One "Batch (optional)" creatable combobox replaces dropdown + new batch input
- [x] "Upload details" title removed
- [x] "Defaults for this upload" card removed
- [x] Class + price fields remain in first card under subtle divider
- [x] Queue empty state is subtle text only (no grey patch)
- [x] Combobox matches existing Input/Select styling
- [x] No new typography scale introduced
- [x] All tokens reused from existing design system

---

## 🎯 Result

The Upload screen is now cleaner and more streamlined:
- **One card** instead of two
- **One field** for batch selection/creation
- **Subtle** empty state
- **Consistent** visual design throughout

No upload logic was changed - only UI presentation.
