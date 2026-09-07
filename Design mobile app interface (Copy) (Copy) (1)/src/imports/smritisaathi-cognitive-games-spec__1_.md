# SmritiSaathi — Cognitive Game Suite Specification v1.1

**Companion document to Architecture v4.3, §7 (Cognitive Game and Session Architecture) and §14 (Adaptive ML Difficulty Engine)**

> **Scope of this document:** four games, one per required game family from Architecture §7, each specified as (a) a versioned measurement contract, (b) full rules/mechanics, (c) elder-facing UI flow, (d) event payloads that slot directly into the existing `event_ledger`, and (e) the schema and pipeline that lets `game.task.completed` events become `MLDifficultyEngine` training data. Everything here is additive to v4.3 — no existing table, event type, or invariant is changed.
>
> **What this document does not do:** it does not claim clinical validation for SmritiSaathi itself. Every mechanic below is traceable to a specific claim in the supplied research report (CST, errorless learning, spaced retrieval, the ACTIVE trial). The architecture's own boundary still applies: this is a measurement and engagement system, not a diagnostic one. No game below produces a score, risk estimate, or diagnostic label visible to the elder, per §6.2A/§6.2C Safety UX.

---

## 0. Game selection and why these four

Architecture §7 requires at least four families: `MEMORY`, `ATTENTION`, `PATTERN_RECOGNITION`, `ORIENTATION_DAILY_FUNCTION`. Rather than build several shallow games per family, this spec proposes **one deep, well-evidenced game per family**, matched to the strongest claim in the research report for that domain:

| # | Game | Family (§7) | Primary evidence basis in the research report |
|---|---|---|---|
| 1 | **Yaad Rakho** ("Remember This") | `MEMORY` | Errorless learning (Clare & Jones) + spaced retrieval, under "Memory Recall Games" |
| 2 | **Nazar Tez** ("Sharp Eyes") | `ATTENTION` | ACTIVE trial adaptive speed-of-processing training — the single strongest citation in the report (~25% lower dementia incidence at 20 years) |
| 3 | **Milan** ("Match") | `PATTERN_RECOGNITION` | "Visuospatial Puzzles" section — pattern-matching/categorization for visuospatial and executive skills |
| 4 | **Mera Din** ("My Day") | `ORIENTATION_DAILY_FUNCTION` | CST's orientation-reinforcement and routine-based activities |

Each game is deliberately narrow (one consistent mechanic per game) rather than a bundle of mini-mechanics at different difficulty steps, because Architecture §13/§14 require that a **difficulty ladder stay inside one measurement contract** — changing the mechanic itself (not just its parameters) is a content-version change, not a difficulty step. This is called out per-game below wherever it matters.

Per Architecture §6.2A, the elder-facing `Play` menu already reserves exactly these four slots (`Memory`, `Attention`, `Patterns & Objects`, `Daily Recall`) — these four games are designed to drop into that existing navigation with no menu changes.

---

## 1. Yaad Rakho — Memory (Picture/Object Recall)

### 1.1 Clinical rationale (from the research report only)
- **Errorless learning:** the report specifies scaffolding via recognition-before-recall, fading cues, and never marking an answer as wrong — "present the answer immediately after an attempt... rather than marking it wrong."
- **Spaced retrieval:** the report calls this "an evidence-based strategy" — re-probing the same item after a delay, interleaved with other items.
- **Neuroplasticity:** the report recommends "repeated recall" under increasing challenge as difficulty is raised.

### 1.2 Rules and mechanics
One consistent mechanic across all difficulty steps: **recognition-to-recall memory probing** on familiar objects/pictures drawn from the active `ContentPack.familiar_objects`.

**Round structure (session contract, §7, mapped):**
1. Presentation phase — `item_count` pictures shown one at a time, full-screen, each named aloud by TTS, fixed dwell time per item (`presentation_dwell_ms`, part of `timing_profile`).
2. Brief filler task (a single unrelated tap, e.g. "tap the sun to continue") — this is the retention-interval filler, not a scored trial.
3. Probe phase — one probe per presented item, each governed by the round's `cue_level`:
   - `RECOGNITION_WITH_CUE` — grid of 3 pictures, target's name is spoken aloud, elder taps the matching picture.
   - `RECOGNITION_NO_CUE` — same grid, no name spoken; elder must recall visually.
   - `CUED_RECALL` — no grid; a partial visual/audio hint is given (e.g. first syllable of the name, or a blurred silhouette), elder must name/select unaided.
   - `FREE_RECALL` — no grid, no hint; elder is asked to recall/select from a larger unordered set.
4. Spaced re-probe — at least one item from the round is re-probed after the *other* items have been probed (a longer, filled retention interval), never immediately after its first probe.
5. Errorless feedback (every trial, correct or not): the correct picture is always shown and named again immediately after the elder's response. A miss never produces negative language or a red mark — only "Let's look at it again" plus a repeat of the presentation for that one item.

**Difficulty ladder** (each step is a `game_difficulty_levels` row, §3):

| Step | item_count | cue_level | retention_interval_ms | measurement_mode |
|---|---|---|---|---|
| 1 | 3 | RECOGNITION_WITH_CUE | 10,000 | ENGAGEMENT_MODE |
| 2 | 4 | RECOGNITION_WITH_CUE | 20,000 | ENGAGEMENT_MODE |
| 3 | 4 | RECOGNITION_NO_CUE | 30,000 | ENGAGEMENT_MODE |
| 4 | 5 | RECOGNITION_NO_CUE | 45,000 | ENGAGEMENT_MODE |
| 5 | 5 | CUED_RECALL | 60,000 | ASSESSMENT_MODE |
| 6 | 6 | CUED_RECALL | 90,000 | ASSESSMENT_MODE |
| 7 | 7 | FREE_RECALL | 120,000 | ASSESSMENT_MODE |

Steps 5–7 are flagged `ASSESSMENT_MODE` because at that point `cue_level` becomes the dominant clinically meaningful variable; per §14 "Engagement mode vs assessment mode," the ML Difficulty Engine may still select *among* these steps, but candidate generation in `ASSESSMENT_MODE` must not silently swap `cue_level` mid-regime for a given patient without an explicit context-boundary event — a patient does not get "promoted" to `FREE_RECALL` without that transition being recorded as a regime change (§13 "Context capture").

### 1.3 UI flow (elder-facing, per §6.2B interaction pattern: *Hear → See → Perform → Feedback → Continue*)
1. **Entry:** `Home → Play → Memory → Yaad Rakho` tile (icon + spoken label on focus).
2. **Instruction screen:** single sentence, spoken and shown: "I will show you some pictures. Try to remember them." One large "Start" button. Non-scored one-item practice example precedes the first real round (per §7 "practice/example where applicable").
3. **Presentation screen:** one picture fills most of the screen, name spoken once, auto-advances after `presentation_dwell_ms` (adjustable via the patient's `timing_profile`). No buttons during presentation — nothing for the elder to tap incorrectly.
4. **Filler screen:** one large unrelated icon ("tap the sun"), immediately advances on tap.
5. **Probe screen:**
   - `RECOGNITION_*`: 3 large picture cards in a single row, equally sized, high contrast; a persistent "🔊 Hear again" button (audio replay, per UI guideline "include a replay button for any spoken instruction").
   - `CUED_RECALL`/`FREE_RECALL`: a single central card slot the elder taps to reveal a larger picture grid, or a microphone button for a spoken answer (voice input path reuses `VoiceInteractionManager`, §6).
6. **Feedback (every trial):** correct → soft chime + brief highlight glow, no numeric score shown. Incorrect/timeout → no negative sound; the correct picture reappears with its name spoken again, framed as "Here it is — {name}."
7. **Progress indicator:** "Picture 3 of 5" style counter — never a percentage or score (§6.2A: scores are absent from `ELDER_MODE`).
8. **Session end screen:** one warm, qualitative closing line ("You did wonderfully today!") — never a number. `Home` and `Back` are present on every screen per accessibility requirements.

### 1.4 Data captured → events → measurement contract
Two measurement definitions (added to `measurement_definitions`, §3):

| name | unit | better_direction | extraction_version |
|---|---|---|---|
| `picture_recall_accuracy` | ratio (0–1) | higher | `pr-extract-v1` |
| `picture_recall_latency_ms` | ms | lower | `pr-extract-v1` |

Event payloads (all nest inside the existing `event_ledger.payload` JSONB; the envelope columns — `event_id`, `device_id`, `signature`, etc. — are unchanged from §12):

```json
// event_type: game.session.started
{
  "game_id": "<uuid, game_definitions.game_id>",
  "game_key": "picture_recall",
  "task_family": "MEMORY",
  "difficulty_id": "<uuid, game_difficulty_levels.difficulty_id>",
  "measurement_mode": "ENGAGEMENT_MODE",
  "selection_source": "ml_difficulty_engine",
  "content_pack_id": "<uuid>",
  "locale": "as-IN"
}
```

```json
// event_type: game.task.completed  (one per probe trial)
{
  "game_id": "<uuid>",
  "session_event_id": "<uuid, the game.session.started event_id>",
  "trial_index": 3,
  "item_id": "<uuid, content-pack item>",
  "cue_level": "RECOGNITION_NO_CUE",
  "is_spaced_reprobe": false,
  "retention_interval_ms": 30000,
  "response_latency_ms": 4210,
  "correct": true,
  "assistance_used": false,
  "input_mode": "touch"
}
```

```json
// event_type: game.session.completed
{
  "game_id": "<uuid>",
  "trials_total": 5,
  "trials_correct": 4,
  "mean_response_latency_ms": 4890,
  "difficulty_id": "<uuid>",
  "fatigue_flag": false
}
```

`game.session.abandoned` reuses the same shape as `game.session.completed` with whatever trial count had been reached at the point of abandonment, per the existing event type list in §12 (no new event type is introduced).

`measurement_observations` rows are derived deterministically from `game.task.completed` (per-item accuracy/latency, `eligibility` computed per the existing §13 rules — e.g. a trial following an app backgrounding event is `INELIGIBLE_INCOMPLETE`) and from `game.session.completed` (session-level aggregate accuracy/latency). `context` (JSONB) for each observation records: `difficulty_id`, `cue_level`, `device_id`'s input-latency class (from `device calibration`, §13), `time_of_day_bucket`, and `session_gap` — exactly the context fields §13 already names, with the game-specific values filled in.

---

## 2. Nazar Tez — Attention (Selective Visual Search)

### 2.1 Clinical rationale
This is the report's single best-evidenced mechanic: the ACTIVE trial's adaptive speed-of-processing/visual-search training, described as producing "~25% lower dementia incidence 20 years later," with the *adaptive* difficulty scaling explicitly credited for the long-term effect. The report's "Attention & Executive Tasks" section also names divided-attention ("spot the difference," multi-step tapping) as a secondary evidence-based variant.

### 2.2 Rules and mechanics
One consistent mechanic: **timed visual search** — a target object is named/shown, then a grid of objects (target + distractors) appears; the elder taps the target before a response window elapses.

**Trial structure:**
1. Target cue: target object shown large + named aloud ("Find the: mango").
2. Fixation pause (brief, calm — not a stressful countdown at low difficulty).
3. Array appears: `set_size` objects arranged in a grid, exactly one matching the target.
4. Elder taps; the trial ends on tap or when `response_window_ms` elapses.
5. Feedback: correct → chime + glow on the tapped item. Timeout/incorrect → no negative sound; the true target is gently highlighted, then the trial ends. Per the report's "no punitive marks" rule.
6. A session is `trials_per_round` (8–12) trials with a short calm pause between each.

**Divided-attention variant (same task_family, distinct measurement contract, per the report's "complex/divided attention" note):** an optional secondary peripheral icon flashes briefly during the array phase; the elder is asked to remember, at end of round, whether it appeared. This is content-versioned separately (`selective_visual_search` vs `divided_visual_search`) — it is **not** a difficulty step of the selective-only game, because it changes what is being measured (single vs. divided attention are different cognitive constructs per DSM-5, and the report treats them as distinct). This spec ships `selective_visual_search` for MVP; `divided_visual_search` is listed as a follow-on content-pack addition using the identical event/schema shape with `attention_mode: "divided"`.

**Difficulty ladder:**

| Step | set_size | target_distractor_similarity | response_window_ms | measurement_mode |
|---|---|---|---|---|
| 1 | 4 | low | 6000 | ENGAGEMENT_MODE |
| 2 | 6 | low | 5000 | ENGAGEMENT_MODE |
| 3 | 8 | medium | 4000 | ENGAGEMENT_MODE |
| 4 | 10 | medium | 3200 | ENGAGEMENT_MODE |
| 5 | 12 | high | 2600 | ENGAGEMENT_MODE |
| 6 | 16 | high | 1800 | ASSESSMENT_MODE |

Step 6 is flagged `ASSESSMENT_MODE` because at that response window the task starts to probe raw processing speed rather than engagement-level attention, and per Architecture §14 "measurement protection," this is where a device's own input-latency contamination becomes a real risk — device calibration context (§13) is mandatory at this step, and the ML Difficulty Engine's device-compatibility gate (§14 "Device compatibility gate") applies with extra weight here, since a slow touchscreen can masquerade as slow attention.

### 2.3 UI flow
1. **Entry:** `Home → Play → Attention → Nazar Tez`.
2. **Instruction + one non-scored practice trial** (per §7 session contract).
3. **Cue screen:** target object large, named aloud, persistent small icon of it stays visible in a corner during the array phase so the elder never has to rely purely on memory of the cue (this keeps the task about *visual search*, not incidentally about *memory*, preserving construct validity).
4. **Array screen:** grid of large, evenly spaced icons (touch targets sized per the accessibility profile, never shrunk to fit more items — if `set_size` grows, the grid scrolls or paginates rather than shrinking targets). Response window shown as a **calm radial fill**, not a ticking numeric clock, per the report's "avoid frightening alert language."
5. **Feedback:** as above — glow/chime or gentle reveal, never a red mark or buzzer.
6. **Progress indicator:** "Round 4 of 10" — no running score shown.
7. **Session end:** qualitative encouragement only.

### 2.4 Data captured → events → measurement contract

| name | unit | better_direction | extraction_version |
|---|---|---|---|
| `visual_search_accuracy` | ratio (0–1) | higher | `vs-extract-v1` |
| `visual_search_reaction_time_ms` | ms | lower | `vs-extract-v1` |

```json
// event_type: game.session.started
{
  "game_id": "<uuid>",
  "game_key": "selective_visual_search",
  "task_family": "ATTENTION",
  "difficulty_id": "<uuid>",
  "measurement_mode": "ENGAGEMENT_MODE",
  "attention_mode": "selective",
  "selection_source": "ml_difficulty_engine"
}
```

```json
// event_type: game.task.completed (one per trial)
{
  "game_id": "<uuid>",
  "session_event_id": "<uuid>",
  "trial_index": 4,
  "set_size": 8,
  "target_distractor_similarity": "medium",
  "response_window_ms": 4000,
  "response_latency_ms": 1870,
  "correct": true,
  "timed_out": false
}
```

```json
// event_type: game.session.completed
{
  "game_id": "<uuid>",
  "trials_total": 10,
  "trials_correct": 8,
  "timeouts": 1,
  "mean_response_latency_ms": 2340,
  "difficulty_id": "<uuid>"
}
```

Because this game is the most reaction-time-sensitive of the four, its `measurement_observations.context` **must** include the device's `input latency class` from the §13 device-calibration profile on every observation — this is the game where an uncalibrated device most directly corrupts the metric.

---

## 3. Milan — Pattern Recognition (Familiar-Object Categorization)

### 3.1 Clinical rationale
The report's "Visuospatial Puzzles" section recommends pattern-matching and categorization tasks, and separately calls out "familiar-object identification" and "sorting/categorization" (both explicitly listed under `PATTERN_RECOGNITION` in Architecture §7). The report also stresses cultural familiarity ("local images... to create comfort") — this game is built entirely on the `ContentPack.familiar_objects` asset group so its content is locale-specific by construction.

### 3.2 Rules and mechanics
One consistent mechanic: **odd-one-out categorization** — the elder is shown a small set of familiar objects and taps the one that does not belong with the others.

A design note worth stating explicitly (this matters for measurement validity, per §13): an earlier draft considered folding identical-pairs matching and odd-one-out categorization into one game as "easy" and "hard" difficulty steps. That would violate the same-contract rule — pairs-matching and categorization are different cognitive operations (perceptual matching vs. semantic categorization), not two difficulty levels of the same operation. This spec therefore keeps **one mechanic** (odd-one-out) across the whole ladder, and only varies *how far apart* the categories are.

**Trial structure:**
1. `set_size` (3–5) object cards shown together; audio: "Tap the one that is different."
2. Elder taps one card.
3. Errorless feedback: correct → the outlier animates away with a chime. Incorrect → the correct outlier is gently highlighted and named, with a one-line reason spoken ("This one is different — it is not a fruit"), then the trial ends; no red marks.
4. A round is `trials_per_round` (6) trials.

**Difficulty ladder** — varies `set_size` and `category_abstractness_level` (how visually/semantically close the odd item is to the others):

| Step | set_size | category_abstractness_level | hint_available | measurement_mode |
|---|---|---|---|---|
| 1 | 3 | concrete (color/shape obviously different) | yes | ENGAGEMENT_MODE |
| 2 | 3 | concrete | no | ENGAGEMENT_MODE |
| 3 | 4 | moderate (same broad category, different sub-type) | no | ENGAGEMENT_MODE |
| 4 | 4 | semantic (all same visual style, one wrong category) | no | ENGAGEMENT_MODE |
| 5 | 5 | semantic | no | ASSESSMENT_MODE |

`hint_available` at step 1 means a soft outline pulses around the general area of the correct answer if the elder hesitates past a generous threshold — an errorless-learning scaffold, not a penalty-avoidance mechanic; its use is logged (`hint_used`) but never held against the elder in feedback.

### 3.2A Within-step hint intensity fade

The static `hint_available` boolean above (steps 1–2 only) is refined into a session-local `hint_intensity_level` (0–3) that fades and reappears within a single difficulty step, without ever becoming a new `difficulty_id` or a measurement-contract change:

- Enters a difficulty step at `intensity = 3` (visible pulse, generous hesitation threshold) only the *first time* the patient plays that step.
- After each **correct, unhinted** trial, intensity steps down by 1 (floor 0) for the next trial.
- After any **incorrect** trial or any hinted trial, intensity resets up by 1 (cap 3) for the next trial — the "reappears if struggling" half of errorless fading.
- At `intensity = 0`, no pulse is available at all (matches current step-2+ behavior).
- Resets to `intensity = 3` only after a patient absence from that step (default 7 days, unvalidated — see §9), not every session.

Event payload addition (`game.task.completed`, Milan):
```json
{
  "hint_intensity_level": 2,
  "hint_used": false,
  "hint_reason": "scheduled_fade"   // or "reintroduced_after_miss" | "reset_after_absence"
}
```

`hint_intensity_level`/`hint_reason` are logged for the caregiver dashboard's scaffolding view but are **not** a new ML feature — `assistance_level` (existing §14 generic feature) remains the single rollup the difficulty engine consumes.

### 3.3 UI flow
1. **Entry:** `Home → Play → Patterns & Objects → Milan`.
2. **Instruction + practice trial**, consistent phrasing kept identical across all difficulty steps ("Tap the one that is different") so the elder never has to relearn what the game is asking.
3. **Trial screen:** 3–5 large object cards in a single row (wraps to two rows only if `set_size` exceeds row capacity at the current font/touch-target scale); no drag-and-drop anywhere in this game (tap-only, per the report's motor-tremor guidance).
4. **Feedback:** as above.
5. **Progress indicator:** "Round 2 of 6."
6. **Session end:** qualitative encouragement.

### 3.4 Data captured → events → measurement contract

| name | unit | better_direction | extraction_version |
|---|---|---|---|
| `object_categorization_accuracy` | ratio (0–1) | higher | `oc-extract-v1` |
| `object_categorization_latency_ms` | ms | lower | `oc-extract-v1` |

```json
// event_type: game.session.started
{
  "game_id": "<uuid>",
  "game_key": "object_categorization",
  "task_family": "PATTERN_RECOGNITION",
  "difficulty_id": "<uuid>",
  "measurement_mode": "ENGAGEMENT_MODE",
  "content_category_set_id": "<uuid, content-pack category grouping>"
}
```

```json
// event_type: game.task.completed
{
  "game_id": "<uuid>",
  "session_event_id": "<uuid>",
  "trial_index": 2,
  "set_size": 4,
  "category_abstractness_level": "moderate",
  "hint_used": false,
  "response_latency_ms": 3120,
  "correct": true
}
```

```json
// event_type: game.session.completed
{
  "game_id": "<uuid>",
  "trials_total": 6,
  "trials_correct": 5,
  "hints_used_total": 1,
  "mean_response_latency_ms": 3450,
  "difficulty_id": "<uuid>"
}
```

`content_preference` (an existing feature in the §14 feature contract) is populated for this game from which `content_category_set_id` values the patient completes fastest/most accurately — this is the game where that feature is most directly observable.

---

## 4. Mera Din — Orientation / Daily Function (Routine Sequencing + Time-of-Day Check)

### 4.1 Clinical rationale
The report's CST section names "orientation (e.g. date, weather)" and "practical tasks" as core CST activities with demonstrated cognitive benefit; Architecture §7 lists `time-of-day orientation`, `day/date recall`, `familiar-place recognition`, and `simple routine sequencing` together under one family. This game covers two of those explicitly (routine sequencing as the main game, a short time-of-day check as a lightweight companion probe) while keeping them as **separate measurement contracts** — they are different tasks, not difficulty steps of one task.

### 4.2 Rules and mechanics — Part A: Routine Sequencing (the main game)
One consistent mechanic: **tap-to-order** a shuffled set of picture cards representing steps of a familiar daily routine (e.g., wake up → wash → eat → get dressed). Tap-to-order (not drag-and-drop) per the report's tremor guidance.

**Trial structure:**
1. `step_count` cards shown shuffled below an empty ordered strip.
2. Elder taps cards one at a time in the order they belong; each correct tap slides the card into the next open slot with a soft click.
3. Errorless scaffolding: an incorrect tap does not "fail" — the tapped card gently returns to the shuffle area, and after two consecutive incorrect taps the correct next card is highlighted (assistance escalates, never punishes).
4. Round ends when the strip is filled; the completed routine briefly animates as a whole (e.g., a small sun-rise motif) with warm praise audio.

**Difficulty ladder:**

| Step | step_count | routine_familiarity | hint_escalation_threshold | measurement_mode |
|---|---|---|---|---|
| 1 | 3 | generic | 1 wrong tap | ENGAGEMENT_MODE |
| 2 | 4 | generic | 2 wrong taps | ENGAGEMENT_MODE |
| 3 | 4 | personalized* | 2 wrong taps | ENGAGEMENT_MODE |
| 4 | 5 | personalized* | 2 wrong taps | ENGAGEMENT_MODE |
| 5 | 6 | personalized* | 3 wrong taps | ASSESSMENT_MODE |

\* "Personalized" routines use photos supplied via the caregiver dashboard's existing Memory Assistance module (§9) rather than generic content-pack art. Personalization is recorded as `routine_set_id` + `personalized: true` in the event payload; a switch between a generic and a personalized routine set is a content-version change, logged and treated as a context boundary per §13, not a silent difficulty change.

### 4.2A Within-step scaffold-intensity fade

`hint_escalation_threshold` (the step's fixed "wrong taps before highlight" value) becomes a session-local floor/ceiling pair rather than one fixed value, so the scaffold can ease across sessions at the same step, not just escalate within one:

- `threshold_ceiling` = the step's existing ladder value (e.g. 2 wrong taps at step 2) — the lenient starting point, unchanged from the base spec.
- `threshold_floor` = `threshold_ceiling − 1`, never below 1.
- Starts at `threshold_ceiling` the first time the patient plays that step (or after the same 7-day absence-reset window as Milan).
- After a **fully correct routine with zero wrong taps**, the threshold steps down by 1 toward `threshold_floor` for the *next session* at that step.
- After any session where the highlight was triggered, the threshold resets up to `threshold_ceiling` for the next session.

Within-session behavior is unchanged — a wrong tap still just returns the card, and past threshold the correct next card is still highlighted, never punished (§4.2). Only the generosity of the threshold across sessions fades.

Event payload addition (`game.session.completed`, routine sequencing):
```json
{
  "hint_escalation_threshold_used": 1,
  "threshold_ceiling": 2,
  "threshold_floor": 1
}
```

Same treatment as Milan: this is scaffold telemetry for the caregiver view, not a new ML feature — `wrong_taps`/`hint_triggered` (already in `game.task.completed`) remain what `assistance_level` is computed from.

### 4.3 Rules and mechanics — Part B: Time-of-Day Orientation Check (companion probe)
A short, separate, lower-frequency check (default: once per day, not every session, to avoid repetitiveness) drawing on CST's orientation-reinforcement principle:
1. Screen shows four large icons: morning sun / midday sun / evening sky / night moon.
2. Audio: "What time is it now?"
3. Elder taps one; feedback is always warm regardless of answer — this is explicitly **not** meant to be adversarial, and its content is compared against the device's actual local-time bucket only for the measurement pipeline, never surfaced to the elder as "correct/incorrect" in punitive language.

This probe has essentially one meaningful difficulty (four options, no ladder) — Architecture §14's difficulty policy has almost nothing to adapt here, so it is explicitly **excluded from ML Difficulty Engine candidate generation** and instead runs on a simple deterministic daily cadence controlled by `LocalPolicyEngine`. This is a direct application of §14's "Engagement mode vs assessment mode" boundary: not every measured task needs to be inside the adaptive loop.

### 4.4 UI flow
1. **Entry:** `Home → Play → Daily Recall → Mera Din` (the `Play` menu already reserves a `Daily Recall` slot per §6.2A — no navigation change needed).
2. **Instruction + practice round.**
3. **Sequencing screen:** empty ordered strip at top, shuffled large cards below; tap-only; no timer pressure (this task is about correctness of order, not speed).
4. **Completion animation + warm audio.**
5. **Orientation check** (only on days it's scheduled): a single simple icon-choice screen, shown either right before or after the sequencing game, framed as part of "starting your day" rather than as a test.
6. **Progress indicator and session end:** as with the other three games — qualitative only.

### 4.5 Data captured → events → measurement contract

| name | unit | better_direction | extraction_version |
|---|---|---|---|
| `routine_sequencing_accuracy` | ratio (0–1) | higher | `rs-extract-v1` |
| `routine_sequencing_completion_time_ms` | ms | lower | `rs-extract-v1` |
| `orientation_time_of_day_accuracy` | ratio (0–1) | higher | `tod-extract-v1` |

```json
// event_type: game.session.started (routine sequencing)
{
  "game_id": "<uuid>",
  "game_key": "routine_sequencing",
  "task_family": "ORIENTATION_DAILY_FUNCTION",
  "difficulty_id": "<uuid>",
  "measurement_mode": "ENGAGEMENT_MODE",
  "routine_set_id": "<uuid>",
  "personalized": true
}
```

```json
// event_type: game.task.completed (per completed sequencing attempt)
{
  "game_id": "<uuid>",
  "session_event_id": "<uuid>",
  "step_count": 4,
  "correct_final_sequence": true,
  "wrong_taps": 1,
  "hint_triggered": false,
  "completion_time_ms": 18400
}
```

```json
// event_type: game.task.completed (time-of-day check; separate game_key, same event_type)
{
  "game_id": "<uuid, distinct game_definitions row: game_key='time_of_day_orientation'>",
  "session_event_id": "<uuid>",
  "correct": true,
  "response_latency_ms": 2600,
  "device_time_bucket": "morning"
}
```

```json
// event_type: game.session.completed
{
  "game_id": "<uuid>",
  "sequencing_attempts": 1,
  "sequencing_correct": 1,
  "orientation_check_included": true,
  "difficulty_id": "<uuid>"
}
```

---

## 5. Consolidated schema additions

All tables below are additive to Architecture §13/§14/§17 and use the same conventions (UUID PKs, explicit `_version` columns, immutable history rows). None of these replace or alter `measurement_observations`, `event_ledger`, `model_versions`, `model_input_snapshots`, `device_model_assignments`, or `model_runs` as already defined in v4.3 — they feed them.

### 5.1 Game catalog (the "content contract" §7 requires)

```sql
CREATE TABLE game_definitions (
    game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_key VARCHAR(60) NOT NULL,
    task_family VARCHAR(40) NOT NULL,          -- MEMORY | ATTENTION | PATTERN_RECOGNITION | ORIENTATION_DAILY_FUNCTION
    subtype VARCHAR(60) NOT NULL,
    display_name_key VARCHAR(100) NOT NULL,    -- localization key, never raw text
    content_pack_dependency VARCHAR(60) NOT NULL,
    game_version VARCHAR(30) NOT NULL,
    min_app_version VARCHAR(30) NOT NULL,
    ml_eligible BOOLEAN NOT NULL DEFAULT true, -- false for e.g. time_of_day_orientation
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (game_key, game_version)
);
```

### 5.2 Difficulty ladder (the approved candidate set §14 "Candidate generation" requires)

```sql
CREATE TABLE game_difficulty_levels (
    difficulty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES game_definitions(game_id),
    difficulty_step SMALLINT NOT NULL,
    parameters JSONB NOT NULL,           -- e.g. {"item_count":5,"cue_level":"RECOGNITION_NO_CUE","retention_interval_ms":45000}
    measurement_mode VARCHAR(20) NOT NULL CHECK (measurement_mode IN ('ENGAGEMENT_MODE','ASSESSMENT_MODE')),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    UNIQUE (game_id, difficulty_step)
);
```

### 5.3 Measurement definitions (formalizes the §13 "Task contract" text block into real DDL)

```sql
CREATE TABLE measurement_definitions (
    measurement_definition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    task_family VARCHAR(40) NOT NULL,
    game_id UUID NOT NULL REFERENCES game_definitions(game_id),
    unit VARCHAR(20) NOT NULL,
    expected_range_low DOUBLE PRECISION,
    expected_range_high DOUBLE PRECISION,
    better_direction VARCHAR(10) NOT NULL CHECK (better_direction IN ('higher','lower')),
    required_task_version_range VARCHAR(60) NOT NULL,
    required_difficulty_range VARCHAR(60),
    extraction_version VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    UNIQUE (name, extraction_version)
);
```

Seed rows for the eight metrics introduced by these four games (all `expected_range_low/high` set to `0/1` for ratios and left product-configurable for latency until field data exists — per §13, "do not imply unobserved context was normal," this spec deliberately does not invent latency norms it has no data for):

| name | task_family | unit | better_direction | extraction_version |
|---|---|---|---|---|
| `picture_recall_accuracy` | MEMORY | ratio | higher | `pr-extract-v1` |
| `picture_recall_latency_ms` | MEMORY | ms | lower | `pr-extract-v1` |
| `visual_search_accuracy` | ATTENTION | ratio | higher | `vs-extract-v1` |
| `visual_search_reaction_time_ms` | ATTENTION | ms | lower | `vs-extract-v1` |
| `object_categorization_accuracy` | PATTERN_RECOGNITION | ratio | higher | `oc-extract-v1` |
| `object_categorization_latency_ms` | PATTERN_RECOGNITION | ms | lower | `oc-extract-v1` |
| `routine_sequencing_accuracy` | ORIENTATION_DAILY_FUNCTION | ratio | higher | `rs-extract-v1` |
| `orientation_time_of_day_accuracy` | ORIENTATION_DAILY_FUNCTION | ratio | higher | `tod-extract-v1` |

`measurement_observations.measurement_definition_id` (already defined in §13 of the architecture) now has a real table to reference; this spec recommends adding the FK constraint `REFERENCES measurement_definitions(measurement_definition_id)` at the same time these rows are seeded.

---

## 6. How this feeds the ML Difficulty Engine (§14)

### 6.1 Candidate generation, concretely
For each of the three ML-eligible games (`ml_eligible = true`; `time_of_day_orientation` is excluded per §4.3), at the `task selection` step of the Session contract (§7) the app queries `game_difficulty_levels` for the patient's current `game_id`, filtered by:
- `measurement_mode` compatible with the patient's current session mode (an `ASSESSMENT_MODE` step is only offered if the patient is already in an active assessment regime for that task, per §14),
- device/locale/accessibility/consent constraints (unchanged from §14),

producing a small candidate set (typically 2–3 adjacent difficulty steps around the patient's current step — e.g. for Yaad Rakho at step 3: candidates = steps 2, 3, 4). This is the same shape as the architecture's own worked example (`Candidate A = MEMORY / difficulty 1 … Candidate D = ATTENTION / difficulty 2`), just populated from real rows instead of illustrative ones.

### 6.2 Feature computation from this data
The §14 feature contract's generic fields are computed per-game as follows (no new features are invented; this just shows the mapping):

- `recent_accuracy` → rolling mean of the game's accuracy `measurement_observations` (e.g. `picture_recall_accuracy`) over the last *N* eligible observations for that patient + `game_id`.
- `recent_reaction_time` → rolling mean of the game's latency metric, filtered to eligible observations from a calibrated device (§13 device calibration).
- `recent_completion_rate` / `recent_abandonment_rate` → derived from `game.session.completed` vs `game.session.abandoned` counts for that `game_id` over the recent window.
- `failure_streak` → consecutive ineligible-for-success or below-baseline `game.task.completed` trials for that game.
- `task_exposure_count` → count of prior sessions for that `game_id`.
- `content_preference` (Milan only, concretely observable) → which `content_category_set_id` yields the best recent accuracy/latency.
- `assistance_level`, `input_mode`, `device_class`, `fatigue_signal`, `time_of_day_bucket` → taken directly from the session/device/accessibility context already captured per §6/§13, unchanged.

### 6.3 Decision points and training-example construction
Per §7's Session contract, there are exactly two points where the ML Difficulty Engine's action space (§14 Outputs: keep/increase/decrease/switch/etc.) is exercised for a given game:

1. **Task selection** (pre-session) — the primary decision point. Training example: `{feature_vector at session start, candidate difficulty selected, observed session-level outcome (game.session.completed vs .abandoned, and session accuracy)}`.
2. **Fatigue/frustration check** (mid-session, per §7) — a secondary, smaller decision point where the engine may choose to shorten/switch/end. Training example: `{feature_vector at checkpoint, action taken, whether the session subsequently completed vs. was abandoned}`.

Both follow the architecture's existing rule verbatim: *"patient/session state + candidate task/difficulty → observed completion outcome."* Patient-level train/test splits (already required by §14) apply identically here — no session from a given patient may appear in both the training and evaluation split.

`model_input_snapshots` (already defined in §14) stores the feature vector at each of these two decision points per game session; `model_runs.output` stores the predicted success probability per candidate; `difficulty_decision_records` (already defined in §14) stores which candidate was actually selected and whether the deterministic fallback policy was used instead — this spec introduces no new provenance table, it only populates the existing ones with game-specific feature vectors and candidate sets.

### 6.4 Worked example (Nazar Tez, task-selection decision point)
```text
patient at set_size=8/response_window=4000ms (difficulty step 3)
        +
candidates = {step 2 (set_size 6, 5000ms), step 3 (current), step 4 (set_size 10, 3200ms)}
        ↓
feature vector: recent_accuracy=0.81, recent_reaction_time=2100ms,
                failure_streak=0, fatigue_signal=low, device_class=low_end,
                task_family=ATTENTION, candidate_difficulty=<one row per candidate>
        ↓
ML success predictor → P(success | state, step2)=0.93, P(success | step3)=0.81, P(success | step4)=0.62
        ↓
bounded difficulty policy (safety/accessibility/measurement-mode constraints applied)
        ↓
selected candidate = step 3 (kept) — because a jump to step 4 would push predicted
success below the configured comfort threshold for ENGAGEMENT_MODE, and step 3
is not yet a persistently high performer per §13's persistence-requirement logic
        ↓
outcome logged after session: session completed, 8/10 correct
        ↓
training example: (feature vector, step3, label=completed & accuracy=0.8)
```
This is the same decision/policy/outcome shape as §14's own diagram, populated with one of the four games' actual candidate set instead of an abstract `Candidate A/B/C/D`.

---

## 7. Content pack integration (§8)

Each game's assets slot into the existing `ContentPack` structure without adding new top-level fields:

- `game_instructions` — per-game spoken/visual instruction strings, one localization key per game_key (§5.1's `display_name_key` and instruction keys live here).
- `game_assets` — the picture/object art for Yaad Rakho, Nazar Tez, and Milan.
- `example_names` / `familiar_objects` — the concrete object pool Yaad Rakho and Milan draw from; per the report's cultural-relevance guidance, this pool is expected to differ per `region`/`locale` content pack.
- `family-memory templates` — the personalized-routine photo slots used by Mera Din's "personalized" difficulty steps (steps 3–5), populated via the existing caregiver-side Memory Assistance module (§9).

No new content-pack field is required; the atomic pack installation protocol (§8) and its checksum/signature/versioned-swap rules apply unchanged to these assets.

---

## 8. Compliance check against existing architecture invariants

| Invariant (source) | How these four games satisfy it |
|---|---|
| No score/confidence/trajectory shown in `ELDER_MODE` (§6.2A/§6.2C) | All four games use qualitative feedback only ("Round 3 of 5", warm praise); numeric accuracy/latency exist only in `measurement_observations` and the caregiver dashboard. |
| Errorless, non-punitive feedback (report; §Safety UX "no frightening alert language") | Every game's feedback path always reveals the correct answer/highlight, never a red mark, buzzer, or "wrong" language. |
| One task, one decision, one obvious next action (§6 UX principles) | Every trial screen has exactly one required tap; no simultaneous multi-choice decisions beyond the trial itself. |
| Tap-only, no typing, tremor-tolerant (report UI/UX guidelines) | All four games use single-tap interaction; Mera Din explicitly avoids drag-and-drop. |
| Difficulty ladder must stay inside one measurement contract (§13/§14) | Each game's ladder varies only *parameters* (item count, timing, set size), never the underlying mechanic; where a mechanic genuinely differs (divided- vs. selective-attention; personalized vs. generic routine; pairs-matching vs. categorization) this spec treats it as a separate `game_key`/content-version, not a difficulty step. |
| `ASSESSMENT_MODE` protects contract-defining conditions (§14) | Each game flags its higher/most-diagnostic difficulty steps `ASSESSMENT_MODE`, and the time-of-day check is excluded from adaptive personalization entirely because it has no meaningful ladder. |
| No single-session escalation into a caregiver signal (§13) | Nothing in this spec creates a trajectory/observation signal directly from one session; that logic is unchanged and lives entirely in the existing §13 pipeline, fed only by the new `measurement_observations` rows. |
| Practice effects handled, not ignored (§13) | Each game's session contract includes a non-scored practice trial before the first real trial, and the existing `PRACTICE_WINDOW` marking applies unchanged. |
| Errorless cues fade with demonstrated competence and reappear if the elder struggles (report; Clare & Jones) | Milan's `hint_intensity_level` (§3.2A) and Mera Din's threshold floor/ceiling (§4.2A) fade within a difficulty step and reset on misses or absence; state is session-local, never a `difficulty_id` or a new ML feature. |
| Patient-level train/test splits (§14) | Explicitly restated in §6.3 above for both new decision points. |
| Offline-first, atomic content install (§8/§11) | All game assets ship as content-pack entries using the existing atomic-swap install protocol; no game requires connectivity to play. |

---

## 9. Open items (in the spirit of Architecture Appendix C)

| Area | What must still be explicitly decided before field-final |
|---|---|
| Presentation/response timing defaults | `presentation_dwell_ms`, `response_window_ms` starting values above are illustrative starting points, not validated norms — they need a small pilot with real elders before being treated as defaults. |
| Divided-attention variant | `divided_visual_search` is specified in shape (§2.2) but not scheduled for MVP; needs its own content-pack assets and a decision on whether it ships in v1. |
| Personalized-routine moderation | Family-supplied routine photos for Mera Din (§4.2 step 3+) need the same content-moderation consideration the architecture already flags for family/media features generally (§9 Social interaction) — not solved here. |
| Orientation-check cadence | Once-per-day is proposed in §4.3 as a default; the exact cadence and whether it's caregiver-configurable is a product decision, not an architectural one. |
| `expected_range` values | Left unset in the seed data (§5.3) deliberately — populate only from real field data, per §13's own instruction not to imply unobserved context was normal. |
