---
name: Nexalis Workspace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006194'
  on-tertiary: '#ffffff'
  tertiary-container: '#007bb9'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-num:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-xxl: 2rem
---

## Brand & Style

This design system delivers a high-precision, utilitarian enterprise environment tailored for engineering, asset management, and operations teams at an international energy operator based in the UAE. 

The aesthetic is Modern Corporate with calibrated functional density—blending the clarity of modern engineering issue trackers with executive-grade poise. The visual tone projects stability, operational rigor, and regional authority:
- Deep oceanic navies frame the application shell, grounding high-density workflows in visual permanence.
- Pristine, neutral-cool canvas tones minimize cognitive strain across long operational shifts.
- Vibrant maritime teals anchor primary actions, balancing energy-sector legacy with forward-leaning digital operations.

The interface rejects ornamental skeuomorphism and excessive glassmorphism. It prioritizes data integrity, sub-second visual scanning, clear visual state differentiation, and seamless localization readiness (including dual English/Arabic metrics and typography compatibility).

## Colors

The palette establishes structural separation between navigational controls, working canvases, interactive states, and mission-critical telemetry.

### Core Architecture
- **Primary Teal (`#0d9488`)**: Dedicated to primary calls-to-action, active selection indicators, and key operational confirmations. Hover states scale to `#14b8a6`; pressed and focused states settle into `#0f766e`.
- **Structural Navy (`#0f172a`, `#1e293b`)**: Confined to global navigation rails, primary headers, and high-level enterprise shell containers. It provides an unyielding contrast anchor against bright data tables.
- **Secondary Accent (`#0284c7`)**: Used for analytical callouts, link navigation, active filters, and operational progress states.
- **Neutral Scales (`#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#64748b`, `#0f172a`)**: 
  - Canvas background: `#f8fafc`
  - Elevated card surfaces: `#ffffff`
  - Subtle borders and dividers: `#e2e8f0`
  - Subdued metadata & secondary typography: `#64748b`
  - High-emphasis body text: `#0f172a`

### Semantic Status Tokens
State badges require zero ambiguity across field tickets, drilling schedules, and capital expense pipelines:
- **To Do / Draft**: Slate (`#64748b` on `#f1f5f9` tint, border `#cbd5e1`)
- **In Progress / Active**: Sky Blue (`#0284c7` on `#e0f2fe` tint, border `#bae6fd`)
- **In Review / Verification**: Amber (`#d97706` on `#fef3c7` tint, border `#fde68a`)
- **Done / Operational**: Emerald (`#059669` on `#d1fae5` tint, border `#a7f3d0`)
- **Blocked / Incident Critical**: Crimson (`#dc2626` on `#fee2e2` tint, border `#fecaca`)

## Typography

Typography centers on **Inter** to deliver optimum legibility across tabular datasets, hierarchical Gantt charts, operational boards, and multi-field inspection forms. Numerical metrics, equipment serial numbers, and financial ledger figures utilize **JetBrains Mono** with tabular lining figures enabled (`font-variant-numeric: tabular-nums`).

### Hierarchy & Rhythm
- **Page Titles & Module Headers (`headline-xl`, `headline-lg`)**: Bold, tightened kerning for assertive grounding of major workspace views.
- **Section & Modal Headers (`headline-md`, `headline-sm`)**: Semi-bold, directly connecting action toolbars to corresponding record tables.
- **Work Surface Text (`body-md`, `body-sm`)**: Tuned for dense data ingestion without text fatigue; precise 1.4-1.45x line-height ratios balance density with readability.
- **Labels & Microcopy (`label-sm`, `caption`)**: Subtle uppercase tracking on captions (`0.04em`) reserved strictly for status classifications, table headers, and asset tier categorizations.

## Layout & Spacing

The workspace leverages a persistent application framework consisting of a fixed 260px left global navigation sidebar (collapsible to 64px icon-only), an optional 320px contextual inspection panel on the right, and an agile, fluid central canvas.

### Layout Mechanics
- **Grid Architecture**: 12-column fluid grid across the central canvas with a 16px (`1rem`) gutter and 24px (`1.5rem`) outer margin on desktop screens (`>= 1024px`).
- **Breakpoints**:
  - `Desktop Wide (>= 1440px)`: Full 3-panel workflow (Navigation + Board/Table View + Detail Flyout).
  - `Desktop Standard (1024px - 1439px)`: Detail views overlay as right slide-over drawers with backdrop tint.
  - `Tablet (768px - 1023px)`: Left navigation collapses to icon rail; gutters reduce to 16px.
  - `Mobile (< 768px)`: Navigation converts to an off-canvas drawer; columns stack to single-column streams with 12px margins and 8px gutters.
- **Compact Density**: Core workflow interfaces (data grids, sub-task lists, comment logs) maintain a baseline unit of 4px. Element padding favors a compact vertical footprint (`0.375rem` to `0.5rem`) and wider horizontal padding (`0.75rem` to `1rem`) to keep operational tools rapid and scan-friendly.

## Elevation & Depth

Visual hierarchy relies on crisp, low-contrast borders combined with ultra-subtle, slate-tinted ambient shadows. Deep layered drop shadows are avoided to maintain professional clarity and prevent clutter in high-density data matrices.

### Surface Elevation Scale
- **Level 0 (Base Canvas)**: Background fill `#f8fafc`. Flat, non-elevated.
- **Level 1 (Cards, Worktables, Panels)**: `#ffffff` surface, bounded by a 1px border (`#e2e8f0`). Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hovered Cards, Popovers, Segmented Controls)**: Bounded by 1px border (`#cbd5e1`). Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Dropdown Menus, Modals, Slide-over Drawers)**: 1px border (`#cbd5e1`). Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`.
- **Dark Structural Surfaces (Sidebar & Shell)**: `#0f172a` with internal dividers rendered via `#1e293b` (1px solid), avoiding dark shadows in favor of crisp boundary lines.

## Shapes

The design system incorporates **Soft** curvature (`roundedness: 1`), utilizing controlled 4px to 8px radiuses. This geometry reflects modern enterprise engineering tools: structural, disciplined, and optimized for space efficiency without the sterility of pure sharp corners or the casual playfulness of circular pill treatments.

### Corner Radius Mapping
- **Micro Elements (Checkboxes, Status Dots, Tags)**: `0.25rem` (4px).
- **Controls & Interactive Inputs (Buttons, Inputs, Selects, Tab Triggers)**: `0.375rem` (6px).
- **Cards, Modals, Table Containers, Flyout Shells**: `0.5rem` (8px).
- **Avatars & Pure Status Indicators**: Fully rounded `9999px` strictly for user identity and presence tracking.

## Components

### Buttons
- **Primary**: Solid background `#0d9488`, text `#ffffff`, border transparent. Focus ring: 2px offset with `#0d9488`. Hover: `#14b8a6`. Active: `#0f766e`.
- **Secondary / Outline**: Background `#ffffff`, text `#0f172a`, border 1px solid `#e2e8f0`. Hover: background `#f1f5f9`, border `#cbd5e1`.
- **Ghost / Tertiary**: Background transparent, text `#64748b`. Hover: background `#f1f5f9`, text `#0f172a`.
- **Sizes**: Small (28px height, 12px font), Default (36px height, 14px font), Large (42px height, 15px font). Padding: horizontal `0.75rem` to `1rem`.

### Status Badges & Chips
- Compact, non-intrusive metadata capsules. Height: 22px; padding: 2px 8px; radius: 4px.
- Styled as semi-transparent background tints (10-15% opacity) accompanied by matching 1px border and high-contrast foreground text matching semantic rules (Slate, Sky Blue, Amber, Emerald, Crimson).

### Data Tables & Task Lists
- **Header Rows**: Height 36px, background `#f8fafc`, typography `caption` uppercase, 1px bottom border `#e2e8f0`.
- **Data Rows**: Height 44px (compact standard), background `#ffffff`, alternating row hover `#f8fafc`. Active row selection marked with a 3px left vertical indicator in primary teal (`#0d9488`).
- **Dividers**: Crisp 1px `#f1f5f9` horizontal lines; vertical cell gridlines omitted to avoid visual noise.

### Form Inputs & Selects
- Height: 36px. Background: `#ffffff`. Border: 1px solid `#cbd5e1`. Internal padding: `0.5rem 0.75rem`.
- Focus state: Border color `#0d9488` with an ambient glow (`box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15)`).
- Error state: Border color `#dc2626` with red glow (`box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15)`).
- Label placement: Top-aligned, 4px spacing, `label-sm` weight, color `#334155`.

### Checkboxes & Radio Controls
- Dimensions: 16px x 16px. Border: 1.5px solid `#94a3b8`.
- Checked state: Background `#0d9488`, border `#0d9488`, icon checkmark white.
- Indeterminate state: Primary teal background with centered 8px horizontal white bar.

### Cards & Container Panels
- Background: `#ffffff`. Border: 1px solid `#e2e8f0`. Radius: 8px.
- Internal padding: `1rem` standard for workspace boards (Kanban columns: 12px padding; inner task cards: 12px padding with 8px vertical gap).

### Workspace-Specific Modules
- **Drilling & Project Milestone Bar**: Segmented horizontal meter using primary teal (`#0d9488`) for executed milestones, sky blue (`#0284c7`) for active segments, and light slate (`#e2e8f0`) for pending steps.
- **UAE Timezone / Shift Header Widget**: Monospaced timestamp badge displaying `GST (UTC+4)` with live operational shift indicators inside the deep navy shell bar.