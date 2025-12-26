---
trigger: always_on
---

## 1. Core Layout Strategy: "The Bento Grid"
**Concept:** Modular, resizeable, dashboard-style layout. Avoid traditional list views.

### Implementation Rules:
* **Grid System:** Use CSS Grid with `minmax()` logic to create a responsive masonry-style layout.
* **Card Components:** All dashboard elements (Progress, Next Lesson, Stats, Skills) must be encapsulated in standardized "Widget Cards."
* **Visual Hierarchy:**
    * **Hero Card:** Spans 2 columns or full width (e.g., "Current Active Course").
    * **Standard Card:** 1x1 aspect ratio (e.g., "Daily Streak").
    * **Tall Card:** Vertical orientation (e.g., "Skill Tree" sidebar).
* **Spacing:** Use consistent gaps (e.g., `gap-4` or `gap-6` in Tailwind) to maintain the "Bento" separation.
* **Reference:** Apple Widgets / Linear Dashboard.

## 2. Visual Aesthetic: "Glassmorphism & Depth"
**Concept:** Translucent layers to establish hierarchy without heavy borders.

### Implementation Rules:
* **Backgrounds:**
    * **Base Layer:** Deep, rich dark mode (e.g., `#0f1115`).
    * **Surface Layer:** Translucent white/gray with blur.
    * **CSS Rule:** `backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.05);`
* **Borders:** Use 1px subtle gradients or white alpha borders (`border: 1px solid rgba(255,255,255,0.1)`) to define edges.
* **Shadows:** Soft, diffused colored shadows behind active elements to create "glow" rather than hard drop shadows.
* **Typography:** High contrast for content (White/Off-White), subtle opacity (60%) for secondary metadata.

## 3. Interaction State: "Focus Mode (Cinema Player)"
**Concept:** Extreme minimalism during the learning phase.

### Implementation Rules:
* **Trigger:** When route matches `/course/:id/learn`.
* **UI Behavior:**
    * **Sidebar:** Auto-collapse to a minimal icon rail or hidden completely (toggleable via `Cmd+B`).
    * **Navigation:** Remove top header/search bars.
    * **Layout:** Split-screen only.
        * Left: Video/Content Player.
        * Right: Interactive Playground (IDE/Canvas).
* **Drawer:** "Notes" feature must exist as a slide-over drawer (z-index: 50) that floats *over* the content, not shifting the layout.

## 4. UX & Behavioral References
Use these specific app behaviors as the "Gold Standard" for interaction design.

### A. The Linear Standard (Navigation & Speed)
* **Keyboard First:** All primary actions must have hotkeys (e.g., `J`/`K` to move between lessons, `Cmd+K` for global search).
* **Transitions:** Instant page loads. Use optimistic UI updates. No loading spinners unless absolutely necessary; use skeleton screens.

### B. The Arc Browser Standard (Spaces & Organization)
* **Collapsible Context:** Sidebars should feel fluid. Hovering near the edge reveals them; moving away hides them (if in Focus Mode).
* **Context Switching:** Visual distinction between "Learning Mode" (Deep Work) and "Browsing Mode" (Discovery). Change background ambient color slightly to denote state.

### C. The Spotify Standard (Discovery)
* **Daily Mix Logic:** Do not present a "Catalog." Present a "Queue."
* **Entry Point:** The dashboard header must feature a "Resume" or "Start Daily Mix" button (large, prominent play button) that immediately starts content.