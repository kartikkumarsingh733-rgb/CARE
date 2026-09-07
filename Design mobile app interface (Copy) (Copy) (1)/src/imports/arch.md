# SmritiSaathi — Production System Architecture v4.3

**Offline-first cognitive-care platform architecture**  
*Elder experience + Smriti Engine + Care Network*

> **Document purpose:** This document defines the production architecture, domain boundaries, runtime contracts, security model, offline behavior, measurement pipeline, bounded ML Difficulty Engine, care workflows, operations, and implementation path for SmritiSaathi.

**Version:** 4.3  
**Status:** Restructured production architecture, hardened against field-crash review  
**Audience:** Backend, Android, ML, product, security, QA, SRE/DevOps, and technical leadership

> **v4.3 correction pass:** an independent architecture review of v4.2 found that device-runtime, crash-observability, and backend-contention-under-burst sections were materially under-specified relative to the governance/versioning sections, which is backwards for a system whose primary failure mode is an unreliable device in an unreliable field condition. v4.3 closes ten specific gaps (Android runtime budget and lifecycle discipline, Keystore invalidation, offline crash/ANR telemetry, reconnection-storm backpressure, job-queue contention, atomic pack/model installs, ML device-compatibility gating, TTS failure handling, post-acceptance data-quality quarantine, and build-priority ordering). See §3 "Device runtime and resilience", §8, §11, §12, §14, §18, §19, §24, §25, and Appendix A.

## How to read this document

Start with Sections 1–5 for the system mental model. Sections 6–10 describe the user-facing product and care surfaces. Sections 11–18 define the core trust, data, synchronization, ML, privacy, and API architecture. Sections 19–24 cover operations, deployment, engineering standards, testing, and scale. Sections 25–29 describe delivery and acceptance. The appendices contain architectural history, terminology, and deployment-specific decisions.

### Document conventions

- **Normative language:** “must” and “shall” identify required behavior; “should” identifies a strong recommendation; “may” identifies an allowed option.
- **Versioning:** semantic changes to events, measurements, policies, models, and configuration must be versioned rather than silently reinterpreted.
- **Source of truth:** canonical events and explicitly owned domain state are distinguished from rebuildable projections and caches.
- **Scope:** this document describes the first production architecture and its evolution path; deferred technologies are not part of the initial deployment.

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. System Context, Scope, and Boundaries](#2-system-context-scope-and-boundaries)
- [3. Architectural Goals, Constraints, and Invariants](#3-architectural-goals-constraints-and-invariants)
- [4. Architecture Overview](#4-architecture-overview)
- [5. Domain and Module Architecture](#5-domain-and-module-architecture)
- [6. Elder Experience and Accessibility Architecture](#6-elder-experience-and-accessibility-architecture)
- [7. Cognitive Game and Session Architecture](#7-cognitive-game-and-session-architecture)
- [8. Localization, Voice, Cultural Content, and Media](#8-localization-voice-cultural-content-and-media)
- [9. Reminders, Memory, Social Interaction, and Engagement](#9-reminders-memory-social-interaction-and-engagement)
- [10. Caregiver and Health-Worker Experience](#10-caregiver-and-health-worker-experience)
- [11. Offline Edge Architecture and Device Trust](#11-offline-edge-architecture-and-device-trust)
- [12. Event Ledger and Synchronization Architecture](#12-event-ledger-and-synchronization-architecture)
- [13. Measurement and Longitudinal Analysis](#13-measurement-and-longitudinal-analysis)
- [14. Adaptive ML Difficulty Engine](#14-adaptive-ml-difficulty-engine)
- [15. Consent, Privacy, and Data Lifecycle](#15-consent-privacy-and-data-lifecycle)
- [16. Security, Audit, and Threat Model](#16-security-audit-and-threat-model)
- [17. API, Data, Query, and Persistence Architecture](#17-api-data-query-and-persistence-architecture)
- [18. Notifications and Asynchronous Processing](#18-notifications-and-asynchronous-processing)
- [19. Observability, SLOs, and Failure Semantics](#19-observability-slos-and-failure-semantics)
- [20. Field Operations, Deployment, and Disaster Recovery](#20-field-operations-deployment-and-disaster-recovery)
- [21. Coding Architecture and Engineering Standards](#21-coding-architecture-and-engineering-standards)
- [22. Testing and Quality Architecture](#22-testing-and-quality-architecture)
- [23. Versioning, Migration, and Backfills](#23-versioning-migration-and-backfills)
- [24. Capacity, Scalability, and Deferred Technologies](#24-capacity-scalability-and-deferred-technologies)
- [25. Implementation Roadmap](#25-implementation-roadmap)
- [26. Definition of Done](#26-definition-of-done)
- [27. Architecture Review Checklist](#27-architecture-review-checklist)
- [28. Problem-Statement Traceability](#28-problem-statement-traceability)
- [29. Final Architecture Judgment](#29-final-architecture-judgment)
- [Appendix A — Architecture Evolution and Corrections](#appendix-a--architecture-evolution-and-corrections)
- [Appendix B — Glossary](#appendix-b--glossary)
- [Appendix C — Open Implementation Decisions](#appendix-c--open-implementation-decisions)

---

# 1. Executive Summary

This version is intentionally **less ambitious in infrastructure and more rigorous in semantics**.

The system is not presented as a clinically validated AI platform. It is a production software system with a conservative longitudinal-measurement layer and a narrowly scoped, bounded ML Difficulty Engine, plus an evidence-gated research path for future ML. The first releasable product is an end-to-end elder-facing cognitive-care platform, with Smriti Engine providing the trusted offline, measurement, caregiver, and data backbone. The first releasable architecture is:

```text
Elder Experience Layer
        ↓
Offline Android application
        ↓
ML Difficulty Engine + bounded policy
        ↓
Games / engagement / assessment session
        ↓
Authenticated, signed events + reminder/engagement state
        ↓
Durable server event ledger
        ↓
Deterministic measurement + engagement extraction
        ↓
Quality + eligibility gate
        ↓
Patient-specific baseline
        ↓
Conservative trajectory + engagement analysis
        ↓
Human-readable observation / reminder state / engagement signal
        ↓
Caregiver + health-worker workflow / notification
```

The two most important architectural decisions are:

1. **The MVP ships a bounded ML Difficulty Engine, but does not ship a contextual bandit, clinical speech biomarker, federated learning, HMM/state-space trajectory model, or microservice architecture.** The Difficulty Engine predicts task success for approved task/difficulty candidates; a deterministic safety policy controls the final action.
2. **The product is end-to-end, but the measurement engine remains conservative and protected from adaptive personalization.** Games, reminders, voice interaction, localization, engagement, caregiver workflows, and offline operation are first-class product capabilities; clinical interpretation remains intentionally bounded.
3. **Software correctness, accessibility, engagement validity, and measurement validity are separate concerns.** A technically correct pipeline is not evidence that a game metric, mood signal, or engagement metric is clinically meaningful.
4. **Every elder-facing feature must have an offline behavior, a safe failure mode, an accessibility fallback, and a data-retention/consent rule.**

The architecture intentionally concentrates rigor on the difficult parts of this system—measurement validity, offline trust, synchronization, authorization, ML lifecycle, and operations—without introducing infrastructure that the product does not yet require.

---

# 2. System Context, Scope, and Boundaries

This section establishes the system boundary before introducing internal components. Read it as the contract for what SmritiSaathi is designed to do—and what it intentionally does not do.

## What Smriti Engine is

Smriti Engine is the backend and intelligence layer for:

- patient identity and care relationships;
- shared-device authorization;
- offline event ingestion and reconciliation;
- game-result measurement extraction;
- longitudinal baselines and trajectory analysis;
- caregiver observations and workflow;
- notifications;
- consent and privacy controls;
- operational monitoring;
- future model lifecycle management.

## What Smriti Engine is not

It is not, by default:

- a dementia diagnosis engine;
- a medical-record replacement;
- an autonomous clinical decision maker;
- a general-purpose event-sourcing framework;
- a real-time streaming platform;
- a large-scale distributed system;
- a reinforcement-learning production platform.

The product boundary remains deliberately conservative: the system can describe observed longitudinal change, but does not turn that observation into a diagnosis.

---

# 3. Architectural Goals, Constraints, and Invariants

The architecture is governed by explicit constraints rather than technology preferences. These rules are intended to be enforced through code, tests, database constraints, and operational controls.

These are implementation rules, not principles. Code review, tests, database constraints, and operational checks must enforce them.

## Identity and authorization

1. **Device identity is not patient identity.**
2. **Device possession never grants patient access.**
3. Every patient-scoped action resolves to an authenticated actor and/or authenticated device session plus an explicit patient scope.
4. Offline actor access is bounded by a server-issued offline authorization package with an explicit expiry and scope.
5. A revoked authorization may remain usable offline only until the local authorization package expires; the limitation is explicit and measurable.
6. Every privileged action is attributable to an actor or a system principal.

## Event integrity

7. Every accepted edge event has a globally unique `event_id`.
8. Every accepted edge event is cryptographically bound to a registered device key and key generation.
9. Authenticity and deduplication are separate checks.
10. The server never trusts client-supplied derived fields such as `quality_score`, `eligibility`, `server_received_at`, or `authorization_result`.
11. Client timestamps are evidence, not authoritative server time.
12. Events are immutable after acceptance. Corrections are new events.
13. Read models are projections of retained canonical events; they may be rebuilt, but replayability is subject to the retention/deletion policy.

## Measurement

14. A raw event is never directly used for trajectory analysis.
15. Every measurement has a task definition, task version, extraction version, measurement unit, and quality/eligibility status.
16. **Eligibility is a decision with reasons; quality score is an optional diagnostic value.** A single scalar quality threshold is not the semantic gate.
17. Baselines are only updated from eligible observations under the same measurement contract.
18. Device/game changes create context boundaries; they do not silently become patient deterioration.
19. MVP trajectory output is an **observation**, not a probability of disease.

## ML and experiments

20. No production adaptive model is allowed to optimize an undefined reward.
21. No field outcome is called “counterfactual” unless a valid causal/experimental design supports that claim.
22. Software canary rollout and scientific experiments are separate concepts and separate data models.
23. A model is not promoted because it is more accurate in aggregate; subgroup performance, calibration, stability, and safety criteria must also pass.
24. The ML Difficulty Engine predicts outcomes; it never directly writes the final difficulty or measurement state.
25. Every production difficulty inference records model version, feature-pipeline version, configuration version, candidate set, and selected action.
26. A measurement/assessment session uses a protected measurement regime and cannot be silently altered by engagement personalization.

## Privacy and deletion

27. Patient deletion takes precedence over replayability claims.
28. Sensitive media and sensitive feature data have explicit retention and deletion paths.
29. Auditability does not mean retaining unlimited patient data forever.

## Operations

30. Every asynchronous operation is retryable and idempotent.
31. At-least-once delivery is assumed; exactly-once external side effects are not assumed.
32. Backups are useless until restoration has been tested.
33. Core patient interaction never depends on backend availability.

## Device runtime and resilience

These invariants exist because the elder-facing tablet is the component most likely to fail in the field, and the most likely to fail silently. They carry the same enforcement weight as every other invariant in this section — they must be enforced through code, tests, and CI budgets, not treated as follow-up hardening.

34. The Android app must operate within an explicit, measured memory budget for the minimum supported device tier (§11); exceeding the budget is a shippability blocker, not a post-launch optimization.
35. Background sync must be implemented against WorkManager/Doze constraints, not against an assumption that the process stays alive (§11).
36. A device signing-key failure (Keystore invalidation) must degrade to a bounded, locally-visible, recoverable state; it must never silently halt event recording without surfacing the condition to the actor and the fleet dashboard (§11).
37. Every crash or ANR must be captured to durable local storage and uploaded on next connectivity, even after full days of offline operation; "we'll find out when a field agent reports it" is not an acceptable observability strategy (§11, §19).
38. Content-pack and model-package installation must be atomic (write-to-temp, checksum-verify, atomic-swap); a partial or corrupted download must never be able to crash the content loader or model runtime on next launch (§8, §14).
39. On-device ML inference must only be enabled for a device that has passed an explicit compatibility/benchmark gate; a device outside the validated matrix always uses the deterministic fallback policy, never a "best effort" model load (§14).
40. A reconnection burst (many devices resuming sync after an outage) must be handled by defined client-side jitter and server-side admission control, not merely diagnosed as a risk (§12, §24).
41. Concurrent job-queue workers polling a shared PostgreSQL table must use contention-safe claim semantics (`SELECT ... FOR UPDATE SKIP LOCKED` or equivalent); lock contention is a correctness and latency bug, not an acceptable pilot-scale cost (§18).
42. An event that was accepted and later found to be wrong (e.g. a server-side validation bug let bad data through) is corrected by quarantine and a compensating event, never by editing or silently excluding history without a recorded reason (§12).

---

# 4. Architecture Overview

The topology stays a modular monolith. The change is what each module is allowed to own.

```text
                        ┌───────────────────────────────┐
                        │        Android Edge           │
                        │                               │
                        │ Elder UI / Accessibility     │
                        │ Game Runtime / Session        │
                        │ Voice + Localization          │
                        │ Reminder / Engagement Engine  │
                        │ Offline Auth Session           │
                        │ Local SQLite                   │
                        │ Event Signer / Sync Queue      │
                        │ ML Difficulty Runtime              │
                        └───────────────┬───────────────┘
                                        │ HTTPS batch sync
                                        ▼
                              ┌──────────────────────┐
                              │      API Gateway     │
                              │ TLS / limits / auth  │
                              └──────────┬───────────┘
                                         │
                      ┌──────────────────┴──────────────────┐
                      │          Modular Monolith           │
                      │                                     │
                      │ Identity / Auth                     │
                      │ Authorization                       │
                      │ Device Management                   │
                      │ Event Ingestion                     │
                      │ Measurement                         │
                      │ Baseline + Trajectory              │
                      │ Caregiver Workflow / Alerts        │
                      │ Reminder Management                 │
                      │ Engagement / Social                │
                      │ Notifications                       │
                      │ Localization / Content / Media      │
                      │ Consent / Privacy                   │
                      │ Operational Jobs                    │
                      │ Research / Model Registry           │
                      └──────────────┬──────────────────────┘
                                     │
             ┌───────────────────────┼────────────────────────┐
             │                       │                        │
             ▼                       ▼                        ▼
      ┌──────────────┐       ┌───────────────┐       ┌────────────────┐
      │ PostgreSQL   │       │ Object Store  │       │ Job Workers    │
      │ ledger +     │       │ media +       │       │ outbox +       │
      │ projections  │       │ model assets  │       │ recompute      │
      └──────────────┘       └───────────────┘       └────────────────┘
```

There is **no dedicated time-series database, message broker, Kubernetes cluster, feature store, federated-learning stack, or microservice fleet in the first deployment**. These technologies remain intentionally deferred until measured requirements justify them.

---

The product architecture is presented explicitly so the problem statement can be traced to concrete runtime capabilities.

```text
                         SMRITISAATHI PRODUCT
┌─────────────────────────────────────────────────────────────────────┐
│                         Elder Experience                            │
│                                                                     │
│  Cognitive Games   Memory Journal   Voice Assistant   Reminders    │
│  Daily Recall      Cultural Content  Social/Family    Accessibility│
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                        Offline Edge Runtime                         │
│                                                                     │
│  Patient Context • Local Policy • Event Store • Sync • Voice/Locale│
│  Reminder Scheduler • Engagement State • ML Difficulty Runtime   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                         Signed batch sync
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                          Smriti Engine                              │
│                                                                     │
│ Identity/AuthZ • Device Fleet • Event Ledger • Measurement          │
│ Baseline/Trajectory • Reminder Service • Care Workflow              │
│ Engagement • Content • Notifications • Consent/Privacy              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
             Caregiver       Health         Research /
             Dashboard       Worker UI      Analytics
```

The product therefore has three primary user surfaces:

1. **Elder surface** — the patient interacts primarily with games, voice, reminders, memory support, family/cultural content, and simple daily routines.
2. **Care surface** — caregivers and authorized health workers see activity, adherence, observations, missed reminders, trends, and actionable follow-up.
3. **Operations/research surface** — administrators manage devices, content, deployments, data quality, model artifacts, and auditability.

No surface is allowed to bypass the central authorization, consent, or evidence rules.

---

# 5. Domain and Module Architecture

| Module | Owns | Must not own |
|---|---|---|
| Identity | actor credentials, login/session issuance | patient business permissions |
| Authorization | policy decision for actor/device/patient/action | credential verification |
| Device Management | device registration, keys, app state, scopes, health | patient clinical data |
| Event Ingestion | signature verification, schema validation, dedup, persistence | measurement interpretation |
| Measurement | event→measurement extraction, task contracts, eligibility | alerts, authorization |
| Baseline | patient/task baseline lifecycle | caregiver delivery |
| Trajectory | sustained deviation detection | notification channel choice |
| Care Workflow | observation/alert lifecycle, acknowledgement, intervention records | low-level transport |
| Notification | intent→channel→delivery | deciding whether an alert exists |
| Consent/Privacy | consent state, processing purpose, deletion orchestration | application business decisions |
| Content | game definitions, localized content, family media | trajectory logic |
| ML Difficulty | feature building, model inference, candidate scoring, bounded difficulty selection, model assignment validation | clinical interpretation, authorization, measurement history mutation |
| Jobs | durable asynchronous execution | domain ownership |
| Research/ML | datasets, evaluations, model artifacts, future research models | direct production authorization |
| Operations | health metrics, audit access, incident state | patient-domain decisions |

The modules are code boundaries inside one deployment, not future microservices by default. The ML Difficulty module is production product intelligence, while clinical/predictive research models remain separately governed.

---

# 6. Elder Experience and Accessibility Architecture

The UI is part of the architecture because elderly usability directly affects safety, adoption, and measurement validity.

## UX principles

The default interaction model is:

```text
one task
  ↓
one decision
  ↓
one obvious next action
```

The elder interface must prioritize:

- large touch targets;
- high contrast;
- large, readable typography;
- minimal simultaneous choices;
- icon + audio reinforcement for important instructions;
- no dependence on typing for core flows;
- predictable navigation;
- clear success/failure feedback without punitive language;
- adjustable interaction timing;
- caregiver-assisted mode;
- graceful handling of accidental taps;
- offline-first operation;
- persistent language/voice preferences.

## UX modes

```text
ELDER_MODE
CAREGIVER_ASSISTED_MODE
HEALTH_WORKER_MODE
ADMIN_MODE
```

## 6.2A Elder screen architecture

The elder application should expose a small, predictable navigation tree rather than a conventional multi-screen productivity UI.

```text
Home
├── Play
│   ├── Memory
│   ├── Attention
│   ├── Patterns & Objects
│   └── Daily Recall
├── My Day
│   ├── Next reminder
│   ├── Today's routine
│   └── Appointment reminder
├── My Memories
│   ├── Family
│   ├── Photos
│   ├── Names
│   └── Stories
├── Talk / Listen
│   ├── voice instructions
│   ├── spoken reminders
│   └── optional simple conversation prompts
└── Help
    └── caregiver assistance
```

The Home screen should prioritize the next useful action rather than analytics. Cognitive scores and caregiver alerts are intentionally absent from `ELDER_MODE`.

## 6.2B Interaction pattern

For core activities, prefer:

```text
Hear instruction → See example → Perform one action → Receive reassuring feedback → Continue / finish
```

The design should minimize nested menus, long forms, typing, and irreversible actions.

## 6.2C Caregiver dashboard screen architecture

```text
Caregiver Home
├── Patients needing attention
├── Missed reminders
├── Recent activity
└── Sync/device health

Patient Detail
├── Today
├── Cognitive trends
├── Engagement
├── Reminders
├── Memories / family content
├── Observations
├── Interventions / follow-up
└── Access / consent
```

`ELDER_MODE` must not expose backend concepts such as scores, confidence, trajectories, or alerts.

`CAREGIVER_ASSISTED_MODE` may expose more controls but must still respect patient authorization and consent.

## Accessibility and measurement interaction

Accessibility changes must be captured as measurement context when they can affect comparability.

Examples:

```text
font_scale
input_mode
voice_enabled
assistance_level
touch_target_profile
timing_profile
audio_prompt_enabled
```

A patient moving from touch input to voice input must create a context boundary where the affected measurements are not silently compared as if the task interface were identical.

## Safety UX

The elder application must never:

- display a dementia probability;
- claim that a cognitive score is a medical diagnosis;
- use frightening alert language;
- silently change language;
- require internet connectivity for the core daily experience;
- allow a caregiver notification to be interpreted as an emergency medical instruction unless an explicitly approved clinical workflow exists.

---

# 7. Cognitive Game and Session Architecture

Games are product capabilities backed by versioned measurement contracts.

## Required game families

The first release should support at least these domain families:

```text
MEMORY
├── picture recall
├── sequence recall
├── name/face association
├── story recall
└── daily-routine recall

ATTENTION
├── selective attention
├── sustained attention
└── simple reaction/response tasks

PATTERN_RECOGNITION
├── visual patterns
├── object matching
├── sorting/categorization
└── familiar-object identification

ORIENTATION / DAILY FUNCTION
├── time-of-day orientation
├── day/date recall
├── familiar-place recognition
└── simple routine sequencing
```

Each task family is a content contract, not merely a screen in the app.

## Session contract

```text
session_started
  ↓
consent/context check
  ↓
task selection
  ↓
voice/visual instruction
  ↓
practice/example where applicable
  ↓
measured attempts
  ↓
fatigue/frustration check
  ↓
session summary
  ↓
local event persistence
  ↓
optional caregiver-visible completion
```

## Session safety

The game engine must be able to end, simplify, pause, or switch activities when it detects explicit operational signals such as repeated abandonment, repeated accidental input, excessive latency, or caregiver-requested stop.

These are engagement/safety signals, not medical diagnoses.

---

# 8. Localization, Voice, Cultural Content, and Media

A `preferred_language` field alone is not sufficient. Localization is a runtime subsystem.

## Locale model

Every patient profile should resolve to:

```text
language
script
voice_profile
audio_prompt_profile
reading_complexity
region
content_pack_id
fallback_locale
```

## Content packs

The content system supports installable offline packs:

```text
ContentPack
├── locale
├── region
├── game_instructions
├── game_assets
├── example_names
├── familiar_objects
├── audio_prompts
├── cultural_stories
├── family-memory templates
├── festival/seasonal content
└── version/checksum
```

Content packs are versioned and signed. The device never downloads an unsigned or incompatible content pack.

## Atomic pack installation

A content pack (and, by the same contract, an ML model package in §14) is a multi-file bundle downloaded over unreliable rural connectivity. A download that is interrupted, truncated, or corrupted mid-transfer must never be able to reach the content loader.

Required install sequence:

```text
download to temp directory (pack_id + download_attempt_id, not the final path)
     ↓
verify full-bundle checksum against signed manifest
     ↓
verify signature over manifest
     ↓
verify declared schema/compatibility version against app version
     ↓
atomic rename/swap temp directory → versioned install directory
     ↓
update local pack registry row (status = installed) in the same local transaction as the swap
     ↓
only then: mark pack eligible for use by ContentCache/GameRuntime
```

Rules:

- the content loader must only ever read from a directory that has completed the swap; it must never read from a partially-written temp path;
- a failed checksum/signature/compatibility check deletes the temp directory and leaves the previously-installed pack (if any) active and untouched;
- the previous pack version is not deleted until the new pack has completed its atomic swap and passed a local post-install sanity check (manifest-declared file count/hash spot-check);
- install attempts, failures, and reasons are recorded locally and included in sync telemetry (`content_pack_install_failure`, §19) so a systemic download-corruption problem on a given network/device class is visible centrally, not just locally;
- a device may retry a failed install on a backoff schedule but must keep operating on its last-known-good pack in the meantime — a failed install is never allowed to leave the device with no valid pack.

## Voice architecture

Voice is split into two concerns:

```text
Accessibility Voice
├── TTS instructions
├── navigation
├── spoken reminders
└── optional speech input

Monitoring Speech
├── separate consent
├── separate data pipeline
├── separate retention
└── separately validated models
```

No voice recording is retained merely because voice interaction was enabled.

## TTS availability and failure path

The elder interaction model ("Hear instruction → See example → Perform") assumes a working TTS engine and voice for the patient's locale. That assumption does not hold on many budget Android devices in the target region, which frequently ship without a working Indian-language TTS voice installed, or with an engine present but the specific locale voice missing.

The app must therefore treat TTS availability as a runtime condition to be checked, not a given:

```text
app start / locale selection
     ↓
query platform TTS engine for installed voices
     ↓
is a voice available for the resolved locale (or its declared fallback_locale)?
     ├── yes → normal Accessibility Voice flow
     └── no  → degraded visual-first mode:
                 - on-screen text/iconography carries full instruction content
                 - larger-text / high-contrast presentation is used in place of audio pacing
                 - a one-time, non-blocking prompt offers the caregiver/health-worker
                   a path to install a system TTS voice, where device permissions allow
                 - the flow NEVER blocks or silently freezes waiting for audio that
                   will never arrive
```

Rules:

- a missing or failed TTS engine call must never leave the elder mid-task with no visible next step; every voice-driven prompt has a visual equivalent that is shown regardless of TTS outcome, not only as a fallback rendered after a timeout;
- TTS availability is checked and cached at session start, not re-probed per prompt (a mid-session engine failure falls back to the same degraded visual-first mode for the remainder of the session);
- `voice_prompt_success` (§19) is broken down by device model and OS version so a systemic "no TTS voice for locale X on device class Y" pattern is visible centrally rather than discovered per-village;
- the supported-locale matrix (§8 "NER localization requirements", Appendix C) must record TTS voice availability per locale explicitly — "supported" without a working voice is not a valid entry.

## NER localization requirements

Localization must be evaluated with the actual target communities. The architecture should support multiple regional language packs without changing the game/measurement contract.

The MVP should explicitly publish its supported-language matrix rather than claiming generic "multilingual support".

---

Monitoring speech is not part of the cognitive trajectory runtime until separately validated. Accessibility voice/TTS is a first-class product capability and follows the product voice architecture above.

## Accessibility speech

Allowed to support:

- navigation;
- accessibility input;
- prompts/TTS.

## Monitoring speech

Separate:

- consent purpose;
- feature extraction pipeline;
- retention;
- evaluation dataset;
- model version;
- subgroup evaluation;
- access control.

No accessibility recording is automatically promoted into a monitoring dataset.

Accessibility speech and clinical/monitoring speech remain separate pipelines with separate consent and retention semantics.

---

Family media is a normal product subsystem, not part of the “AI architecture.”

## Media flow

```text
upload
 ↓
size/type validation
 ↓
malware scan
 ↓
metadata stripping
 ↓
optional moderation
 ↓
object storage
 ↓
short-lived access URL
```

No application endpoint returns permanent public object URLs.

## Media references

Application records store logical object IDs and checksums, not public URLs.

---

# 9. Reminders, Memory, Social Interaction, and Engagement

Reminders are a first-class care feature, not a generic notification subtype.

## Reminder types

```text
MEDICATION
HYDRATION
DAILY_ACTIVITY
MEDICAL_APPOINTMENT
CUSTOM_ROUTINE
```

## Reminder lifecycle

```text
scheduled
   ↓
local_triggered
   ↓
voice/visual_prompted
   ↓
acknowledged ───────────────┐
   ↓                         │
completed                    │
                             │
missed → retry/escalation ───┘
```

The system distinguishes `prompted`, `acknowledged`, and `completed`. A reminder being displayed is not proof that the activity occurred.

## Reminder data model

```sql
CREATE TABLE reminders (
    reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    reminder_type VARCHAR(40) NOT NULL,
    title TEXT NOT NULL,
    instruction TEXT,
    schedule JSONB NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    recurrence_rule TEXT,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    voice_profile VARCHAR(50),
    escalation_policy JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Reminder execution

Reminder execution state is separately tracked so local retries, missed reminders, acknowledgement, and caregiver escalation are auditable.

Offline reminder behavior is authoritative for the local schedule. Server reconciliation updates the care view when connectivity returns.

## Safety rule

The reminder engine does not infer medication adherence from a tap alone. The UI should distinguish:

```text
"Reminder acknowledged"
vs
"Activity marked complete"
```

---

The problem statement includes memory assistance, emotional engagement, and social interaction. These are separate from clinical trajectory analysis.

## Memory assistance

Provide a patient-owned memory space containing:

```text
Family members
Important names
Photos
Short stories
Places
Routines
Appointments
Personal preferences
```

Memory content has explicit ownership, consent, visibility, and deletion semantics.

## Social interaction

The MVP should support lightweight, low-bandwidth social features such as:

```text
family photo prompts
voice greetings
caregiver messages
shared memory stories
celebration reminders
simple conversation prompts
```

These features must work without requiring permanent real-time connectivity.

## Engagement metrics

Engagement is measured separately from cognitive performance:

```text
session_completion_rate
voluntary_session_rate
abandonment_rate
repeat_interest
reminder_ack_rate
social_interaction_frequency
content_preference
assistance_level
```

These metrics are product/engagement indicators, not diagnostic biomarkers.

## Emotional well-being boundary

The system may ask simple patient-reported check-ins such as mood/comfort or preferred activity, provided the purpose, consent, wording, and interpretation are clearly defined.

The MVP must not infer depression, anxiety, or other mental-health diagnoses from game behavior alone.

---

# 10. Caregiver and Health-Worker Experience

The caregiver surface must answer three questions quickly:

```text
Is the patient engaging?
Did anything important get missed?
Is there a persistent change worth reviewing?
```

## Dashboard layers

```text
Patient Overview
├── last activity
├── current routine/reminder status
├── recent cognitive task participation
├── trend observations
├── missed/acknowledged reminders
├── engagement indicators
└── follow-up items

Patient Detail
├── longitudinal trends
├── evidence sessions
├── game/task breakdown
├── device/context boundaries
├── reminder history
├── caregiver notes
├── interventions
└── consent/access state
```

## Dashboard language

Avoid:

```text
"Dementia risk: 82%"
"Cognitive health failed"
"Treatment ineffective"
```

Prefer:

```text
"Persistent change observed in visual matching performance"
"6 eligible sessions contributed to this observation"
"3 medication reminders were not marked complete"
"No activity recorded for 2 days"
```

Every observation links to evidence and the policy version that generated it.

## Health-worker workflow

Authorized health workers should be able to:

```text
review patient
→ review evidence
→ record observation
→ record intervention/action
→ schedule follow-up
→ acknowledge/close
```

The workflow remains observational unless a formally approved clinical workflow is added.

---

## Alert policy is deterministic

Initial policy:

```text
trajectory observation
       ↓
policy eligibility
       ↓
rate/suppression check
       ↓
create caregiver observation
       ↓
optional notification
```

The policy does not infer “severity” from one opaque score.

## Alert types

```text
OBSERVATION
ATTENTION
ACTION
```

The MVP may produce `OBSERVATION` records only until field evidence supports escalation to `ATTENTION`/`ACTION` semantics.

## Alert record

```sql
CREATE TABLE caregiver_observations (
    observation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    trajectory_run_id UUID NOT NULL,
    observation_type VARCHAR(30) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    evidence_quality VARCHAR(30) NOT NULL,
    evidence_count INTEGER NOT NULL,
    explanation_code VARCHAR(80) NOT NULL,
    explanation_text TEXT NOT NULL,
    policy_version VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Suppression

Suppression is explicit and reason-coded:

```text
DUPLICATE_SIGNAL
RECENTLY_ACKNOWLEDGED
LOW_EVIDENCE
OUTSIDE_MONITORING_WINDOW
PATIENT_ARCHIVED
CONSENT_REVOKED
CAREGIVER_CHANNEL_UNAVAILABLE
```

The system must retain the fact that a candidate was suppressed; it must not silently disappear.

---

## Purpose

These tables are for **observational workflow learning**, not automatic causal claims.

## Intervention

```sql
CREATE TABLE interventions (
    intervention_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    caregiver_observation_id UUID REFERENCES caregiver_observations(observation_id),
    actor_id UUID REFERENCES actors(actor_id),
    intervention_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Outcome observations

```sql
CREATE TABLE outcome_observations (
    outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID REFERENCES interventions(intervention_id),
    outcome_definition VARCHAR(100) NOT NULL,
    baseline_snapshot_ref TEXT,
    followup_snapshot_ref TEXT,
    measurement_definition_id UUID,
    source VARCHAR(40) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    context JSONB,
    notes TEXT
);
```

No schema or dashboard language may label these as “treatment effect” without an appropriate study design.

---

# 11. Offline Edge Architecture and Device Trust

## Local components

```text
App
├── ElderUI
├── AccessibilityManager
├── VoiceInteractionManager
├── LocalizationManager
├── AuthSessionManager
├── PatientContextManager
├── GameRuntime
├── MeasurementCollector
├── LocalPolicyEngine
├── ReminderEngine
├── EngagementEngine
├── MLFeatureBuilder
├── MLDifficultyEngine
├── DifficultyPolicy
├── EventStore
├── EventSigner
├── SyncManager
├── DeviceKeyManager
├── ContentCache
├── CrashReporter
└── MLDifficultyModelRuntime
```

## Android runtime constraints and budget

The components above (SQLite, event signing, local ML inference, TTS/voice, localization, reminder scheduling, and the game runtime) all run inside a single mobile process on hardware that is explicitly the low end of the Android market — this is a rural/shared-device deployment, and the validated minimum device tier (Appendix C) must be tested down to **2 GB RAM devices**, not mid-range development hardware. The following constraints are mandatory, not aspirational:

**Memory budget.** The app must declare and test against an explicit resident-memory budget for the minimum device tier (target: peak app working set materially below what a 2 GB device leaves available after OS and OEM skin overhead — validate empirically per §Appendix C device matrix, do not assume a number). The ML runtime, TTS engine, and game asset cache are the largest consumers and must each have an independent budget line; loading a model, a content pack, and game assets concurrently must not be allowed to exceed the total budget. CI must include a memory-profiled run on the lowest supported device class before release, not just functional tests.

**WorkManager / JobScheduler and Doze.** Background sync, delayed crash-log upload (below), and content-pack polling must be implemented as WorkManager jobs with explicit constraints (network type, battery state), not as a long-lived background thread or service that assumes the process survives. The app must be designed and tested under Doze mode and App Standby Buckets: sync must complete correctly (even if delayed) when the OS defers background work, and must not depend on wake locks held indefinitely.

**Foreground service restrictions.** Any operation that genuinely requires guaranteed background network access (e.g. a large in-progress sync batch) must use a foreground service with a visible, honestly-labelled notification, sized to the minimum duration needed, and must degrade to WorkManager-deferred execution rather than being relied upon as the default sync mechanism — modern Android foreground-service restrictions make an always-on background-network assumption unreliable.

**Thread and lifecycle discipline for SQLite.** All SQLite writes (event persistence, reminder state, sync status) must go through a single writer discipline (e.g. a serialized write queue or WAL mode with a defined writer thread/coroutine dispatcher) so that UI-thread reads never block on, or race with, concurrent event writes from the game runtime, sync manager, and reminder engine. `EventStore` writes must never be issued from the UI thread. Activity/Fragment lifecycle transitions (rotation, backgrounding, low-memory kill) must not be able to interrupt an in-flight event write partway — the "transactionally persist event" step in the local event storage flow below must complete or fully roll back before the UI continuation proceeds.

These constraints apply to every component in the list above; they are called out here once so they do not need to be re-derived per subsystem.

## Local database rules

SQLite contains:

- current authorized patient scopes;
- current offline actor authorization package;
- active device session;
- game/content definitions;
- reminders and reminder execution state;
- cached localization/content packs;
- elder UI/accessibility preferences;
- engagement/session state required for offline continuity;
- immutable local events;
- sync status;
- active ML Difficulty Engine package metadata, assignment state, and last-known-good model version;
- local deletion directives.

SQLite does **not** become a second source of truth for server-owned patient relationships. It is an offline execution cache plus durable event buffer.

## Local event storage

Every event is written locally before it is considered successful.

```text
create event
    ↓
validate local schema
    ↓
attach actor/session/patient context
    ↓
sign canonical envelope
    ↓
transactionally persist event
    ↓
execute game/UI continuation
    ↓
queue for sync
```

If the process crashes after event persistence, the event remains. If the network is unavailable, the event remains. If the server rejects the event, the event remains with a terminal sync state and rejection reason.

## Offline crash and ANR telemetry

A device deployed in the field may be days from the nearest sync. If the app crashes with no local capture and delayed upload, the operator learns about the crash only if a health worker happens to report it — which means production crashes are debugged with zero diagnostic data. This is treated as a required subsystem, not an enhancement:

```text
crash / ANR occurs
     ↓
process-death-safe handler writes a structured crash record to local storage
    (stack trace, app version, OS version, device model, free memory/storage
     at time of crash, last N breadcrumb events, timestamp)
     ↓
record is appended to a bounded local crash-log store (separate from EventStore;
    crash reports are diagnostic data, not domain events, and must not be signed
    as if they were patient-authored facts)
     ↓
CrashReporter enqueues a WorkManager upload job (network-constrained, retried
    with backoff, survives process death and reboot)
     ↓
on next connectivity: crash/ANR batch uploads ahead of or alongside normal
    event sync, capped in size per batch
     ↓
server ingests into crash telemetry storage (separate pipeline from the event
    ledger), keyed by device_id + app_version + crash_signature
```

Rules:

- capture must use a process-death-safe mechanism (e.g. an uncaught-exception handler that writes synchronously to disk before the process dies, plus platform ANR-trace capture) — a crash handler that itself depends on being able to make a network call or spin up new threads is not acceptable;
- the local crash-log store is bounded (oldest-first eviction) so a crash loop cannot consume the device's limited storage;
- crash records carry enough context to reproduce (breadcrumbs of recent screens/actions, not just the stack trace) but must not include full patient content in the trace;
- `app_crash_rate` (already tracked, §19) must be broken down by `device_model`, `OS_version`, and `app_version` so a crash pattern isolated to a specific cheap device class is visible, not averaged away;
- this pipeline must exist before ML inference, TTS, and background sync are enabled on field devices (§25 Phase 0/1) — it is the primary way the team finds out what is actually breaking on real hardware.

---

## Actor authentication

Actors authenticate to the backend using a normal server-backed login/session mechanism.

The backend issues an **offline authorization package** for devices that are explicitly approved to operate offline.

The package contains:

```text
package_id
actor_id
device_id
allowed_patient_ids OR allowed_center_scope
allowed_actions
issued_at_server_time
expires_at_server_time
policy_version
credential_version
package_signature
```

The package is signed by the server and stored encrypted on the device.

## Offline actor unlock

The actor must locally unlock the cached authorization package using a device-supported authentication factor. MVP uses a PIN/passcode credential; biometric authentication is not required.

The device stores only the minimum verifier/material required to unlock the package. The server remains authoritative for the underlying identity and can revoke the package on the next sync.

## Offline time handling

Do not pretend an offline Android clock is trustworthy.

The device records both:

- server-issued expiry timestamp;
- local monotonic session duration state.

Clock rollback/large wall-clock changes cause the device to enter a restricted state and require online revalidation when possible.

The system does **not** claim cryptographically perfect offline time enforcement. The security property is instead:

```text
offline access = explicitly issued package + local unlock + bounded lifetime + server revocation on next contact
```

## Authorization decision

Use an explicit action model:

```text
can(actor, action, patient, device, now)
```

Required checks:

1. actor status is active;
2. device status is active;
3. device is entitled to the patient;
4. actor is entitled to the patient or center scope;
5. action is allowed by the actor's scope;
6. consent/processing purpose permits the operation;
7. session/package is valid.

Never infer authorization from a selected patient profile.

## Temporal relationship model

Relationships must support grant → revoke → re-grant without overwriting history.

Use interval records with:

```text
valid_from
valid_until
revoked_at
revoked_by
```

Do not enforce history with a single mutable row plus one `revoked_at`.

---

## Device identity

A device has:

- stable `device_id` for the installation;
- one or more historical signing keys;
- current key generation;
- device status;
- app version;
- last seen/sync state.

A reinstall creates a new device installation identity and requires re-enrollment.

## Key lifecycle

Device keys are generated in Android secure hardware/keystore where supported.

Every event records the exact `device_key_id` used for signing.

Key rotation never destroys historical verification material until the retention policy allows it.

## Key invalidation and degraded-but-functional path

Android Keystore/StrongBox behavior is not uniformly reliable across the OEM skins common in the budget-tablet market this system targets: keys can be silently invalidated after an OS update, a lock-screen credential change, or an OEM-specific bug. Because every event requires a signature, an unhandled Keystore failure means the device cannot record any new event — and "reinstall the app" as the only recovery path both discards the local device identity and risks orphaning whatever unsynced backlog was sitting in `EventStore`.

The app must therefore treat key invalidation as an expected, recoverable condition rather than a fatal one:

```text
periodic key health-check (app start + before each signing operation)
     ↓
can the key still sign a test payload?
     ├── yes → normal signing flow
     └── no  → enter DEGRADED_SIGNING state:
                 - do NOT block game/reminder UI; the elder-facing experience continues
                 - newly created events are still written to EventStore and queued,
                   but flagged pending_signature (not silently dropped, not sent unsigned)
                 - device surfaces a clear, non-alarming local status (visible to the
                   actor/health-worker, not the elder) indicating re-authorization is needed
                 - fleet dashboard is notified at next any successful connectivity
                   (a lightweight unsigned health-ping is permitted purely to report
                   device status, distinct from domain event ingestion)
     ↓
recovery paths, in order of preference:
    1. app attempts local key regeneration under the existing device_id and
       re-signs the pending_signature backlog with the new device_key_id
       once a server round-trip confirms the new key is accepted
    2. if local regeneration is not possible, guided re-enrollment preserves
       the existing device_id and unsynced backlog where technically possible,
       rather than defaulting to a full reinstall/new-identity path
    3. full reinstall (new device installation identity, per "Device identity"
       above) remains the last resort, and is treated as an operational
       incident to investigate, not a routine recovery step
```

Rules:

- a Keystore failure must never present as a silent stall or a generic crash — the actor-facing status must name the condition plainly enough for a health worker to act on it;
- events queued as `pending_signature` are never transmitted to the server unsigned; they wait for a valid key before entering the sync pipeline;
- the health-check must run proactively (app start, and before each signing attempt) rather than being discovered only when a sync attempt fails days later with a large backlog already accumulated;
- this condition and its resolution are tracked as fleet-operations signals (§20 Field support) alongside expired authorization packages and failed content installs.

## Signature contract

The signed message is the canonical serialization of:

```text
protocol_version
 event_id
event_type
event_schema_version
device_id
device_key_id
actor_id (nullable)
patient_id
session_id
client_sequence
client_timestamp
payload_hash
```

The payload itself is hashed canonically and the envelope signature covers the hash.

This prevents the earlier ambiguity where the system knew a device had a key but could not cleanly identify which generation signed a historical event.

## What signatures do not prove

A valid device signature proves provenance from an enrolled key. It does **not** prove that the payload is semantically truthful.

Therefore server validation also checks:

- schema;
- numeric ranges;
- impossible values;
- event type rules;
- session scope;
- patient scope;
- sequence anomalies;
- device health anomalies;
- known client version constraints.

---

# 12. Event Ledger and Synchronization Architecture

## Correct source-of-truth model

The canonical history contract is intentionally precise:

> The canonical source for retained domain history is an append-only event ledger. Operational tables are projections/read models. Replay is supported for retained data. Privacy deletion can remove or cryptographically render patient-specific event payloads unrecoverable; this intentionally overrides indefinite replayability.

This resolves the fundamental tension between replayability and privacy deletion: retained history is replayable, but patient deletion may intentionally make specific payloads unrecoverable.

## Event envelope

```sql
CREATE TABLE event_ledger (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(80) NOT NULL,
    schema_version SMALLINT NOT NULL,

    patient_id UUID,
    device_id UUID NOT NULL,
    device_key_id UUID NOT NULL,
    device_session_id UUID,
    actor_id UUID,

    client_sequence BIGINT NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    payload_hash CHAR(64) NOT NULL,
    signature TEXT NOT NULL,

    payload JSONB NOT NULL,

    ingestion_status VARCHAR(20) NOT NULL DEFAULT 'accepted',
    rejection_code VARCHAR(80),
    rejected_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (device_id, client_sequence)
);
```

## Immutable rule

No update to:

- payload;
- patient_id;
- device_id;
- actor_id;
- client timestamp;
- signature;
- sequence.

Sync flags belong in a separate delivery/projection table, not on the canonical event.

## Event types

Initial event types:

```text
game.session.started
game.task.completed
game.session.completed
game.session.abandoned
reminder.completed
care.session.started
care.session.ended
intervention.recorded
consent.granted
consent.revoked
patient.created
patient.archived
device.enrolled
device.revoked
actor.session.started
actor.session.ended
device.deleted_data_acknowledged
```

Do not create one event type per database table. Events represent domain facts, not CRUD operations.

---

## Client behavior

The client sends ordered batches but the server does **not** require global ordering.

After a prolonged offline period, the client must not resume sync the instant connectivity returns. Sync resumption applies randomized jitter (e.g. a few seconds to low tens of seconds, tuned during load testing) before the first batch request, and batches are capped in size (§24) so a device with days of backlog sends a bounded first batch rather than the entire queue at once. This is the client half of reconnection-storm mitigation; the server half (admission control, connection pooling) is defined in §24.

```text
batch
 ├── request_id
 ├── device_id
 ├── device_key_id
 ├── protocol_version
 └── events[]
```

Each event is independently validated.

## Server processing order

```text
TLS
 ↓
device authentication
 ↓
request size / rate limit
 ↓
canonical parsing
 ↓
signature verification
 ↓
payload hash verification
 ↓
device/session/patient scope verification
 ↓
deduplication
 ↓
schema/domain validation
 ↓
consent/processing-purpose validation
 ↓
append event
 ↓
update projections asynchronously
 ↓
ack per event
```

The important correction is that the server does not mark the entire batch as successful merely because the HTTP request succeeded.

## Per-event acknowledgement

```json
{
  "request_id": "...",
  "results": [
    {
      "event_id": "...",
      "status": "accepted"
    },
    {
      "event_id": "...",
      "status": "duplicate"
    },
    {
      "event_id": "...",
      "status": "rejected",
      "code": "DEVICE_SCOPE_REVOKED"
    }
  ]
}
```

The device removes an event from its retry queue only when the server has returned a terminal acknowledgement.

## Duplicate handling

`event_id` catches repeated submission of the same event.

`(device_id, client_sequence)` catches accidental client sequence reuse.

A duplicate with a different payload hash is treated as a security/data-integrity incident, not a normal duplicate.

## Clock handling

Never reject a valid event solely because its client timestamp is old.

Store:

- original client timestamp;
- server receive timestamp;
- clock-skew classification.

Late events are processed according to their event time where the domain permits it.

## Post-acceptance quarantine and tombstones

Events are immutable after acceptance (Invariant 12, §3). That rule protects against tampering, but it creates a specific operational risk: if a bug in server-side schema/domain validation lets malformed or semantically wrong data through, the system cannot simply "reject and fix" after the fact — the bad data is already canonical. Without an explicit mechanism, that becomes a permanent scar in the ledger and in every projection/baseline built from it.

The architecture defines a **quarantine, not a rewrite**:

```sql
CREATE TABLE event_quarantine (
    quarantine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_ledger(event_id),
    quarantined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    quarantined_by UUID REFERENCES actors(actor_id),
    reason_code VARCHAR(80) NOT NULL,
    reason_detail TEXT,
    validation_bug_reference TEXT,
    compensating_event_id UUID REFERENCES event_ledger(event_id)
);
```

Rules:

- the original event row in `event_ledger` is never edited, deleted, or backfilled — its `payload`, `signature`, and identifying fields remain exactly as accepted, preserving the provenance/audit chain;
- a quarantine record marks the event as excluded from projection/measurement rebuilds going forward, with a mandatory reason and (where applicable) a reference to the validation bug that let it through;
- where domain correction is needed (e.g. the event should be treated as if it never happened for trajectory purposes), a **compensating event** is appended through the normal event pipeline (e.g. a `*.correction.recorded` event type) that explicitly supersedes the quarantined event; projections are rebuilt from the combination of retained events plus quarantine state, never by mutating history;
- projection/trajectory rebuild jobs must read quarantine state and exclude quarantined events from aggregation, so a fixed validation bug does not require a data migration — it requires quarantining the specific bad events it let through and re-running the rebuild;
- quarantine actions are themselves audited (actor, timestamp, reason) per §16;
- this is distinct from the existing "Signature failure → reject/quarantine; do not project" failure-semantics row (§19), which handles events that never should have been accepted in the first place — this mechanism handles events that were validly accepted under the rules that existed at the time, but that a later-discovered bug shows should not have been.

---

# 13. Measurement and Longitudinal Analysis

This is the core of the product. Treat it as a measurement system first and an AI system second.

## Task contract

Every measurable task has a stable definition:

```text
measurement_definition_id
name
task_family
unit
expected_range
higher_is_better / lower_is_better
required_task_version_range
required_difficulty_range
extraction_version
```

A game implementation cannot invent metrics ad hoc.

## Measurement observation

```sql
CREATE TABLE measurement_observations (
    observation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    source_event_id UUID NOT NULL REFERENCES event_ledger(event_id),
    measurement_definition_id UUID NOT NULL,
    task_version VARCHAR(30) NOT NULL,
    device_id UUID NOT NULL REFERENCES devices(device_id),
    observed_at TIMESTAMPTZ NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    extraction_version VARCHAR(30) NOT NULL,
    eligibility VARCHAR(20) NOT NULL,
    exclusion_reason VARCHAR(80),
    context JSONB
);
```

## Eligibility model

Do not reduce measurement validity to one arbitrary score.

Eligibility starts with explicit rules:

```text
ELIGIBLE
INELIGIBLE_INCOMPLETE
INELIGIBLE_INVALID_VALUE
INELIGIBLE_DEVICE_CHANGE
INELIGIBLE_TASK_VERSION_CHANGE
INELIGIBLE_MISSING_CONTEXT
INELIGIBLE_EXCESSIVE_INPUT_LATENCY
INELIGIBLE_SECURITY_ANOMALY
```

A separate diagnostic `quality_score` may exist for research and monitoring, but downstream algorithms consume eligibility plus context.

Eligibility remains the semantic gate; a quality score is diagnostic metadata rather than the validity decision.

## Device calibration

The system needs a device performance profile:

```text
device_id
app_version
screen/input class
input latency class
calibration version
calibrated_at
```

The measurement extractor uses that profile to identify observations potentially contaminated by client performance.

## Context capture

For every observation, capture only context that has a defined purpose:

- task/game version;
- difficulty;
- device class;
- time-of-day bucket;
- session gap;
- incomplete session state;
- known client input-latency class;
- optional patient/caregiver-reported context.

The system must not imply that unobserved context was normal.

---

## Baseline is a distribution, not one magic number

Store the baseline representation needed by the selected algorithm:

```text
baseline_id
patient_id
measurement_definition_id
algorithm_version
population_prior_version (optional)
observation_window_start
observation_window_end
eligible_count
median / robust center
MAD / robust scale
confidence / uncertainty metadata
status
created_at
superseded_at
```

Do not make the schema depend forever on `mean + std_dev`.

## Baseline lifecycle

```text
INSUFFICIENT_DATA
      ↓
PROVISIONAL
      ↓
ESTABLISHED
      ↓
STALE
      ↓
REESTABLISH
```

`RESET` is not automatic merely because a device changed. A device change creates a context boundary and temporarily reduces evidence quality until enough same-device observations exist.

## Practice effects

The MVP does not fit a sophisticated learned learning curve.

Instead:

1. mark early sessions as `PRACTICE_WINDOW`;
2. avoid generating trajectory alerts from the practice window;
3. establish a baseline after sufficient repeated performance under the same task contract;
4. add learned practice-effect correction only after a measurement study demonstrates benefit.

This is safer than implementing a mathematically elegant but unvalidated correction.

## Time weighting

Use a configurable decay function but persist its configuration version.

Do not silently change decay constants in application code.

---

## MVP algorithm

The first trajectory engine is intentionally boring:

```text
eligible observations
        ↓
same measurement contract
        ↓
context stratification
        ↓
robust baseline comparison
        ↓
rolling deviation
        ↓
persistence requirement
        ↓
context/evidence check
        ↓
observation candidate
```

## No single-session escalation

A single abnormal session cannot generate a caregiver action signal.

An observation candidate requires configurable persistence across multiple eligible observations.

The actual persistence count and evidence window are product/field validation parameters. They must live in versioned configuration, not hard-coded application constants.

## Evidence window

Every trajectory result records the exact contributing observation IDs.

Never represent an evidence window only as a string such as:

```text
"last 6 evening sessions"
```

Store the actual IDs and timestamps as the authoritative evidence set.

## Output contract

The trajectory engine returns:

```json
{
  "type": "OBSERVATION",
  "measurement": "reaction_time_ms",
  "direction": "above_baseline",
  "magnitude": 0.35,
  "persistence": 6,
  "evidence_quality": "acceptable",
  "evidence_observation_ids": ["..."],
  "baseline_id": "...",
  "algorithm_version": "trajectory-v1",
  "explanation_code": "PERSISTENT_DEVIATION_SAME_TASK",
  "generated_at": "..."
}
```

There is deliberately no field called `dementia_risk`.

## Confidence terminology

Do not call this output `confidence` unless there is a formally defined probabilistic interpretation.

Use separate terms:

- `evidence_quality` — quality of supporting observations;
- `deviation_magnitude` — size of observed change;
- `persistence` — number/time span of supporting observations;
- `model_probability` — only for a future probabilistic model with a defined target.

Probability is not used without an explicitly defined predictive target and calibration contract.

---

# 14. Adaptive ML Difficulty Engine

The deterministic policy remains the production default, with personalization explicitly constrained by accessibility, engagement, and cognitive-task comparability.

## Inputs

```text
recent eligible performance
current task difficulty
recent failure streak
abandonment
input latency
assistance level
patient preference
content preference
session fatigue signals
recent task-family exposure
```

## Outputs

```text
keep task
increase difficulty one step
decrease difficulty one step
switch task family
switch presentation style
use more audio guidance
shorten session
end session
```

## Measurement protection

The personalization engine may adapt presentation, pacing, or difficulty, but any change that alters the measurement contract must be explicit and versioned.

The system must never reward a patient with a new task regime and then compare the resulting score directly against a baseline from a different task regime without a declared context boundary.

---

The production personalization path uses a bounded machine-learning model for task/difficulty selection. The ML system is intentionally narrow: it predicts the probability that the patient will successfully complete a candidate task at a candidate difficulty. It does not diagnose, estimate dementia risk, or alter measurement semantics.

## Decision problem

```text
patient/session state
        +
candidate task
        +
candidate difficulty
        ↓
ML success predictor
        ↓
P(success | state, task, difficulty)
        ↓
bounded difficulty policy
        ↓
selected task + difficulty
```

The model target is a clearly defined operational outcome such as successful task completion. The label definition must be versioned and must not be confused with clinical improvement.

## Candidate generation

The model never invents arbitrary tasks or difficulty levels. The application generates an approved candidate set from the active content/task catalog. A candidate must satisfy task-family, content-version, device, locale, accessibility, consent, and session-policy constraints before it reaches the model.

Example:

```text
Candidate A = MEMORY / difficulty 1
Candidate B = MEMORY / difficulty 2
Candidate C = MEMORY / difficulty 3
Candidate D = ATTENTION / difficulty 2
```

## Feature contract

Production features may include:

```text
recent_accuracy
recent_reaction_time
recent_completion_rate
recent_abandonment_rate
failure_streak
sessions_last_7d
task_exposure_count
current_difficulty
assistance_level
input_mode
device_class
fatigue_signal
content_preference
time_of_day_bucket
task_family
candidate_difficulty
```

Every feature belongs to a versioned feature schema. Features unavailable offline are not required for the core decision; the local runtime uses the last valid feature state.

## Model contract

The initial implementation should use a small tabular model such as gradient-boosted trees. The architecture does not require a specific library, but the production artifact must be versioned and reproducible.

```text
input:
    feature_vector + candidate task/difficulty

output:
    predicted_success_probability

metadata:
    model_version_id
    feature_pipeline_version
    configuration_version
```

The model must be calibrated before production activation. Performance is evaluated overall and by relevant subgroups such as language, device class, input mode, and task family.

## Difficulty policy

The policy converts model predictions into a bounded action. The policy is deterministic given the model output, candidate set, safety constraints, and configuration version.

```text
ML predictions
      ↓
remove invalid / unavailable candidates
      ↓
apply measurement-mode restrictions
      ↓
apply accessibility and safety constraints
      ↓
select allowed candidate
      ↓
record recommendation + final action
```

The ML model must never directly bypass:

- authorization;
- consent;
- task availability;
- accessibility requirements;
- session safety limits;
- measurement-regime constraints.

## Engagement mode vs assessment mode

Two explicit modes are required:

```text
ENGAGEMENT_MODE
    → ML may personalize difficulty/task family/presentation within bounds

ASSESSMENT_MODE
    → measurement contract is protected; ML cannot silently change measured conditions
```

In `ASSESSMENT_MODE`, candidate generation is restricted to an approved measurement regime. A change in task version, difficulty regime, input mode, assistance level, or other contract-defining context creates an explicit regime boundary.

This prevents the system from interpreting easier tasks as cognitive recovery.

## Fallback behavior

The ML Difficulty Engine must fail closed to a deterministic safe policy when:

```text
model unavailable
model artifact invalid
feature set incomplete
model assignment expired
inference timeout
output outside valid probability range
unsupported device/runtime
```

Fallback is a product-continuity mechanism, not a second hidden ML model. The fallback action is versioned and logged.

## Device compatibility gate for on-device inference

"Unsupported device/runtime" (above) is only a meaningful fallback trigger if the app actually knows, ahead of shipping, which devices are supported. On-device ML inference must not be enabled on a device model that has not been explicitly validated — Appendix C's "supported devices" decision is a hard prerequisite for enabling inference, not a parallel-track open item.

```text
before enabling on-device inference for a device_model:
     ↓
runtime (e.g. TFLite) is benchmarked on that exact device_model
    (or a documented equivalence class) for:
        - inference latency under realistic concurrent load (game UI + audio)
        - memory headroom against the device's budget (§11)
        - crash/ANR rate over a soak test, not a single smoke test
     ↓
device_model is added to a maintained compatibility list (locally cached,
    server-updatable) with a pass/fail/untested status
     ↓
app checks this list at runtime before loading the model:
    pass    → on-device inference enabled
    fail / untested → deterministic fallback policy only; inference is never
                       attempted "optimistically" on an unvalidated device
```

Rules:

- an untested device defaults to the deterministic fallback policy, not to an attempted model load — the failure mode for an unknown device must be "safe and slightly less personalized," not "possible crash/ANR";
- the compatibility list is server-updatable so a device model discovered to be problematic in the field can be moved to fallback-only without an app release;
- `ml_difficulty_fallback_rate` (already tracked, §19) broken down by `device_model` is the primary signal for keeping this list accurate — a device with a persistently high fallback rate should be investigated and either fixed or explicitly marked unsupported;
- this gate applies equally to the model-package install itself, which follows the atomic-install protocol defined in §8.

## Shadow mode and promotion

A new model version should initially run in shadow mode:

```text
actual production decision
        │
        ├── existing active policy/model
        │
        └── shadow ML model
                 ↓
          prediction logging
                 ↓
       outcome comparison
```

Shadow predictions do not affect patient experience. Promotion requires predefined evaluation thresholds, calibration checks, subgroup review, runtime compatibility, safety review, and rollback readiness.

## Explainability

The caregiver UI does not need to expose raw model internals. The system must, however, retain structured decision provenance such as:

```text
model_version_id
candidate_set
predicted_success_probability
selected_candidate
policy_version
fallback_used
measurement_mode
```

The human-readable explanation should describe the action without presenting the prediction as a clinical judgment.

## ML training data

Training examples are constructed from decision points rather than isolated scores:

```text
patient/session state
+ candidate task/difficulty
→ observed completion outcome
```

The training dataset must use patient-level splits to prevent leakage across sessions from the same patient. Synthetic data may be used to test the pipeline but cannot be presented as evidence of clinical efficacy.

## Production boundaries

The ML Difficulty Engine is a production product model, but it is not a clinical model. Contextual bandits, learned clinical measurement models, speech biomarkers, disease-risk models, federated learning, and automated treatment optimization remain outside the production decision path.

---

## Model artifact model

Model packages are downloaded and installed on-device using the same atomic write-to-temp + checksum-verify + atomic-swap protocol defined for content packs (§8 "Atomic pack installation"); a partial or corrupted model download must never reach `MLDifficultyModelRuntime`, and the device continues on its last-known-good model until a new package completes a verified swap.

Production and future models use:

```sql
CREATE TABLE model_versions (
    model_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    purpose VARCHAR(80) NOT NULL,
    semantic_version VARCHAR(50) NOT NULL,
    artifact_uri TEXT NOT NULL,
    artifact_checksum CHAR(64) NOT NULL,
    runtime_version VARCHAR(50) NOT NULL,
    model_card_uri TEXT,
    evaluation_report_uri TEXT,
    status VARCHAR(30) NOT NULL,
    approved_by UUID REFERENCES actors(actor_id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (model_name, semantic_version)
);
```

## Required model provenance

A production model output must point to:

```text
model_version_id
feature_pipeline_version
configuration_version
input_snapshot_id
runtime_version
inference_timestamp
execution_device_id (when edge)
model_output_schema_version
```

## Immutable input snapshot

`input_snapshot_id` references an immutable stored feature set, not merely a URI whose contents can change.

```sql
CREATE TABLE model_input_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_schema_version VARCHAR(30) NOT NULL,
    feature_pipeline_version VARCHAR(30) NOT NULL,
    content_hash CHAR(64) NOT NULL,
    object_uri TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

For the Difficulty Engine, `model_input_snapshots` may contain the feature vector used at a decision point. The snapshot must exclude unnecessary patient identifiers and follow the retention policy for derived behavioral features.

## Edge model assignment

```sql
CREATE TABLE device_model_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(device_id),
    model_version_id UUID NOT NULL REFERENCES model_versions(model_version_id),
    assigned_at TIMESTAMPTZ NOT NULL,
    activated_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    assignment_status VARCHAR(30) NOT NULL
);
```

The application must enforce that at most one model assignment is active for a device at a time. Historical assignments remain immutable.

## Model run

```sql
CREATE TABLE model_runs (
    model_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id),
    device_id UUID REFERENCES devices(device_id),
    model_version_id UUID NOT NULL REFERENCES model_versions(model_version_id),
    input_snapshot_id UUID NOT NULL REFERENCES model_input_snapshots(snapshot_id),
    feature_pipeline_version VARCHAR(30) NOT NULL,
    configuration_version VARCHAR(30) NOT NULL,
    output_schema_version VARCHAR(30) NOT NULL,
    output JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Model provenance explicitly identifies the device context used for a production decision.

## Difficulty decision record

Every production difficulty inference must be reproducible. Store the model prediction separately from the final policy action:

```sql
CREATE TABLE difficulty_decisions (
    decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id),
    device_id UUID REFERENCES devices(device_id),
    session_id UUID NOT NULL,
    model_run_id UUID,
    model_version_id UUID NOT NULL REFERENCES model_versions(model_version_id),
    feature_pipeline_version VARCHAR(30) NOT NULL,
    configuration_version VARCHAR(30) NOT NULL,
    policy_version VARCHAR(30) NOT NULL,
    measurement_mode VARCHAR(30) NOT NULL,
    candidate_set JSONB NOT NULL,
    predictions JSONB NOT NULL,
    selected_candidate JSONB,
    fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
    fallback_reason VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The record must never be interpreted as a clinical recommendation.

---

# 15. Consent, Privacy, and Data Lifecycle

The existing consent architecture is strong but must cover the newly explicit product capabilities.

## Processing purposes

At minimum, distinguish:

```text
CORE_CARE
COGNITIVE_MEASUREMENT
REMINDERS
VOICE_ACCESSIBILITY
FAMILY_MEDIA
SOCIAL_FEATURES
RESEARCH
MONITORING_SPEECH
```

A user can enable one purpose without implicitly enabling another.

## Data minimization

Collect only what is necessary for the selected feature. For example:

- a spoken reminder acknowledgment need not become a stored audio recording;
- family photos need not become training data;
- UI accessibility settings need not become medical history;
- engagement metrics need not be presented as clinical measurements.

## Local privacy

The Android application must support:

```text
encrypted local database
secure key storage
automatic session expiry
protected caregiver mode
remote/local purge directives
minimum cached patient data
```

Sensitive content should be hidden from system previews/recents where platform controls permit.

---

## Deletion states

```text
ACTIVE
 ↓
DELETION_REQUESTED
 ↓
PROCESSING_DISABLED
 ↓
PRIMARY_DATA_REMOVED
 ↓
MEDIA_REMOVED
 ↓
LOCAL_PURGE_PENDING
 ↓
DELETION_COMPLETED
```

## Processing freeze

At deletion request/revocation:

- stop new processing for affected purposes;
- stop model training inclusion;
- revoke device scopes where appropriate;
- issue local purge directives;
- prevent new notification generation for deleted/blocked subjects.

## Event ledger deletion

The architecture explicitly chooses one of two policies per data class:

1. **Retain non-sensitive event fact** when it is genuinely necessary and permitted; or
2. **Delete/redact the patient-specific payload** when deletion applies.

Do not claim impossible universal replayability after deletion.

## Training datasets

Training datasets are immutable extracts with subject membership manifests.

A deletion request marks a subject excluded from future training. Existing models remain historical artifacts; there is no claim of automatic machine unlearning unless a separate unlearning capability is implemented and validated.

Training-data handling does not imply automatic retroactive unlearning from every derived artifact.

---

# 16. Security, Audit, and Threat Model

## Audit intent

Audit logs answer:

- who did what;
- to which resource;
- when;
- from which authenticated context;
- with what authorization decision;
- whether the action succeeded.

## Audit record

```sql
CREATE TABLE audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id UUID,
    device_id UUID,
    patient_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    decision VARCHAR(20),
    request_id UUID,
    metadata JSONB,
    previous_hash CHAR(64),
    row_hash CHAR(64) NOT NULL
);
```

The hash chain is tamper-evident, not tamper-proof. A privileged database operator who destroys the entire audit store can still destroy evidence; therefore audit export is periodically written to a separately controlled immutable archive.

That is the actual security property.

---

Minimum threats tested before pilot:

| Threat | Required control |
|---|---|
| Lost tablet | encrypted storage, device revocation, local session expiry |
| Stolen actor credentials | credential revocation, session revocation, audit trail |
| Patient profile switching | explicit actor/device/patient authorization |
| Replayed event | event ID + sequence + signature + payload hash |
| Forged event | device-key signature verification |
| Compromised enrolled device | anomaly detection + revocation + semantic validation |
| Clock manipulation | skew detection + bounded offline package lifetime |
| Key rotation ambiguity | explicit device key ID per event |
| Wrong caregiver notification | authorization evaluated when intent is created |
| Malicious media | type allowlist + scan + signed URLs |
| Data deletion race | processing freeze + deletion state machine |
| Backend compromise | least privilege + isolated secrets + audit + backup controls |
| Model artifact tampering | artifact checksum/signature verification |
| Model regression | canary + evaluation gate + rollback |
| Alert spam | deterministic suppression/rate limiting |

Threats are addressed through explicit protocol, data-model, and operational controls.

---

# 17. API, Data, Query, and Persistence Architecture

Extend the public API groups with explicit product domains:

```text
/v1/auth/*
/v1/patients/*
/v1/caregivers/*
/v1/devices/*
/v1/sync/*
/v1/games/*
/v1/measurements/*
/v1/trajectory/*
/v1/observations/*
/v1/reminders/*
/v1/content/*
/v1/localization/*
/v1/voice/*
/v1/memory/*
/v1/engagement/*
/v1/difficulty/*
/v1/notifications/*
/v1/interventions/*
/v1/admin/*
```

The `/v1/voice/*` surface should not imply storage of recordings; it can cover voice capability/configuration and accessibility assets.

The `/v1/memory/*` surface must enforce patient/caregiver authorization and media access policy.

---

Add the following domain entities to the implementation backlog:

```text
elder_ui_preferences
locales
content_packs
content_pack_versions
voice_profiles
reminders
reminder_occurrences
memory_items
memory_item_access
engagement_observations
social_interactions
accessibility_contexts
difficulty_decisions
ml_feature_snapshots
care_followups
```

These are domain models, not necessarily separate microservices.

## Key relationships

```text
patient
 ├── preferences
 ├── reminders
 ├── memory items
 ├── content/locale assignment
 ├── sessions
 ├── measurements
 ├── engagement observations
 ├── caregiver observations
 └── care follow-ups

patient + device + session + context
        ↓
   measurement observation
        ↓
      baseline
        ↓
    trajectory
        ↓
 caregiver observation
```

---

## Patients

```sql
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_health_id VARCHAR(64) UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);
```

## Actors

```sql
CREATE TABLE actors (
    actor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE actor_credentials (
    credential_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(actor_id),
    credential_type VARCHAR(30) NOT NULL,
    credential_hash TEXT,
    credential_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);
```

Credential secrets/tokens must never be stored in plaintext.

## Centers and temporal assignments

```sql
CREATE TABLE centers (
    center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE TABLE actor_center_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(actor_id),
    center_id UUID NOT NULL REFERENCES centers(center_id),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    granted_by UUID REFERENCES actors(actor_id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES actors(actor_id)
);
```

## Patient access relationships

```sql
CREATE TABLE actor_patient_access (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES actors(actor_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    relationship VARCHAR(50),
    scope VARCHAR(30) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    granted_by UUID REFERENCES actors(actor_id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES actors(actor_id)
);
```

Do not use a unique `(actor_id, patient_id)` constraint; a relationship can legitimately be granted, revoked, and granted again.

## Devices and keys

```sql
CREATE TABLE devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type VARCHAR(30) NOT NULL,
    owning_center_id UUID REFERENCES centers(center_id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    app_version VARCHAR(30),
    os_version VARCHAR(30),
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE device_keys (
    device_key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(device_id),
    key_generation INTEGER NOT NULL,
    algorithm VARCHAR(30) NOT NULL,
    public_key TEXT NOT NULL,
    activated_at TIMESTAMPTZ NOT NULL,
    retired_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    UNIQUE(device_id, key_generation)
);
```

## Device patient scope

```sql
CREATE TABLE device_patient_scopes (
    scope_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(device_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    granted_by UUID REFERENCES actors(actor_id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES actors(actor_id)
);
```

## Device sessions

```sql
CREATE TABLE device_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(device_id),
    actor_id UUID REFERENCES actors(actor_id),
    patient_id UUID,
    auth_package_id UUID,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_online_validation_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    ended_at TIMESTAMPTZ
);
```

## Consent

Consent is a versioned processing-purpose record, not merely `granted_at/revoked_at`.

```sql
CREATE TABLE consent_grants (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    purpose VARCHAR(50) NOT NULL,
    policy_version VARCHAR(30) NOT NULL,
    granted_by UUID REFERENCES actors(actor_id),
    granted_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES actors(actor_id),
    source VARCHAR(30) NOT NULL
);
```

The exact legal meaning of each `purpose` remains subject to the required legal review before deployment. The architecture does not claim that a database schema alone establishes legal consent.

---

## Public API groups

```text
/v1/auth/*
/v1/patients/*
/v1/caregivers/*
/v1/devices/*
/v1/sync/*
/v1/games/*
/v1/measurements/*
/v1/trajectory/*
/v1/observations/*
/v1/interventions/*
/v1/reminders/*
/v1/content/*
/v1/notifications/*
```

The public API is REST/HTTPS. Internal module calls are function/service calls inside the monolith, not HTTP.

## Sync endpoint

```http
POST /v1/sync/batch
Authorization: DeviceSignature ...
Content-Type: application/json
Idempotency-Key: <request-id>
```

## Error contract

```json
{
  "error": {
    "code": "DEVICE_SCOPE_REVOKED",
    "message": "The device is no longer authorized for this patient.",
    "request_id": "..."
  }
}
```

Client UI must use stable `code` values; human-readable `message` text is not an API contract.

## Pagination

Cursor pagination for all unbounded lists.

Never use offset pagination on long-lived measurement/alert tables.

## Rate limiting

Separate limits for:

- actor API traffic;
- device sync traffic;
- media upload;
- admin/model operations.

A shared ASHA tablet must not share the same rate-limit identity as one individual actor.

---

The initial database workload is PostgreSQL. Design indexes around actual access paths.

Required initial indexes:

```text
actor_patient_access(actor_id, patient_id, valid_from, valid_until)
device_patient_scopes(device_id, patient_id, valid_from, valid_until)
device_sessions(device_id, status, expires_at)
event_ledger(device_id, client_sequence)
event_ledger(patient_id, server_received_at)
measurement_observations(patient_id, measurement_definition_id, observed_at)
measurement_observations(source_event_id)
caregiver_observations(patient_id, status, created_at)
notification_deliveries(status, created_at)
job_queue(status, available_at, priority)
```

Before adding TimescaleDB or another database, prove PostgreSQL cannot satisfy the measured workload.

The initial capacity assumptions are planning inputs rather than measured limits. PostgreSQL remains the default until measured workload proves otherwise.

---

# 18. Notifications and Asynchronous Processing

## Transactional model

Use an outbox.

```text
caregiver_observation
      ↓ same DB transaction
notification_intent
      ↓
notification worker
      ↓
provider
      ↓
notification_delivery
```

## Idempotency

The internal idempotency key is the `intent_id`.

Provider-side behavior is treated as at-least-once.

Duplicate provider messages are an operational possibility and must be monitored.

## Delivery states

```text
queued
sending
sent
provider_accepted
delivered
failed
expired
acknowledged
```

A provider's `sent` status must not be displayed as “delivered” unless the provider actually supplies that state.

---

PostgreSQL-backed jobs remain acceptable for the pilot.

## Job contract

```text
job_id
job_type
idempotency_key
priority
payload
attempt_count
available_at
lease_until
last_error
status
created_at
completed_at
```

## Job classes

Separate logical queues:

```text
CRITICAL_NOTIFICATION
EVENT_PROJECTION
TRAJECTORY_RECOMPUTE
MEDIA_CLEANUP
DATA_DELETION
MODEL_EVALUATION
MAINTENANCE
```

The queues can share one worker process initially.

## Contention-safe claiming

Five job classes (projection, trajectory, notification, privacy/deletion, maintenance) polling the same PostgreSQL table concurrently will contend badly if workers use a naive `SELECT ... WHERE status = 'pending' LIMIT N` followed by a separate `UPDATE`: multiple workers can select the same rows before either commits, and even with correct locking, a plain `SELECT ... FOR UPDATE` blocks other workers on the locked rows instead of skipping past them. This produces lock contention and worker timeouts well before pilot volume, and undermines the deferred-infrastructure argument in §24 (a dedicated queue only becomes unnecessary if the PostgreSQL-backed one is implemented correctly).

The required claim pattern:

```sql
WITH claimed AS (
    SELECT job_id
    FROM jobs
    WHERE status = 'pending'
      AND available_at <= now()
      AND job_type = ANY($1)          -- worker's assigned queue(s)
    ORDER BY priority DESC, available_at ASC
    LIMIT $2                           -- worker batch size
    FOR UPDATE SKIP LOCKED
)
UPDATE jobs
SET status = 'in_progress',
    lease_until = now() + $3,
    attempt_count = attempt_count + 1
FROM claimed
WHERE jobs.job_id = claimed.job_id
RETURNING jobs.*;
```

Rules:

- every worker claim goes through `FOR UPDATE SKIP LOCKED` (or an equivalent contention-safe claim, if a managed queue library is used later) — a worker never blocks waiting on rows another worker already has;
- a composite index on `(status, job_type, available_at)` (or per-queue partial indexes) is required so the claim query does not degrade to a sequential scan as the table grows;
- `lease_until` bounds how long a claimed-but-not-completed job blocks re-claiming; a worker that crashes mid-job releases its claim automatically once the lease expires, and a sweep job requeues expired leases;
- job classes may share one physical table and one worker pool initially (per the existing design), but each worker process should claim by an explicit `job_type` allowlist so a burst in one class (e.g. `EVENT_PROJECTION` during a reconnection storm, §24) cannot starve `CRITICAL_NOTIFICATION`;
- this is a correctness requirement for the pilot scale already planned, not a scale-up optimization — without it, the "PostgreSQL-backed jobs remain acceptable for the pilot" decision above does not actually hold.

## Job rules

Every job:

- is safe to retry;
- has bounded attempts;
- enters a dead-letter state after terminal failure;
- carries a correlation ID;
- records execution duration;
- can be manually replayed when safe.

---

# 19. Observability, SLOs, and Failure Semantics

Infrastructure metrics alone are insufficient. Add product-health metrics:

```text
app_crash_rate
session_start_success
session_completion_rate
offline_days_supported
sync_backlog_age
reminder_trigger_success
reminder_completion_mark_rate
voice_prompt_success
content_pack_install_failure
localization_fallback_rate
accessibility_mode_usage
caregiver_ack_latency
observation_review_rate
measurement_exclusion_rate
social_feature_participation
ml_difficulty_inference_rate
ml_difficulty_fallback_rate
ml_prediction_calibration_error
ml_subgroup_performance_gap
```

Break down critical metrics by:

```text
language
region
app_version
device_model
OS_version
input_mode
content_pack_version
```

This is mandatory because a feature that works in a lab language/device combination can still fail in the actual NER field.

Crash/ANR telemetry (§11 "Offline crash and ANR telemetry") is ingested into a separate crash-telemetry store, not the event ledger — crash reports are diagnostic data about the device, not signed domain facts about the patient, and must not be conflated with the measurement pipeline's integrity guarantees. `app_crash_rate` and related metrics above are sourced from this pipeline.

---

## Pilot SLOs

Initial targets:

| Capability | Initial target |
|---|---|
| Core on-device interaction | <200 ms where practical |
| API request p95 | <500 ms for ordinary CRUD/read requests |
| Sync acceptance p95 | <2 s excluding large batches/provider effects |
| Event-to-projection freshness | <5 min under normal load |
| Trajectory recomputation | <10 min after ingestion for eligible patients |
| Notification intent creation | <1 min after policy evaluation |
| Core offline availability | 100% without backend dependency |
| PostgreSQL restore target | RTO ≤4 h initially |
| Data loss target | RPO ≤15 min for server-side operational data |

These are engineering targets, not clinical guarantees.

## Metrics

Track:

```text
sync_success_rate
sync_rejection_rate
signature_failure_rate
late_event_rate
event_projection_lag
measurement_exclusion_rate
measurement_exclusion_reason_distribution
baseline_insufficient_rate
trajectory_generation_rate
alert_suppression_rate
notification_delivery_rate
notification_ack_rate
job_retry_rate
job_dead_letter_rate
device_last_seen_age
app_crash_rate
device_storage_pressure
model_package_failure_rate (future)
```

The most important new category is **measurement data quality**, not just infrastructure health.

## Data-quality monitoring

Create alarms for:

- sudden distribution shifts by device/app version;
- missing metric fields;
- unusual exclusion rates;
- impossible values;
- task-version-specific failures;
- language/device subgroup differences;
- sudden changes in session duration or event counts;
- suspiciously perfect performance patterns.

A healthy API does not imply healthy measurement data.

---

| Failure | Required behavior |
|---|---|
| Client crashes before sync | event remains locally |
| Network drops mid-batch | per-event acknowledgement; retry remaining events |
| Duplicate event | idempotent no-op |
| Same ID, different payload | integrity incident |
| Signature failure | reject/quarantine; do not project |
| Server validation bug lets an event through, later found wrong | never edit/delete the accepted event; add an `event_quarantine` record with reason, exclude from projections, append a compensating event if domain correction is needed (§12) |
| Keystore key silently invalidated on device | enter `DEGRADED_SIGNING`; queue events as `pending_signature`; do not send unsigned; attempt local re-key before falling back to guided re-enrollment (§11) |
| Content pack or model package download corrupted/partial | temp download discarded on checksum/signature failure; previously installed pack/model remains active; retry on backoff (§8, §14) |
| App crashes/ANRs while offline | crash record captured to durable local storage synchronously; uploaded via WorkManager on next connectivity, independent of and not blocking event sync (§11) |
| Reconnection burst after prolonged outage | client applies jittered resume delay and capped batch size; server applies admission control and sized connection pooling (§12, §24) |
| Job-queue workers contend on shared table | workers claim via `FOR UPDATE SKIP LOCKED`; a stalled worker's lease expires and is requeued (§18) |
| Device revoked while offline | local package expires; server rejects later ingestion |
| Consent revoked while offline | device may hold local events until reconnect; server prevents prohibited processing on receipt |
| Projection worker crashes | retry from event ledger |
| Trajectory job crashes | retry from immutable observations/snapshots |
| Notification worker crashes | outbox event remains pending |
| Provider timeout | retry safely, duplicate delivery possible |
| Model artifact invalid | never activate; retain last-known-good |
| DB unavailable | edge continues offline; server operations recover after DB restoration |
| Object store unavailable | metadata transaction does not expose unusable media |
| Patient deletion during offline accumulation | server applies deletion policy and rejects/prohibits disallowed processing |
| Late event | preserve event time and receive time; process according to event-specific policy |

Failure handling is built around immutable events and rebuildable projections so recovery does not depend on partially mutable state.

---

# 20. Field Operations, Deployment, and Disaster Recovery

The architecture assumes geographically distributed, intermittently connected deployments.

## Device topology

A tablet may be:

```text
family-owned
center-owned
health-worker-owned
shared by multiple patients
```

Patient access is always explicitly scoped.

## Field synchronization modes

Support:

```text
direct internet sync
periodic Wi-Fi sync
health-worker assisted sync
```

ASHA-assisted synchronization remains an evolution path, but the core sync protocol must already support delayed batch transfer safely.

## Field support

The fleet dashboard should highlight:

```text
no sync > threshold
low storage
low battery where available
outdated app
outdated content pack
expired authorization package
failed content/model install
high event backlog
unusual measurement exclusion
degraded signing state / pending key re-authorization
unuploaded crash/ANR backlog
```

## Regional resilience

The system must tolerate prolonged network loss without turning the device into an unusable shell. Cached games, language assets, reminder schedules, and memory content should have explicit validity periods.

---

## PostgreSQL

- continuous/WAL backup;
- daily full snapshot;
- point-in-time recovery;
- encrypted backup storage;
- restore drill at least quarterly during pilot operations.

## Object storage

- versioning where useful;
- lifecycle management;
- explicit deletion markers;
- backup strategy appropriate to retained media.

## Recovery sequence

```text
restore database
 ↓
restore object references/assets
 ↓
validate integrity checks
 ↓
start API in read-restricted recovery mode
 ↓
start projection workers
 ↓
process backlog
 ↓
reconcile notification outbox
 ↓
re-enable normal traffic
```

Recovery itself is an operational workflow, not simply “restore the database.”

---

This is now a first-class operational subsystem because the field model depends on shared Android devices.

Device management must expose:

```text
app version
OS version
last sync
last successful authentication
storage usage
battery/health indicators where available
current patient scope count
current model package version
key generation
revocation state
pending deletion directives
pending configuration
```

The initial implementation can be a normal backend/admin module. A dedicated MDM product is optional later.

---

## Initial deployment

```text
Android APKs
      ↓
HTTPS load balancer / gateway
      ↓
2+ backend replicas when production availability requires it
      ↓
managed PostgreSQL
      ↓
managed encrypted object storage
```

For local development, one backend + one PostgreSQL instance is sufficient.

## Environments

Separate:

```text
dev
staging
production
```

No real patient data in development.

## Secrets

Secrets live in a managed secret store/environment mechanism appropriate to the deployment. They are never committed to Git or packaged into the APK.

## Kubernetes

Still deferred.

Docker/container deployment is sufficient until measured operational requirements justify orchestration complexity.

---

# 21. Coding Architecture and Engineering Standards

## Backend repository

```text
src/
  modules/
    identity/
    authorization/
    devices/
    events/
    measurement/
    baseline/
    trajectory/
    caregiver-workflow/
    notifications/
    reminders/
    content/
    consent/
    privacy/
    operations/
    research/

  shared/
    db/
    crypto/
    errors/
    logging/
    config/
    clocks/
    ids/

  workers/
    projection-worker/
    trajectory-worker/
    notification-worker/
    privacy-worker/
    maintenance-worker/

  api/
    v1/

  migrations/
```

## Module rule

A module may access its own persistence directly.

Cross-module behavior goes through application services/interfaces, not arbitrary imports of internal repositories.

## Transaction rule

A request transaction should only mutate state owned by its module plus explicitly coordinated transactional records such as the outbox.

Long-running computation never occurs inside the HTTP transaction.

---

# 22. Testing and Quality Architecture

## Unit tests

Mandatory for:

- signature canonicalization;
- key rotation;
- authorization decisions;
- consent decisions;
- event validation;
- measurement extraction;
- eligibility rules;
- baseline transitions;
- trajectory calculations;
- suppression policy;
- notification idempotency;
- ML feature construction;
- ML candidate scoring;
- difficulty-policy selection;
- model fallback behavior.

## Property tests

Required for event handling:

```text
same event twice → same final state
reordered events → deterministic supported outcome
corrupted signature → never accepted
corrupted payload → never accepted
retry after timeout → no duplicate domain effect
```

## Offline integration tests

Simulate:

- 3 days offline;
- 30 patients on one tablet;
- actor switching;
- device restart;
- clock rollback;
- key rotation;
- revoked scope while offline;
- app upgrade while unsynced events exist;
- partial batch upload;
- duplicate batch upload;
- malformed event mixed with valid events.

## Measurement harness

Before any caregiver-facing trajectory feature:

```text
fixture session data
        ↓
measurement extraction
        ↓
eligibility
        ↓
baseline
        ↓
trajectory
        ↓
expected structured output
```

Golden datasets must cover:

- normal repeated performance;
- learning/practice effect;
- noisy sessions;
- device change;
- task-version change;
- missing sessions;
- outliers;
- persistent deviation;
- transient deviation.

## ML Difficulty Engine tests

Mandatory tests include:

```text
same feature vector + same model + same candidate set → same prediction
same prediction + same policy version → same selected difficulty
invalid model artifact → fallback
expired model assignment → fallback
missing feature → fallback
out-of-range probability → fallback
unsupported device/runtime → fallback
assessment mode → no unauthorized difficulty adaptation
engagement-mode adaptation → explicit decision record
model version change → historical decision reproducibility preserved
```

The ML test harness must also evaluate:

- calibration;
- patient-level train/validation/test separation;
- subgroup performance by language, device class, input mode, and task family;
- prediction stability across supported runtime versions.

## Security tests

At minimum:

- authorization matrix tests;
- replay attack tests;
- event tampering tests;
- key rotation tests;
- session expiry tests;
- token/session revocation tests;
- media upload fuzzing;
- rate-limit tests;
- privilege-escalation tests.

---

# 23. Versioning, Migration, and Backfills

Every semantic artifact has an explicit version:

| Artifact | Version field |
|---|---|
| Event envelope | `schema_version` |
| Measurement contract | `measurement_definition_id` + version |
| Extraction | `extraction_version` |
| Eligibility rules | `eligibility_policy_version` |
| Baseline | `algorithm_version` |
| Trajectory | `trajectory_version` |
| Alert policy | `policy_version` |
| App/game | `game_version` |
| Consent text/policy | `policy_version` |
| Model | `model_version_id` |
| Difficulty policy | `policy_version` + `configuration_version` |
| Difficulty decision | `decision_id` + model/policy provenance |
| Feature pipeline | `feature_pipeline_version` |
| Configuration | `configuration_version` |

A semantic change creates a new version. Do not silently reinterpret historical rows.

---

A backfill is a first-class job.

```text
historical event ledger
        ↓
selected historical time range
        ↓
measurement extraction version
        ↓
eligibility policy version
        ↓
baseline algorithm version
        ↓
trajectory version
        ↓
comparison report
```

Backfills write new versioned projections. They do not mutate the meaning of historical results.

Production caregiver data should not be replaced blindly by a backfill. A backfill produces a candidate projection that is compared and promoted under an explicit migration policy.

---

# 24. Capacity, Scalability, and Deferred Technologies

The initial planning assumptions for engineering and load testing are:

```text
~500 pilot patients
3–5 sessions/patient/day
~10–15 events/session
~15k–35k events/day
```

These are test inputs, not production capacity claims.

Initial load tests must include:

1. normal distributed ingestion;
2. reconnection storm after 24–72 hours offline;
3. trajectory backlog;
4. notification fan-out;
5. media uploads;
6. simultaneous caregiver dashboard access.

The likely first scaling problem is a **reconnection/processing burst**, not steady-state event volume.

## Reconnection storm: mitigation, not just diagnosis

Diagnosing the reconnection storm as the likely first failure is not the same as being protected against it. If a village-wide outage ends and dozens of tablets each POST several days of batched events at once, and event ledger writes, projection reads, job-queue polling, and notification queries all share one PostgreSQL instance, connection-pool exhaustion is the realistic failure mode. The following are required, not optional hardening:

**Client-side (§12):** jittered resume delay before the first post-outage batch, plus a hard cap on batch size so a device with a large backlog sends multiple bounded batches over time rather than one unbounded request.

**Server-side admission control:** the sync endpoint enforces a per-device concurrent-request limit (a device cannot have more than one in-flight sync batch) and a global sync-endpoint concurrency ceiling separate from the rest of the API, so a burst of reconnecting devices degrades sync latency gracefully rather than starving unrelated API traffic (caregiver dashboard reads, notification delivery).

**Connection pool sizing:** the backend uses a bounded connection pool (e.g. PgBouncer or equivalent in transaction-pooling mode) sized to the database's actual safe concurrent-connection limit, not to the number of application processes/threads that might want a connection simultaneously. Application-level pool size + PgBouncer pool size must be explicitly documented as a deployment parameter and included in the load test below.

**Circuit breaker for dependent work:** projection and trajectory-recomputation job classes (§18) apply backpressure — if the job queue backlog for `EVENT_PROJECTION` exceeds a defined threshold, event ingestion continues (events are still durably appended to the ledger) but the system explicitly tolerates and surfaces increased `sync_backlog_age` / `event_projection_lag` (§19) rather than allowing projection workers to starve the connection pool trying to keep up in real time. Ingestion is never blocked waiting on projection to catch up.

**Load test requirement:** the reconnection-storm load test (below) must specifically validate that, under a simulated village-wide reconnection of the pilot's full device count with multi-day backlogs, the system degrades to increased latency and queue depth — not to connection-pool exhaustion or dropped requests. This is a release gate for the field-hardening phase (§25 Phase 4), not a nice-to-have benchmark.

---

Do not implement these in the coding phase:

```text
Kubernetes
MQTT
CRDT / HLC
Bluetooth mesh
Kafka
Dedicated time-series database
Dedicated feature store
Federated learning
Contextual bandits in production
Clinical speech biomarkers
HMM/state-space trajectory models
Biometric login
Microservices
```

Each requires a measurable trigger and an ADR before introduction.

Complexity must be earned by observed requirements, not by the appearance of sophistication.

---

# 25. Implementation Roadmap

The original phase order is preserved where it is sound, but the missing product capabilities are made explicit.

## Phase 0 — Engineering foundation

Build:

- repository structure;
- database migrations;
- logging and correlation IDs;
- CI/CD;
- secrets;
- Android local database;
- design system/accessibility primitives;
- localization infrastructure;
- **offline crash/ANR telemetry capture and delayed-upload pipeline (§11, §19) — build this before any feature that could crash on-device, since it is how every subsequent phase gets diagnostic data from real hardware;**
- **memory-budget and Doze/WorkManager profiling harness for the minimum device tier (§11), run against CI from the start rather than retrofitted later.**

**Exit:** application boots in dev/staging and automated tests pass, and a deliberately-triggered test crash on the minimum device tier is captured locally and uploaded on next connectivity.

## Phase 1 — Elder offline product core

Build:

- patient/actor/device authorization;
- elder UI shell;
- caregiver-assisted mode;
- cognitive game runtime;
- ML Difficulty Engine runtime shell + deterministic fallback;
- cached content packs **installed via the atomic write-to-temp/checksum/swap protocol (§8) from the first implementation, not added later;**
- voice/TTS accessibility **with the TTS-availability check and visual-first degraded path (§8) implemented alongside the happy path, not as a follow-up;**
- local reminders;
- local memory assistance;
- local event store/signing **with the single-writer SQLite discipline (§11) and Keystore invalidation / degraded-signing path (§11) implemented from the start — these are correctness requirements for the event store, not hardening;**
- sync protocol **including client-side reconnection jitter and batch-size capping (§12);**
- basic caregiver dashboard.

**Exit:** a shared tablet can support multiple authorized patients for multiple offline days with games, reminders, cached content, and safe synchronization — validated on the minimum supported device tier (2 GB RAM class), including at least one forced Keystore-invalidation drill and one interrupted-content-pack-download drill, both of which must leave the device in a recoverable, non-crashing state.

### Coding-ready Phase 0 and Phase 1 emphasis

The first two phases also establish the concrete implementation foundations required for a shared offline device:

- actor and device enrollment;
- device key lifecycle;
- actor login and offline authorization packages;
- patient selection and shared-device isolation;
- local event storage and signing;
- sync protocol and deterministic reminders;
- reproducible migrations, configuration, correlation IDs, CI, and test infrastructure.

The Phase 1 exit condition is explicit: a shared device should support multiple authorized patients for multiple offline days and synchronize without duplicate domain effects or unauthorized patient access.

## Phase 2 — Measurement + ML difficulty + engagement

Build:

- measurement definitions;
- ML feature schema;
- ML Difficulty Engine training pipeline;
- model evaluation harness;
- shadow-mode inference;
- bounded difficulty policy;
- eligibility;
- calibration metadata;
- baseline lifecycle;
- trajectory engine;
- evidence snapshots;
- engagement metrics;
- activity/participation analytics;
- measurement-quality dashboard.

**Exit:** reproducible fixture sessions yield deterministic measurements, engagement signals, trajectories, and reproducible ML difficulty decisions; the ML model can run in shadow mode with versioned provenance and safe fallback.

## Phase 3 — Care workflow

Build:

- caregiver observations;
- reminder escalation;
- acknowledgement;
- suppression;
- interventions;
- follow-ups;
- notification outbox;
- end-to-end caregiver traceability.

**Exit:** every caregiver signal can be traced from source event → evidence → policy → intent → delivery → acknowledgement/follow-up.

## Phase 4 — Regionalization and field hardening

Build:

- prioritized NER language packs;
- voice asset evaluation;
- regional cultural content packs;
- field usability tests;
- accessibility validation;
- low-connectivity soak tests;
- fleet operations;
- field data-quality monitoring.

**Exit:** the product works for the declared target language/region matrix under real field connectivity and device conditions.

## Phase 5 — Research ML

Only after real longitudinal data exists and the production Difficulty Engine has passed its validation gate, extend into research models:

- labelled dataset pipeline;
- patient-level train/validation/test splits;
- calibration;
- subgroup evaluation;
- model cards;
- model registry;
- edge rollout;
- research experiments.

Bandit and speech remain shadow/research until they earn promotion through evidence.

## Phase 6 — Scale and interoperability

Only if measured:

- dedicated queue;
- service extraction;
- advanced device management;
- ASHA-assisted synchronization;
- ABDM/eSanjeevani integration;
- federated learning.

---

# 26. Definition of Done

The first serious release is complete only when the following requirements are true.

### Elder UX

- core flows require minimal reading;
- touch targets and typography pass the agreed accessibility review;
- voice/TTS works for supported locales;
- caregiver-assisted mode is available;
- UI preferences persist offline;
- accessibility changes are represented in measurement context where required.

### Cognitive activities

- memory, attention, pattern/object recognition, and daily-routine recall are represented by actual game/task families;
- every measured task has a stable versioned measurement definition;
- practice effects and context boundaries are handled;
- task adaptations cannot silently corrupt historical comparability.

### Localization

- every supported locale has a declared content-pack version;
- unsupported language fallback is explicit;
- culturally localized assets are versioned and signed;
- regional language/device failures are visible in operations metrics.

### Reminders

- medication, hydration, daily activity, and appointment reminders are supported;
- offline scheduling works;
- prompted/acknowledged/completed/missed states are distinct;
- missed reminders can trigger configured caregiver follow-up;
- reminder activity does not masquerade as medical adherence evidence.

### Memory + social

- authorized memory content works offline;
- family content has explicit consent and deletion semantics;
- low-bandwidth social interactions can queue for synchronization;
- engagement signals are not represented as medical diagnoses.

### Caregiver/health-worker

- dashboards show activity, reminders, observations, and evidence;
- each observation links to underlying evidence;
- caregiver actions are auditable;
- role permissions are tested;
- no diagnostic claim is displayed by default.

### Field readiness

- prolonged offline testing passes;
- reconnection storms pass;
- shared-device isolation passes;
- target device classes pass usability tests;
- supported language packs pass voice/content QA;
- restore and deletion drills have been completed.

---

The system is not ready to leave engineering when every endpoint returns 200.

It is ready when all of these are true:

### Offline

- application works without internet;
- multiple patients can share one tablet;
- actors cannot access patients outside their cached authorization scope;
- expired offline authorization stops use;
- events survive process/device restart.

### Integrity

- every server-accepted edge event has a valid signature;
- key generation is recorded;
- tampered payloads are rejected;
- duplicate events are idempotent;
- same ID with different payload is detected.

### ML Difficulty Engine

- active model assignment is explicit and versioned;
- difficulty predictions are reproducible;
- model fallback is tested;
- candidate set and selected action are stored;
- assessment mode cannot be silently altered by ML;
- model evaluation includes calibration and subgroup checks.

### Measurement

- measurement definitions are versioned;
- eligibility is explicit and reason-coded;
- device/game changes are tracked;
- baseline lifecycle is deterministic;
- evidence IDs are stored;
- one bad session cannot create an escalation.

### Authorization

- every protected endpoint has authorization tests;
- actor/patient access is temporal;
- center assignments are temporal;
- revocation works server-side;
- device possession alone never grants access.

### Operations

- DB restore has been tested;
- job retries are idempotent;
- notification outbox works after worker crashes;
- dashboard shows sync backlog and measurement-quality health;
- alerts can be traced end-to-end by correlation ID.

### Safety boundary

- no diagnosis is generated;
- no production bandit exists;
- the ML Difficulty Engine has a valid approved model assignment or uses the deterministic fallback;
- no unvalidated speech biomarker affects caregiver decisions;
- model outputs cannot bypass deterministic safety policy.

---

# 27. Architecture Review Checklist

In addition to the original twelve questions, every elder-facing feature must answer:

13. Can the elder complete it without internet?
14. What happens if the elder taps the wrong thing?
15. What is the voice/TTS fallback?
16. What happens for the supported regional languages?
17. Does the feature change measurement comparability?
18. Is the feature engaging enough to be used repeatedly?
19. What happens after a missed reminder?
20. Does the feature expose or retain more patient data than necessary?
21. Can a caregiver understand the output without interpreting a clinical score?
22. Can the feature be safely used on a shared tablet?

If these cannot be answered, the feature is not ready for field deployment.

---

Before approving a significant change, answer:

1. What invariant does this change strengthen or preserve?
2. Does it introduce new state that must survive offline operation?
3. Can it create a new authorization path?
4. What happens when the network disappears halfway through?
5. What happens when the device is old for 30 days?
6. Can the operation be retried safely?
7. What evidence proves the measurement is still comparable to historical data?
8. What version identifies its semantics?
9. How is the output reproduced six months later?
10. How is the data deleted?
11. What metric tells us this subsystem is failing?
12. Is this complexity actually required by a measured product requirement?

If these questions cannot be answered, the feature is not architecturally ready.

---

# 28. Problem-Statement Traceability

This matrix is the acceptance contract between the stated NER problem and the architecture. A requirement is only considered covered when there is a concrete product capability, domain model, or operational control behind it.

| Problem requirement | Architectural capability | Release status | Evidence / implementation anchor |
|---|---|---|---|
| Memory improvement | Memory game family + versioned measurement contracts | MVP | Cognitive game architecture + measurement engine |
| Attention/concentration | Attention task family | MVP | Cognitive game architecture |
| Daily routine recall | Daily Recall task family + routine assistance | MVP | Cognitive game architecture + reminder domain |
| Pattern/object recognition | Pattern & Object task family | MVP | Cognitive game architecture |
| Adaptive difficulty | ML Difficulty Engine + bounded fallback policy + versioned model assignment | MVP | Section 14 — Adaptive ML Difficulty Engine |
| Multilingual support | Locale + signed offline content packs | MVP for declared locales | NER localization architecture |
| Voice assistance | TTS/voice accessibility layer | MVP for supported device/language combinations | Voice architecture |
| Cultural familiarity | Region-aware content packs | Field-hardening phase | Cultural content architecture |
| Medication reminders | Reminder domain + lifecycle | MVP | Reminder architecture |
| Hydration reminders | Reminder domain + lifecycle | MVP | Reminder architecture |
| Daily activity reminders | Reminder domain + routine schedules | MVP | Reminder architecture |
| Medical appointments | Reminder domain + appointment type | MVP | Reminder architecture |
| Caregiver monitoring | Caregiver dashboard + observation workflow | MVP | Caregiver architecture |
| Healthcare worker support | Health-worker mode + follow-up workflow | Field phase | Care architecture |
| Offline operation | Local state + signed event buffer + local reminders | Core | Offline-first product contract |
| Secure patient data | AuthZ + encryption + consent + audit + deletion | Core | Core security/privacy architecture |
| Elder-friendly UI | Elder mode + accessibility primitives | Core | Elder UX architecture |
| Emotional engagement | Engagement metrics + patient-reported check-ins | MVP/field validation | Engagement architecture |
| Social interaction | Family/media/message features | MVP/field validation | Social architecture |
| Long-term cognitive engagement | longitudinal baselines + engagement trends + preferences | Core | Measurement/personalization architecture |
| Early intervention support | persistent observed changes + human follow-up workflow | Field validation | Trajectory + care workflow |

The architecture must not claim support for a requirement merely because a generic backend primitive could theoretically implement it. The release status above reflects what the architecture explicitly defines.

---

# 29. Final Architecture Judgment

SmritiSaathi should be presented as:

> **An offline-first, multilingual cognitive-care and memory-assistance platform for elderly users in geographically underserved regions, combining adaptive cognitive activities, longitudinal behavioral measurement, personalized reminders, memory support, culturally relevant content, voice accessibility, and caregiver intelligence.**

The architecture is deliberately split into three maturity levels:

```text
PRODUCT RUNTIME
────────────────────────────────────────────
Games • Voice • Localization • Reminders
Memory • Engagement • Social • Caregiver UX
Offline-first operation • Security

MEASUREMENT RUNTIME
────────────────────────────────────────────
Versioned tasks • Eligibility • Baselines
Trajectory • Evidence • Data-quality controls

RESEARCH RUNTIME
────────────────────────────────────────────
Learned models • Speech biomarkers
Contextual bandits • Federated learning
Advanced predictive/clinical models
```

The key principle is unchanged: **do not use AI complexity to hide product gaps or evidence gaps.** Build the reliable elder experience first, instrument it correctly, establish field validity, and only then promote learned intelligence into production.

The implementation target is therefore no longer just the backend engine. It is the complete **Elder Experience + Smriti Engine + Care Network** system.

---

# Appendix A — Architecture Evolution and Corrections

## Purpose of the appendix

This appendix records the major architectural corrections and scope decisions that led to the current design. It is intentionally separated from the main architecture so the core document describes the present system without requiring the reader to understand its history first.

## Evolution of the architecture

The architecture evolved toward stronger semantic boundaries, particularly around offline trust, event integrity, measurement validity, model provenance, privacy deletion, and production-versus-research intelligence.


| Earlier concept | Current decision |
|---|---|
| One scalar `quality_score >= 0.4` as validity gate | Replaced by explicit eligibility + exclusion reason; score is diagnostic |
| `confidence` without a precise probabilistic target | Replaced by evidence quality/deviation/persistence; probability reserved for defined predictive models |
| “counterfactual” bandit logging | Removed; observational outcomes are not called counterfactual |
| `experiment_cohorts` as generic experiment mechanism | Split software canaries from scientific experiments |
| Permanent absolute event-log replay guarantee | Replaced with retained-data replay subject to deletion policy |
| Mutable sync flags on canonical events | Removed; delivery/projection state is separate |
| `model_runs` without direct device identity | Added `device_id` |
| `devices.key_generation` as sole key-history concept | Replaced with explicit `device_keys` and `device_key_id` per event |
| Single mutable actor/patient link | Replaced with temporal access history |
| Minimal consent table | Expanded to processing purpose + policy version + source |
| Offline “session TTL” as if device clock were trusted | Added explicit clock-skew/restricted-state handling |
| Bandit in the near-term architecture | Research-only until experimental design and reward definition are valid; ML Difficulty Engine is the approved bounded production model |
| Time-series DB as an implied scaling concern | PostgreSQL remains the default until measured workload proves otherwise |
| Family moderation as a central architecture concern | Kept as an isolated product subsystem |
| MLOps maturity before evidence maturity | Research lifecycle separated from production runtime |

---

# Appendix B — Glossary

## Purpose

This glossary defines recurring terms used across the architecture. Definitions are intentionally operational rather than clinical.

| Term | Definition |
|---|---|
| **Actor** | A human or system principal that performs an action; examples include caregivers, health workers, administrators, and service principals. |
| **Patient scope** | The explicit set of patient records a device or actor is authorized to access. |
| **Offline authorization package** | A server-issued, signed package that allows bounded offline use for a defined actor, device, patient scope, action set, and lifetime. |
| **Canonical event** | An accepted, immutable domain fact stored in the event ledger and attributable to a device key and event identity. |
| **Measurement contract** | The versioned definition of what a task measures, how it is extracted, what unit is used, and what context is required for comparability. |
| **Eligibility** | A reason-coded decision determining whether a measurement is suitable for longitudinal analysis. |
| **Observation** | A human-readable, non-diagnostic representation of observed change or engagement derived from eligible evidence. |
| **Evidence snapshot** | The versioned evidence and policy references used to support an observation or care signal. |
| **Assessment mode** | A protected measurement regime in which personalization cannot silently change contract-defining conditions. |
| **Engagement mode** | A product mode in which bounded personalization can adjust difficulty, pacing, presentation, or task choice. |
| **Content pack** | A versioned, signed bundle of offline language, cultural, game, audio, or media assets. |
| **Projection** | A rebuildable operational read model derived from retained canonical events. |
| **Last-known-good model** | The most recent verified and approved ML artifact that the device can safely continue using when an update is unavailable or invalid. |

---

# Appendix C — Open Implementation Decisions

## Purpose

These are areas the architecture intentionally leaves deployment- or product-specific. They should be resolved before the corresponding capability is treated as field-final.

| Area | What must be explicitly declared |
|---|---|
| Supported devices | Official Android device classes, OS versions, storage constraints, and runtime compatibility. |
| Supported locales | The initial language/region matrix, voice availability, fallback locale, and QA status. |
| Offline authorization | Maximum offline package lifetime, renewal rules, restricted-state behavior, and operational escalation path. |
| Measurement contracts | Exact task definitions, eligibility rules, calibration assumptions, and context-boundary rules. |
| Notification delivery | Initial provider, delivery guarantees, retry limits, and failure escalation. |
| Retention | Retention periods for events, media, voice-derived data, audit records, projections, and research datasets. |
| Capacity | Validated limits for patients/device, local event backlog, media volume, sync batch sizes, and worker throughput. |
| Interoperability | Trigger conditions and scope for ABDM/eSanjeevani or other integrations. |
| Model deployment | Exact runtime/artifact format, signing authority, promotion thresholds, and rollback procedure. |
