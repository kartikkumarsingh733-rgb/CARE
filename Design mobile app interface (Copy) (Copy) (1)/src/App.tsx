import { useState, useEffect, useRef } from "react"
import CaregiverDashboard from "./CaregiverDashboard"
import { ReminderProvider, useReminders, parseTimeMins } from "./reminderStore"

type Screen = "home" | "play" | "myday" | "memories" | "help"

// ─── Inline SVG icons — filled, bold, literal shapes ───────────────────────

const IcHome = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)

const IcPuzzle = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.5 2.5 0 0 1 0 5H2V19a2 2 0 0 0 2 2h3.8v-1.5a2.5 2.5 0 0 1 5 0V21H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
  </svg>
)

const IcCalendar = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
)

const IcPhoto = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
)

const IcPhone = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
)

const IcMedicine = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
  </svg>
)

const IcFood = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
  </svg>
)

const IcWalk = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
  </svg>
)

const IcWater = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
  </svg>
)

const IcCheck = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

const IcArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </svg>
)

const IcBrain = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a9 9 0 0 1 9 9c0 3.07-1.54 5.78-3.9 7.43L16 20h-4l-1.5-2H9l-1.5 2H3.9C1.54 18.78 0 16.07 0 13A9 9 0 0 1 9 4h1a9 9 0 0 1 2-.2zM9 6a7 7 0 1 0 6 11H9a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3V6zm6 0v3a1 1 0 1 0 2 0V6h-2z" />
  </svg>
)

const IcEye = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
)

const IcSun = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
  </svg>
)

const IcPerson = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
)

const IcAlert = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
)

const IcStar = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

const IcMic = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
  </svg>
)

const IcChat = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </svg>
)

const IcClose = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

const IcTemple = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3L2 9h3v9H2v3h20v-3h-3V9h3L12 3zm-1 9h2v6h-2v-6zm-4 0h2v6H7v-6zm10 0h2v6h-2v-6z" />
  </svg>
)

const IcBed = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
  </svg>
)

// ─── Shared tokens ──────────────────────────────────────────────────────────

const F = {
  display: "'Atkinson Hyperlegible', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
}

// ─── Section label ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: F.body,
      fontSize: "13px",
      fontWeight: 700,
      color: "#6B4C35",
      letterSpacing: "0.1em",
      marginBottom: "10px",
    }}
  >
    {children}
  </div>
)

// ─── UP NEXT CARD (replaces carousel) ───────────────────────────────────────

type ReminderCard = {
  iconKey: string
  accent: string
  shadow: string
  bg: string
  title: string
  body: string
  timeH: number
  timeM: number
}

const reminderCards: ReminderCard[] = [
  {
    iconKey: "medicine",
    accent: "#C4822A",
    shadow: "#8B3A2A",
    bg: "#FDF0E0",
    title: "Take Afternoon Medicine",
    body: "2 tablets with water",
    timeH: 13, timeM: 0,
  },
  {
    iconKey: "food",
    accent: "#2D5A3D",
    shadow: "#1A3825",
    bg: "#E8F0EB",
    title: "Lunch Time",
    body: "Dal, rice, and salad are ready",
    timeH: 13, timeM: 30,
  },
  {
    iconKey: "water",
    accent: "#3B6B8A",
    shadow: "#1E3D52",
    bg: "#E8F1F8",
    title: "Drink Water",
    body: "Stay hydrated — have a full glass",
    timeH: 15, timeM: 0,
  },
  {
    iconKey: "walk",
    accent: "#5A6B2A",
    shadow: "#2E381A",
    bg: "#EFF2E0",
    title: "Evening Walk",
    body: "20 minutes outside is good for you",
    timeH: 16, timeM: 0,
  },
  {
    iconKey: "calendar",
    accent: "#8B3A2A",
    shadow: "#5A1E12",
    bg: "#F5E8E5",
    title: "Priya is visiting today",
    body: "Your daughter will arrive soon",
    timeH: 17, timeM: 0,
  },
]

function cardIcon(key: string, size = 28) {
  if (key === "medicine") return <IcMedicine size={size} />
  if (key === "food") return <IcFood size={size} />
  if (key === "calendar") return <IcCalendar size={size} />
  if (key === "water") return <IcWater size={size} />
  if (key === "walk") return <IcWalk size={size} />
  return null
}

function UpNextCard() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const nowMins = now.getHours() * 60 + now.getMinutes()

  const upcoming = reminderCards
    .map(c => ({ ...c, totalMins: c.timeH * 60 + c.timeM }))
    .filter(c => c.totalMins >= nowMins)
    .sort((a, b) => a.totalMins - b.totalMins)

  const card = upcoming[0] || null

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, "0")} ${period}`
  }

  return (
    <div style={{ margin: "20px 16px 0" }}>
      <SectionLabel>UP NEXT</SectionLabel>

      {card ? (
        <div
          style={{
            backgroundColor: card.bg,
            borderTop: `1px solid ${card.accent}44`,
            borderRight: `1px solid ${card.accent}44`,
            borderBottom: `1px solid ${card.accent}44`,
            borderLeft: `6px solid ${card.accent}`,
            padding: "20px",
            boxShadow: `3px 3px 0px ${card.shadow}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div
              style={{
                flexShrink: 0,
                width: "56px",
                height: "56px",
                backgroundColor: card.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                borderRadius: "4px",
              }}
            >
              {cardIcon(card.iconKey)}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: card.accent,
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                {formatTime(card.timeH, card.timeM)}
              </div>
              <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", lineHeight: 1.2 }}>
                {card.title}
              </div>
              <div style={{ fontFamily: F.body, fontSize: "17px", color: "#4A3828", marginTop: "5px", lineHeight: 1.4 }}>
                {card.body}
              </div>
            </div>
          </div>

          {/* Remaining items as quiet pills */}
          {upcoming.length > 1 && (
            <div style={{ marginTop: "14px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {upcoming.slice(1, 4).map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: F.body,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: c.accent,
                    backgroundColor: c.bg,
                    border: `1px solid ${c.accent}55`,
                    padding: "3px 10px",
                    borderRadius: "2px",
                  }}
                >
                  {formatTime(c.timeH, c.timeM)} · {c.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#E8F0EB",
            borderLeft: "6px solid #2D5A3D",
            padding: "20px",
            boxShadow: "3px 3px 0px #1A3825",
          }}
        >
          <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#2D5A3D", lineHeight: 1.3 }}>
            All done for today!
          </div>
          <div style={{ fontFamily: F.body, fontSize: "17px", color: "#4A3828", marginTop: "6px" }}>
            You have completed everything. Rest well tonight.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HOME SCREEN ────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const h = now.getHours()
  const greeting = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const navTiles = [
    {
      s: "play" as Screen,
      label: "Play Games",
      sub: "Memory · Attention · Patterns",
      icon: <IcPuzzle size={34} />,
      bg: "#3B6B8A",
      sh: "#1E3D52",
    },
    {
      s: "myday" as Screen,
      label: "My Day",
      sub: "Reminders and today's routine",
      icon: <IcCalendar size={34} />,
      bg: "#8B3A2A",
      sh: "#5A1E12",
    },
    {
      s: "memories" as Screen,
      label: "My Memories",
      sub: "Family photos and stories",
      icon: <IcPhoto size={34} />,
      bg: "#5A6B2A",
      sh: "#2E381A",
    },
    {
      s: "help" as Screen,
      label: "I Need Help",
      sub: "Call family or caregiver",
      icon: <IcPhone size={34} />,
      bg: "#B52C1A",
      sh: "#7A150C",
    },
  ]

  return (
    <div style={{ paddingBottom: "16px" }}>
      {/* Time + Date header */}
      <div
        style={{
          backgroundColor: "#2D5A3D",
          padding: "28px 24px 24px",
          boxShadow: "0 4px 0px #1A3825",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: "clamp(28px, 8vw, 40px)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {greeting},
          </div>
          <div
            style={{
              fontFamily: F.display,
              fontSize: "clamp(28px, 8vw, 40px)",
              fontWeight: 700,
              color: "#A8D4B5",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Rameshji
          </div>
        </div>

        <div style={{ flexShrink: 0, width: "110px", textAlign: "right" }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: "26px",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              fontFamily: F.display,
              fontSize: "12px",
              color: "#A8D4B5",
              marginTop: "6px",
              letterSpacing: "0.01em",
              lineHeight: 1.4,
            }}
          >
            {dateStr}
          </div>
        </div>
      </div>

      {/* Up Next card */}
      <UpNextCard />

      {/* Navigation tiles */}
      <div style={{ margin: "24px 16px 0" }}>
        <SectionLabel>WHAT WOULD YOU LIKE TO DO?</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {navTiles.map(({ s, label, sub, icon, bg, sh }) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                backgroundColor: "#FDF0E0",
                border: "1px solid #C4A882",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: `3px 3px 0px ${sh}`,
                minHeight: "84px",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: "60px",
                  height: "60px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  borderRadius: "2px",
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", lineHeight: 1.2 }}>
                  {label}
                </div>
                <div style={{ fontFamily: F.body, fontSize: "16px", color: "#6B4C35", marginTop: "3px" }}>
                  {sub}
                </div>
              </div>
              <div style={{ color: "#9B8070", flexShrink: 0 }}>
                <IcArrow size={22} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PLAY SCREEN — 4 cognitive games ────────────────────────────────────────

type GameKey = "yaad-rakho" | "nazar-tez" | "milan" | "mera-din"

type Obj = { id: string; emoji: string; name: string; cat: string }

const OBJ_POOL: Obj[] = [
  { id: "apple",     emoji: "🍎", name: "Apple",     cat: "fruit" },
  { id: "banana",    emoji: "🍌", name: "Banana",    cat: "fruit" },
  { id: "orange",    emoji: "🍊", name: "Orange",    cat: "fruit" },
  { id: "mango",     emoji: "🥭", name: "Mango",     cat: "fruit" },
  { id: "grapes",    emoji: "🍇", name: "Grapes",    cat: "fruit" },
  { id: "flower",    emoji: "🌺", name: "Flower",    cat: "nature" },
  { id: "moon",      emoji: "🌙", name: "Moon",      cat: "nature" },
  { id: "star",      emoji: "⭐", name: "Star",      cat: "nature" },
  { id: "tree",      emoji: "🌳", name: "Tree",      cat: "nature" },
  { id: "bird",      emoji: "🐦", name: "Bird",      cat: "animal" },
  { id: "elephant",  emoji: "🐘", name: "Elephant",  cat: "animal" },
  { id: "fish",      emoji: "🐟", name: "Fish",      cat: "animal" },
  { id: "butterfly", emoji: "🦋", name: "Butterfly", cat: "animal" },
  { id: "car",       emoji: "🚗", name: "Car",       cat: "vehicle" },
  { id: "train",     emoji: "🚂", name: "Train",     cat: "vehicle" },
  { id: "house",     emoji: "🏠", name: "House",     cat: "place" },
  { id: "book",      emoji: "📚", name: "Book",      cat: "object" },
  { id: "bell",      emoji: "🔔", name: "Bell",      cat: "object" },
  { id: "cup",       emoji: "☕", name: "Cup",       cat: "kitchen" },
  { id: "spoon",     emoji: "🥄", name: "Spoon",     cat: "kitchen" },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sampleN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

function GameBackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        background: "none", border: "none", color: "#A8D4B5",
        fontFamily: F.body, fontSize: "15px", fontWeight: 600,
        cursor: "pointer", padding: 0, marginBottom: "10px",
        display: "flex", alignItems: "center", gap: "4px",
      }}
    >
      ← Back to Games
    </button>
  )
}

function PraiseScreen({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "80px", marginBottom: "20px" }}>🌟</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: i === 0 ? F.display : F.body, fontSize: i === 0 ? "26px" : "19px", fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "#1C1008" : "#6B4C35", marginBottom: "10px", lineHeight: 1.4 }}>{l}</div>
      ))}
      <button onClick={onDone} style={{ marginTop: "28px", padding: "18px 36px", backgroundColor: "#2D5A3D", color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "3px 3px 0px #1A3825" }}>
        Back to Games
      </button>
    </div>
  )
}

// ─── YAAD RAKHO (Memory) ──────────────────────────────────────────────────────

type YRPhase = "intro" | "presenting" | "filler" | "probing" | "feedback" | "done"

function YaadRakho({ onBack }: { onBack: () => void }) {
  const ITEM_COUNT = 3
  const [items] = useState<Obj[]>(() => sampleN(OBJ_POOL, ITEM_COUNT))
  const [phase, setPhase] = useState<YRPhase>("intro")
  const [presentIdx, setPresentIdx] = useState(0)
  const [probeOrder, setProbeOrder] = useState<Obj[]>([])
  const [probeIdx, setProbeIdx] = useState(0)
  const [choices, setChoices] = useState<Obj[]>([])
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)

  const BG = "#3B6B8A", SH = "#1E3D52"

  function buildChoices(target: Obj) {
    const others = sampleN(OBJ_POOL.filter(o => o.id !== target.id), 2)
    setChoices(shuffle([target, ...others]))
  }

  function startProbes() {
    const order = shuffle(items)
    setProbeOrder(order)
    setProbeIdx(0)
    buildChoices(order[0])
    setPhase("probing")
  }

  function handlePick(chosen: Obj) {
    const ok = chosen.id === probeOrder[probeIdx].id
    if (ok) setScore(s => s + 1)
    setLastCorrect(ok)
    setPhase("feedback")
  }

  function nextProbe() {
    const next = probeIdx + 1
    if (next < probeOrder.length) {
      setProbeIdx(next)
      buildChoices(probeOrder[next])
      setLastCorrect(null)
      setPhase("probing")
    } else {
      setPhase("done")
    }
  }

  const target = probeOrder[probeIdx]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ backgroundColor: BG, padding: "20px 20px 16px", boxShadow: `0 4px 0px ${SH}`, flexShrink: 0 }}>
        <GameBackBtn onBack={onBack} />
        <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#FFFFFF" }}>Yaad Rakho</div>
        <div style={{ fontFamily: F.body, fontSize: "15px", color: "#B8D4E8", marginTop: "2px" }}>याद रखो · Memory</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {phase === "intro" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🧠</div>
            <div style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 700, color: "#1C1008", marginBottom: "12px" }}>I will show you some pictures.</div>
            <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.5, marginBottom: "32px" }}>Try to remember them. Then I will ask you to find them.</div>
            <button onClick={() => { setPresentIdx(0); setPhase("presenting") }} style={{ padding: "20px 48px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "22px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              Start
            </button>
          </div>
        )}

        {phase === "presenting" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em", marginBottom: "16px" }}>
              Picture {presentIdx + 1} of {ITEM_COUNT}
            </div>
            <div style={{ fontSize: "120px", lineHeight: 1, marginBottom: "20px" }}>{items[presentIdx].emoji}</div>
            <div style={{ fontFamily: F.display, fontSize: "32px", fontWeight: 700, color: "#1C1008", marginBottom: "40px" }}>{items[presentIdx].name}</div>
            <button
              onClick={() => presentIdx + 1 < ITEM_COUNT ? setPresentIdx(i => i + 1) : setPhase("filler")}
              style={{ padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}
            >
              {presentIdx + 1 < ITEM_COUNT ? "Next Picture →" : "I'm Ready!"}
            </button>
          </div>
        )}

        {phase === "filler" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "28px" }}>Now let's see how many you remember!</div>
            <button onClick={startProbes} style={{ fontSize: "80px", background: "none", border: "4px solid #C4822A", borderRadius: "50%", width: "140px", height: "140px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0px #8B3A2A" }}>
              ☀️
            </button>
            <div style={{ fontFamily: F.body, fontSize: "18px", color: "#6B4C35", marginTop: "20px" }}>Tap the sun to continue</div>
          </div>
        )}

        {phase === "probing" && target && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
            <div style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em", textAlign: "center", marginBottom: "12px" }}>
              Question {probeIdx + 1} of {probeOrder.length}
            </div>
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", textAlign: "center", marginBottom: "6px" }}>Which picture did you see?</div>
            <div style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 700, color: BG, textAlign: "center", marginBottom: "32px" }}>Find: {target.name}</div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {choices.map(c => (
                <button
                  key={c.id}
                  onClick={() => handlePick(c)}
                  style={{ flex: 1, maxWidth: "115px", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#FFFFFF", border: "2px solid #C4A882", cursor: "pointer", boxShadow: "2px 2px 0px #9B8070", fontFamily: F.body, fontSize: "14px", fontWeight: 600, color: "#6B4C35" }}
                >
                  <span style={{ fontSize: "50px", lineHeight: 1 }}>{c.emoji}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && target && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            {lastCorrect ? (
              <>
                <div style={{ fontSize: "60px", marginBottom: "12px" }}>✨</div>
                <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#2D5A3D", marginBottom: "10px" }}>Well done!</div>
                <div style={{ fontSize: "80px", marginBottom: "10px" }}>{target.emoji}</div>
                <div style={{ fontFamily: F.display, fontSize: "22px", color: "#1C1008" }}>Yes, that is {target.name}!</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "10px" }}>Let's look at it again</div>
                <div style={{ fontSize: "80px", marginBottom: "10px" }}>{target.emoji}</div>
                <div style={{ fontFamily: F.display, fontSize: "22px", color: BG }}>Here it is — {target.name}</div>
              </>
            )}
            <button onClick={nextProbe} style={{ marginTop: "32px", padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              {probeIdx + 1 < probeOrder.length ? "Next →" : "Finish"}
            </button>
          </div>
        )}

        {phase === "done" && (
          <PraiseScreen
            lines={["You did wonderfully!", `You remembered ${score} out of ${ITEM_COUNT} pictures.`, "Memory practice helps keep our mind strong."]}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  )
}

// ─── NAZAR TEZ (Attention) ────────────────────────────────────────────────────

type NTPhase = "intro" | "cue" | "array" | "feedback" | "done"

function NazarTez({ onBack }: { onBack: () => void }) {
  const ROUNDS = 5
  const SET_SIZE = 6
  const WINDOW_MS = 5000
  const BG = "#8B3A2A", SH = "#5A1E12"

  const [phase, setPhase] = useState<NTPhase>("intro")
  const [round, setRound] = useState(0)
  const [target, setTarget] = useState<Obj | null>(null)
  const [grid, setGrid] = useState<Obj[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(WINDOW_MS)
  const [feedbackOk, setFeedbackOk] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  function startRound(r: number) {
    const tgt = sampleN(OBJ_POOL, 1)[0]
    const distractors = sampleN(OBJ_POOL.filter(o => o.id !== tgt.id), SET_SIZE - 1)
    setTarget(tgt)
    setGrid(shuffle([tgt, ...distractors]))
    setTimeLeft(WINDOW_MS)
    setFeedbackOk(false)
    setRound(r)
    setPhase("cue")
  }

  function beginArray() {
    setPhase("array")
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 100) {
          clearTimer()
          setFeedbackOk(false)
          setPhase("feedback")
          return 0
        }
        return t - 100
      })
    }, 100)
  }

  function handleTap(obj: Obj) {
    if (phase !== "array") return
    clearTimer()
    const ok = target !== null && obj.id === target.id
    if (ok) setScore(s => s + 1)
    setFeedbackOk(ok)
    setPhase("feedback")
  }

  function nextRound() {
    if (round + 1 < ROUNDS) startRound(round + 1)
    else setPhase("done")
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ backgroundColor: BG, padding: "20px 20px 16px", boxShadow: `0 4px 0px ${SH}`, flexShrink: 0 }}>
        <GameBackBtn onBack={onBack} />
        <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#FFFFFF" }}>Nazar Tez</div>
        <div style={{ fontFamily: F.body, fontSize: "15px", color: "#E8C4B8", marginTop: "2px" }}>नज़र तेज़ · Sharp Eyes</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {phase === "intro" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>👁️</div>
            <div style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 700, color: "#1C1008", marginBottom: "12px" }}>Find the Picture!</div>
            <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.5, marginBottom: "32px" }}>
              I will show you a picture. Find it in the grid. There is no hurry.
            </div>
            <button onClick={() => startRound(0)} style={{ padding: "20px 48px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "22px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              Start
            </button>
          </div>
        )}

        {phase === "cue" && target && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em", marginBottom: "16px" }}>Round {round + 1} of {ROUNDS}</div>
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "12px" }}>Find this:</div>
            <div style={{ fontSize: "100px", lineHeight: 1, marginBottom: "12px" }}>{target.emoji}</div>
            <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: BG, marginBottom: "36px" }}>{target.name}</div>
            <button onClick={beginArray} style={{ padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              I'm Ready →
            </button>
          </div>
        )}

        {phase === "array" && target && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px" }}>
            <div style={{ height: "12px", backgroundColor: "#E8D5BE", marginBottom: "14px", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(timeLeft / WINDOW_MS) * 100}%`, backgroundColor: timeLeft > 2000 ? "#2D5A3D" : "#C4822A", transition: "width 0.1s linear, background-color 0.3s" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", padding: "8px 12px", backgroundColor: "#FDF0E0", border: "2px solid #C4A882" }}>
              <span style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 700, color: "#6B4C35" }}>Find:</span>
              <span style={{ fontSize: "26px" }}>{target.emoji}</span>
              <span style={{ fontFamily: F.display, fontSize: "18px", fontWeight: 700, color: "#1C1008" }}>{target.name}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {grid.map((obj, i) => (
                <button
                  key={`${obj.id}-${i}`}
                  onClick={() => handleTap(obj)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", aspectRatio: "1", backgroundColor: "#FFFFFF", border: "2px solid #C4A882", cursor: "pointer", boxShadow: "2px 2px 0px #9B8070", fontFamily: F.body, fontSize: "13px", fontWeight: 600, color: "#6B4C35" }}
                >
                  <span style={{ fontSize: "42px", lineHeight: 1 }}>{obj.emoji}</span>
                  {obj.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && target && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            {feedbackOk ? (
              <>
                <div style={{ fontSize: "60px", marginBottom: "12px" }}>✨</div>
                <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#2D5A3D", marginBottom: "10px" }}>Found it!</div>
                <div style={{ fontSize: "80px", marginBottom: "10px" }}>{target.emoji}</div>
                <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35" }}>You spotted the {target.name}!</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "10px" }}>Here it is</div>
                <div style={{ fontSize: "80px", marginBottom: "10px" }}>{target.emoji}</div>
                <div style={{ fontFamily: F.body, fontSize: "19px", color: "#3B6B8A" }}>That was the {target.name}. Let's try the next one!</div>
              </>
            )}
            <button onClick={nextRound} style={{ marginTop: "32px", padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              {round + 1 < ROUNDS ? "Next Round →" : "Finish"}
            </button>
          </div>
        )}

        {phase === "done" && (
          <PraiseScreen
            lines={["Wonderful effort!", `You found ${score} out of ${ROUNDS} pictures.`, "Sharp eyes and focused attention — well done, Rameshji!"]}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  )
}

// ─── MILAN (Pattern Recognition) ──────────────────────────────────────────────

type MilanPhase = "intro" | "trial" | "feedback" | "done"

const MILAN_ROUNDS = [
  { items: ["apple","banana","orange","car"],      odd: "car",       reason: "The car is not a fruit." },
  { items: ["bird","fish","elephant","flower"],     odd: "flower",    reason: "The flower is not an animal." },
  { items: ["cup","spoon","bell","train"],          odd: "train",     reason: "The train is not a kitchen item." },
  { items: ["moon","star","tree","car"],            odd: "car",       reason: "The car does not belong in the sky." },
  { items: ["apple","grapes","orange","elephant"],  odd: "elephant",  reason: "The elephant is not a fruit." },
  { items: ["flower","tree","butterfly","moon"],    odd: "moon",      reason: "The moon is in the sky, not a living thing." },
]

function Milan({ onBack }: { onBack: () => void }) {
  const BG = "#5A6B2A", SH = "#2E381A"

  const [phase, setPhase] = useState<MilanPhase>("intro")
  const [roundIdx, setRoundIdx] = useState(0)
  const [shuffledItems, setShuffledItems] = useState<Obj[]>([])
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)

  function getObj(id: string): Obj { return OBJ_POOL.find(o => o.id === id)! }

  function startRound(idx: number) {
    setShuffledItems(shuffle(MILAN_ROUNDS[idx].items.map(getObj)))
    setRoundIdx(idx)
    setPhase("trial")
  }

  function handleTap(obj: Obj) {
    const ok = obj.id === MILAN_ROUNDS[roundIdx].odd
    if (ok) setScore(s => s + 1)
    setLastCorrect(ok)
    setPhase("feedback")
  }

  function nextRound() {
    if (roundIdx + 1 < MILAN_ROUNDS.length) startRound(roundIdx + 1)
    else setPhase("done")
  }

  const oddObj = roundIdx < MILAN_ROUNDS.length ? getObj(MILAN_ROUNDS[roundIdx].odd) : null

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ backgroundColor: BG, padding: "20px 20px 16px", boxShadow: `0 4px 0px ${SH}`, flexShrink: 0 }}>
        <GameBackBtn onBack={onBack} />
        <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#FFFFFF" }}>Milan</div>
        <div style={{ fontFamily: F.body, fontSize: "15px", color: "#C8D4A8", marginTop: "2px" }}>मिलान · Patterns & Objects</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {phase === "intro" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🔍</div>
            <div style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 700, color: "#1C1008", marginBottom: "12px" }}>Tap the One That Is Different</div>
            <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.5, marginBottom: "32px" }}>
              Look at the pictures. One does not belong with the others. Can you find it?
            </div>
            <button onClick={() => startRound(0)} style={{ padding: "20px 48px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "22px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              Start
            </button>
          </div>
        )}

        {phase === "trial" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
            <div style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em", textAlign: "center", marginBottom: "16px" }}>
              Round {roundIdx + 1} of {MILAN_ROUNDS.length}
            </div>
            <div style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 700, color: "#1C1008", textAlign: "center", marginBottom: "28px" }}>
              Tap the one that is different
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {shuffledItems.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => handleTap(obj)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px 12px", backgroundColor: "#FFFFFF", border: "2px solid #C4A882", cursor: "pointer", boxShadow: "3px 3px 0px #9B8070", fontFamily: F.display, fontSize: "18px", fontWeight: 700, color: "#1C1008" }}
                >
                  <span style={{ fontSize: "56px", lineHeight: 1 }}>{obj.emoji}</span>
                  {obj.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && oddObj && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            {lastCorrect ? (
              <>
                <div style={{ fontSize: "60px", marginBottom: "12px" }}>✨</div>
                <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#2D5A3D", marginBottom: "10px" }}>That's right!</div>
                <div style={{ fontSize: "72px", marginBottom: "10px" }}>{oddObj.emoji}</div>
                <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.5 }}>{MILAN_ROUNDS[roundIdx].reason}</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "14px" }}>Let's look again</div>
                <div style={{ fontSize: "72px", marginBottom: "8px" }}>{oddObj.emoji}</div>
                <div style={{ fontFamily: F.display, fontSize: "20px", fontWeight: 700, color: BG, marginBottom: "8px" }}>The {oddObj.name} is the different one</div>
                <div style={{ fontFamily: F.body, fontSize: "18px", color: "#6B4C35" }}>{MILAN_ROUNDS[roundIdx].reason}</div>
              </>
            )}
            <button onClick={nextRound} style={{ marginTop: "32px", padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              {roundIdx + 1 < MILAN_ROUNDS.length ? "Next →" : "Finish"}
            </button>
          </div>
        )}

        {phase === "done" && (
          <PraiseScreen
            lines={["Well done!", `You spotted ${score} out of ${MILAN_ROUNDS.length} patterns.`, "Noticing differences keeps our mind sharp and focused."]}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  )
}

// ─── MERA DIN (Orientation / Daily Function) ──────────────────────────────────

type MDPhase = "intro" | "sequence" | "seqdone" | "timecheck" | "done"

const ROUTINE = [
  { id: "wake",  emoji: "☀️", label: "Wake up",     order: 0 },
  { id: "wash",  emoji: "💧", label: "Wash face",   order: 1 },
  { id: "tea",   emoji: "☕", label: "Have tea",    order: 2 },
  { id: "dress", emoji: "👕", label: "Get dressed", order: 3 },
]

const TIME_OPTS = [
  { id: "morning",   emoji: "🌅", label: "Morning" },
  { id: "afternoon", emoji: "🌞", label: "Afternoon" },
  { id: "evening",   emoji: "🌆", label: "Evening" },
  { id: "night",     emoji: "🌙", label: "Night" },
]

function getTimeBucket(): string {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  if (h < 20) return "evening"
  return "night"
}

function MeraDin({ onBack }: { onBack: () => void }) {
  const BG = "#6B4C8B", SH = "#3D1E5A"

  const [phase, setPhase] = useState<MDPhase>("intro")
  const [shuffled, setShuffled] = useState<typeof ROUTINE>([])
  const [selected, setSelected] = useState<string[]>([])
  const [wrongTaps, setWrongTaps] = useState(0)
  const [hintId, setHintId] = useState<string | null>(null)
  const [timePicked, setTimePicked] = useState<string | null>(null)

  function startSequence() {
    setShuffled(shuffle(ROUTINE))
    setSelected([])
    setWrongTaps(0)
    setHintId(null)
    setPhase("sequence")
  }

  function handleStepTap(step: typeof ROUTINE[0]) {
    const expected = ROUTINE[selected.length]
    if (step.id === expected.id) {
      const next = [...selected, step.id]
      setSelected(next)
      setWrongTaps(0)
      setHintId(null)
      if (next.length === ROUTINE.length) setPhase("seqdone")
    } else {
      const w = wrongTaps + 1
      setWrongTaps(w)
      if (w >= 2) setHintId(expected.id)
    }
  }

  const remaining = shuffled.filter(s => !selected.includes(s.id))

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ backgroundColor: BG, padding: "20px 20px 16px", boxShadow: `0 4px 0px ${SH}`, flexShrink: 0 }}>
        <GameBackBtn onBack={onBack} />
        <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#FFFFFF" }}>Mera Din</div>
        <div style={{ fontFamily: F.body, fontSize: "15px", color: "#D4C0F0", marginTop: "2px" }}>मेरा दिन · My Day</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {phase === "intro" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🌄</div>
            <div style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 700, color: "#1C1008", marginBottom: "12px" }}>Put the Morning in Order</div>
            <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.5, marginBottom: "32px" }}>
              Tap the pictures in the order you do them each morning. Start with what comes first.
            </div>
            <button onClick={startSequence} style={{ padding: "20px 48px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "22px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              Start
            </button>
          </div>
        )}

        {phase === "sequence" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px" }}>
            <div style={{ fontFamily: F.display, fontSize: "20px", fontWeight: 700, color: "#1C1008", textAlign: "center", marginBottom: "16px" }}>
              Tap what you do first, then next…
            </div>

            {selected.length > 0 && (
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em", marginBottom: "8px" }}>YOUR ORDER SO FAR</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {selected.map((id, i) => {
                    const s = ROUTINE.find(x => x.id === id)!
                    return (
                      <div key={id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 4px", backgroundColor: "#E8F0EB", border: "2px solid #2D5A3D" }}>
                        <span style={{ fontSize: "28px" }}>{s.emoji}</span>
                        <span style={{ fontFamily: F.body, fontSize: "11px", fontWeight: 700, color: "#2D5A3D", textAlign: "center" }}>{i + 1}. {s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {hintId && (
              <div style={{ padding: "12px 16px", backgroundColor: "#FFF0D8", borderLeft: "4px solid #C4822A", marginBottom: "16px" }}>
                <div style={{ fontFamily: F.body, fontSize: "16px", color: "#8B4A00" }}>Hint: The next step is highlighted below 👇</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {remaining.map(step => (
                <button
                  key={step.id}
                  onClick={() => handleStepTap(step)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px 12px", backgroundColor: hintId === step.id ? "#FFF0D8" : "#FFFFFF", border: hintId === step.id ? "3px solid #C4822A" : "2px solid #C4A882", cursor: "pointer", boxShadow: hintId === step.id ? "3px 3px 0px #C4822A" : "3px 3px 0px #9B8070", fontFamily: F.display, fontSize: "18px", fontWeight: 700, color: "#1C1008" }}
                >
                  <span style={{ fontSize: "52px", lineHeight: 1 }}>{step.emoji}</span>
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "seqdone" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
            <div style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 700, color: "#2D5A3D", marginBottom: "16px" }}>You remembered the order!</div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "28px", justifyContent: "center" }}>
              {ROUTINE.map(s => <span key={s.id} style={{ fontSize: "40px" }}>{s.emoji}</span>)}
            </div>
            <button onClick={() => setPhase("timecheck")} style={{ padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
              One More Question →
            </button>
          </div>
        )}

        {phase === "timecheck" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
            <div style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 700, color: "#1C1008", textAlign: "center", marginBottom: "28px" }}>
              What time of day is it now?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
              {TIME_OPTS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setTimePicked(opt.id); setPhase("done") }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "24px 12px", backgroundColor: "#FFFFFF", border: "2px solid #C4A882", cursor: "pointer", boxShadow: "3px 3px 0px #9B8070", fontFamily: F.display, fontSize: "20px", fontWeight: 700, color: "#1C1008" }}
                >
                  <span style={{ fontSize: "52px", lineHeight: 1 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && timePicked && (() => {
          const actual = getTimeBucket()
          const picked = TIME_OPTS.find(o => o.id === timePicked)!
          const actualLabel = TIME_OPTS.find(o => o.id === actual)!.label
          return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "72px", marginBottom: "16px" }}>🌟</div>
              <div style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 700, color: "#2D5A3D", marginBottom: "14px" }}>You did wonderfully today!</div>
              <div style={{ fontFamily: F.body, fontSize: "19px", color: "#6B4C35", lineHeight: 1.6, marginBottom: "12px" }}>
                {timePicked === actual
                  ? `Yes! It is ${picked.label}. Your sense of time is very good!`
                  : `It is ${actualLabel} right now. That is okay — keeping track of time is good practice!`}
              </div>
              <div style={{ fontFamily: F.body, fontSize: "17px", color: "#9B8070", lineHeight: 1.5, marginBottom: "32px" }}>
                Thinking about your daily routine helps keep your mind clear and strong.
              </div>
              <button onClick={onBack} style={{ padding: "18px 40px", backgroundColor: BG, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `3px 3px 0px ${SH}` }}>
                Back to Games
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ─── PLAY SCREEN (game menu) ──────────────────────────────────────────────────

function PlayScreen() {
  const [activeGame, setActiveGame] = useState<GameKey | null>(null)

  if (activeGame === "yaad-rakho") return <YaadRakho onBack={() => setActiveGame(null)} />
  if (activeGame === "nazar-tez") return <NazarTez onBack={() => setActiveGame(null)} />
  if (activeGame === "milan") return <Milan onBack={() => setActiveGame(null)} />
  if (activeGame === "mera-din") return <MeraDin onBack={() => setActiveGame(null)} />

  const menuGames = [
    { key: "yaad-rakho" as GameKey, title: "Yaad Rakho", hindi: "याद रखो", tag: "Memory", desc: "Look at pictures and try to remember them.", icon: "🧠", bg: "#3B6B8A", sh: "#1E3D52", lvlBg: "#E8F0EB", lvlFg: "#2D5A3D", lvl: "Easy today" },
    { key: "nazar-tez" as GameKey, title: "Nazar Tez", hindi: "नज़र तेज़", tag: "Attention", desc: "Find the picture in the grid before time is up.", icon: "👁️", bg: "#8B3A2A", sh: "#5A1E12", lvlBg: "#FFF0D8", lvlFg: "#C4822A", lvl: "Medium today" },
    { key: "milan" as GameKey, title: "Milan", hindi: "मिलान", tag: "Patterns", desc: "Tap the picture that does not belong with the others.", icon: "🔍", bg: "#5A6B2A", sh: "#2E381A", lvlBg: "#E8F0EB", lvlFg: "#2D5A3D", lvl: "Easy today" },
    { key: "mera-din" as GameKey, title: "Mera Din", hindi: "मेरा दिन", tag: "Daily Recall", desc: "Put your morning routine in the right order.", icon: "🌄", bg: "#6B4C8B", sh: "#3D1E5A", lvlBg: "#EDE8F5", lvlFg: "#6B4C8B", lvl: "Gentle today" },
  ]

  return (
    <div style={{ paddingBottom: "16px" }}>
      <div style={{ backgroundColor: "#3B6B8A", padding: "28px 24px", boxShadow: "0 4px 0px #1E3D52" }}>
        <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: "#FFFFFF" }}>Let's Play</div>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: "#B8D4E8", marginTop: "4px" }}>Choose a game below. Take your time.</div>
      </div>

      <div style={{ margin: "16px 16px 0", padding: "14px 16px", backgroundColor: "#E8F0EB", borderLeft: "5px solid #2D5A3D" }}>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: "#2D5A3D", fontWeight: 500 }}>You played for 10 minutes yesterday. Great work, Rameshji!</div>
      </div>

      <div style={{ margin: "20px 16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
        {menuGames.map(g => (
          <div key={g.key} style={{ backgroundColor: "#FDF0E0", border: "1px solid #C4A882", boxShadow: `3px 3px 0px ${g.sh}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px" }}>
              <div style={{ flexShrink: 0, width: "68px", height: "68px", backgroundColor: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "38px", borderRadius: "4px" }}>
                {g.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", lineHeight: 1.2 }}>{g.title}</div>
                <div style={{ fontFamily: F.body, fontSize: "13px", color: g.bg, fontWeight: 700, marginTop: "2px" }}>{g.hindi} · {g.tag}</div>
                <div style={{ fontFamily: F.body, fontSize: "16px", color: "#6B4C35", marginTop: "6px", lineHeight: 1.5 }}>{g.desc}</div>
                <div style={{ display: "inline-block", marginTop: "10px", padding: "3px 10px", backgroundColor: g.lvlBg, color: g.lvlFg, fontFamily: F.body, fontSize: "14px", fontWeight: 700, borderRadius: "2px", border: `1px solid ${g.lvlFg}` }}>{g.lvl}</div>
              </div>
            </div>
            <button
              onClick={() => setActiveGame(g.key)}
              style={{ width: "100%", height: "60px", backgroundColor: g.bg, color: "#FFFFFF", fontFamily: F.display, fontSize: "20px", fontWeight: 700, borderTop: "1px solid #C4A882", borderRight: "none", borderBottom: "none", borderLeft: "none", cursor: "pointer", letterSpacing: "0.03em" }}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MY DAY SCREEN ───────────────────────────────────────────────────────────

type ScheduleItem = {
  time: string
  label: string
  desc: string
  iconKey: string
  color: string
  done: boolean
  next?: boolean
  addedBy?: string   // caregiver name if this item was added via the caregiver dashboard
  cgId?: string      // SharedReminder.id — used to identify caregiver-added items
}

function scheduleIcon(key: string, size = 26) {
  if (key === "medicine") return <IcMedicine size={size} />
  if (key === "food") return <IcFood size={size} />
  if (key === "water") return <IcWater size={size} />
  if (key === "walk") return <IcWalk size={size} />
  if (key === "photo") return <IcPhoto size={size} />
  if (key === "star") return <IcStar size={size} />
  if (key === "temple") return <IcTemple size={size} />
  if (key === "rest") return <IcBed size={size} />
  if (key === "phone") return <IcPhone size={size} />
  return <IcCalendar size={size} />
}

const defaultItems: ScheduleItem[] = [
  { time: "8:00 AM", label: "Morning Medicine", desc: "2 tablets with water", iconKey: "medicine", color: "#2D5A3D", done: true },
  { time: "9:00 AM", label: "Breakfast", desc: "Idli and sambar", iconKey: "food", color: "#2D5A3D", done: true },
  { time: "11:00 AM", label: "Drink Water", desc: "A full glass of water", iconKey: "water", color: "#2D5A3D", done: true },
  { time: "1:00 PM", label: "Afternoon Medicine", desc: "2 tablets with water", iconKey: "medicine", color: "#C4822A", done: false, next: true },
  { time: "1:30 PM", label: "Lunch", desc: "Dal, rice and sabzi", iconKey: "food", color: "#3B6B8A", done: false },
  { time: "4:00 PM", label: "Evening Walk", desc: "15 minutes in the garden", iconKey: "walk", color: "#3B6B8A", done: false },
  { time: "5:00 PM", label: "Priya Visits", desc: "Your daughter will come home", iconKey: "photo", color: "#5A6B2A", done: false },
  { time: "9:00 PM", label: "Night Medicine", desc: "1 tablet before sleep", iconKey: "medicine", color: "#3B6B8A", done: false },
]

// Preset tasks for the quick-add form
type TaskPreset = { key: string; label: string; iconKey: string; color: string }
type TimePreset = { key: string; label: string; sub: string; timeStr: string; sortH: number; sortM: number }

const taskPresets: TaskPreset[] = [
  { key: "medicine", label: "Medicine", iconKey: "medicine", color: "#C4822A" },
  { key: "meal", label: "Meal", iconKey: "food", color: "#2D5A3D" },
  { key: "water", label: "Drink Water", iconKey: "water", color: "#3B6B8A" },
  { key: "walk", label: "Walk", iconKey: "walk", color: "#5A6B2A" },
  { key: "doctor", label: "Doctor Visit", iconKey: "star", color: "#6B4C8B" },
  { key: "temple", label: "Temple / Prayer", iconKey: "temple", color: "#8B3A2A" },
  { key: "call", label: "Call Family", iconKey: "phone", color: "#3B6B8A" },
  { key: "rest", label: "Rest / Nap", iconKey: "rest", color: "#6B4C35" },
]

const timePresets: TimePreset[] = [
  { key: "morning", label: "Morning", sub: "8:00 AM", timeStr: "8:00 AM", sortH: 8, sortM: 0 },
  { key: "midday", label: "Midday", sub: "12:00 PM", timeStr: "12:00 PM", sortH: 12, sortM: 0 },
  { key: "afternoon", label: "Afternoon", sub: "3:00 PM", timeStr: "3:00 PM", sortH: 15, sortM: 0 },
  { key: "evening", label: "Evening", sub: "6:00 PM", timeStr: "6:00 PM", sortH: 18, sortM: 0 },
  { key: "night", label: "Night", sub: "9:00 PM", timeStr: "9:00 PM", sortH: 21, sortM: 0 },
]

function MyDayScreen() {
  const { reminders: cgReminders } = useReminders()
  const [items, setItems] = useState<ScheduleItem[]>(defaultItems)
  const [doneCgIds, setDoneCgIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null)
  const [voiceUnavailable, setVoiceUnavailable] = useState(false)

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setVoiceUnavailable(true)
      return
    }
    const r = new SR()
    r.lang = "en-IN"
    r.onstart = () => setIsListening(true)
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript
      setVoiceLabel(transcript)
      setSelectedTask("custom")
      setIsListening(false)
    }
    r.onerror = () => { setIsListening(false); setVoiceUnavailable(true) }
    r.onend = () => setIsListening(false)
    r.start()
  }

  function addTask() {
    const preset = taskPresets.find(p => p.key === selectedTask)
    const time = timePresets.find(t => t.key === selectedTime)
    if (!time) return
    const label = voiceLabel || (preset ? preset.label : "Task")
    const iconKey = preset ? preset.iconKey : "calendar"
    const color = preset ? preset.color : "#5A6B2A"

    const toSortMins = (h: number, m: number) => h * 60 + m
    const newItem: ScheduleItem = { time: time.timeStr, label, desc: "", iconKey, color, done: false }
    const updated = [...items, newItem].sort((a, b) => {
      const parse = (t: string) => {
        const [hm, period] = t.split(" ")
        let [hh, mm] = hm.split(":").map(Number)
        if (period === "PM" && hh !== 12) hh += 12
        if (period === "AM" && hh === 12) hh = 0
        return toSortMins(hh, mm || 0)
      }
      return parse(a.time) - parse(b.time)
    })
    setItems(updated)
    setSelectedTask(null)
    setSelectedTime(null)
    setVoiceLabel(null)
    setShowForm(false)
  }

  function cancelForm() {
    setShowForm(false)
    setSelectedTask(null)
    setSelectedTime(null)
    setVoiceLabel(null)
    setVoiceUnavailable(false)
  }

  const canAdd = (selectedTask !== null || voiceLabel !== null) && selectedTime !== null

  // Merge caregiver-added reminders for Ramesh into the display list
  const cgForRamesh: ScheduleItem[] = cgReminders
    .filter(r => r.patientId === "ramesh")
    .map(r => ({
      time: r.time,
      label: r.label,
      desc: r.desc,
      iconKey: r.iconKey,
      color: "#3B4A63",
      done: doneCgIds.has(r.id),
      addedBy: r.addedBy,
      cgId: r.id,
    }))

  const displayItems = [...items, ...cgForRamesh].sort(
    (a, b) => parseTimeMins(a.time) - parseTimeMins(b.time)
  )

  return (
    <div style={{ paddingBottom: "24px" }}>
      <div
        style={{
          backgroundColor: "#8B3A2A",
          padding: "28px 24px",
          boxShadow: "0 4px 0px #5A1E12",
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: "#FFFFFF" }}>
          My Day
        </div>
        <div style={{ fontFamily: F.body, fontSize: "20px", color: "#E8C4B8", marginTop: "4px" }}>
          Wednesday, 27 August 2025
        </div>
      </div>

      <div style={{ margin: "20px 16px 0" }}>
        <SectionLabel>TODAY'S SCHEDULE</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayItems.map((r, i) => (
            <div
              key={r.cgId ?? i}
              onClick={r.cgId ? () => setDoneCgIds(prev => {
                const next = new Set(prev)
                next.has(r.cgId!) ? next.delete(r.cgId!) : next.add(r.cgId!)
                return next
              }) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                backgroundColor: r.done ? "#F5EDD8" : r.addedBy ? "#EFF2F8" : "#FDF0E0",
                borderTop: "1px solid #C4A882",
                borderRight: "1px solid #C4A882",
                borderBottom: "1px solid #C4A882",
                borderLeft: r.addedBy ? "6px solid #3B4A63" : r.next ? "6px solid #C4822A" : r.done ? "6px solid #A8C4B0" : "1px solid #C4A882",
                opacity: r.done ? 0.65 : 1,
                boxShadow: r.next ? "3px 3px 0px #8B3A2A" : "none",
                cursor: r.cgId ? "pointer" : "default",
              }}
            >
              <div style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 600, color: "#6B4C35", minWidth: "58px", textAlign: "right", flexShrink: 0 }}>
                {r.time}
              </div>
              <div style={{ width: "2px", height: "46px", backgroundColor: r.done ? "#C4A882" : r.color, flexShrink: 0 }} />
              <div style={{ flexShrink: 0, width: "46px", height: "46px", backgroundColor: r.done ? "#B8A890" : r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", borderRadius: "2px" }}>
                {r.done ? <IcCheck size={22} /> : scheduleIcon(r.iconKey)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontSize: "20px", fontWeight: 700, color: r.done ? "#9B8070" : "#1C1008", textDecoration: r.done ? "line-through" : "none", lineHeight: 1.2 }}>
                  {r.label}
                </div>
                {r.desc ? (
                  <div style={{ fontFamily: F.body, fontSize: "15px", color: "#6B4C35", marginTop: "2px" }}>{r.desc}</div>
                ) : null}
                {r.addedBy && !r.done && (
                  <div style={{ fontFamily: F.body, fontSize: "12px", color: "#3B4A63", fontWeight: 700, marginTop: "4px", letterSpacing: "0.03em" }}>
                    ✦ Added by {r.addedBy} · tap to mark done
                  </div>
                )}
              </div>
              {r.next && (
                <div style={{ flexShrink: 0, padding: "4px 8px", backgroundColor: "#C4822A", color: "#FFFFFF", fontFamily: F.body, fontSize: "12px", fontWeight: 700, borderRadius: "2px", letterSpacing: "0.05em" }}>
                  NEXT
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Task trigger */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginTop: "16px",
              width: "100%",
              height: "68px",
              backgroundColor: "#FFF8F0",
              border: "2px dashed #C4822A",
              color: "#C4822A",
              fontFamily: F.display,
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ fontSize: "28px", lineHeight: 1 }}>+</span>
            Add a Task to Today
          </button>
        )}

        {/* Quick-add form — preset tiles, no keyboard needed */}
        {showForm && (
          <div
            style={{
              marginTop: "16px",
              backgroundColor: "#FDF0E0",
              borderTop: "1px solid #C4A882",
              borderRight: "1px solid #C4A882",
              borderBottom: "1px solid #C4A882",
              borderLeft: "6px solid #C4822A",
              boxShadow: "3px 3px 0px #8B3A2A",
              padding: "20px",
            }}
          >
            <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 700, color: "#1C1008", marginBottom: "18px" }}>
              Add a Task
            </div>

            {/* Voice button */}
            <button
              onClick={startVoice}
              disabled={isListening}
              style={{
                width: "100%",
                height: "64px",
                backgroundColor: isListening ? "#3B6B8A" : "#1C1008",
                color: "#FFFFFF",
                fontFamily: F.display,
                fontSize: "19px",
                fontWeight: 700,
                border: "none",
                cursor: isListening ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "6px",
                boxShadow: isListening ? "none" : "3px 3px 0px #5A1E12",
                letterSpacing: "0.02em",
              }}
            >
              <IcMic size={26} />
              {isListening ? "Listening… speak now" : "Speak Your Task"}
            </button>

            {voiceLabel && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 14px",
                  backgroundColor: "#E8F0EB",
                  borderLeft: "4px solid #2D5A3D",
                  fontFamily: F.display,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#2D5A3D",
                }}
              >
                "{voiceLabel}"
              </div>
            )}

            {voiceUnavailable && (
              <div style={{ fontFamily: F.body, fontSize: "14px", color: "#8B3A2A", marginBottom: "10px" }}>
                Voice not available on this device. Please choose a task below.
              </div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 14px" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#C4A882" }} />
              <span style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.08em" }}>
                OR CHOOSE A TASK
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#C4A882" }} />
            </div>

            {/* Task preset grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
              {taskPresets.map(p => {
                const isSelected = selectedTask === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => { setSelectedTask(p.key); setVoiceLabel(null) }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 14px",
                      backgroundColor: isSelected ? p.color : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#1C1008",
                      border: isSelected ? `2px solid ${p.color}` : "2px solid #C4A882",
                      cursor: "pointer",
                      boxShadow: isSelected ? `2px 2px 0px ${p.color}AA` : "none",
                      fontFamily: F.display,
                      fontSize: "17px",
                      fontWeight: 700,
                      textAlign: "left",
                      minHeight: "58px",
                    }}
                  >
                    <span style={{ flexShrink: 0, color: isSelected ? "#FFFFFF" : p.color }}>
                      {scheduleIcon(p.iconKey, 22)}
                    </span>
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Time preset row */}
            <div style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 700, color: "#6B4C35", letterSpacing: "0.08em", marginBottom: "10px" }}>
              WHEN?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {timePresets.map(t => {
                const isSelected = selectedTime === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setSelectedTime(t.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      backgroundColor: isSelected ? "#2D5A3D" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#1C1008",
                      border: isSelected ? "2px solid #1A3825" : "2px solid #C4A882",
                      cursor: "pointer",
                      boxShadow: isSelected ? "2px 2px 0px #1A3825" : "none",
                      fontFamily: F.display,
                      fontSize: "19px",
                      fontWeight: 700,
                      minHeight: "58px",
                    }}
                  >
                    <span>{t.label}</span>
                    <span
                      style={{
                        fontFamily: F.body,
                        fontSize: "16px",
                        fontWeight: 600,
                        color: isSelected ? "#A8D4B5" : "#9B8070",
                      }}
                    >
                      {t.sub}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={addTask}
                disabled={!canAdd}
                style={{
                  flex: 1,
                  height: "64px",
                  backgroundColor: canAdd ? "#2D5A3D" : "#A8C4B0",
                  color: "#FFFFFF",
                  fontFamily: F.display,
                  fontSize: "20px",
                  fontWeight: 700,
                  border: "none",
                  cursor: canAdd ? "pointer" : "default",
                  boxShadow: canAdd ? "3px 3px 0px #1A3825" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <IcCheck size={22} />
                Add to My Day
              </button>
              <button
                onClick={cancelForm}
                style={{
                  height: "64px",
                  padding: "0 20px",
                  backgroundColor: "#FFF8F0",
                  color: "#8B3A2A",
                  fontFamily: F.display,
                  fontSize: "18px",
                  fontWeight: 700,
                  border: "2px solid #C4A882",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MEMORIES SCREEN ─────────────────────────────────────────────────────────

function MemoriesScreen() {
  const family = [
    {
      name: "Priya",
      relation: "Your Daughter",
      note: "She lives nearby and visits every evening.",
      photo: "https://images.unsplash.com/photo-1580471260026-2a8acbc7c7a7?w=220&h=220&fit=crop&auto=format",
      color: "#2D5A3D",
      sh: "#1A3825",
    },
    {
      name: "Suresh",
      relation: "Your Son",
      note: "He lives in Pune. He calls you every Sunday morning.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&auto=format",
      color: "#3B6B8A",
      sh: "#1E3D52",
    },
    {
      name: "Kavya",
      relation: "Your Granddaughter",
      note: "Priya's daughter. She is 8 years old and loves drawing.",
      photo: "https://images.unsplash.com/photo-1589169011402-8b2cbd1ee593?w=220&h=220&fit=crop&auto=format",
      color: "#5A6B2A",
      sh: "#2E381A",
    },
  ]

  return (
    <div style={{ paddingBottom: "16px" }}>
      <div
        style={{
          backgroundColor: "#5A6B2A",
          padding: "28px 24px",
          boxShadow: "0 4px 0px #2E381A",
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: "#FFFFFF" }}>
          My Memories
        </div>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: "#C8D4A8", marginTop: "4px" }}>
          Your family and favourite things
        </div>
      </div>

      {/* Who Am I */}
      <div style={{ margin: "20px 16px 0" }}>
        <SectionLabel>WHO AM I</SectionLabel>
        <div
          style={{
            backgroundColor: "#2D5A3D",
            boxShadow: "3px 3px 0px #1A3825",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <img
              src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=220&h=220&fit=crop&auto=format"
              alt="Ramesh Kumar"
              style={{ width: "120px", height: "120px", objectFit: "cover", display: "block", flexShrink: 0 }}
            />
            <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: F.display, fontSize: "28px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1 }}>
                Ramesh Kumar
              </div>
              <div style={{ fontFamily: F.body, fontSize: "16px", color: "#A8D4B5", marginTop: "4px" }}>
                Retired School Teacher
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  backgroundColor: "#C4822A",
                  color: "#FFFFFF",
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: "15px",
                  padding: "4px 12px",
                  boxShadow: "2px 2px 0px #8B3A2A",
                  alignSelf: "flex-start",
                }}
              >
                78 years old
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFF8F0",
              borderTop: "4px solid #C4822A",
              padding: "16px 18px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 12px",
            }}
          >
            {[
              { label: "Born", value: "12 March 1947" },
              { label: "Blood Group", value: "B+" },
              { label: "Lives at", value: "14, Jayanagar, Bangalore" },
              { label: "Native Place", value: "Mysuru, Karnataka" },
              { label: "Languages", value: "Kannada, Hindi, English" },
              { label: "Favourite Food", value: "Idli & filter coffee" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: F.body, fontSize: "12px", fontWeight: 700, color: "#9B8070", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {label}
                </div>
                <div style={{ fontFamily: F.display, fontSize: "16px", fontWeight: 700, color: "#1C1008", marginTop: "2px", lineHeight: 1.3 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family cards */}
      <div style={{ margin: "24px 16px 0" }}>
        <SectionLabel>YOUR FAMILY</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {family.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#FDF0E0",
                border: "1px solid #C4A882",
                boxShadow: `3px 3px 0px ${m.sh}`,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex" }}>
                <div style={{ flexShrink: 0, width: "115px", backgroundColor: "#E8D5BE" }}>
                  <img
                    src={m.photo}
                    alt={`${m.name}, ${m.relation}`}
                    style={{ width: "115px", height: "115px", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div style={{ flex: 1, padding: "16px" }}>
                  <div style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 700, color: "#1C1008", lineHeight: 1.1 }}>
                    {m.name}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: m.color, marginTop: "3px" }}>
                    {m.relation}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: "15px", color: "#6B4C35", marginTop: "6px", lineHeight: 1.5 }}>
                    {m.note}
                  </div>
                </div>
              </div>
              <button
                style={{
                  width: "100%",
                  height: "58px",
                  backgroundColor: m.color,
                  color: "#FFFFFF",
                  fontFamily: F.display,
                  fontSize: "19px",
                  fontWeight: 700,
                  borderTop: "1px solid #C4A882",
                  borderRight: "none",
                  borderBottom: "none",
                  borderLeft: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <IcPhone size={22} />
                Call {m.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Remember this */}
      <div
        style={{
          margin: "20px 16px 0",
          backgroundColor: "#FDF0E0",
          border: "1px solid #C4A882",
          padding: "20px",
          boxShadow: "3px 3px 0px #5A6B2A",
        }}
      >
        <SectionLabel>REMEMBER THIS</SectionLabel>
        <div style={{ fontFamily: F.display, fontSize: "19px", color: "#1C1008", lineHeight: 1.6 }}>
          You live at 14, Jayanagar, Bangalore.
        </div>
        <div style={{ fontFamily: F.display, fontSize: "19px", color: "#1C1008", lineHeight: 1.6 }}>
          Priya's phone: <span style={{ color: "#2D5A3D", fontWeight: 700 }}>98765-43210</span>
        </div>
        <div style={{ fontFamily: F.display, fontSize: "19px", color: "#1C1008", lineHeight: 1.6 }}>
          Home phone: <span style={{ color: "#2D5A3D", fontWeight: 700 }}>080-2234-5678</span>
        </div>
      </div>
    </div>
  )
}

// ─── HELP SCREEN ─────────────────────────────────────────────────────────────

function HelpScreen() {
  const contacts = [
    { name: "Priya", relation: "Your Daughter", phone: "98765-43210", color: "#2D5A3D", sh: "#1A3825" },
    { name: "Suresh", relation: "Your Son", phone: "98700-12345", color: "#3B6B8A", sh: "#1E3D52" },
    { name: "Dr. Meera Sharma", relation: "Your Doctor", phone: "080-4567-8901", color: "#5A6B2A", sh: "#2E381A" },
    { name: "Rajesh (Caregiver)", relation: "Your Caregiver", phone: "96540-78901", color: "#6B4C35", sh: "#3D2010" },
  ]

  return (
    <div style={{ paddingBottom: "16px" }}>
      <div
        style={{
          backgroundColor: "#B52C1A",
          padding: "28px 24px",
          boxShadow: "0 4px 0px #7A150C",
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: "34px", fontWeight: 700, color: "#FFFFFF" }}>
          I Need Help
        </div>
        <div style={{ fontFamily: F.body, fontSize: "18px", color: "#F0C4BE", marginTop: "4px" }}>
          Press a button to call someone
        </div>
      </div>

      <div style={{ margin: "20px 16px 0" }}>
        <button
          style={{
            width: "100%",
            height: "120px",
            backgroundColor: "#B52C1A",
            color: "#FFFFFF",
            fontFamily: F.display,
            fontSize: "26px",
            fontWeight: 700,
            border: "3px solid #7A150C",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "5px 5px 0px #7A150C",
            letterSpacing: "0.06em",
            borderRadius: "4px",
          }}
        >
          <IcAlert size={44} />
          CALL EMERGENCY — 112
        </button>
        <div
          style={{
            fontFamily: F.body,
            fontSize: "16px",
            color: "#6B4C35",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          This will call 112 (emergency services)
        </div>
      </div>

      <div style={{ margin: "24px 16px 0" }}>
        <SectionLabel>CALL SOMEONE YOU KNOW</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {contacts.map((c, i) => (
            <button
              key={i}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                backgroundColor: "#FDF0E0",
                border: "1px solid #C4A882",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: `3px 3px 0px ${c.sh}`,
                minHeight: "84px",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: "56px",
                  height: "56px",
                  backgroundColor: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  borderRadius: "2px",
                }}
              >
                <IcPerson size={30} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontSize: "21px", fontWeight: 700, color: "#1C1008", lineHeight: 1.2 }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: F.body, fontSize: "15px", color: "#6B4C35" }}>
                  {c.relation}
                </div>
                <div style={{ fontFamily: F.body, fontSize: "18px", color: c.color, fontWeight: 700, marginTop: "2px" }}>
                  {c.phone}
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  width: "46px",
                  height: "46px",
                  backgroundColor: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  borderRadius: "2px",
                }}
              >
                <IcPhone size={22} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          margin: "20px 16px 0",
          padding: "16px",
          backgroundColor: "#E8F0EB",
          borderLeft: "5px solid #2D5A3D",
        }}
      >
        <div style={{ fontFamily: F.body, fontSize: "18px", color: "#2D5A3D", fontWeight: 500, lineHeight: 1.6 }}>
          You are safe. Your family loves you. Help is always here.
        </div>
      </div>
    </div>
  )
}

// ─── ASSISTANT CHAT ──────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; text: string; id: number }

function getAssistantResponse(input: string): string {
  const q = input.toLowerCase().trim()

  if (/hello|namaste|good morning|good afternoon|good evening|\bhi\b/.test(q)) {
    const h = new Date().getHours()
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
    return `${g}, Rameshji! I am your SmritiSaathi helper. Ask me anything — your schedule, family, medicines, or just say hello!`
  }
  if (/\btime\b|clock|what time/.test(q)) {
    return `It is ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} right now.`
  }
  if (/\bdate\b|today|what day|which day/.test(q)) {
    return `Today is ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`
  }
  if (/who am i|my name|what.*my name/.test(q)) {
    return "Your name is Ramesh Kumar. You are a retired school teacher, 78 years old. You live at 14, Jayanagar, Bangalore."
  }
  if (/where.*live|my home|my address|where am i/.test(q)) {
    return "You live at 14, Jayanagar, Bangalore. You have lived there for many years. You are safe at home."
  }
  if (/priya|daughter/.test(q)) {
    return "Priya is your daughter. She lives nearby and visits every evening. Her phone number is 98765-43210."
  }
  if (/suresh|\bson\b/.test(q)) {
    return "Suresh is your son. He lives in Pune and calls you every Sunday morning. His number is 98700-12345."
  }
  if (/kavya|granddaughter|grandchild/.test(q)) {
    return "Kavya is your granddaughter — Priya's daughter. She is 8 years old and loves to draw pictures for you."
  }
  if (/medicine|tablet|\bpill\b/.test(q)) {
    return "Your medicines today: Morning 8:00 AM (done ✓), Afternoon 1:00 PM — 2 tablets with water, Night 9:00 PM — 1 tablet before sleep."
  }
  if (/next|schedule|what should|what do|what now/.test(q)) {
    return "Your next task is Afternoon Medicine at 1:00 PM — 2 tablets with water. After that, lunch at 1:30 PM. Take it one step at a time."
  }
  if (/lunch|dinner|breakfast|\bfood\b|\beat\b|meal/.test(q)) {
    return "Lunch today is Dal, rice and sabzi at 1:30 PM. Your favourite food is Idli and filter coffee!"
  }
  if (/walk|exercise|garden/.test(q)) {
    return "Your evening walk is at 4:00 PM — 15 minutes in the garden. The doctor says walking every day is very good for you."
  }
  if (/doctor|dr\.|physician/.test(q)) {
    return "Your doctor is Dr. Meera Sharma. Her phone number is 080-4567-8901. You can find her in the Help screen."
  }
  if (/caregiver|rajesh/.test(q)) {
    return "Rajesh is your caregiver. He is here to help you with daily tasks. His number is 96540-78901."
  }
  if (/blood/.test(q)) {
    return "Your blood group is B+. This is important to tell doctors."
  }
  if (/age|\bold\b|born|birthday/.test(q)) {
    return "You were born on 12 March 1947. You are 78 years old. You had a long and wonderful life as a school teacher."
  }
  if (/pain|hurt|sick|unwell/.test(q)) {
    return "I am sorry you are not feeling well. Please tell Priya on 98765-43210 or call Dr. Meera Sharma on 080-4567-8901. If it is urgent, dial 112."
  }
  if (/emergency|scared|afraid|confus|lost|forget/.test(q)) {
    return "It is okay, Rameshji. You are safe at home in Jayanagar, Bangalore. For emergency call 112. For Priya call 98765-43210. Take a deep breath — everything is fine."
  }
  if (/thank|thanks|dhanyavad/.test(q)) {
    return "You are most welcome, Rameshji! I am always here whenever you need me. Is there anything else?"
  }
  return "I am here to help you, Rameshji. You can ask me: What time is it? Where do I live? Who is Priya? What medicine should I take? What is my next task? Just ask!"
}

function ChatAssistant({ navHeight, onListeningChange }: { navHeight: number; onListeningChange: (v: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Namaste, Rameshji! I am your SmritiSaathi helper. Ask me anything — your schedule, your family, your medicines, or just say hello!", id: 0 },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [counter, setCounter] = useState(1)
  const endRef = useRef<HTMLDivElement>(null)

  function setListening(v: boolean) {
    setIsListening(v)
    onListeningChange(v)
  }

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  function send(text: string) {
    const t = text.trim()
    if (!t) return
    const userMsg: Message = { role: "user", text: t, id: counter }
    const reply: Message = { role: "assistant", text: getAssistantResponse(t), id: counter + 1 }
    setMessages(m => [...m, userMsg, reply])
    setCounter(c => c + 2)
    setInput("")
  }

  function startVoice() {
    setListening(true)
    const resetTimer = setTimeout(() => setListening(false), 10000)
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = "en-IN"
    r.onresult = (e: any) => {
      clearTimeout(resetTimer)
      send(e.results[0][0].transcript as string)
      setListening(false)
    }
    r.start()
  }

  return (
    <>
      {/* Floating button — only shown when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          style={{
            position: "absolute",
            bottom: navHeight + 16,
            right: 16,
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#2D5A3D",
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            zIndex: 200,
          }}
        >
          <IcChat size={28} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: navHeight,
            left: 0,
            right: 0,
            height: "66%",
            backgroundColor: "#FFF8F0",
            borderTop: "3px solid #C4822A",
            display: "flex",
            flexDirection: "column",
            zIndex: 150,
            boxShadow: "0 -6px 24px rgba(0,0,0,0.22)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#2D5A3D",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              boxShadow: "0 2px 0px #1A3825",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#A8D4B5", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D5A3D", flexShrink: 0 }}>
                <IcChat size={22} />
              </div>
              <div>
                <div style={{ fontFamily: F.display, fontSize: "19px", fontWeight: 700, color: "#FFFFFF" }}>SmritiSaathi Helper</div>
                <div style={{ fontFamily: F.body, fontSize: "12px", color: "#A8D4B5" }}>Ask me anything</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
            >
              <IcClose size={26} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "84%",
                    padding: "12px 15px",
                    backgroundColor: m.role === "user" ? "#2D5A3D" : "#FFFFFF",
                    color: m.role === "user" ? "#FFFFFF" : "#1C1008",
                    fontFamily: F.body,
                    fontSize: "16px",
                    lineHeight: 1.55,
                    boxShadow: m.role === "user" ? "2px 2px 0px #1A3825" : "2px 2px 0px #C4A882",
                    borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input bar */}
          {isListening ? (
            <div
              style={{
                flexShrink: 0,
                padding: "20px 14px 24px",
                backgroundColor: "#FDF0E0",
                borderTop: "1px solid #C4A882",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#3B6B8A",
                  letterSpacing: "0.02em",
                }}
              >
                I'm listening…
              </div>
              <button
                onClick={startVoice}
                aria-label="Listening"
                className="mic-listening"
                style={{
                  width: 68,
                  height: 68,
                  backgroundColor: "#3B6B8A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IcMic size={32} />
              </button>
            </div>
          ) : (
            <div
              style={{
                flexShrink: 0,
                padding: "12px 14px",
                backgroundColor: "#FDF0E0",
                borderTop: "1px solid #C4A882",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                onClick={startVoice}
                aria-label="Speak"
                style={{
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  backgroundColor: "#C4822A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "2px 2px 0px #8B3A2A",
                }}
              >
                <IcMic size={24} />
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                placeholder="Type your question…"
                style={{
                  flex: 1,
                  height: 52,
                  fontFamily: F.display,
                  fontSize: "17px",
                  color: "#1C1008",
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #C4A882",
                  padding: "0 14px",
                  boxSizing: "border-box" as const,
                  outline: "none",
                }}
              />

              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                aria-label="Send"
                style={{
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  backgroundColor: input.trim() ? "#2D5A3D" : "#C4A882",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: input.trim() ? "2px 2px 0px #1A3825" : "none",
                }}
              >
                <IcArrow size={22} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── BOTTOM NAVIGATION ───────────────────────────────────────────────────────

const tabs: { s: Screen; label: string; activeColor: string; icon: (a: boolean) => React.ReactNode }[] = [
  { s: "home", label: "Home", activeColor: "#2D5A3D", icon: (a) => <IcHome size={a ? 30 : 26} /> },
  { s: "play", label: "Play", activeColor: "#3B6B8A", icon: (a) => <IcPuzzle size={a ? 30 : 26} /> },
  { s: "myday", label: "My Day", activeColor: "#8B3A2A", icon: (a) => <IcCalendar size={a ? 30 : 26} /> },
  { s: "memories", label: "Memories", activeColor: "#5A6B2A", icon: (a) => <IcPhoto size={a ? 30 : 26} /> },
  { s: "help", label: "Help", activeColor: "#B52C1A", icon: (a) => <IcAlert size={a ? 30 : 26} /> },
]

function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div
      style={{
        flexShrink: 0,
        backgroundColor: "#1C1008",
        borderTop: "4px solid #C4822A",
        display: "flex",
      }}
    >
      {tabs.map(({ s, label, activeColor, icon }) => {
        const isActive = active === s
        return (
          <button
            key={s}
            onClick={() => onNavigate(s)}
            style={{
              flex: 1,
              height: "76px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isActive ? "#FFFFFF" : "#7B5A4A",
              backgroundColor: isActive ? activeColor : "transparent",
              border: "none",
              cursor: "pointer",
              // Hard bottom shadow on active tab to separate it visually
              boxShadow: isActive ? `inset 0 -4px 0px rgba(0,0,0,0.3)` : "none",
              position: "relative",
            }}
          >
            {icon(isActive)}
            <span
              style={{
                fontFamily: F.body,
                fontSize: isActive ? "12px" : "11px",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

type AppMode = "elder" | "caregiver"

export default function App() {
  const [mode, setMode]           = useState<AppMode>("elder")
  const [screen, setScreen]       = useState<Screen>("home")
  const [chatListening, setChatListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const navigate = (s: Screen) => {
    setScreen(s)
    scrollRef.current?.scrollTo(0, 0)
  }

  return (
    <ReminderProvider>
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        backgroundColor: mode === "caregiver" ? "#2E2210" : "#C8AB8A",
        transition: "background-color 0.3s",
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "430px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: mode === "caregiver" ? "#FDF6EC" : "#FFF8F0",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* Mode toggle bar — always visible at top of phone frame */}
        <div
          style={{
            height: "44px",
            backgroundColor: "#1C1008",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            flexShrink: 0,
            borderBottom: `2px solid ${mode === "caregiver" ? "#3B4A63" : "#C4822A"}`,
          }}
        >
          {(["elder", "caregiver"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "5px 18px",
                backgroundColor: mode === m ? (m === "elder" ? "#C4822A" : "#3B4A63") : "transparent",
                color: mode === m ? "#FFFFFF" : "#7B5A4A",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                border: mode === m ? "none" : "1px solid #3A2810",
                cursor: "pointer",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                transition: "background-color 0.2s, color 0.2s",
              }}
            >
              {m === "elder" ? "Elder App" : "Caregiver"}
            </button>
          ))}
        </div>

        {mode === "caregiver" ? (
          <CaregiverDashboard />
        ) : (
          <>
            {/* Scrollable content */}
            <div
              ref={scrollRef}
              style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
            >
              {screen === "home" && <HomeScreen onNavigate={navigate} />}
              {screen === "play" && <PlayScreen />}
              {screen === "myday" && <MyDayScreen />}
              {screen === "memories" && <MemoriesScreen />}
              {screen === "help" && <HelpScreen />}
            </div>

            {/* Sticky bottom nav — hidden while mic is active */}
            {!chatListening && <BottomNav active={screen} onNavigate={navigate} />}

            {/* Floating assistant */}
            <ChatAssistant navHeight={chatListening ? 0 : 76} onListeningChange={setChatListening} />
          </>
        )}
      </div>
    </div>
    </ReminderProvider>
  )
}
