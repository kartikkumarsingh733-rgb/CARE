import { createContext, useContext, useState } from "react"

export type SharedReminder = {
  id: string
  patientId: string   // "ramesh" | "meera" | "arjun"
  patientName: string
  label: string
  desc: string
  iconKey: string     // "medicine" | "food" | "water" | "walk" | "calendar"
  color: string
  time: string        // display string: "3:00 PM"
  sortMins: number    // pre-computed for sorting
  addedBy: string
  addedAt: string
}

type ReminderStore = {
  reminders: SharedReminder[]
  addReminder: (r: Omit<SharedReminder, "id" | "addedAt">) => void
  removeReminder: (id: string) => void
}

export const ReminderContext = createContext<ReminderStore>({
  reminders: [],
  addReminder: () => {},
  removeReminder: () => {},
})

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<SharedReminder[]>([])

  function addReminder(r: Omit<SharedReminder, "id" | "addedAt">) {
    const now = new Date()
    const addedAt = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    setReminders(prev => [...prev, { ...r, id: `cr-${Date.now()}`, addedAt }])
  }

  function removeReminder(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, removeReminder }}>
      {children}
    </ReminderContext.Provider>
  )
}

export function useReminders() {
  return useContext(ReminderContext)
}

export function parseTimeMins(timeStr: string): number {
  const [hm, period] = timeStr.split(" ")
  let [hh, mm] = hm.split(":").map(Number)
  if (period === "PM" && hh !== 12) hh += 12
  if (period === "AM" && hh === 12) hh = 0
  return hh * 60 + (mm || 0)
}
