# CogniCare - Elder Care & Cognitive Monitoring System

## 1. Project Information

- **Project Title:** CogniCare
- **PS ID:** [ENTER YOUR PS ID HERE]
- **PS Title:** [ENTER YOUR PS TITLE HERE]
- **Category:** Software
- **Theme:** MedTech / Healthcare

## 2. Problem Statement

Elderly individuals often struggle with daily routines, medication adherence, and early signs of cognitive decline. Concurrently, their caregivers lack real-time visibility into the elder's wellbeing and face difficulties managing tasks and appointments efficiently. Existing solutions are either too complex for elders or lack integrated caregiver monitoring tools.

## 3. Proposed Solution

**CogniCare** is a dual-persona mobile application designed specifically for both elders and their caregivers. 

For **Elders**, the app provides a highly accessible, high-contrast, and simplified interface (Elder Mode) that focuses on daily routines, medication reminders, and easy access to emergency contacts.
For **Caregivers**, the app provides a comprehensive dashboard (Caregiver Mode) allowing them to track the elder's tasks, assign new routines, monitor medication adherence, and receive critical alerts in real-time. The app functions entirely offline-first, syncing data automatically when a connection is available.

## 4. Key Features

- **Dual-Persona UI:** Dedicated simplified "Elder Mode" and advanced "Caregiver Dashboard".
- **Routine & Task Management:** Caregivers can assign tasks (e.g., "Take medication", "Drink water") which sync to the Elder's "My Day" view.
- **Real-Time Alerts:** Emergency SOS and medication non-compliance alerts sent immediately to the caregiver.
- **Offline-First Capabilities:** Full functionality without an internet connection, relying on robust local state management.
- **Accessibility Optimized:** High-legibility fonts (Atkinson Hyperlegible), large touch targets, and high-contrast color themes for visually impaired users.
- **Health & Cognitive Analytics:** (Upcoming) On-device AI tracking for cognitive and behavioral trends.

## 5. Technology Stack

- **Frontend:** React Native (v0.86.3), Expo (v57.0)
- **Routing:** Expo Router (File-based navigation)
- **State Management:** Zustand + `@react-native-async-storage/async-storage`
- **Backend Sync:** Firebase
- **AI & Analytics:** `@google/genai` (Gemini API) and `brain.js`
- **UI Components:** `react-native-svg`, `react-native-chart-kit`, `@expo/vector-icons`

## 6. Architecture

```text
Elder User                  Caregiver
    |                           |
    v                           v
[ Elder UI ]              [ Caregiver UI ]
    |                           |
    +-----> Zustand Store <-----+
            (Local State)
                  |
                  v
             AsyncStorage
          (Local Persistence)
                  |
                  v
          Firebase Backend
          (Cloud Syncing)
```

## 7. Presentation & Demo

- **Pitch Presentation (PPT):** [Link to your PPT will go here]
- **Demo Video:** [Link to your Demo Video will go here]

---
*Note: This repository follows the standard submission structure for SIH 2026.*