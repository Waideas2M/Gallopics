# Component Hover Effects Audit
**Date:** 2026-01-22
**Purpose:** Ensure Tokens page matches real website behavior

---

## ✅ VERIFIED CORRECT

### Button (Primary/Secondary/Ghost)
**File:** `src/components/Button.css`
- **Primary hover:** Darker background (`#1532d1`), no transform
- **Secondary hover:** Brand tint background, brand border, `translateY(-1px)`, shadow
- **Ghost hover:** `rgba(0, 0, 0, 0.05)` background
- **Status:** ✅ Correct

### Button Circle (Small/Medium)
**File:** `src/components/Button.css`
- **Hover:** Inherits from variant (primary/ghost/white)
- **Status:** ✅ Correct with `padding: 0 !important` fix

### Button Circle Floating (48px)
**File:** `src/components/Button.css`
- **White variant hover:** `scale(1.05)`, `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)`
- **Primary variant hover:** `scale(1.05)`, darker background
- **Status:** ✅ JUST FIXED

### Button Circle Large (56px)
**File:** `src/components/Button.css`
- **Hover:** `translateY(-1px)`, shadow overlay
- **Status:** ✅ Correct

### Header Icon Buttons (.icon-btn)
**File:** `src/components/Header.css`
- **Hover:** `scale(1.05)`, `background: #f0f0f0`
- **Base shadow:** `0 2px 4px rgba(0, 0, 0, 0.05)`
- **Status:** ✅ JUST FIXED in HeaderActions.css

### FilterChip
**File:** `src/components/FilterChip.css`
- **Hover (inactive):** `rgba(0, 0, 0, 0.04)` background, darker border
- **Active:** Black background, white text, no hover change
- **Status:** ✅ Correct

### InfoChip (Clickable)
**File:** `src/components/InfoChip.css`
- **Hover:** `translateY(-1px)`, shadow, underline on name
- **Status:** ✅ Correct

### Toggle
**File:** `src/components/Toggle.css`
- **Hover:** Ring shadow `0 0 0 4px rgba(0, 0, 0, 0.05)` on slider
- **Status:** ✅ Correct

### StatusPill
**File:** `src/components/StatusPill.css`
- **Hover:** None (static display component)
- **Status:** ✅ Correct

### ModernDropdown
**File:** `src/components/ModernDropdown.css`
- **Hover:** Brand border, brand tint background, shadow
- **Open:** Brand border, focus ring
- **Status:** ✅ Correct

### PageTabs
**File:** `src/components/PageTabs.css`
- **Hover:** Text color change only (no background)
- **Active:** Underline indicator
- **Status:** ✅ FIXED (removed unwanted background)

### User Chip (Header)
**File:** `src/components/Header.css`
- **Hover:** `#f9f9f9` background, no border color change
- **Status:** ✅ FIXED (removed blue border)

---

## 📋 COMPONENT HOVER MATRIX

| Component | Hover Transform | Hover Shadow | Hover BG | Hover Border |
|-----------|----------------|--------------|----------|--------------|
| Button Primary | None | None | Darker | None |
| Button Secondary | translateY(-1px) | Yes | Brand tint | Brand color |
| Button Ghost | None | None | rgba(0,0,0,0.05) | None |
| Icon Button (Header) | scale(1.05) | 0 2px 4px | #f0f0f0 | None |
| Circle White | scale(1.05) | 0 4px 12px | white | None |
| Circle Primary | scale(1.05) | None | Darker | None |
| FilterChip | None | None | rgba(0,0,0,0.04) | Darker |
| InfoChip | translateY(-1px) | 0 4px 8px | Brand tint | Brand |
| Toggle | None | Ring (4px) | None | None |
| Dropdown | None | 0 2px 4px | Brand tint | Brand |
| PageTabs | None | None | None | None |
| User Chip | None | None | #f9f9f9 | None |

---

## 🎯 ALL COMPONENTS NOW MATCH PRODUCTION
