# Gallopics — Frontend Migration Plan

## Branch: `V2` — Info Pages (deployed)

**Netlify site:** gallopics.netlify.app
**Netlify site ID:** `812ed9fc-6652-4fdb-b403-9cbaecd62c18`
**Last deploy:** 2026-03-27 — commit `d5217b8`

### What's in V2
- Added `/faq`, `/privacy`, `/terms` pages with sticky TOC sidebar and section numbering
- Added `InfoPageLayout` wrapper with `ContactSupportModal` integration
- Added `PageHeader` component used by info pages
- Added `FacebookIcon` and `TikTokIcon` — fixed FB icon in Footer
- Added `noLinks` prop to `Footer` / `CopyrightBar` for info page footer variant
- Added `.info-page` scoped styles + `info-section` / `info-box` CSS classes in `index.css`
- Content audited against source PDF — all 3 pages match source document

---

## Branch: `Gallo2` → target: hand-off ready codebase

---

## Rules (non-negotiable)
- Zero inline CSS (`style={{}}`) in final output
- Visuals must be pixel-exact to `main` branch (desktop + mobile)
- No logic, routing, mock data, or auth flow changes
- Each phase verified before starting the next

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| Language | TypeScript (strict) |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI primitives) |
| Icons | lucide-react |
| Utilities | clsx + tailwind-merge |
| State | React Context API |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form |
| Validation | Zod |
| HTTP Client | axios |
| Dates | date-fns |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |
| Testing | Vitest + Playwright |

---

## Phases

### Phase 1 — Tailwind Setup ✅
- [x] Install Tailwind CSS v4
- [x] Install tailwind-merge and update clsx usage
- [x] Map all existing CSS variables (theme.css) into @theme in index.css
- [x] Verify build passes with no visual change
- [ ] Confirm desktop + mobile visuals unchanged (manual check)

### Phase 2 — CSS Files → Tailwind ✅
- [x] Migrate all 57 component CSS files to Tailwind classes
- [x] Delete migrated CSS files as each component is done
- [x] Verify each component visually after migration
- [x] Confirm 0 CSS files remaining in /src (except index.css, theme.css, shared-filters.css, mobileSearchFix.css, guestHome.mobile.css — intentionally kept globals/mobile)

### Phase 3 — Eliminate All Inline Styles
- [ ] Remove all 491 `style={{}}` instances
- [ ] Replace every instance with Tailwind classes
- [ ] Dynamic styles (color, transform etc.) handled via Tailwind variants or CSS variables
- [ ] Confirm 0 inline styles remaining
- [ ] Verify desktop + mobile visuals unchanged

### Phase 4 — shadcn/ui Integration
- [ ] Install shadcn/ui
- [ ] Replace Button component
- [ ] Replace Modal/Dialog component
- [ ] Replace Toggle component
- [ ] Replace Tabs / PageTabs component
- [ ] Replace Dropdown / ModernDropdown component
- [ ] Replace Checkbox / FilterChip where applicable
- [ ] Keep all domain-specific components (PhotoCard, PgSelectionPanel etc.) as-is
- [ ] Verify visuals match original for each replaced component

### Phase 5 — Professional Tooling
- [ ] Install and configure Prettier
- [ ] Install Husky + lint-staged (pre-commit: lint + format)
- [ ] Install TanStack Query (React Query) — configured, not wired to API yet
- [ ] Install React Hook Form
- [ ] Install Zod
- [ ] Install axios — create /src/services/api.ts stub
- [ ] Install date-fns
- [ ] Add .env.example with API_BASE_URL placeholder
- [ ] Verify build passes cleanly

### Phase 6 — Code Quality
- [ ] Remove all ~15 `any` types, replace with proper interfaces
- [ ] Split EventDetail.tsx (1407 lines) into sub-components
- [ ] Split PgSelectionPanel.tsx (1217 lines) into sub-components
- [ ] Split PhotographerContext.tsx (807 lines) by feature
- [ ] Final ESLint pass — zero warnings
- [ ] Final TypeScript pass — zero errors

---

## Completion Checklist
- [ ] All 6 phases done
- [ ] Zero inline styles
- [ ] Zero `any` types
- [ ] Zero CSS files in /src (except globals)
- [ ] Build passes clean
- [ ] Desktop visuals match main branch
- [ ] Mobile visuals match main branch
- [ ] Ready to hand off to senior frontend team
