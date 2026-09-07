// CaregiverDashboard — mobile caregiver view, spec: src/imports/Caretaker-Dashboard-UI2.md
// Same phone frame as elder app. Design tokens from spec §1.1. 18px body-text floor per §1.2.

import { useState } from "react"
import { useReminders, parseTimeMins } from "./reminderStore"

// ─── Design tokens — spec §1.1 ─────────────────────────────────────────────

const C = {
  bg:      "#FDF6EC",  // bg/day
  accent:  "#3B4A63",  // accent/caregiver — slate blue, distinct from elder's terracotta
  confirm: "#2F6B3C",  // state/confirm
  stop:    "#A3372E",  // state/stop — destructive only
  caution: "#B98A1E",  // state/caution — missed reminders, attention items
  border:  "#3B4A63",  // border/default
  text:    "#2B2620",  // text/primary
  muted:   "#6B6355",  // text/muted — timestamps, secondary metadata
}

const F = { display: "'Atkinson Hyperlegible', sans-serif", body: "'IBM Plex Sans', sans-serif" }

// spec §1.3 fixed corner radii — never change these
const R = { alert: "0px", row: "4px", hero: "20px", pill: "4px" }

// ─── Icons (filled, literal — spec §1.4) ────────────────────────────────────

const IcHome    = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
const IcPeople  = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
const IcBell    = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
const IcShield  = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
const IcBack    = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
const IcArrow   = ({ s=20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
const IcPerson  = ({ s=24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
const IcCheck   = ({ s=20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
const IcAdd     = ({ s=20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
const IcClock   = ({ s=18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
const IcPhone   = ({ s=20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
const IcNote    = ({ s=18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
const IcMed     = ({ s=22 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>
const IcFood    = ({ s=22 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
const IcWalk    = ({ s=22 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
const IcWater   = ({ s=22 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>
const IcDown    = ({ s=16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>

// ─── Types ──────────────────────────────────────────────────────────────────

type CgTab = "home" | "patients" | "notifications" | "access"
type PTab = "today" | "cognitive" | "engagement" | "reminders" | "observations" | "interventions" | "paccess"
type AlertType = "OBSERVATION" | "ATTENTION" | "ACTION"
type AttentionLevel = "urgent" | "attention" | "ok"
type ReminderStatus = "completed" | "missed" | "acknowledged" | "prompted" | "upcoming"

type Patient = {
  id: string; name: string; age: number; condition: string; language: string
  location: string; lastActive: string; deviceStatus: "online" | "offline"
  attentionLevel: AttentionLevel; missedReminders: number; sessions7d: number
  alerts: { text: string; type: AlertType }[]
}

type Observation = {
  id: string; patientId: string; type: AlertType; observedAt: string
  text: string; evidenceQuality: "strong" | "acceptable" | "limited"
  algorithmVersion: string; explanationCode: string; suppressed?: boolean
  suppressReason?: string
}

type ReminderRecord = {
  patientId: string; date: string; label: string
  status: ReminderStatus; reminderType: string
}

type Intervention = {
  id: string; patientId: string; intType: string; notes: string
  startedAt: string; followUpAt: string; status: "open" | "in-progress" | "closed"
  actorName: string
}

type ConsentRecord = {
  purpose: string; label: string; grantedAt: string
  status: "granted" | "pending" | "revoked"; policyVersion: string
}

// ─── Mock data ──────────────────────────────────────────────────────────────

const PATIENTS: Patient[] = [
  {
    id: "meera", name: "Meera Devi", age: 82, condition: "Moderate cognitive impairment, type 2 diabetes",
    language: "Hindi", location: "Malviya Nagar, Jaipur", lastActive: "2 days ago",
    deviceStatus: "offline", attentionLevel: "urgent", missedReminders: 3, sessions7d: 0,
    alerts: [
      { type: "ATTENTION", text: "No activity recorded for 2 days" },
      { type: "OBSERVATION", text: "Persistent change observed in visual attention performance — 6 eligible sessions contributed" },
    ],
  },
  {
    id: "ramesh", name: "Ramesh Kumar", age: 78, condition: "Mild cognitive impairment, hypertension",
    language: "Kannada · Hindi", location: "Jayanagar, Bengaluru", lastActive: "45 min ago",
    deviceStatus: "online", attentionLevel: "attention", missedReminders: 1, sessions7d: 4,
    alerts: [{ type: "OBSERVATION", text: "3 medication reminders were not marked complete this week" }],
  },
  {
    id: "arjun", name: "Arjun Sharma", age: 71, condition: "Early-stage memory concerns",
    language: "Hindi · English", location: "Vasant Vihar, Delhi", lastActive: "2 hours ago",
    deviceStatus: "online", attentionLevel: "ok", missedReminders: 0, sessions7d: 5,
    alerts: [],
  },
]

const OBSERVATIONS: Observation[] = [
  {
    id: "obs-m1", patientId: "meera", type: "ATTENTION", observedAt: "Today, 6:00 AM",
    text: "No app activity recorded for 2 days. The patient has not acknowledged any reminders or opened any sessions since 2 days ago. Device is currently offline.",
    evidenceQuality: "limited", algorithmVersion: "engagement-v1", explanationCode: "ACTIVITY_GAP_48H",
  },
  {
    id: "obs-m2", patientId: "meera", type: "OBSERVATION", observedAt: "5 days ago",
    text: "Persistent change observed in visual attention performance across 6 eligible sessions. Time-to-complete for visual search tasks has increased above this patient's established baseline. Same task version, same device, similar time-of-day distribution.",
    evidenceQuality: "acceptable", algorithmVersion: "trajectory-v1", explanationCode: "PERSISTENT_DEVIATION_SAME_TASK",
  },
  {
    id: "obs-r1", patientId: "ramesh", type: "OBSERVATION", observedAt: "Today, 6:00 AM",
    text: "3 medication reminders were not marked complete this week. Reminder completion rate has been below the patient's usual pattern for 3 consecutive days.",
    evidenceQuality: "acceptable", algorithmVersion: "reminder-v1", explanationCode: "REMINDER_ADHERENCE_LOW",
  },
  {
    id: "obs-m3", patientId: "meera", type: "OBSERVATION", observedAt: "10 days ago",
    text: "Session participation below usual range for this patient — 0 sessions in the last 7 days versus a typical rate of 4–5 per week.",
    evidenceQuality: "acceptable", algorithmVersion: "engagement-v1", explanationCode: "SESSION_DROP_7D",
    suppressed: true, suppressReason: "Recently acknowledged",
  },
]

const REMINDERS: Record<string, ReminderRecord[]> = {
  ramesh: [
    { patientId: "ramesh", date: "Today",     label: "Morning Medicine",   status: "completed",    reminderType: "MEDICATION" },
    { patientId: "ramesh", date: "Today",     label: "Breakfast",          status: "completed",    reminderType: "DAILY_ACTIVITY" },
    { patientId: "ramesh", date: "Today",     label: "Afternoon Medicine", status: "missed",       reminderType: "MEDICATION" },
    { patientId: "ramesh", date: "Today",     label: "Evening Walk",       status: "upcoming",     reminderType: "DAILY_ACTIVITY" },
    { patientId: "ramesh", date: "Yesterday", label: "Morning Medicine",   status: "completed",    reminderType: "MEDICATION" },
    { patientId: "ramesh", date: "Yesterday", label: "Afternoon Medicine", status: "missed",       reminderType: "MEDICATION" },
    { patientId: "ramesh", date: "Yesterday", label: "Night Medicine",     status: "completed",    reminderType: "MEDICATION" },
  ],
  meera: [
    { patientId: "meera",  date: "Today",     label: "Morning Medicine",   status: "missed",       reminderType: "MEDICATION" },
    { patientId: "meera",  date: "Today",     label: "Breakfast",          status: "missed",       reminderType: "DAILY_ACTIVITY" },
    { patientId: "meera",  date: "Today",     label: "Afternoon Medicine", status: "missed",       reminderType: "MEDICATION" },
    { patientId: "meera",  date: "Yesterday", label: "Morning Medicine",   status: "missed",       reminderType: "MEDICATION" },
    { patientId: "meera",  date: "Yesterday", label: "Afternoon Medicine", status: "missed",       reminderType: "MEDICATION" },
  ],
  arjun: [
    { patientId: "arjun",  date: "Today",     label: "Morning Walk",       status: "completed",    reminderType: "DAILY_ACTIVITY" },
    { patientId: "arjun",  date: "Today",     label: "Morning Medicine",   status: "completed",    reminderType: "MEDICATION" },
    { patientId: "arjun",  date: "Today",     label: "Breakfast",          status: "completed",    reminderType: "DAILY_ACTIVITY" },
    { patientId: "arjun",  date: "Today",     label: "Evening Medicine",   status: "upcoming",     reminderType: "MEDICATION" },
    { patientId: "arjun",  date: "Yesterday", label: "Morning Medicine",   status: "completed",    reminderType: "MEDICATION" },
    { patientId: "arjun",  date: "Yesterday", label: "Evening Medicine",   status: "completed",    reminderType: "MEDICATION" },
  ],
}

const INTERVENTIONS: Record<string, Intervention[]> = {
  ramesh: [{
    id: "int-r1", patientId: "ramesh", intType: "Family coordination",
    notes: "Coordinated with daughter Priya to provide afternoon medicine reminder by phone at 1 PM daily.",
    startedAt: "Yesterday", followUpAt: "In 3 days", status: "in-progress", actorName: "Rajesh Sharma",
  }],
  meera: [{
    id: "int-m1", patientId: "meera", intType: "Home visit",
    notes: "Scheduled home visit after 2-day activity gap. Will review device status, family support, and current wellbeing.",
    startedAt: "Today", followUpAt: "Tomorrow morning", status: "open", actorName: "Rajesh Sharma",
  }],
  arjun: [],
}

const CONSENT: Record<string, ConsentRecord[]> = {
  ramesh: [
    { purpose: "CORE_CARE",            label: "Core Care",            grantedAt: "12 Aug 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "COGNITIVE_MEASUREMENT",label: "Cognitive Measurement", grantedAt: "12 Aug 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "REMINDERS",            label: "Reminders",            grantedAt: "12 Aug 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "VOICE_ACCESSIBILITY",  label: "Voice & Accessibility", grantedAt: "12 Aug 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "FAMILY_MEDIA",         label: "Family Media",         grantedAt: "12 Aug 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "RESEARCH",             label: "Research Participation",grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
    { purpose: "MONITORING_SPEECH",    label: "Monitoring Speech",    grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
  ],
  meera: [
    { purpose: "CORE_CARE",            label: "Core Care",            grantedAt: "1 Sep 2025",  status: "granted", policyVersion: "v1.2" },
    { purpose: "COGNITIVE_MEASUREMENT",label: "Cognitive Measurement", grantedAt: "1 Sep 2025",  status: "granted", policyVersion: "v1.2" },
    { purpose: "REMINDERS",            label: "Reminders",            grantedAt: "1 Sep 2025",  status: "granted", policyVersion: "v1.2" },
    { purpose: "VOICE_ACCESSIBILITY",  label: "Voice & Accessibility", grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
    { purpose: "FAMILY_MEDIA",         label: "Family Media",         grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
    { purpose: "RESEARCH",             label: "Research Participation",grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
    { purpose: "MONITORING_SPEECH",    label: "Monitoring Speech",    grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
  ],
  arjun: [
    { purpose: "CORE_CARE",            label: "Core Care",            grantedAt: "20 Jul 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "COGNITIVE_MEASUREMENT",label: "Cognitive Measurement", grantedAt: "20 Jul 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "REMINDERS",            label: "Reminders",            grantedAt: "20 Jul 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "VOICE_ACCESSIBILITY",  label: "Voice & Accessibility", grantedAt: "20 Jul 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "FAMILY_MEDIA",         label: "Family Media",         grantedAt: "20 Jul 2025", status: "granted", policyVersion: "v1.2" },
    { purpose: "RESEARCH",             label: "Research Participation",grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
    { purpose: "MONITORING_SPEECH",    label: "Monitoring Speech",    grantedAt: "",            status: "pending",  policyVersion: "v1.2" },
  ],
}

const TODAY_SCHEDULE: Record<string, { time: string; label: string; status: ReminderStatus; iconKey: string }[]> = {
  ramesh: [
    { time: "8:00 AM",  label: "Morning Medicine",   status: "completed",  iconKey: "med"  },
    { time: "9:00 AM",  label: "Breakfast",           status: "completed",  iconKey: "food" },
    { time: "11:00 AM", label: "Drink Water",         status: "completed",  iconKey: "water"},
    { time: "1:00 PM",  label: "Afternoon Medicine",  status: "missed",     iconKey: "med"  },
    { time: "1:30 PM",  label: "Lunch",               status: "acknowledged",iconKey: "food"},
    { time: "4:00 PM",  label: "Evening Walk",        status: "upcoming",   iconKey: "walk" },
    { time: "9:00 PM",  label: "Night Medicine",      status: "upcoming",   iconKey: "med"  },
  ],
  meera: [
    { time: "8:00 AM",  label: "Morning Medicine",   status: "missed",  iconKey: "med"  },
    { time: "9:00 AM",  label: "Breakfast",           status: "missed",  iconKey: "food" },
    { time: "11:00 AM", label: "Drink Water",         status: "missed",  iconKey: "water"},
    { time: "1:00 PM",  label: "Afternoon Medicine",  status: "missed",  iconKey: "med"  },
    { time: "4:00 PM",  label: "Evening Walk",        status: "upcoming",iconKey: "walk" },
    { time: "9:00 PM",  label: "Night Medicine",      status: "upcoming",iconKey: "med"  },
  ],
  arjun: [
    { time: "7:30 AM",  label: "Morning Walk",        status: "completed",iconKey: "walk" },
    { time: "8:00 AM",  label: "Morning Medicine",    status: "completed",iconKey: "med"  },
    { time: "9:00 AM",  label: "Breakfast",           status: "completed",iconKey: "food" },
    { time: "10:00 AM", label: "Brain Games",         status: "completed",iconKey: "med"  },
    { time: "1:00 PM",  label: "Lunch",               status: "completed",iconKey: "food" },
    { time: "5:00 PM",  label: "Evening Medicine",    status: "upcoming", iconKey: "med"  },
  ],
}

// ─── Shared micro-components ────────────────────────────────────────────────

function ScheduleIcon({ iconKey }: { iconKey: string }) {
  if (iconKey === "med")   return <IcMed s={20} />
  if (iconKey === "food")  return <IcFood s={20} />
  if (iconKey === "walk")  return <IcWalk s={20} />
  if (iconKey === "water") return <IcWater s={20} />
  return <IcNote s={20} />
}

function StatusPill({ status }: { status: ReminderStatus }) {
  const m: Record<string, [string, string, string]> = {
    completed:    ["#E5F0E8", C.confirm,  "Done"],
    missed:       ["#F5E8E5", C.caution,  "Missed"],
    acknowledged: ["#F5EDDA", C.caution,  "Noted"],
    prompted:     ["#EEF0F6", C.accent,   "Prompted"],
    upcoming:     ["#EEF0F6", C.muted,    "Upcoming"],
  }
  const [bg, color, label] = m[status] || ["#F5F0E8", C.muted, status]
  return (
    <span style={{ padding: "3px 10px", backgroundColor: bg, color, fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: R.pill, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

function AlertTypePill({ type }: { type: AlertType }) {
  const m: Record<AlertType, [string, string]> = {
    OBSERVATION: [C.caution, "#FDF5E0"],
    ATTENTION:   [C.caution, "#FDF5E0"],
    ACTION:      [C.stop,    "#F9ECEB"],
  }
  const [color, bg] = m[type]
  return (
    <span style={{ padding: "2px 8px", backgroundColor: bg, color, fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: R.pill, border: `1px solid ${color}55` }}>
      {type}
    </span>
  )
}

function DeviceDot({ status }: { status: "online" | "offline" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: F.body, fontSize: "16px", color: status === "online" ? C.confirm : C.muted }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: status === "online" ? C.confirm : C.muted, display: "inline-block" }} />
      {status === "online" ? "Online" : "Offline"}
    </span>
  )
}

function EvidencePill({ quality }: { quality: "strong" | "acceptable" | "limited" }) {
  const m: Record<string, string> = { strong: C.confirm, acceptable: C.caution, limited: C.muted }
  return (
    <span style={{ padding: "2px 8px", backgroundColor: "#F5F0E8", color: m[quality], fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: R.pill, border: `1px solid ${m[quality]}55` }}>
      Evidence: {quality}
    </span>
  )
}

// spec §6 ObservationCard — 0px radius "note" shape, left border by type
function ObservationCard({ obs, onAction }: { obs: Observation; onAction?: () => void }) {
  const borderColor = obs.type === "ACTION" ? C.stop : C.caution
  return (
    <div style={{ border: `2px solid ${borderColor}`, borderLeft: `6px solid ${borderColor}`, borderRadius: R.alert, backgroundColor: "#FEFCF6", marginBottom: "0px" }}>
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" as const }}>
          <AlertTypePill type={obs.type} />
          <span style={{ fontFamily: F.body, fontSize: "14px", color: C.muted }}>{obs.observedAt}</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text, lineHeight: 1.6, marginBottom: "10px" }}>{obs.text}</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "10px" }}>
          <EvidencePill quality={obs.evidenceQuality} />
          <span style={{ padding: "2px 8px", backgroundColor: "#EEF0F6", color: C.accent, fontFamily: F.body, fontSize: "14px", fontWeight: 600, borderRadius: R.pill }}>{obs.algorithmVersion}</span>
        </div>
        <button style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          See the evidence →
        </button>
      </div>
      {onAction && (
        <button onClick={onAction} style={{ width: "100%", height: "48px", backgroundColor: "#EEF0F6", color: C.accent, fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", borderTop: `1px solid ${borderColor}44`, cursor: "pointer", letterSpacing: "0.02em" }}>
          Record observation
        </button>
      )}
    </div>
  )
}

// spec §3 patient row — 4px radius
function PatientRow({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const borderColor = patient.attentionLevel === "urgent" ? C.stop : patient.attentionLevel === "attention" ? C.caution : C.border
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left" as const, display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "#FEFCF6", border: `2px solid ${borderColor}`, borderRadius: R.row, cursor: "pointer", marginBottom: "0px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: borderColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
        <IcPerson s={26} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "2px" }}>{patient.name}</div>
        {patient.alerts.length > 0 && (
          <div style={{ fontFamily: F.body, fontSize: "16px", color: patient.attentionLevel === "urgent" ? C.stop : C.caution, lineHeight: 1.4 }}>
            {patient.alerts[0].text}
          </div>
        )}
        {patient.alerts.length === 0 && (
          <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted }}>Engaging normally · {patient.sessions7d} sessions this week</div>
        )}
        <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, marginTop: "4px" }}>{patient.lastActive}</div>
      </div>
      <IcArrow s={20} />
    </button>
  )
}

// ─── Shell ───────────────────────────────────────────────────────────────────

function TopBar({
  title, showBack, onBack, patient,
}: {
  title?: string; showBack?: boolean; onBack?: () => void; patient?: Patient
}) {
  return (
    <div style={{ backgroundColor: C.accent, height: "60px", display: "flex", alignItems: "center", gap: "8px", padding: "0 8px", flexShrink: 0 }}>
      {showBack && (
        <button onClick={onBack} style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "#fff", cursor: "pointer", borderRadius: R.pill, flexShrink: 0 }}>
          <IcBack s={24} />
        </button>
      )}
      {patient ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <IcPerson s={20} />
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{patient.name}</div>
            <div style={{ fontFamily: F.body, fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{patient.age}y · {patient.location}</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: "#fff", paddingLeft: showBack ? 0 : "8px" }}>{title}</div>
      )}
      <div style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.75)", flexShrink: 0, cursor: "pointer" }}>
        <IcNote s={18} />
      </div>
    </div>
  )
}

// spec §2 Assisted Mode Banner
function AssistedBanner() {
  return (
    <div style={{ backgroundColor: C.accent, height: "44px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "0.03em" }}>Caregiver Assisted Mode — Rajesh Sharma</span>
    </div>
  )
}

// spec §1.8 bottom tab bar
function BottomTabBar({ active, onNavigate }: { active: CgTab; onNavigate: (t: CgTab) => void }) {
  const tabs: { key: CgTab; label: string; icon: React.ReactNode }[] = [
    { key: "home",          label: "Home",          icon: <IcHome s={24} /> },
    { key: "patients",      label: "Patients",      icon: <IcPeople s={24} /> },
    { key: "notifications", label: "Alerts",        icon: <IcBell s={24} /> },
    { key: "access",        label: "Access",        icon: <IcShield s={24} /> },
  ]
  const urgentCount = OBSERVATIONS.filter(o => !o.suppressed && o.type === "ATTENTION").length
  return (
    <div style={{ height: "68px", backgroundColor: "#FEFCF6", borderTop: `2px solid ${C.border}`, display: "flex", flexShrink: 0 }}>
      {tabs.map(t => {
        const active2 = active === t.key
        const badge = t.key === "notifications" && urgentCount > 0
        return (
          <button key={t.key} onClick={() => onNavigate(t.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", borderTop: `3px solid ${active2 ? C.accent : "transparent"}`, color: active2 ? C.accent : C.muted, position: "relative" as const }}>
            {badge && <span style={{ position: "absolute" as const, top: "6px", right: "calc(50% - 18px)", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: C.caution, display: "block" }} />}
            {t.icon}
            <span style={{ fontFamily: F.body, fontSize: "12px", fontWeight: active2 ? 700 : 500 }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── PATIENT DETAIL TABS ─────────────────────────────────────────────────────

function TodayTab({ patient }: { patient: Patient }) {
  const schedule = TODAY_SCHEDULE[patient.id] || []
  const done   = schedule.filter(e => e.status === "completed").length
  const missed = schedule.filter(e => e.status === "missed").length
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Done",     value: done,    color: C.confirm, bg: "#E5F0E8" },
          { label: "Missed",   value: missed,  color: missed > 0 ? C.caution : C.muted, bg: missed > 0 ? "#FDF5DA" : "#F5F0E8" },
          { label: "Upcoming", value: schedule.filter(e => e.status === "upcoming").length, color: C.muted, bg: "#F5F0E8" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, backgroundColor: s.bg, border: `2px solid ${s.color}44`, borderRadius: R.hero, padding: "14px 10px", textAlign: "center" as const }}>
            <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>TODAY'S SCHEDULE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {schedule.map((entry, i) => {
          const sc = entry.status === "completed" ? C.confirm : entry.status === "missed" ? C.caution : entry.status === "upcoming" ? C.muted : C.caution
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 14px", backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderLeft: `5px solid ${sc}`, borderRadius: R.row }}>
              <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 600, color: C.muted, minWidth: "60px", textAlign: "right" as const, flexShrink: 0 }}>{entry.time}</div>
              <div style={{ width: "36px", height: "36px", backgroundColor: sc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", borderRadius: R.pill, flexShrink: 0 }}>
                <ScheduleIcon iconKey={entry.iconKey} />
              </div>
              <div style={{ flex: 1, fontFamily: F.body, fontSize: "18px", color: entry.status === "completed" ? C.muted : C.text, textDecoration: entry.status === "completed" ? "line-through" : "none" }}>
                {entry.label}
              </div>
              <StatusPill status={entry.status} />
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: "16px", padding: "12px 14px", backgroundColor: "#F5F0E8", borderLeft: `4px solid ${C.caution}`, borderRadius: R.row }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, lineHeight: 1.5 }}>
          <strong>Acknowledged</strong> means the patient saw the prompt — it does not confirm the activity occurred.
        </div>
      </div>
    </div>
  )
}

function CognitiveTrendsTab({ patient }: { patient: Patient }) {
  const obs = OBSERVATIONS.filter(o => o.patientId === patient.id && !o.suppressed)
  const weekData = patient.id === "arjun"
    ? [{ w: "Wk 1", s: 4 }, { w: "Wk 2", s: 5 }, { w: "Wk 3", s: 5 }, { w: "Wk 4", s: 5 }]
    : patient.id === "ramesh"
    ? [{ w: "Wk 1", s: 3 }, { w: "Wk 2", s: 4 }, { w: "Wk 3", s: 4 }, { w: "Wk 4", s: 4 }]
    : [{ w: "Wk 1", s: 5 }, { w: "Wk 2", s: 3 }, { w: "Wk 3", s: 2 }, { w: "Wk 4", s: 0 }]

  const maxS = Math.max(...weekData.map(d => d.s), 5)
  const H = 60, bW = 40, gap = 14

  return (
    <div style={{ padding: "20px" }}>
      {obs.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>SYSTEM OBSERVATIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {obs.map(o => <ObservationCard key={o.id} obs={o} />)}
          </div>
        </div>
      )}

      <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>SESSION PARTICIPATION — LAST 4 WEEKS</div>
      <div style={{ padding: "16px 20px", backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero, marginBottom: "8px" }}>
        <svg width={(bW + gap) * 4 - gap} height={H + 34} style={{ overflow: "visible" }}>
          {weekData.map((d, i) => {
            const h = d.s === 0 ? 4 : Math.max(6, (d.s / maxS) * H)
            const x = i * (bW + gap), y = H - h
            const fill = d.s === 0 ? "#DDD8D0" : d.s < 3 ? C.caution : C.confirm
            return (
              <g key={d.w}>
                <rect x={x} y={y} width={bW} height={h} fill={fill} rx={2} />
                <text x={x + bW / 2} y={H + 18} textAnchor="middle" fontSize="14" fontFamily="IBM Plex Sans" fill={C.muted}>{d.w}</text>
                <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize="15" fontFamily="Atkinson Hyperlegible" fontWeight="700" fill={C.text}>{d.s}</text>
              </g>
            )
          })}
        </svg>
        <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, marginTop: "4px" }}>Sessions per week. Green = 3+, amber = 1–2, grey = 0.</div>
      </div>
      <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted }}>Session counts are participation indicators — not clinical measurements.</div>
    </div>
  )
}

function EngagementTab({ patient }: { patient: Patient }) {
  const trend = patient.id === "arjun" ? "improving" : patient.id === "meera" ? "declining" : "stable"
  const completionRate = patient.id === "arjun" ? 92 : patient.id === "ramesh" ? 78 : 30
  const ackRate = patient.id === "arjun" ? 95 : patient.id === "ramesh" ? 65 : 25
  const trendColor = trend === "improving" ? C.confirm : trend === "declining" ? C.stop : C.caution

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ padding: "12px 14px", backgroundColor: "#F5F0E8", borderLeft: `4px solid ${C.caution}`, borderRadius: R.row, marginBottom: "20px" }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, lineHeight: 1.5 }}>
          These are <strong>product engagement indicators</strong> — how the patient interacts with the app. Not diagnostic biomarkers.
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div style={{ flex: 1, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero, padding: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: C.text }}>{patient.sessions7d}</div>
          <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, marginTop: "2px" }}>Sessions this week</div>
          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px", backgroundColor: trendColor + "20", color: trendColor, fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: R.pill }}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero, padding: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: C.text }}>{completionRate}%</div>
          <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, marginTop: "2px" }}>Session completion</div>
        </div>
      </div>

      {[
        { label: "Reminder acknowledgement rate", value: ackRate, color: ackRate > 60 ? C.confirm : C.caution },
        { label: "Sessions played this week", value: Math.round((patient.sessions7d / 7) * 100), color: C.accent },
      ].map(row => (
        <div key={row.label} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: F.body, fontSize: "16px", color: C.text }}>{row.label}</span>
            <span style={{ fontFamily: F.display, fontSize: "18px", fontWeight: 700, color: C.text }}>{row.value}%</span>
          </div>
          <div style={{ height: "10px", backgroundColor: "#E5E0D8", borderRadius: R.pill }}>
            <div style={{ height: "100%", width: `${Math.min(100, row.value)}%`, backgroundColor: row.color, borderRadius: R.pill }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Task type presets for the Add Reminder form
const TASK_PRESETS = [
  { key: "medicine", label: "Medicine",     iconKey: "med",      color: "#C4822A" },
  { key: "food",     label: "Meal",         iconKey: "food",     color: "#2D5A3D" },
  { key: "water",    label: "Drink Water",  iconKey: "water",    color: "#3B6B8A" },
  { key: "walk",     label: "Walk",         iconKey: "walk",     color: "#5A6B2A" },
  { key: "custom",   label: "Other…",       iconKey: "calendar", color: C.accent  },
]

const TIME_PRESETS = [
  { label: "Morning",   time: "8:00 AM",   sortMins:  480 },
  { label: "Midday",    time: "12:00 PM",  sortMins:  720 },
  { label: "Afternoon", time: "3:00 PM",   sortMins:  900 },
  { label: "Evening",   time: "6:00 PM",   sortMins: 1080 },
  { label: "Night",     time: "9:00 PM",   sortMins: 1260 },
]

function RemindersTab({ patient }: { patient: Patient }) {
  const { reminders: allReminders, addReminder, removeReminder } = useReminders()
  const history = REMINDERS[patient.id] || []
  const missed = history.filter(r => r.status === "missed").length
  const done   = history.filter(r => r.status === "completed").length

  // Caregiver-added reminders for this patient
  const cgAdded = allReminders
    .filter(r => r.patientId === patient.id)
    .sort((a, b) => a.sortMins - b.sortMins)

  const [showForm, setShowForm]       = useState(false)
  const [taskKey, setTaskKey]         = useState<string | null>(null)
  const [customLabel, setCustomLabel] = useState("")
  const [customDesc, setCustomDesc]   = useState("")
  const [timeSlot, setTimeSlot]       = useState<typeof TIME_PRESETS[0] | null>(null)
  const [justSent, setJustSent]       = useState(false)

  function handleSend() {
    const preset = TASK_PRESETS.find(p => p.key === taskKey)
    if (!preset || !timeSlot) return
    const label = taskKey === "custom" ? (customLabel.trim() || "Task") : preset.label
    addReminder({
      patientId: patient.id,
      patientName: patient.name,
      label,
      desc: customDesc.trim(),
      iconKey: preset.iconKey,
      color: preset.color,
      time: timeSlot.time,
      sortMins: timeSlot.sortMins,
      addedBy: "Rajesh Sharma",
    })
    setTaskKey(null); setCustomLabel(""); setCustomDesc(""); setTimeSlot(null)
    setShowForm(false); setJustSent(true)
    setTimeout(() => setJustSent(false), 3000)
  }

  const canSend = taskKey !== null && timeSlot !== null && (taskKey !== "custom" || customLabel.trim())

  return (
    <div style={{ padding: "20px" }}>
      {/* Summary stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Completed", value: done,   color: C.confirm, bg: "#E5F0E8" },
          { label: "Missed",    value: missed, color: missed > 0 ? C.caution : C.muted, bg: missed > 0 ? "#FDF5DA" : "#F5F0E8" },
          { label: "Noted",     value: history.filter(r => r.status === "acknowledged").length, color: C.muted, bg: "#F5F0E8" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, backgroundColor: s.bg, border: `2px solid ${s.color}44`, borderRadius: R.hero, padding: "14px 10px", textAlign: "center" as const }}>
            <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Reminder section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em" }}>ADD REMINDER</div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: C.accent, color: "#fff", fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row }}>
            <IcAdd s={18} /> Schedule Reminder
          </button>
        )}
      </div>

      {/* Success toast */}
      {justSent && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#E5F0E8", border: `2px solid ${C.confirm}`, borderRadius: R.row, marginBottom: "14px" }}>
          <IcCheck s={20} />
          <span style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.confirm }}>Reminder sent to {patient.name.split(" ")[0]}'s app</span>
        </div>
      )}

      {/* Add Reminder form */}
      {showForm && (
        <div style={{ border: `2px solid ${C.accent}`, borderRadius: R.row, backgroundColor: "#FEFCF6", padding: "18px 16px", marginBottom: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "16px" }}>Schedule a reminder for {patient.name.split(" ")[0]}</div>

          {/* Task type */}
          <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: "8px" }}>TASK TYPE</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "16px" }}>
            {TASK_PRESETS.map(p => (
              <button key={p.key} onClick={() => { setTaskKey(p.key); if (p.key !== "custom") setCustomLabel("") }} style={{ padding: "8px 14px", backgroundColor: taskKey === p.key ? p.color : "#F5F0E8", color: taskKey === p.key ? "#fff" : C.text, fontFamily: F.body, fontSize: "16px", fontWeight: taskKey === p.key ? 700 : 500, border: `2px solid ${taskKey === p.key ? p.color : C.border + "33"}`, cursor: "pointer", borderRadius: R.pill }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom label if "Other" selected */}
          {taskKey === "custom" && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: "6px" }}>TASK NAME</div>
              <input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="e.g. Take blood pressure reading" style={{ width: "100%", height: "48px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "0 12px", outline: "none", boxSizing: "border-box" as const, borderRadius: R.row }} />
            </div>
          )}

          {/* Optional description */}
          {taskKey && taskKey !== "custom" && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: "6px" }}>INSTRUCTIONS (optional)</div>
              <input value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="e.g. 2 tablets with water" style={{ width: "100%", height: "48px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "0 12px", outline: "none", boxSizing: "border-box" as const, borderRadius: R.row }} />
            </div>
          )}

          {/* Time slot */}
          <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: "8px" }}>TIME</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "18px" }}>
            {TIME_PRESETS.map(t => (
              <button key={t.label} onClick={() => setTimeSlot(t)} style={{ padding: "8px 14px", backgroundColor: timeSlot?.label === t.label ? C.accent : "#F5F0E8", color: timeSlot?.label === t.label ? "#fff" : C.text, fontFamily: F.body, fontSize: "16px", fontWeight: timeSlot?.label === t.label ? 700 : 500, border: `2px solid ${timeSlot?.label === t.label ? C.accent : C.border + "33"}`, cursor: "pointer", borderRadius: R.pill }}>
                {t.label}
                <span style={{ display: "block", fontSize: "12px", fontWeight: 400, opacity: 0.75 }}>{t.time}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSend} disabled={!canSend} style={{ flex: 1, height: "52px", backgroundColor: canSend ? C.confirm : "#B0C8B8", color: "#fff", fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: "none", cursor: canSend ? "pointer" : "default", borderRadius: R.row }}>
              Send to {patient.name.split(" ")[0]}'s App
            </button>
            <button onClick={() => { setShowForm(false); setTaskKey(null); setCustomLabel(""); setCustomDesc(""); setTimeSlot(null) }} style={{ padding: "0 18px", height: "52px", backgroundColor: "#F5F0E8", color: C.muted, fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: `2px solid ${C.border}33`, cursor: "pointer", borderRadius: R.row }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Caregiver-added reminders */}
      {cgAdded.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "10px" }}>SENT TO PATIENT'S APP</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {cgAdded.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "#FEFCF6", border: `2px solid ${C.accent}44`, borderLeft: `5px solid ${C.accent}`, borderRadius: R.row }}>
                <div style={{ width: "36px", height: "36px", backgroundColor: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", borderRadius: R.pill, flexShrink: 0 }}>
                  <ScheduleIcon iconKey={r.iconKey} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.text }}>{r.label}</div>
                  <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted }}>{r.time}{r.desc ? ` · ${r.desc}` : ""} · Added {r.addedAt}</div>
                </div>
                <button onClick={() => removeReminder(r.id)} style={{ padding: "4px 10px", backgroundColor: "#F9ECEB", color: C.stop, fontFamily: F.body, fontSize: "13px", fontWeight: 700, border: `1px solid ${C.stop}44`, cursor: "pointer", borderRadius: R.pill, flexShrink: 0 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing reminder history */}
      <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>RECENT HISTORY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0px", border: `2px solid ${C.border}22`, borderRadius: R.row, overflow: "hidden" }}>
        {history.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: r.status === "missed" ? "#FDF5DA" : "#FEFCF6", borderBottom: i < history.length - 1 ? `1px solid ${C.border}18` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.body, fontSize: "16px", color: C.text }}>{r.label}</div>
              <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, marginTop: "2px" }}>{r.date} · {r.reminderType.replace("_", " ")}</div>
            </div>
            <StatusPill status={r.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ObservationsTab({ patient }: { patient: Patient }) {
  const [notes, setNotes] = useState<{ text: string; addedAt: string }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [noteText, setNoteText] = useState("")
  const obs = OBSERVATIONS.filter(o => o.patientId === patient.id && !o.suppressed)

  return (
    <div style={{ padding: "20px" }}>
      {obs.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>SYSTEM OBSERVATIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {obs.map(o => <ObservationCard key={o.id} obs={o} onAction={() => setShowForm(true)} />)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em" }}>CAREGIVER NOTES</div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: C.accent, color: "#fff", fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row }}>
            <IcAdd s={18} /> Record Observation
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ border: `2px solid ${C.accent}`, borderRadius: R.row, backgroundColor: "#FEFCF6", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>Add a caregiver note</div>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Describe what you observed, discussed, or arranged…" style={{ width: "100%", minHeight: "80px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "10px 12px", resize: "vertical" as const, outline: "none", boxSizing: "border-box" as const, borderRadius: R.row }} />
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button onClick={() => { if (noteText.trim()) { setNotes(n => [{ text: noteText.trim(), addedAt: "Just now" }, ...n]); setNoteText(""); setShowForm(false) } }} disabled={!noteText.trim()} style={{ flex: 1, height: "48px", backgroundColor: noteText.trim() ? C.accent : "#C0CADB", color: "#fff", fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", cursor: noteText.trim() ? "pointer" : "default", borderRadius: R.row }}>Save Note</button>
            <button onClick={() => { setShowForm(false); setNoteText("") }} style={{ padding: "0 18px", height: "48px", backgroundColor: "#F5F0E8", color: C.muted, fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: `2px solid ${C.border}33`, cursor: "pointer", borderRadius: R.row }}>Cancel</button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm && (
        <div style={{ padding: "20px", backgroundColor: "#F5F0E8", borderRadius: R.row, textAlign: "center" as const }}>
          <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted }}>No caregiver notes yet. Use "Record Observation" to add one.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notes.map((n, i) => (
          <div key={i} style={{ border: `2px solid ${C.border}22`, borderLeft: `5px solid ${C.accent}`, borderRadius: R.row, backgroundColor: "#FEFCF6", padding: "14px 16px" }}>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text, lineHeight: 1.6, marginBottom: "8px" }}>{n.text}</div>
            <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, display: "flex", alignItems: "center", gap: "6px" }}><IcClock s={14} /> Rajesh Sharma · {n.addedAt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const INT_TYPES = ["Family coordination", "Home visit", "Doctor referral", "Medication adjustment", "Routine change", "Device support", "Other"]

function InterventionsTab({ patient }: { patient: Patient }) {
  const [items, setItems] = useState<Intervention[]>(INTERVENTIONS[patient.id] || [])
  const [showForm, setShowForm] = useState(false)
  const [fType, setFType] = useState(INT_TYPES[0])
  const [fNotes, setFNotes] = useState("")
  const [fFollowUp, setFFollowUp] = useState("")

  const statusC: Record<string, string> = { open: C.caution, "in-progress": C.accent, closed: C.confirm }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "16px" }}>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted, flex: 1, lineHeight: 1.5 }}>Interventions and follow-up actions for this patient.</div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: C.accent, color: "#fff", fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row, flexShrink: 0 }}>
            <IcAdd s={18} /> Record Intervention
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ border: `2px solid ${C.accent}`, borderRadius: R.row, backgroundColor: "#FEFCF6", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "14px" }}>Record what was done</div>
          {[
            { label: "TYPE", content: (
              <select value={fType} onChange={e => setFType(e.target.value)} style={{ width: "100%", height: "48px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "0 12px", outline: "none", borderRadius: R.row }}>
                {INT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )},
            { label: "NOTES", content: (
              <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Describe the action taken or planned…" style={{ width: "100%", minHeight: "72px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "10px 12px", resize: "vertical" as const, outline: "none", boxSizing: "border-box" as const, borderRadius: R.row }} />
            )},
            { label: "FOLLOW-UP DATE (optional)", content: (
              <input value={fFollowUp} onChange={e => setFFollowUp(e.target.value)} placeholder="e.g. In 3 days, Next Monday" style={{ width: "100%", height: "48px", fontFamily: F.body, fontSize: "18px", color: C.text, backgroundColor: "#FEFCF6", border: `2px solid ${C.border}44`, padding: "0 12px", outline: "none", boxSizing: "border-box" as const, borderRadius: R.row }} />
            )},
          ].map(row => (
            <div key={row.label} style={{ marginBottom: "12px" }}>
              <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.muted, letterSpacing: "0.06em", marginBottom: "6px" }}>{row.label}</div>
              {row.content}
            </div>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={() => { if (fNotes.trim()) { setItems(v => [{ id: `int-${Date.now()}`, patientId: patient.id, intType: fType, notes: fNotes.trim(), startedAt: "Just now", followUpAt: fFollowUp || "To be scheduled", status: "open", actorName: "Rajesh Sharma" }, ...v]); setFNotes(""); setFFollowUp(""); setShowForm(false) } }} disabled={!fNotes.trim()} style={{ flex: 1, height: "48px", backgroundColor: fNotes.trim() ? C.accent : "#C0CADB", color: "#fff", fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: "none", cursor: fNotes.trim() ? "pointer" : "default", borderRadius: R.row }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "0 18px", height: "48px", backgroundColor: "#F5F0E8", color: C.muted, fontFamily: F.body, fontSize: "16px", fontWeight: 700, border: `2px solid ${C.border}33`, cursor: "pointer", borderRadius: R.row }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div style={{ padding: "20px", backgroundColor: "#F5F0E8", borderRadius: R.row, textAlign: "center" as const }}>
          <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted }}>No interventions recorded yet.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map(item => (
          <div key={item.id} style={{ border: `2px solid ${statusC[item.status]}55`, borderLeft: `5px solid ${statusC[item.status]}`, borderRadius: R.row, backgroundColor: "#FEFCF6", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
              <div>
                <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text }}>{item.intType}</div>
                <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: statusC[item.status], marginTop: "2px" }}>{item.status.replace("-", " ").toUpperCase()}</div>
              </div>
              {item.status !== "closed" && (
                <button onClick={() => setItems(v => v.map(i => i.id === item.id ? { ...i, status: "closed" as const } : i))} style={{ padding: "6px 12px", backgroundColor: "#E5F0E8", color: C.confirm, fontFamily: F.body, fontSize: "14px", fontWeight: 700, border: `1px solid ${C.confirm}55`, cursor: "pointer", borderRadius: R.pill, flexShrink: 0 }}>
                  Mark closed
                </button>
              )}
            </div>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text, lineHeight: 1.6, marginBottom: "8px" }}>{item.notes}</div>
            <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
              <span>By: <strong style={{ color: C.text }}>{item.actorName}</strong></span>
              <span>Started: <strong style={{ color: C.text }}>{item.startedAt}</strong></span>
              {item.followUpAt && <span>Follow-up: <strong style={{ color: C.caution }}>{item.followUpAt}</strong></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientAccessTab({ patient }: { patient: Patient }) {
  const [records, setRecords] = useState<ConsentRecord[]>(CONSENT[patient.id] || [])
  const [revoking, setRevoking] = useState<string | null>(null)

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted, lineHeight: 1.6, marginBottom: "20px" }}>
        Consent is per processing purpose. Each grant is versioned and auditable. Revocation may take time to propagate to offline devices.
      </div>

      <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>ACCESS GRANTS — POLICY v1.2</div>
      <div style={{ border: `2px solid ${C.border}22`, borderRadius: R.row, overflow: "hidden" }}>
        {records.map((r, i) => (
          <div key={r.purpose} style={{ padding: "14px 16px", backgroundColor: "#FEFCF6", borderBottom: i < records.length - 1 ? `1px solid ${C.border}18` : "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text }}>{r.label}</div>
              <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, marginTop: "2px" }}>{r.grantedAt || "Not yet granted"} · {r.policyVersion}</div>
            </div>
            <span style={{ padding: "3px 10px", backgroundColor: r.status === "granted" ? "#E5F0E8" : r.status === "revoked" ? "#F5E8E5" : "#F5F0E8", color: r.status === "granted" ? C.confirm : r.status === "revoked" ? C.stop : C.muted, fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: R.pill }}>
              {r.status.toUpperCase()}
            </span>
            {r.status === "granted" && (
              <button onClick={() => setRevoking(r.purpose)} style={{ padding: "5px 10px", backgroundColor: "#F9ECEB", color: C.stop, fontFamily: F.body, fontSize: "14px", fontWeight: 700, border: `1px solid ${C.stop}55`, cursor: "pointer", borderRadius: R.pill }}>
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>

      {/* spec §9.2 revoke confirm sheet — states real offline limitation */}
      {revoking && (
        <div style={{ position: "fixed" as const, inset: 0, backgroundColor: "rgba(43,38,32,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" as const }}>
          <div style={{ width: "100%", maxWidth: "430px", margin: "0 auto", backgroundColor: "#FEFCF6", borderRadius: `${R.hero} ${R.hero} 0 0`, border: `2px solid ${C.stop}`, padding: "24px 20px 32px" }}>
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: C.stop, marginBottom: "12px" }}>Revoke access?</div>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text, lineHeight: 1.6, marginBottom: "20px" }}>
              This person will lose access. If their device is offline, access may continue until their local authorization expires.
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
              <button onClick={() => { setRecords(r => r.map(rec => rec.purpose === revoking ? { ...rec, status: "revoked" as const, grantedAt: "" } : rec)); setRevoking(null) }} style={{ height: "56px", backgroundColor: C.stop, color: "#fff", fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row }}>
                Revoke access
              </button>
              <button onClick={() => setRevoking(null)} style={{ height: "56px", backgroundColor: "#F5F0E8", color: C.text, fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: `2px solid ${C.border}44`, cursor: "pointer", borderRadius: R.row }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PATIENT DETAIL ──────────────────────────────────────────────────────────

const PTABS: { key: PTab; label: string }[] = [
  { key: "today",         label: "Today"            },
  { key: "cognitive",     label: "Cognitive trends" },
  { key: "engagement",    label: "Engagement"       },
  { key: "reminders",     label: "Reminders"        },
  { key: "observations",  label: "Observations"     },
  { key: "interventions", label: "Interventions"    },
  { key: "paccess",       label: "Access"           },
]

function PatientDetail({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  const [ptab, setPtab] = useState<PTab>("today")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky patient header — spec §4 */}
      <TopBar showBack onBack={onBack} patient={patient} />

      {/* Call button — spec §4: full-width under sticky header, one touch */}
      <div style={{ padding: "10px 20px", backgroundColor: "#F5F0E8", borderBottom: `2px solid ${C.border}22`, flexShrink: 0 }}>
        <button style={{ width: "100%", height: "52px", backgroundColor: C.confirm, color: "#fff", fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <IcPhone s={20} /> Call {patient.name.split(" ")[0]}
        </button>
      </div>

      {/* Alerts if any */}
      {patient.alerts.length > 0 && (
        <div style={{ padding: "0 20px 0", backgroundColor: "#F5F0E8", flexShrink: 0 }}>
          {patient.alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 0", borderTop: i > 0 ? `1px solid ${C.border}18` : "none" }}>
              <AlertTypePill type={a.type} />
              <div style={{ fontFamily: F.body, fontSize: "16px", color: a.type === "ATTENTION" ? C.stop : C.caution, lineHeight: 1.5 }}>{a.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two-tier sticky tab strip — spec §5 */}
      <div style={{ backgroundColor: "#FEFCF6", borderBottom: `2px solid ${C.border}22`, overflowX: "auto", scrollbarWidth: "none" as const, flexShrink: 0 }}>
        <div style={{ display: "flex", minWidth: "max-content" }}>
          {PTABS.map(t => (
            <button key={t.key} onClick={() => setPtab(t.key)} style={{ padding: "12px 16px", fontFamily: F.body, fontSize: "16px", fontWeight: ptab === t.key ? 700 : 500, color: ptab === t.key ? C.accent : C.muted, background: "none", border: "none", borderBottom: `3px solid ${ptab === t.key ? C.accent : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap" as const }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg }}>
        {ptab === "today"         && <TodayTab patient={patient} />}
        {ptab === "cognitive"     && <CognitiveTrendsTab patient={patient} />}
        {ptab === "engagement"    && <EngagementTab patient={patient} />}
        {ptab === "reminders"     && <RemindersTab patient={patient} />}
        {ptab === "observations"  && <ObservationsTab patient={patient} />}
        {ptab === "interventions" && <InterventionsTab patient={patient} />}
        {ptab === "paccess"       && <PatientAccessTab patient={patient} />}
      </div>
    </div>
  )
}

// ─── HOME SCREEN — spec §3 ────────────────────────────────────────────────────

function CgHomeScreen({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  const needing = PATIENTS.filter(p => p.attentionLevel !== "ok")
  const allMissed = PATIENTS.filter(p => p.missedReminders > 0)

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg }}>
      <TopBar title="SmritiSaathi" />

      {needing.length === 0 ? (
        <div style={{ margin: "40px 20px", backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero, padding: "32px 24px", textAlign: "center" as const }}>
          <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>Nothing needs your attention right now</div>
          <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted, lineHeight: 1.6 }}>We'll let you know if that changes.</div>
        </div>
      ) : (
        <>
          {/* Section 1: Patients needing attention */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>PATIENTS NEEDING ATTENTION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {needing.map(p => <PatientRow key={p.id} patient={p} onClick={() => onSelectPatient(p.id)} />)}
            </div>
          </div>

          {/* Section 2: Missed reminders */}
          {allMissed.length > 0 && (
            <div style={{ padding: "24px 20px 0" }}>
              <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>MISSED REMINDERS</div>
              <div style={{ border: `2px solid ${C.caution}44`, borderRadius: R.hero, overflow: "hidden", backgroundColor: "#FEFCF6" }}>
                {allMissed.map((p, i) => (
                  <button key={p.id} onClick={() => onSelectPatient(p.id)} style={{ width: "100%", textAlign: "left" as const, display: "block", padding: "14px 16px", borderBottom: i < allMissed.length - 1 ? `1px solid ${C.border}18` : "none", background: "none", border: "none", cursor: "pointer", borderBottomWidth: i < allMissed.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: `${C.border}18` }}>
                    <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "2px" }}>{p.name}</div>
                    <div style={{ fontFamily: F.body, fontSize: "18px", color: C.caution }}>
                      {p.missedReminders} medication reminder{p.missedReminders !== 1 ? "s" : ""} {p.missedReminders !== 1 ? "were" : "was"} not marked complete
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Engaging patients */}
      {PATIENTS.filter(p => p.attentionLevel === "ok").length > 0 && (
        <div style={{ padding: "24px 20px 0" }}>
          <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "12px" }}>ENGAGING NORMALLY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PATIENTS.filter(p => p.attentionLevel === "ok").map(p => <PatientRow key={p.id} patient={p} onClick={() => onSelectPatient(p.id)} />)}
          </div>
        </div>
      )}

      {/* Section 3: Recent activity strip — spec §3 */}
      <div style={{ margin: "24px 20px 20px", padding: "16px", backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <IcNote s={16} /> RECENT ACTIVITY
        </div>
        {[
          { text: "Arjun completed a memory session", when: "2 hours ago" },
          { text: "Ramesh acknowledged afternoon reminder", when: "45 min ago" },
          { text: "Last synced", when: "2 min ago", isSync: true },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: i > 0 ? "8px" : "0", borderTop: i > 0 ? `1px solid ${C.border}18` : "none", marginTop: i > 0 ? "8px" : "0" }}>
            <IcCheck s={16} />
            <div style={{ flex: 1, fontFamily: F.body, fontSize: "16px", color: C.text }}>{item.text}</div>
            <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted, flexShrink: 0 }}>{item.when}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PATIENTS SCREEN ─────────────────────────────────────────────────────────

function CgPatientsScreen({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg }}>
      <TopBar title="Patients" />
      <div style={{ padding: "20px" }}>
        <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, marginBottom: "16px" }}>
          {PATIENTS.length} patients assigned · tap to view their full profile
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {PATIENTS.map(p => (
            <button key={p.id} onClick={() => onSelectPatient(p.id)} style={{ width: "100%", textAlign: "left" as const, display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px 16px", backgroundColor: "#FEFCF6", border: `2px solid ${p.attentionLevel === "urgent" ? C.stop : p.attentionLevel === "attention" ? C.caution : C.border}`, borderRadius: R.row, cursor: "pointer" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: p.attentionLevel === "urgent" ? C.stop : p.attentionLevel === "attention" ? C.caution : C.confirm, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <IcPerson s={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "2px" }}>{p.name}</div>
                <div style={{ fontFamily: F.body, fontSize: "16px", color: C.muted, marginBottom: "6px" }}>{p.age}y · {p.condition}</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
                  <DeviceDot status={p.deviceStatus} />
                  <span style={{ fontFamily: F.body, fontSize: "16px", color: C.muted }}>{p.sessions7d} sessions this week</span>
                  {p.missedReminders > 0 && <span style={{ fontFamily: F.body, fontSize: "16px", color: C.caution }}>{p.missedReminders} missed</span>}
                </div>
                {p.alerts.map((a, i) => (
                  <div key={i} style={{ marginTop: "8px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <AlertTypePill type={a.type} />
                    <div style={{ fontFamily: F.body, fontSize: "16px", color: C.text, lineHeight: 1.5, flex: 1 }}>{a.text}</div>
                  </div>
                ))}
              </div>
              <IcArrow s={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── NOTIFICATIONS SCREEN — spec §6 ──────────────────────────────────────────

function CgNotificationsScreen() {
  const [filterType, setFilterType] = useState<"all" | AlertType>("all")
  const [showSuppressed, setShowSuppressed] = useState(false)

  const active     = OBSERVATIONS.filter(o => !o.suppressed)
  const suppressed = OBSERVATIONS.filter(o => o.suppressed)
  const filtered   = filterType === "all" ? active : active.filter(o => o.type === filterType)

  const suppressLabels: Record<string, string> = {
    Duplicate: "Duplicate", "Recently acknowledged": "Recently acknowledged",
    "Low evidence": "Low evidence", "Outside monitoring window": "Outside monitoring window",
    Archived: "Archived", "Consent revoked": "Consent revoked", "Channel unavailable": "Channel unavailable",
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg }}>
      <TopBar title="Alerts & Observations" />

      {/* Filter chips — spec §6 */}
      <div style={{ padding: "12px 20px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" as const, borderBottom: `2px solid ${C.border}18`, backgroundColor: "#FEFCF6" }}>
        {(["all", "OBSERVATION", "ATTENTION", "ACTION"] as const).map(f => (
          <button key={f} onClick={() => setFilterType(f)} style={{ padding: "6px 14px", backgroundColor: filterType === f ? C.accent : "#F5F0E8", color: filterType === f ? "#fff" : C.muted, fontFamily: F.body, fontSize: "16px", fontWeight: filterType === f ? 700 : 500, border: `2px solid ${filterType === f ? C.accent : C.border + "33"}`, cursor: "pointer", borderRadius: R.pill, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px", backgroundColor: "#FEFCF6", border: `2px solid ${C.border}22`, borderRadius: R.hero, textAlign: "center" as const }}>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted }}>No active observations match this filter.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map(obs => {
              const patient = PATIENTS.find(p => p.id === obs.patientId)
              return (
                <div key={obs.id}>
                  {patient && (
                    <div style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: C.accent, marginBottom: "4px", letterSpacing: "0.04em" }}>{patient.name}</div>
                  )}
                  <ObservationCard obs={obs} onAction={() => {}} />
                </div>
              )
            })}
          </div>
        )}

        {/* spec §6 suppressed section — must always be present, never hidden silently */}
        {suppressed.length > 0 && (
          <div style={{ marginTop: "24px", border: `2px solid ${C.border}22`, borderRadius: R.row, overflow: "hidden" }}>
            <button onClick={() => setShowSuppressed(s => !s)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#FEFCF6", border: "none", cursor: "pointer" }}>
              <div style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: C.muted }}>Not shown right now ({suppressed.length})</div>
              <IcDown s={16} />
            </button>
            {showSuppressed && (
              <div>
                {suppressed.map((obs, i) => {
                  const patient = PATIENTS.find(p => p.id === obs.patientId)
                  return (
                    <div key={obs.id} style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}18`, backgroundColor: "#F5F0E8" }}>
                      <div style={{ fontFamily: F.body, fontSize: "16px", color: C.text, marginBottom: "3px" }}>{patient?.name} — {obs.explanationCode.replace(/_/g, " ")}</div>
                      <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted }}>{suppressLabels[obs.suppressReason!] || obs.suppressReason}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ACCESS SCREEN — spec §9 ─────────────────────────────────────────────────

function CgAccessScreen() {
  const [revoking, setRevoking] = useState<{ patientId: string; purpose: string } | null>(null)
  const [consentState, setConsentState] = useState(CONSENT)

  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: C.bg }}>
      <TopBar title="Access & Consent" />
      <div style={{ padding: "20px" }}>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: C.muted, lineHeight: 1.6, marginBottom: "20px" }}>
          Manage data access and consent for each patient. Revocation may not take effect immediately on offline devices.
        </div>

        {PATIENTS.map(p => (
          <div key={p.id} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <IcPerson s={20} />
              </div>
              <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: C.text }}>{p.name}</div>
              <DeviceDot status={p.deviceStatus} />
            </div>

            <div style={{ border: `2px solid ${C.border}22`, borderRadius: R.row, overflow: "hidden" }}>
              {(consentState[p.id] || []).map((r, i) => (
                <div key={r.purpose} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: "#FEFCF6", borderBottom: i < (consentState[p.id] || []).length - 1 ? `1px solid ${C.border}18` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: F.body, fontSize: "16px", color: C.text }}>{r.label}</div>
                    <div style={{ fontFamily: F.body, fontSize: "14px", color: C.muted }}>{r.grantedAt || "Pending"}</div>
                  </div>
                  <span style={{ padding: "2px 8px", backgroundColor: r.status === "granted" ? "#E5F0E8" : r.status === "revoked" ? "#F5E8E5" : "#F5F0E8", color: r.status === "granted" ? C.confirm : r.status === "revoked" ? C.stop : C.muted, fontFamily: F.body, fontSize: "13px", fontWeight: 700, borderRadius: R.pill }}>
                    {r.status.toUpperCase()}
                  </span>
                  {r.status === "granted" && (
                    <button onClick={() => setRevoking({ patientId: p.id, purpose: r.purpose })} style={{ padding: "4px 10px", backgroundColor: "#F9ECEB", color: C.stop, fontFamily: F.body, fontSize: "13px", fontWeight: 700, border: `1px solid ${C.stop}55`, cursor: "pointer", borderRadius: R.pill }}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Revoke confirm sheet — spec §9.2 */}
      {revoking && (
        <div style={{ position: "fixed" as const, inset: 0, backgroundColor: "rgba(43,38,32,0.55)", zIndex: 100, display: "flex", alignItems: "flex-end" as const }}>
          <div style={{ width: "100%", maxWidth: "430px", margin: "0 auto", backgroundColor: "#FEFCF6", borderRadius: `${R.hero} ${R.hero} 0 0`, border: `2px solid ${C.stop}`, padding: "24px 20px 36px" }}>
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: C.stop, marginBottom: "12px" }}>Revoke access?</div>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: C.text, lineHeight: 1.6, marginBottom: "24px" }}>
              This person will lose access. If their device is offline, access may continue until their local authorization expires.
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
              <button
                onClick={() => {
                  const { patientId, purpose } = revoking
                  setConsentState(prev => ({
                    ...prev,
                    [patientId]: prev[patientId].map(r => r.purpose === purpose ? { ...r, status: "revoked" as const, grantedAt: "" } : r),
                  }))
                  setRevoking(null)
                }}
                style={{ height: "56px", backgroundColor: C.stop, color: "#fff", fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: R.row }}
              >
                Revoke access
              </button>
              <button onClick={() => setRevoking(null)} style={{ height: "56px", backgroundColor: "#F5F0E8", color: C.text, fontFamily: F.body, fontSize: "18px", fontWeight: 700, border: `2px solid ${C.border}44`, cursor: "pointer", borderRadius: R.row }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function CaregiverDashboard() {
  const [tab,       setTab]       = useState<CgTab>("home")
  const [patientId, setPatientId] = useState<string | null>(null)

  const selectedPatient = PATIENTS.find(p => p.id === patientId) ?? null

  function selectPatient(id: string) {
    setPatientId(id)
    setTab("patients")
  }

  function handleNav(t: CgTab) {
    setTab(t)
    if (t !== "patients") setPatientId(null)
  }

  const showDetail = tab === "patients" && selectedPatient

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: C.bg, overflow: "hidden" }}>
      <AssistedBanner />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {showDetail ? (
          <PatientDetail patient={selectedPatient!} onBack={() => setPatientId(null)} />
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {tab === "home"          && <CgHomeScreen onSelectPatient={selectPatient} />}
            {tab === "patients"      && <CgPatientsScreen onSelectPatient={selectPatient} />}
            {tab === "notifications" && <CgNotificationsScreen />}
            {tab === "access"        && <CgAccessScreen />}
          </div>
        )}

        {!showDetail && <BottomTabBar active={tab} onNavigate={handleNav} />}
      </div>
    </div>
  )
}
