# Design Tokens & Component Specs

**Single Source of Truth** for the Gallopics Design System.
Last updated: 2026-01-22

---

## 1. Tokens

### Colors
**Source:** `src/index.css`

#### Brand
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--color-brand-primary` | `#1B3AEC` | Primary buttons, active states, links |
| `--color-brand-primary-hover` | `#152dbb` | Hover interaction |
| `--color-brand-tint` | `rgba(27, 58, 236, 0.08)` | Subtle backgrounds, active tabs |
| `--color-brand-tint-strong` | `rgba(27, 58, 236, 0.12)` | Active states for tinted elements |

#### Base / Neutrals
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--color-bg` | `#F9FAFB` | Page background (Canvas) |
| `--color-surface` | `#FFFFFF` | Cards, Modals, Dropdowns |
| `--color-text-primary` | `#111111` | Headings, Body text |
| `--color-text-secondary` | `#666666` | Meta text, labels |
| `--color-border` | `#e5e5e5` | Dividers, Inputs |
| `--color-accent` | `#000000` | Strong emphasis |

### Typography
**Source:** `src/index.css` `src/components/TitleHeader.css` (Hero)

**Font Family:** `'Inter', system-ui, -apple-system, sans-serif`

| Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--fs-display` | `3rem` | 800 | 1.1 | Hero Titles |
| `--fs-3xl` / `--fs-h1` | `2rem` | 800 | 1.25 | Page Titles |
| `--fs-2xl` / `--fs-h2` | `1.5rem` | 700 | 1.3 | Section Headers |
| `--fs-xl` | `1.25rem` | 600 | 1.4 | Card Titles, Modal Headers |
| `--fs-lg` | `1.125rem` | 400 | 1.5 | Lead Text |
| `--fs-base` | `1rem` | 400 | 1.5 | Body Text, Buttons |
| `--fs-sm` | `0.875rem` | 400 | 1.5 | Meta, Helper Text |
| `--fs-xs` | `0.75rem` | 500 | 1.5 | Badges, Labels |

### Spacing Scale
**Source:** `src/index.css`

| Token | Value | Mobile Value |
| :--- | :--- | :--- |
| `--spacing-xs` | `4px` | - |
| `--spacing-sm` | `8px` | - |
| `--spacing-md` | `16px` | - |
| `--spacing-lg` | `24px` | `16px` |
| `--spacing-xl` | `32px` | - |
| `--spacing-2xl` | `48px` | - |
| `--container-padding` | `40px` | `24px` |

### Radius Scale
**Source:** `src/index.css`

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-sm` | `6px` | Inputs, small tags |
| `--radius-md` | `16px` | Cards, Modals |
| `--radius-lg` | `24px` | Large panels |
| `--radius-full` | `9999px` | Buttons, Pills, Avatars |

### Shadows
**Source:** `src/index.css`

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.02)` | Subtle depth |
| `--shadow-hover` | `0 6px 16px rgba(0, 0, 0, 0.04)` | Lifted cards |
| `--shadow-overlay` | `0 12px 32px rgba(0, 0, 0, 0.08)` | Modals, Dropdowns |

---

## 2. Components Inventory

### Button
**Files:** `src/components/Button.tsx`, `src/components/Button.css`

| Prop | Values | Notes |
| :--- | :--- | :--- |
| `variant` | `primary`, `secondary`, `ghost`, `icon`, `white` | Controls color/border. |
| `size` | `small`, `medium`, `large`, `floating` | Controls height/padding. |
| `shape` | `default`, `circle` | `circle` forces 1:1 aspect ratio. |
| `disabled` | `boolean` | Opacity 0.5, no pointer events. |

**Sizes (Verified):**
- **Small:** 32px height, 6px 14px padding.
- **Medium:** 44px height, 10px 20px padding.
- **Large:** 52px height, 14px 28px padding.
- **Floating:** 48px x 48px circle.

### FilterChip
**Files:** `src/components/FilterChip.tsx`

- **Purpose:** Toggle filters in browse pages.
- **States:** Default (Grey), Active (Black).

### ModernSearchBar
**Files:** `src/components/ModernSearchBar.tsx`

- **Purpose:** Global search with dropdown results.
- **Variants:** `theme="light"` (white bg), `theme="dark"` (transparent/dark).

### ProfileAvatar
**Files:** `src/components/ProfileAvatar.tsx`

- **Purpose:** Display user/rider/horse entity avatars.
- **Variants:** `rider`, `horse`, `photographer`, `default`.
- **Sizes:** Dynamic (prop `size` in px).

### InfoChip
**Files:** `src/components/InfoChip.tsx`

- **Purpose:** Display entity context (e.g. "Rider: Alva").

### PageTabs
**Files:** `src/components/PageTabs.tsx`

- **Purpose:** In-page navigation switching.
- **Style:** Underline active state.

---

## 3. Gaps & inconsistencies (NOT TOKENIZED)

| Component / Issue | Location | Status | Recommended Fix |
| :--- | :--- | :--- | :--- |
| Global Buttons | `src/index.css` | **DUPLICATE** | `.btn-primary` and `.btn-outline` in global CSS duplicate `Button.css`. Remove global classes and use `<Button />`. |
| Header Icons | `src/components/HeaderActions.css` | **AD-HOC** | `.share-icon-btn` is a one-off class. Should be refactored to use `<Button variant="ghost" shape="circle" />`. |
| Login/Register Modal | `src/components/AuthModal.css` | **INCONSISTENT** | Checks explicitly for `.auth-btn` instead of using shared Button component. |
| Cart Button | `src/components/Header.css` | **AD-HOC** | `.icon-btn` used for cart, duplicates `Button` logic. |

---

## 4. State Matrix (Button)

| State | Visual Change | Token |
| :--- | :--- | :--- |
| **Hover** | Lift + Shadow (Secondary/White), Darker Bg (Primary) | `--color-brand-primary-hover` |
| **Active** | Scale Down (Secondary), Darker Bg (Primary) | Transform scale(0.98) |
| **Focus** | Outline (Keyboard) | `--color-brand-primary` ring |
| **Disabled** | Opacity | 0.5 |
