# Product Requirements Document (PRD)
## CogniCare NER — AI-Powered Cognitive Gaming & Memory Assistance Platform for Elderly Dementia Patients

**Version:** 1.0
**Prepared for:** SIH (Smart India Hackathon) — Problem Statement: Elderly Cognitive Health, North Eastern Region
**Document owner:** Product/Engineering Team
**Target build agent:** Antigravity (agentic coding assistant)

---

## 0. Instructions for the Development Agent (Antigravity)

> **Read this section first, before writing any code.**

1. **There is no existing frontend codebase.** What exists is a set of **UI design screenshots** — those screenshots are the source of truth for the visual design language (colors, typography, spacing, component style, screen layouts) and the frontend must be built from scratch to match them. Before generating any UI code:
   - Review the provided UI design screenshots and produce an inventory of every screen/component they show.
   - Map each screen/component shown in the screenshots to the feature list in Section 5 of this PRD.
   - Identify gaps in both directions — features listed in Section 5 with no corresponding screen in the screenshots, and any screenshot screens that don't map to a listed feature (flag these for the user to clarify).
   - Choose the mobile framework per Section 8.1 (confirm with the user before locking it in, per point 5 below) and set up the project's design system (theme, typography scale, spacing units, base components) so it matches the screenshots exactly. Do not deviate from the screenshots' look and feel. For the cognitive games specifically, you may optimize layouts for better usability, and for entirely new features not covered by the screenshots you may extend the design language — but the established palette, type scale, and component shapes must stay consistent throughout.
2. **This is a single app, not two apps.** Build one codebase with a **role-based mode switch** (Elder Mode / Caregiver Mode) as described in Section 4. Do not create separate elder-app and caregiver-app projects.
3. **Build in this order** to keep the app demo-able at every stage (important for hackathon judging):
   - Stage 1: Core game engine + 1 working game per cognitive domain (4 games) with static difficulty
   - Stage 2: Adaptive Difficulty Engine (ML/rules-hybrid) wired into those 4 games
   - Stage 3: Reminders module + local notifications
   - Stage 4: Caregiver dashboard (read from local/mock data first, then real backend)
   - Stage 5: Voice + multilingual layer
   - Stage 6: Offline sync + backend integration
   - Stage 7: Polish, accessibility pass, theming for NER
4. **Everything must run in a demo with no internet**, since offline-first is a core judged requirement. Build offline-first from day one; treat the backend as a sync target, not a dependency for core functioning.
5. Ask the user (not the agent's own judgment) before making irreversible architectural choices not covered in this document (e.g., swapping the mobile framework, changing the database).

---

## 1. Background & Problem Statement

The North Eastern Region (NER) is seeing a gradual rise in age-related cognitive disorders (dementia, memory decline) among the elderly. Families in remote/rural NER areas face:
- Limited access to specialized neurological care and cognitive therapy
- Geographic and infrastructural barriers to continuous care
- Lack of affordable, **culturally relevant**, regional-language digital therapeutic tools
- Caregiver burden from continuous monitoring needs

**Goal:** Build an AI-enabled cognitive gaming and memory-assistance mobile platform for elderly dementia patients in NER that is clinically useful, culturally embedded, caregiver-integrated, and usable with unreliable connectivity.

---

## 2. Objectives

1. Deliver interactive cognitive games covering memory, attention, routine recall, and pattern/object recognition.
2. Personalize difficulty in real time using an ML-driven adaptive engine tied to patient performance.
3. Support multilingual, voice-assisted interaction suitable for elderly, potentially low-literacy users.
4. Reflect NER cultural context in visuals, sounds, language, and themes.
5. Provide reminders for medicine, hydration, activities, and appointments.
6. Give caregivers/health workers a monitoring dashboard with alerts.
7. Function fully offline with sync-when-available.
8. Provide an elderly-friendly, low-friction UI/UX.
9. Encourage sustained engagement, emotional well-being, and (where possible) social interaction.

## 3. Non-Goals (for hackathon MVP scope control)

- This is **not** a diagnostic tool — it does not diagnose dementia or its stage. It supports cognitive engagement and monitoring, and flags patterns for a doctor to review.
- Not a replacement for clinical care; positioned as a companion/support tool.
- Video/audio calling with doctors is out of scope for MVP (can be a "future roadmap" item).
- Full EHR (Electronic Health Record) integration is out of scope for MVP; only structured local health/reminder data is stored.

---

## 4. App Architecture: One App, Two Modes

Single Android/iOS (or Android-first) app with a **Mode Switcher**, unlocked by role at login/setup:

### 4.1 Elder Mode
- Large-icon home screen: **Play**, **Reminders**, **My Day**, **Call Family/Help** (SOS-style), and a mascot/companion character for warmth.
- No dense menus, no small text, no more than 3–4 choices per screen.
- Voice-first navigation option ("Read this to me", "Start a game", spoken in regional language).
- Runs the games, receives reminders, has an optional simple mood check-in ("How are you feeling today?" with 3–5 large emoji-style options).

### 4.2 Caregiver Mode
- PIN/biometric-gated switch from Elder Mode (so the patient can't accidentally enter it).
- Dashboard: cognitive trend charts, activity streaks, alerts, reminder management, multi-patient support (one caregiver can monitor multiple elders), and data export.
- Caregiver can configure: difficulty ceiling/floor overrides, reminder schedules, language, theme pack, and emergency contacts.

### 4.3 Shared Backend Concepts
- One patient profile → many caregivers can be linked (family + health worker) → one activity/event log stream feeds both game engine and dashboard.

---

## 5. Functional Requirements (mapped to problem statement a–h)

### (a) Cognitive Game Library
Minimum 4 domains, each with **3+ game variants** for variety and to avoid rote memorization of a single puzzle:

| Domain | Example Game Mechanics |
|---|---|
| **Memory Improvement** | Card-flip matching pairs; "what changed" (spot the difference in a scene); sequence recall (repeat a shown sequence of images/sounds) |
| **Attention & Concentration** | Odd-one-out under time pressure; sustained-attention tap-when-you-see-X game; distractor-filtering tasks |
| **Daily Routine Recall** | "What comes next" sequencing of a daily routine (brushing → bathing → breakfast, shown as regionally familiar imagery); time-of-day matching (match activity to time) |
| **Pattern & Object Recognition** | Shape/pattern completion; regional object naming/identification (local fruits, tools, festival items, animals); category sorting |
| **Emotional/Mental Engagement** | Mood-linked music/soundscape rooms; simple storytelling with choices; family-photo recognition game (caregiver-uploaded photos) |

**Game engine requirements:**
- All games are built on one shared internal **Game Session API** so the Adaptive Difficulty Engine and analytics logging work identically across all games (single integration point, not per-game logic).
- Each game session logs: response time per item, correct/incorrect, hint usage, retries, session duration, time of day, and abandonment (if the user quits mid-game).

### (b) ML/AI Adaptive Difficulty Engine
See Section 6 (dedicated section — this is a core differentiator).

### (c) Multilingual & Voice-Assisted Interaction
- Text and voice UI in: **English, Hindi, Assamese, Bodo, Bengali (for NER Bengali-speaking areas), Khasi, Mizo, Manipuri (Meitei), Nagamese**, prioritized by feasibility of TTS/STT support (see Section 8.5 for phased language rollout and the Sarvam AI-based speech stack — note that TTS and STT coverage differ per language, which changes what "supported" means per language; see 8.5).
- Speech-to-text for voice commands ("start game", "repeat", "call my daughter") powered by Sarvam AI's Saarika/Saaras speech-to-text models — see Section 8.5.
- Text-to-speech reads out instructions, reminders, and encouragement messages aloud, in the selected language, via Sarvam AI's Bulbul text-to-speech model, backed by a locally-cached audio bank for offline playback (see Section 8.5 — Sarvam is a cloud API with no on-device model, so pre-generation/caching is mandatory, not optional, for the offline-first requirement).
- Language selectable at onboarding by the caregiver, changeable anytime.

### (d) Cultural Familiarity
- Visual theme packs per NER state/community (e.g., festival motifs — Bihu, Hornbill Festival, Chapchar Kut — as optional decorative themes, not stereotypes; caregiver picks what fits the patient).
- Regional folk music / local instrument sounds as background audio options.
- Object-recognition game content uses regionally familiar items (bamboo products, local fruits/vegetables, traditional attire) rather than generic Western clipart.
- All of this is **content data**, not hardcoded — themes should be defined in a config/content pack so new regions/languages can be added without code changes.

### (e) Reminders System
- Reminder categories: **Medicine, Hydration, Daily Activities, Medical Appointments.**
- Each reminder: title, category, time(s)/recurrence, optional voice message recorded by caregiver ("Amma, it's time for your BP tablet" in the caregiver's own voice — high engagement value), and an acknowledgment requirement (elder taps "Done" or says "done").
- Missed/unacknowledged reminders escalate: local repeat notification → caregiver alert (when online) → optional SMS fallback for caregivers with low smartphone literacy.
- Must work fully offline via local notification scheduling (see Section 7.3).

### (f) Caregiver/Health Worker Monitoring Dashboard
- Trend charts: accuracy over time, average response time, engagement (sessions/week, minutes/week), domain-wise performance (memory vs. attention vs. recognition).
- Adherence tracking: reminder completion rate.
- Alerts: sudden performance drop, prolonged inactivity, repeated failed sessions, missed medicine/hydration reminders.
- Notes field for caregiver/health worker observations (plain text, timestamped).
- Multi-patient list view for health workers managing several elders in a village/cluster.
- Exportable summary (PDF/CSV) to share with a doctor.

### (g) Offline-First / Low-Connectivity Support
See Section 7.3 (dedicated section).

### (h) Elderly-Friendly UI/UX
- Minimum 18–20sp equivalent font size baseline (scalable up further via an in-app "text size" slider), high contrast mode, large tap targets (minimum 48x48dp), minimal simultaneous on-screen choices, consistent icon-based navigation, no double-tap or complex gestures, undo-friendly (no destructive irreversible actions without confirmation).
- Calming, non-flashing color palette; no aggressive game-over sounds; failure states are gentle and encouraging, never punishing (important for dementia patients — avoid frustration/anxiety triggers).

---

## 6. ML Adaptive Difficulty Engine — Detailed Design

This is the centerpiece differentiator the user wants emphasized. Treat this as its own module, independent of any single game.

### 6.1 Design Philosophy
Two-layer approach so the system is both **explainable to judges** and **genuinely adaptive**:

1. **Rules-based safety layer** (always active, works fully offline, zero cold-start problem): moves difficulty up/down based on rolling accuracy and response-time thresholds. This guarantees the app is never "broken" for a demo with no trained model yet.
2. **ML personalization layer** (refines the rules layer over time, per patient): a lightweight model that learns each patient's individual response patterns and adjusts more precisely than the generic rule thresholds.

### 6.2 Input Features per Session/Item
- Accuracy (rolling window of last N attempts, e.g., N=10)
- Response time (normalized against that game's expected time budget)
- Hint usage count
- Retry count
- Time-of-day (cognitive performance for dementia patients often varies with time of day — "sundowning" effect)
- Streak (consecutive correct/incorrect)
- Domain-specific score (memory score vs attention score tracked separately — difficulty adapts per-domain, not globally, since a patient may be strong in recognition but weak in memory)

### 6.3 Difficulty Parameters the Engine Controls (per game, exposed via the shared Game Session API)
- Number of items/cards on screen
- Time limit per item
- Distractor similarity (how visually/conceptually similar wrong options are to the correct one)
- Sequence length (for recall games)
- Hint availability/frequency
- Complexity of stimulus (e.g., single object → object-in-scene → object-in-cluttered-scene)

### 6.4 Model Approach
- **MVP/offline model:** Rule-based state machine — e.g., 5 difficulty tiers per domain; move up a tier after 3 consecutive successes above an accuracy threshold and under a time threshold; move down a tier after 2 consecutive failures or timeouts. This runs entirely on-device, no ML infra needed, and is enough to satisfy "adapts based on performance" for a working demo.
- **Enhanced/stretch model:** A lightweight on-device model (e.g., a small logistic regression / decision tree, or a bandit algorithm such as Thompson Sampling) trained per-patient (or cold-started from a population-level model, then fine-tuned locally) to predict "probability patient succeeds at difficulty tier X next" and pick the tier that keeps success probability in a target band (e.g., 65–80% — the psychological "flow zone," hard enough to be meaningful, easy enough to avoid frustration).
- Model runs **on-device** (e.g., TensorFlow Lite / ONNX Runtime Mobile) so it works offline; periodic sync uploads anonymized performance logs to retrain population-level models server-side, which are then pushed back down as an updated base model (federated-style update, without needing full federated learning infra for MVP).

### 6.5 Explainability Requirement
For hackathon judging and clinical trust, the dashboard should show **why** difficulty changed in plain language, e.g., "Difficulty increased in Memory games — 4 correct answers in a row" or "Difficulty reduced in Attention games — response time increasing over the last 3 sessions." Never a black box.

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Game screens must respond within 100ms to input (elderly users are sensitive to lag feeling like "it didn't register my tap").
- App cold start under 3 seconds on mid-range Android devices (target hardware: budget Android phones/tablets common in rural NER, e.g., 2–3GB RAM devices).

### 7.2 Security & Privacy
- All patient health-adjacent data (game performance, reminder logs, notes) encrypted at rest (e.g., SQLCipher for local DB) and in transit (TLS).
- Compliant in spirit with India's **Digital Personal Data Protection (DPDP) Act, 2023** — explicit consent capture at onboarding, data minimization, ability for caregiver to export/delete patient data.
- Role-based access: caregiver PIN/biometric gate before entering Caregiver Mode or dashboard.
- No data sold/shared with third parties; anonymized aggregate data only for the population-level ML model.

### 7.3 Offline-First & Low-Connectivity
- **Local-first data model:** all core functionality (games, difficulty engine, reminders, mood check-ins) reads/writes to an on-device database first; no feature should block on network availability.
- **Sync engine:** background sync queue pushes/pulls changes when connectivity is detected (Wi-Fi or even intermittent 2G/3G), with conflict resolution (last-write-wins per field, with timestamps, is sufficient for MVP; flag conflicts for caregiver review if timestamps collide).
- **Asset strategy:** all game assets (images, audio, TTS voice packs for offline use) bundled with the app or downloaded once and cached — no on-demand asset fetching during gameplay.
- **Degraded-mode indicators:** subtle "offline — will sync later" indicator in Caregiver Mode dashboard so caregivers aren't confused by stale data.

### 7.4 Accessibility
- Screen-reader compatible (for low-vision elderly users).
- Colorblind-safe palette options.
- Adjustable font scaling independent of OS-level settings (some elderly users won't know how to change system font size).

---

## 8. Technical Architecture (Recommended)

### 8.1 Frontend
- Build fresh from the **UI design screenshots** (no existing frontend codebase to inherit from). Antigravity should propose a framework — React Native or Flutter are the likely fits for a typical SIH mobile build — and confirm the choice with the user before locking it in, per Section 0 point 5, since switching frameworks later is exactly the kind of irreversible choice that shouldn't be made unilaterally.
- State management: since there's no established pattern to match, pick a simple, well-known solution (Redux/Zustand for React Native, or Provider/Riverpod for Flutter) and confirm with the user if there's a preference.

### 8.2 Local Storage
- SQLite (via SQLCipher for encryption) or WatermelonDB/Realm for structured local-first data (patient profile, game sessions, reminders, sync queue).

### 8.3 Backend (for sync, caregiver multi-device access, and population-level ML training)
- Lightweight REST or GraphQL API (Node.js/Express or Python/FastAPI).
- Database: PostgreSQL for structured caregiver/patient/reminder data; **Cloudflare R2** (S3-compatible object storage, accessed via the S3 API/SDK) for uploaded family photos, custom reminder voice notes, and the cached/pre-generated Sarvam TTS audio bank described in Section 8.5. R2's lack of egress fees is a meaningful cost win here since cached audio and family photos will be pulled down to many devices repeatedly.
- Auth: JWT-based, with separate scopes for elder-linked device vs caregiver account.
- Required secrets/config (store in environment variables or a secrets manager — never commit to the repo): `SARVAM_API_KEY`; Cloudflare R2 account ID, access key ID, secret access key, bucket name, and endpoint URL.

### 8.4 ML Infrastructure
- On-device inference: TensorFlow Lite (React Native) or `tflite_flutter` (Flutter).
- Server-side training pipeline (can be minimal for hackathon): Python + scikit-learn/PyTorch, retrains population-level baseline model periodically from anonymized aggregated logs, model artifact pushed to app via versioned model download during sync.

### 8.5 Voice & Multilingual Stack
- **Primary speech API: Sarvam AI.** We have a Sarvam API key already provisioned. Use Sarvam's hosted REST API (`api.sarvam.ai`) as the STT/TTS provider — it's purpose-built for Indian languages and gives the fastest path to a working demo. Two important facts shape the architecture below:
  1. **Sarvam is a cloud API only** — there is no official on-device/self-hostable model to fall back on the way AI4Bharat offered. This makes the pre-generated/cached audio strategy in the bullet below **mandatory for the offline-first requirement (Section 7.3), not just a nice-to-have fallback.**
  2. **TTS and STT do not cover the same languages.** Don't assume "Sarvam supports language X" means both directions work.
     - **TTS (Bulbul model):** 11 languages — English, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia. Of the NER-relevant languages in Section 5(c), only **English and Bengali** have Sarvam TTS voices.
     - **STT (Saaras v3 model):** all TTS languages above, **plus** Assamese, Bodo (brx), Manipuri/Meitei (mni), Nepali, and several others — but still **no Khasi, Mizo, or Nagamese.**
     - Net effect: for Assamese, Bodo, and Manipuri, elders can speak voice commands and Sarvam will transcribe them (STT works), but Sarvam **cannot speak instructions/reminders back** in those languages (no TTS voice) — the app has to cover that gap another way (see below). Confirm current coverage against `docs.sarvam.ai` before Stage 5, since Sarvam ships new language support fairly often.
  - **Offline architecture (required, not optional):** at build/setup time (with connectivity), call Sarvam TTS once for every fixed UI string, instruction, encouragement message, and reminder-category phrase in each supported language, and store the resulting audio files in Cloudflare R2, then sync/cache them to the device alongside other bundled assets per Section 7.3. At runtime the app plays back the cached local audio file — it does not call Sarvam live during gameplay or reminder delivery. Live Sarvam TTS calls are reserved for content that's genuinely dynamic and can tolerate needing connectivity (e.g., an ad hoc caregiver note that wasn't pre-generated); the far more common case, caregiver-recorded voice reminders, needs no TTS at all since it's the caregiver's own recorded voice, uploaded straight to R2.
  - **Voice command STT is online-only.** Since Sarvam has no offline STT, voice command navigation ("start game", "repeat") requires connectivity and should degrade gracefully to the on-screen buttons (which remain the primary interaction path per Section 4.1 — voice is an *option*, not a requirement) when offline.
  - **Coverage gap for Khasi, Mizo, and Nagamese remains** (Sarvam has no support for any of them, on either TTS or STT) — as before, treat these as Phase 2/roadmap languages needing a secondary provider, Bhashini (Government of India's National Language Translation Mission) if it adds coverage, or community-sourced voice data plus manually recorded bundled audio.
- Phase 1 (MVP/demo): **English + Hindi + Bengali** — the set where Sarvam gives full TTS *and* STT, so both spoken instructions and voice commands work end-to-end. (This replaces the earlier Assamese-in-Phase-1 plan: Assamese voice *commands* work today via Sarvam STT, but Assamese spoken *instructions/reminders* do not, since there's no Assamese TTS voice yet — see above.)
- Phase 1.5 (if time allows before the deadline): add **Assamese, Bodo, and Manipuri** as STT-only languages for voice commands, paired with **professionally pre-recorded (not Sarvam-generated) bundled audio** for instructions/reminders in those languages, so the elder still hears a real voice even though Sarvam can't synthesize one yet. Swap in live Sarvam TTS for these languages the moment coverage appears.
- Phase 2 (post-hackathon roadmap): Khasi, Mizo, Nagamese, once a suitable provider or community voice-data pipeline is identified.
- All UI strings externalized into locale files from day one (even before all languages are voiced) so adding a language later is a translation/content task, not a re-engineering task.

---

## 9. Data Model (Core Entities)

- **Patient**: id, name, age, preferred language, theme pack, difficulty overrides, linked caregivers, consent record
- **Caregiver**: id, name, role (family/health worker), linked patients, contact info, PIN/biometric hash
- **GameSession**: id, patient_id, game_type, domain, start/end time, items[] (each with response time, correct/incorrect, hint used), difficulty tier before/after, device offline/online flag
- **DifficultyState**: patient_id, domain, current_tier, last_updated, change_reason (for explainability)
- **Reminder**: id, patient_id, category, schedule, custom_voice_note_url (nullable), acknowledgment_log[]
- **MoodCheckin**: id, patient_id, timestamp, mood_value
- **Alert**: id, patient_id, caregiver_id, type, timestamp, resolved (bool), note
- **SyncQueue**: entity_type, entity_id, operation, timestamp, sync_status

> Note: `custom_voice_note_url` (Reminder) and any family-photo URLs are Cloudflare R2 object URLs (or R2 keys resolved via the backend), synced down and cached locally per the offline strategy in Section 8.5/7.3 — not fetched live during gameplay or reminder delivery.

---

## 10. Success Metrics (for hackathon pitch + real-world framing)

- Engagement: average sessions/week per patient, average session length
- Cognitive proxy metrics: accuracy trend over time per domain, response-time trend
- Adherence: % of reminders acknowledged on time
- Caregiver adoption: % of caregivers checking dashboard weekly
- Offline robustness: % of sessions completed with zero connectivity
- Reach: number of regional languages/themes actively supported

---

## 11. MVP Scope for Hackathon Demo (Recommended Cut Line)

**Must have (demo-critical):**
- 4 working games (one per core domain) with the rules-based adaptive difficulty layer live
- Elder Mode + Caregiver Mode switch with PIN gate
- Reminders (medicine, hydration, activity, appointment) with local notifications, fully offline
- Caregiver dashboard with at least accuracy/engagement trend charts and one alert type
- One NER regional language + English, with TTS for instructions
- Offline-first local storage proven by demoing with airplane mode on

**Should have (strong differentiator, do if time allows):**
- ML personalization layer (bandit/logistic model) on top of the rules layer, with explainability text in dashboard
- Voice command navigation ("start game", "repeat")
- Custom caregiver-recorded voice reminders
- Cultural theme packs (visual/audio)

**Could have (roadmap/future):**
- Multi-patient health-worker view across a village cluster
- Federated model updates across devices
- Social/family interaction features (shared photo games, video messages)
- Full doctor-facing clinical report export

---

## 12. Stage-by-Stage Build Prompts (for Claude Code)

Use these one at a time, in order. Run each stage, review/test/commit what it builds, then paste the next one. Don't paste them all at once — the checkpoints are the point.

**Setup prompt (paste first, once):**
> Read PRD_CogniCare_NER.md(2) in this repo fully before doing anything else. There is no existing frontend codebase — only a set of UI design screenshots. Review the screenshots and produce an inventory: list every screen/component they show, propose a framework and state management approach (per Section 8.1), and define the design system (colors, fonts, spacing, component patterns) that will match the screenshots. Map each screenshot screen to the features in Section 5 of the PRD. Tell me what the screenshots cover, what's missing relative to Section 5, your proposed framework choice, and ask me anything you need clarified before we start Stage 1. Do not write any code yet.

**Stage 1 — Core game engine + 4 games (static difficulty):**
> Following Section 5(a) and the shared Game Session API described in Section 5, build one game per cognitive domain (Memory, Attention, Daily Routine Recall, Pattern/Object Recognition) with fixed difficulty for now. All four must go through one shared Game Session API that logs response time, correct/incorrect, hints used, and retries per item, per Section 5's game engine requirements. Match the design system defined from the UI screenshots in the setup step. When done, tell me how to run and test each game.

**Stage 2 — Adaptive Difficulty Engine:**
> Implement the rules-based safety layer from Section 6.4: per-domain difficulty tiers, promote after N consecutive successes above the accuracy/time thresholds, demote after failures, as specified in Section 6. Wire it into all 4 games from Stage 1 via the Game Session API so each game's difficulty parameters (Section 6.3: item count, time limit, distractor similarity, sequence length, hint frequency, stimulus complexity) respond to it. Add the explainability log described in Section 6.5 (plain-language reason for each difficulty change). Do not build the ML personalization layer yet — rules-based only for now.

**Stage 3 — Reminders module:**
> Implement the reminders system from Section 5(e): categories (Medicine, Hydration, Daily Activities, Medical Appointments), recurrence scheduling, local notifications that work fully offline, acknowledgment tracking, and the escalation path (repeat notification → caregiver alert when online). Skip the custom voice-note recording for now — placeholder text-only reminders are fine at this stage.

**Stage 4 — Caregiver dashboard:**
> Build the Caregiver Mode dashboard from Section 5(f): PIN/biometric gate to enter it, trend charts for accuracy/response time/engagement per domain, reminder adherence view, and the alert types listed in Section 5(f). Use local/mock data sourced from what Stages 1–3 already log — no backend yet. Follow the elderly-friendly and caregiver-mode UI notes in Sections 4.2 and 5(h) for layout, but this screen can use denser information layout than Elder Mode since it's for caregivers.

**Stage 5 — Voice + multilingual layer:**
> Add the multilingual/voice layer from Section 5(c) and 8.5: externalize all UI strings into locale files (English, Hindi, Bengali for this stage per the Phase 1 language priority in Section 8.5), integrate Sarvam AI (Bulbul for TTS, Saarika/Saaras for STT) as the speech provider using the provided `SARVAM_API_KEY`. Build the offline audio-caching pipeline: pre-generate TTS audio for every fixed instruction/reminder/encouragement string in each Phase 1 language, upload it to Cloudflare R2 using the provided R2 credentials, and cache it to the device for offline playback — the app must never make a live Sarvam call during gameplay or reminder delivery. Add basic voice command navigation ("start game", "repeat", "done") via Sarvam STT, with a graceful fallback to on-screen buttons when offline. Note in your summary how the offline caching pipeline works and confirm no runtime path depends on a live network call to Sarvam.

**Stage 6 — Offline sync + backend:**
> Implement the offline-first local storage and sync engine from Section 7.3 and the data model in Section 9: local-first reads/writes for all entities, a sync queue, and a lightweight backend (per Section 8.3) for cross-device caregiver access. Prove it works by describing how to test with the device in airplane mode, per the offline-robustness requirement in Section 11.

**Stage 7 — Polish + accessibility + theming:**
> Do an accessibility pass against Section 7.4 and Section 5(h) (font scaling, contrast, tap target sizes, screen-reader support), then add the cultural theme packs from Section 5(d) as a config-driven content pack (not hardcoded) so themes/languages can be added later without code changes.

## 13. Open Questions for the Team to Decide Before Build

1. Confirm the mobile framework choice (Antigravity to propose based on the UI screenshots and report back before Stage 1 begins, per Section 8.1).
2. Confirm target OS: Android-only for MVP (recommended, given device cost realities in rural NER) or cross-platform from day one?
3. Which regional languages are must-have for the hackathon demo vs. roadmap, given STT/TTS availability constraints (Section 8.5)?
4. Who hosts the backend for the hackathon demo (cloud provider/free tier) — needed only for the sync + caregiver dashboard demo, not for core offline gameplay?
