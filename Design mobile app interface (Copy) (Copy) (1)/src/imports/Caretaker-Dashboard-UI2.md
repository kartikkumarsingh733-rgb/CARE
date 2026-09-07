# SmritiSaathi — Caretaker Dashboard UI Specification (Mobile App, for Figma)

**Companion to:** `SmritiSaathi-Architecture.md` (§10, §6.2C) and `UI.md` (§1, §4)
**Scope:** the full `CAREGIVER_ASSISTED_MODE` / `HEALTH_WORKER_MODE` experience — **mobile app only**, same physical device family as the elder-facing app, not a desktop dashboard.
**Design language:** identical foundations to the elder app (same tokens, same voice, same card/button rules) with the caregiver-mode accent and the higher information density §1 of `UI.md` already permits for this audience. Nothing here introduces a new visual system — it applies the one already fixed in `UI.md` §1 to a denser, data-carrying set of mobile screens.

---

## 0. How to use this in Figma

Build one **Figma page per numbered section below** (`0. Foundations`, `1. Caregiver Home`, `2. Patient Overview`, …). Inside each page, one **frame per named screen/state**, named exactly as given (e.g. `Caregiver Home / Default`, `Caregiver Home / Empty`). Build the **Components** page (Section 11) first and turn every reusable card/button/badge into a Figma component with variants for its states — every screen frame then only *instances* those components.

**Frame size: 375×812px (iPhone-standard mobile frame)** for every screen in this spec. If you also ship Android, duplicate the finished 375-width screens into a 360×800 page near the end — don't design twice; the layout, components, and copy are identical, only the frame changes. There is no tablet or desktop variant in this spec.

Everything in this dashboard is reached from the elder device's own **Help → Caregiver sign-in** gate (`UI.md` §2/§3.8) when running in `CAREGIVER_ASSISTED_MODE`, or from the caregiver's own phone with the app installed and signed in directly (their own `HEALTH_WORKER_MODE`/`FAMILY_CAREGIVER` session). Both cases render the same screens below; the only difference is the persistent "Assisted Mode" banner described in Section 2.

---

## 1. Foundations (Figma page: `0. Foundations`)

Reuse the elder-app tokens exactly — do not create new ones. This is what makes switching modes on a shared device feel like the same product, just a different mode.

### 1.1 Color styles to create
| Style name | Hex | Use |
|---|---|---|
| `bg/day` | `#FDF6EC` | screen background, day |
| `bg/night` | `#2E2210` | screen background, night (optional toggle — see 1.7) |
| `text/night` | `#F5E6C8` | text on night background |
| `accent/caregiver` | `#3B4A63` | **primary accent for every caregiver/health-worker screen** — visually distinct from elder mode's terracotta so the mode switch is obvious at a glance |
| `state/confirm` | `#2F6B3C` | completed items, healthy sync, confirm actions |
| `state/stop` | `#A3372E` | destructive actions only (revoke, delete) — never for OBSERVATION-type alerts |
| `state/caution` | `#B98A1E` | Attention-level items, missed reminders, escalation |
| `border/default` | `#3B4A63` | 2px hard borders, all cards |
| `text/primary` | `#2B2620` | body text on day background, 7:1 contrast minimum |
| `text/muted` | `#6B6355` | timestamps and secondary metadata only |

No gradients, anywhere. No drop shadows — borders only. Flat fills only.

### 1.2 Text styles
| Style name | Font | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| `heading/h1` | Atkinson Hyperlegible | 28px | Bold | 0.03em | 1.6 |
| `heading/h2` | Atkinson Hyperlegible | 22px | Bold | 0.03em | 1.6 |
| `heading/h3` | Atkinson Hyperlegible | 19px | Bold | 0.03em | 1.6 |
| `body/default` | IBM Plex Sans | 18px | Regular | 0.03em | 1.6 |
| `body/emphasis` | IBM Plex Sans | 18px | Semibold | 0.03em | 1.6 |
| `body/small` | IBM Plex Sans | 16px | Regular | 0.03em | 1.6 | *(metadata/timestamps only — never smaller)* |

No italics. No all-caps. No serif anywhere. 18px is the caregiver-mode body-text floor from `UI.md` §1.2 — do not shrink type to fit more onto the phone screen; add a screen instead.

### 1.3 Spacing & shape
- Screen side margin: 20px, both edges — nothing runs edge-to-edge except the top nav bar and bottom tab bar themselves.
- Card categories and their **fixed** corner radii (never change once set, anywhere in the app):
  - Alert/observation card → **0px** (a "note")
  - Patient row / list card → **4px**
  - Section summary / hero card → **20px**
  - Tabs, pills, badges → **4px**
- Card internal padding: minimum 20px, all sides.
- Card border: 2px solid `border/default` (or `state/*` when the card carries urgency), never a shadow.
- Vertical rhythm between stacked cards: 24px — irregular relative to internal padding on purpose (matches the elder app's "intentional, not uniform-grid" spacing rule), but identical every time the same card type repeats.

### 1.4 Iconography
- Literal, filled icons only — house, pill bottle, envelope, clock, person, clipboard, shield/lock, chart-line, doctor's bag.
- 44×44px minimum touch target on every icon button — this is a phone, so tap targets matter more here, not less.
- Every icon still carries a **visible text label**. A caregiver thumb-scrolling a list one-handed shouldn't have to guess what a bare glyph means.

### 1.5 Buttons (components: `Button/Primary`, `Button/Secondary`, `Button/Destructive`)
- Min size 44×44px, full-width on mobile for any primary screen action (not a small pill floating in a corner).
- Primary action bottom-right *within its card* for inline actions; for full-screen forms, primary action is docked full-width at the bottom of the screen, safe-area aware.
- Labels are concrete verbs: "Revoke Access," "Record Observation," "Schedule Follow-up" — never "Submit."
- `Button/Destructive` (fill `state/stop`) always opens a confirm sheet with the real consequence spelled out (Section 9.3) — never a generic "Are you sure?"

### 1.6 Sticky headers
Every scrolling screen keeps the patient's photo + name (or the screen title) pinned at the top as you scroll — build this as a fixed header frame + a separately-scrolling content frame beneath it, not one flat scrolling frame. On a phone this is the difference between "whose data am I looking at" being always answered or not.

### 1.7 Day/night
Caregiver screens may offer a manual light/dark toggle in account settings (unlike elder mode, which switches off the device clock and is not manually overridable) — include a `Toggle/Theme` component in Section 11, defaulting every screen in this spec to the day palette.

### 1.8 Navigation shape (mobile-specific)
This is a phone app, so navigation is a **bottom tab bar**, not a desktop top-nav:
`Home` · `Patients` · `Notifications` · `Access` — four tabs, each a filled icon + label, active tab in `accent/caregiver`. Deeper screens (Patient Detail, forms, workflow steps) push on top with a back arrow + title in the top bar, standard iOS/Android push-navigation pattern — never a hidden hamburger menu, since discoverability matters more than density here.

---

## 2. Global Shell (Figma page: `1. Shell`)

### Frame: `Shell / Top Bar` (component, reused on every pushed screen)
- Back chevron (44×44 target) + screen title (`heading/h3`), centered or left per platform convention — pick one and hold it everywhere.
- Right-aligned: sync/device-health icon (below).
- On `Patient Detail` and deeper, the title area is replaced by the sticky patient identity (photo 40px + name) instead of a plain text title.

### Frame: `Shell / Bottom Tab Bar` (component, reused on every top-level screen)
- Four tabs as described in §1.8. 56px tall + safe-area inset.

### Frame: `Shell / Assisted Mode Banner`
- Full-width banner, `accent/caregiver` fill, white text, 44px tall, pinned directly under the top bar.
- Appears **only** when this session is `CAREGIVER_ASSISTED_MODE` running on the *patient's own device* rather than the caregiver's own phone — carrying over the mode-switch visibility rule from `UI.md` §2 so nobody mistakes which mode the shared tablet/phone is currently in.

### Component: `SyncStatus/Icon`
- A single house icon: solid fill = synced, outline only = offline. No numeric badge, no red state — mirrors the elder-mode rule (§3.11) exactly, so a caregiver recognizes the same glyph their patient's device shows.
- Tap opens a small plain-text sheet: "Last synced 4 minutes ago."

---

## 3. Caregiver Home (Figma page: `2. Caregiver Home`, architecture §6.2C / §10)

Answers the three framing questions from §10 as three stacked, visually distinct sections on one scrolling screen — never a dense table, and never tabs hiding two of the three questions from view.

### Frame: `Caregiver Home / Default`
1. **Section: "Patients needing attention"**
   - List-row cards, 4px radius, full width minus 20px margins.
   - Each row: patient photo (circle, 48px) + name (`heading/h3`) + one-line plain-language reason (`body/default`, e.g. "No activity recorded for 2 days") + timestamp (`body/small`, `text/muted`) + chevron to Patient Overview.
   - Sorted by recency. Show first 5 rows, then a full-width "See all (12)" row.
2. **Section: "Missed reminders"**
   - Grouped by patient (patient name as a small sub-header), each line in the exact §10 phrasing: "3 medication reminders were not marked complete" — never a bare count badge alone.
   - Tap → Patient Detail → Reminders tab.
3. **Section: "Recent activity" + status strip**
   - A compact strip at the very bottom of the scroll (not sticky — a footer, distinct from the sticky *patient* header used on deeper screens).
   - Contains `SyncStatus/Icon` + last-sync text + one recent-activity line per patient ("Kamala completed a Memory session, 20 min ago").

### Frame: `Caregiver Home / Empty`
- A real, calm empty state (never a fake all-green demo dashboard): `heading/h2` "Nothing needs your attention right now," `body/default` "We'll let you know if that changes," no icon-heavy illustration — keep it plain.

---

## 4. Patient Overview (Figma page: `3. Patient Overview`, architecture §10 "Dashboard layers")

Reached by tapping any patient row from Home or the Patients tab.

### Frame: `Patient Overview / Default`
- **Sticky header:** patient photo (56px circle) + name (`heading/h2`) + a full-width `Button/Primary` "Call [Patient]" directly beneath it — the one-touch family-call pattern, reachable within one tap per `UI.md` §5.
- Below the sticky header, a **single scrolling column** of bordered cards, in this **fixed order** (architectural requirement, §10 — do not reorder):
  1. **Last activity** — one line + timestamp.
  2. **Current routine/reminder status** — today's reminders, compact (`ReminderCard/Caregiver` component, Section 11).
  3. **Recent task participation** — which game families were played and when; no scores here — scores live one level deeper, behind an explicit "Cognitive trends" tab, so they're never glanced at by accident.
  4. **Trend observations** — plain-language observation snippets (`ObservationCard`, Section 6), with a "See more in Cognitive trends" link.
  5. **Missed/acknowledged reminders** — plain-language counts.
  6. **Engagement indicators** — plain language ("Played 3 days this week"), never a bare percentage.
  7. **Follow-up items** — open interventions/follow-ups awaiting action, each linking into the health-worker workflow (Section 7).
- Each of the 7 is its **own bordered card** (4px radius) — never a single dense stat grid.

---

## 5. Patient Detail (Figma page: `4. Patient Detail`, architecture §10 + `UI.md` §4.3)

### Frame: `Patient Detail / Tab Shell`
- Same sticky patient header as Patient Overview, but shorter (40px photo) to leave room for the tab strip beneath it.
- Below the header, a **horizontally scrollable tab strip** (this is the one place horizontal scroll is acceptable in this spec, since it's a caregiver-density screen, not elder-facing): `Today` · `Cognitive trends` · `Engagement` · `Reminders` · `Memories` · `Observations` · `Interventions` · `Access`.
- Active tab: `accent/caregiver` underline, 3px, `body/emphasis`. No filled-pill tabs.
- Tab strip is pinned directly under the sticky header, so it also stays visible while scrolling deep into a tab's content (two-tier sticky).

### Frame: `Patient Detail / Today`
- Mirrors elder-mode "My Day" content but caregiver-annotated: each reminder card shows the same icon/label the elder sees (medication = pill bottle, etc. — consistency rule, `UI.md` §4.8) plus a caregiver-only status line (prompted/acknowledged/completed/missed), using the same color states as elder mode. Missed reminders use `state/caution` mustard here too, never `state/stop` red — red stays reserved for destructive actions only.

### Frame: `Patient Detail / Cognitive trends`
- Plain line/bar charts only (`Chart/Trend` component), sized full-width minus margins, scrollable vertically if more than one chart.
- Axis labels use the exact approved dashboard language from §10 (e.g. "Visual matching accuracy, sessions with sufficient evidence" — never "Cognitive Score" or a bare 0–100 axis with no explanation).
- Directly beneath each chart, an `ObservationCard` explains what it shows in plain language, with an evidence-quality tag and a "See the evidence" link (opens `Patient Detail / Evidence Sessions`, a pushed sub-screen).
- **No standalone percentage or score ever appears without this explanatory card beside it.**

### Frame: `Patient Detail / Engagement`
- A 30-day heat strip (small filled/outline day cells, horizontally scrollable) plus a plain-language summary line above it. Color is never the only signal — each cell also responds to tap with a one-line label.

### Frame: `Patient Detail / Reminders`
- Reminder history as a scrolling list of cards + a full-width "Add reminder" button pinned above the tab content or as a floating action button, opening `Form/Reminder` (Section 8).

### Frame: `Patient Detail / Memories`
- Vertical scrolling grid (2 columns) of memory entries — caregiver-only view; the elder never sees a grid (`UI.md` §3.4). Each cell: photo thumbnail + name + "added by [caregiver name]" attribution + edit/delete icons, each carrying a text label. Delete opens the mandatory consequence-stating confirm sheet (Section 9.3).

### Frame: `Patient Detail / Observations`
- The observations & alerts feed filtered to this one patient — see Section 6.

### Frame: `Patient Detail / Interventions`
- List of past/open interventions + "Record intervention" button — see Section 8.

### Frame: `Patient Detail / Access`
- Consent/access list for this specific patient — see Section 9.

---

## 6. Observations & Alerts Feed (Figma page: `5. Observations Feed`, architecture §10 "Alert types" / "Alert record")

### Component: `ObservationCard`
Three variants, one per alert type, sharing the same 0px-radius "note" shape, full-width minus screen margins:

| Variant | Left border / tag color | Tag word | When used |
|---|---|---|---|
| `ObservationCard/Observation` | `state/caution` (mustard-adjacent, neutral, not urgent) | "Observation" | the only type live in MVP (§10) |
| `ObservationCard/Attention` | `state/caution` | "Attention" | reserved, not yet live |
| `ObservationCard/Action` | `state/stop` | "Action" | reserved, not yet live |

Card content, top to bottom, every variant:
1. Urgency tag (word + color, never color alone).
2. Explanation text **exactly as generated by the system**, e.g. "Persistent change observed in visual matching performance — 6 eligible sessions contributed."
3. Evidence-quality label (small pill, `body/small`).
4. "See the evidence" link → `Patient Detail / Evidence Sessions`.
5. Full-width `Button/Secondary` "Record observation" / "Record intervention" (health-worker workflow entry, Section 7) at the card's bottom edge.

**Guardrail to annotate directly on this Figma component:** it must never render copy containing "risk," "diagnosis," "failed," or a bare percentage — every number is paired with its plain-language sentence, per §10's explicit "Avoid" list.

### Frame: `Observations Feed / Default`
- Vertically scrolling feed of `ObservationCard` instances, most recent first. A filter control (patient/urgency) sits as a row of chips directly under the top bar — tap to filter, not a separate settings screen.

### Frame: `Observations Feed / Suppressed (collapsed)`
- Beneath the main feed, a collapsed section, closed by default: **"Not shown right now"** (chevron-to-expand row).
- Expanded: one compact row per suppressed candidate — patient name + plain-language reason, one of exactly: `Duplicate` · `Recently acknowledged` · `Low evidence` · `Outside monitoring window` · `Archived` · `Consent revoked` · `Channel unavailable`.
- Never omit this section — suppressed items must remain visible on request, never silently discarded.

---

## 7. Health-Worker Workflow (Figma page: `6. HW Workflow`, architecture §10 "Health-worker workflow")

A guided, one-decision-per-screen push sequence — same interaction principle as elder-mode game sessions, applied to a professional workflow instead of memory load.

### Component: `ProgressStrip/Step`
- Horizontal strip, "Step 2 of 6" style, pinned just under the top bar on every step screen. 6 fixed segments, current segment filled `accent/caregiver`, future segments outlined only.

### Frames (one full screen per step, each with exactly one primary action docked full-width at the bottom):
1. `HW Workflow / 1 Review Patient` — condensed Patient Overview summary.
2. `HW Workflow / 2 Review Evidence` — the evidence-sessions list from the linked observation.
3. `HW Workflow / 3 Record Observation` — dropdown (observation type) + multiline notes field. This is a *health-worker-authored* note, distinct from the system-generated `caregiver_observations` record above it — label the frame clearly so the two are never visually confused.
4. `HW Workflow / 4 Record Intervention` — `Form/Intervention`, Section 8.
5. `HW Workflow / 5 Schedule Follow-up` — date/time picker + assignee picker, plain form.
6. `HW Workflow / 6 Acknowledge / Close` — final confirm screen, single full-width button "Close this item," with a one-line summary of what was recorded above it so nothing closes blind.

---

## 8. Interventions, Outcomes & Reminder Forms (Figma page: `7. Forms`)

All forms in this section are **full-screen mobile forms** (pushed from wherever they're triggered), not modals — a phone screen is too small for a stacked modal-on-modal pattern.

### Component: `Form/Intervention`
Fields, stacked vertically: intervention type (dropdown), start date/time, end date/time (optional), notes (multiline, expands with content). Reached from an `ObservationCard`'s "Record intervention" button or from `HW Workflow / 4`.
**Guardrail to annotate on the frame:** neither this screen nor the outcome screen below may ever be titled or described as "treatment effect" anywhere in copy, buttons, or empty states.

### Frame: `Form/Outcome Observation` (separate, clearly labeled screen — never merged into the intervention form)
Fields: outcome definition, observed-at date, window start/end, notes. Screen title: "Record what happened after" — plain language, not clinical shorthand.

### Component: `Form/Reminder`
Fields: type (medication/hydration/activity/appointment/custom — each with the **same literal icon** the elder will later see on their own device), title, plain-language instruction text, schedule (time picker + day-of-week picker), priority, escalation policy (dropdown: e.g. "Notify me if missed twice").
Build as one component with a "prefilled" boolean variant — same screen serves both create and edit.

---

## 9. Consent & Access Management (Figma page: `8. Access & Consent`, architecture §10 "Access / consent")

### Frame: `Access / Patient List`
- Plain vertical list, one row per person with access: name, scope ("Family caregiver — full"), expiry date, `Button/Destructive` "Revoke access" at the row's trailing edge.

### Frame: `Access / Revoke Confirm` (bottom sheet, component `Sheet/Confirm`)
- A mobile bottom sheet, not a centered desktop dialog — slides up, states the **real** consequence, exactly reflecting the offline-revocation limitation the architecture requires be surfaced honestly:
  > "This person will lose access. If their device is offline, access may continue until their local authorization expires."
- Two full-width stacked buttons: `Button/Destructive` "Revoke access" on top, `Button/Secondary` "Cancel" beneath it — thumb-reachable at the bottom of the sheet.

### General component: `Sheet/Confirm`
Reused everywhere a state-changing/irreversible action occurs (delete memory, mark permanently done, revoke access, end session early): always states the specific real consequence in plain words, never "Are you sure?" Always a bottom sheet, never a full-screen interstitial, so context above it stays visible.

---

## 10. Notifications & Device/Sync Health (Figma page: `9. Notifications & Device Health`)

### Frame: `Notifications / Feed`
- Same non-alarming language and color rules as `ObservationCard`: no siren icons, no red badge for `OBSERVATION`-type items.
- Only reminder-escalation notifications (repeatedly missed medication) may use `state/caution` mustard. Build the `state/stop` red variant anyway for future-proofing, but annotate it "not used in MVP" — `ATTENTION`/`ACTION` types aren't live yet.
- This is the fourth bottom-tab destination (§1.8) — badge the tab icon with a small dot (never a number) when unread items exist.

### Frame: `Device Health / Row` (surfaced inside Home's footer strip and inside a caregiver's own account/settings screen — not its own tab)
- `SyncStatus/Icon` + last sync time + pending event count + crash/ANR flag if present — plain numbers, no red, per §10/§19. This is the one place raw technical state is acceptable, since the audience here is the caregiver/operator, not the patient.

---

## 11. Components Page (Figma page: `10. Components` — build this FIRST)

Create each of the following as a true Figma **component** with named **variants** covering every state mentioned above, before building any screen:

| Component | Variants required |
|---|---|
| `Button/Primary`, `Button/Secondary`, `Button/Destructive` | default, pressed, disabled (grayed + one-line reason text slot) |
| `Sheet/Confirm` | generic bottom sheet |
| `ObservationCard` | Observation / Attention / Action |
| `ReminderCard/Caregiver` | upcoming / prompted / acknowledged / completed / missed |
| `Tabs/PatientDetail` | active / inactive, per tab label |
| `ProgressStrip/Step` | step 1–6 filled states |
| `SyncStatus/Icon` | synced / offline |
| `Form/Intervention`, `Form/Outcome Observation`, `Form/Reminder` | empty / prefilled |
| `Badge/CredentialRole` | Family Caregiver / Health Worker |
| `Badge/EvidenceQuality` | one visual style, text slot |
| `Toggle/Theme` | day / night |
| `EmptyState/Generic` | icon-free text block, title + subtext slots |
| `Shell/TopBar`, `Shell/BottomTabBar`, `Shell/AssistedModeBanner` | see Section 2 |

Every screen frame in Sections 3–10 should be built from **instances of these components only** — no one-off buttons or cards. One definition, reused everywhere it applies — same discipline the architecture applies to its backend schemas.

---

## 12. Cross-cutting rules (apply to every frame you build)

- No gradients, no drop shadows — 2px solid borders only.
- No stock photography, no illustrated/AI avatars anywhere — real patient photos only, or a plain neutral silhouette placeholder if none exists; never a generated face.
- Text ≥ 18px, 7:1 contrast, IBM Plex Sans body / Atkinson Hyperlegible headings, no italics/caps.
- Every state-changing action gets a `Sheet/Confirm` with the real consequence spelled out, as a bottom sheet.
- Never label anything "risk," "failed," "ineffective," or "treatment effect" — use the plain-language phrasing bank in Section 6.
- Destructive actions use `state/stop` red exclusively — never for OBSERVATION-type alerts or missed reminders, which stay mustard.
- Every empty/error/loading state is designed as a real frame in this file — never a placeholder "TODO" frame. If a screen's empty state isn't designed, the screen isn't done.
- All navigation is bottom-tab + push, safe-area aware, one-handed-reachable primary actions — no desktop-pattern hover states, no hamburger menus, no modal-on-modal stacking.
