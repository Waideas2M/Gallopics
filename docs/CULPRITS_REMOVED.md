# Culprits Found & Removed - TokensPage.css

**Date:** 2026-01-22  
**Issue:** Fake demo styles overriding real component behavior

---

## 🚨 CULPRITS IDENTIFIED & REMOVED:

### 1. Global Button Styles (index.css)
**Location:** `src/index.css` lines 327-375  
**Problem:**
- `.btn-primary` sets fixed `height: 52px` and `padding: 0 32px`
- Overrides size classes (small/medium/large)
- Broke circle buttons (forced horizontal padding)

**Solution:**
- Increased specificity in Button.css: `.btn.btn-small` instead of `.btn-small`
- Added `!important` to size classes
- Added `height: auto !important` to override fixed height

---

### 2. Fake Token Classes (TokensPage.css)
**Location:** `src/pages/pg/TokensPage.css` lines 519-582  
**Removed:**

#### `.token-user-pill`
- **Problem:** Duplicate of `.user-chip` from Header.css
- **Impact:** Created inconsistent styling
- **Fix:** REMOVED - now using real `.user-chip`

#### `.token-icon-btn`
- **Problem:** Duplicate of `.share-icon-btn` from HeaderActions.css
- **Impact:** Missing hover effects (scale, shadow)
- **Fix:** REMOVED - now using real `.share-icon-btn`

#### `.token-hero-btn`
- **Problem:** Fake demo version of `.btn-hero-primary` from TitleHeader.css
- **Impact:** Wrong sizing, wrong hover behavior
- **Fix:** REMOVED - now using real `.btn-hero-primary`

---

## ✅ REMAINING (LEGITIMATE):

### `.gallery-hero-context .modern-search-bar`
**Location:** `src/pages/pg/TokensPage.css` lines 585-592  
**Purpose:** Forces hero sizing on ModernSearchBar for demo  
**Status:** KEPT - Uses `!important` but necessary for context simulation  
**Verified:** Matches TitleHeader.css line 467

---

## 📋 VERIFICATION CHECKLIST:

- [x] Button sizes now visually distinct (36px, 48px, 56px)
- [x] Circle buttons are perfect circles (no elongation)
- [x] Header icons show correct hover (scale 1.05 + shadow)
- [x] White floating button shows correct hover
- [x] InfoChips show hover when clickable
- [x] User chip uses real Header.css styles
- [x] No duplicate/conflicting token-* classes

---

## 🎯 RESULT:

**All components on Tokens page now use REAL production styles.**  
No more drift between documentation and implementation.
