# Tech Stack & Technical Approach

## 1. Technology Stack

### Core Framework & Language
* **Framework:** React Native (v0.86.3) powered by Expo (v57.0.20)
* **Language:** TypeScript
* **Routing:** Expo Router for file-based routing and navigation

### State Management & Data
* **State Management:** Zustand for lightweight, scalable, and reactive global state.
* **Local Persistence:** `@react-native-async-storage/async-storage` combined with Zustand's persist middleware for a robust local-first architecture.
* **Local Database:** `expo-sqlite` for structured local querying and caching.

### Backend & Cloud Services
* **Backend Platform:** Firebase (Authentication, Firestore, Cloud Functions) for real-time data synchronization between the Elder and Caregiver.
* **Storage:** `@aws-sdk/client-s3` for handling potential external media and `expo-file-system` for robust local file handling.

### Artificial Intelligence & Analytics
* **Generative AI:** `@google/genai` (Google Gemini API) to power intelligent insights, dynamic conversation, and contextual responses.
* **Local Machine Learning:** `brain.js` for on-device, privacy-preserving neural network computations (e.g., analyzing behavioral patterns or cognitive trends locally).
* **Data Visualization:** `react-native-chart-kit` and `react-native-svg` for plotting trends and analytics on the Caregiver dashboard.

### UI, UX, & Accessibility
* **Icons:** `@expo/vector-icons` (MaterialIcons)
* **Fonts:** `@expo-google-fonts` (Specifically leveraging Atkinson Hyperlegible, IBM Plex Sans, and Nunito to ensure maximum readability for elderly users).
* **Internationalization:** `i18n-js` and `expo-localization` to easily adapt the UI for users speaking different languages (e.g., Hindi, English).
* **Media & Notifications:** `expo-av` for audio feedback/alarms, and `expo-notifications` for local and push reminders.

---

## 2. Technical Approach & Architecture

### Dual-Persona Application (Single Codebase)
Rather than building two separate apps, the application utilizes a **single monolithic mobile codebase** with distinct UI boundaries for its two user personas: **Elder** and **Caregiver**.
* **Expo Router Groups:** By utilizing route groups (`(elder)` and `(caregiver)`), the app isolates the navigation trees, layouts, and UX paradigms of each persona while allowing them to seamlessly share underlying core logic and data stores.

### Local-First & Offline-Capable Strategy
Elderly users may have unreliable internet connections, and caregivers need instant access to information.
* **Zustand Persistence:** All core app state (Patient Profiles, Reminders, Tasks, Appointments, Alerts) is stored locally first using `AsyncStorage`.
* **Optimistic UI Updates:** Changes made in either mode instantly reflect on the local UI without waiting for network calls.
* **Synchronization Pipeline:** The store tracks `lastUpdated` timestamps and `syncStatus` (`synced`, `syncing`, `offline`). A background worker (using Firebase) acts as a synchronization layer, reconciling local changes with the remote database (Stage 6 Implementation).

### Accessibility-Driven Design (Elder Mode)
The Elder UI is not just a stylistic choice but a technical requirement:
* **Typography:** Strict adherence to high-legibility fonts (Atkinson Hyperlegible).
* **Contrast & Sizing:** Large touch targets, simplified semantic layouts, and high-contrast color modes to accommodate visual impairments.
* **Audio-Visual Cues:** Heavy reliance on iconography and localized string representations to reduce cognitive load.

### Intelligence at the Edge
To ensure privacy and reduce latency, the app splits its AI capabilities:
1. **On-Device (brain.js):** Tracking localized, micro-interactions (e.g., task completion times, domain scores) to identify baseline cognitive deviations without sending sensitive telemetry over the wire.
2. **Cloud-Based (Gemini API):** Handling heavy-lifting LLM tasks, such as generating dynamic health summaries, providing conversational assistance, or re-structuring complex medical jargon into easy-to-understand formats.
