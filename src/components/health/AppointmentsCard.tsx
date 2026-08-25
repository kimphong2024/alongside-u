import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { MOCK_APPOINTMENTS, appointmentDate } from "@/lib/mock-health";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function AppointmentsCard() {
  const [selected, setSelected] = useState<Date | undefined>();
  const appointments = useMemo(
    () => MOCK_APPOINTMENTS.map((a) => ({ ...a, when: appointmentDate(a) })),
    [],
  );
  const apptDates = appointments.map((a) => a.when);
  const visible = selected
    ? appointments.filter((a) => sameDay(a.when, selected))
    : appointments.slice(0, 3);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-soft paper-grain overflow-hidden">
      <div className="flex justify-center pt-2">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ appointment: apptDates }}
          modifiersClassNames={{
            appointment:
              "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-clay",
          }}
          className="bg-transparent"
        />
      </div>

      <div className="border-t border-border/60 p-4 space-y-2.5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {selected ? "On this day" : "Coming up"}
        </p>
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No appointments this day.</p>
        )}
        {visible.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 rounded-xl bg-background border border-border/70 p-3"
          >
            <div className="h-9 w-9 rounded-full bg-clay-soft/40 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-foreground/70" strokeWidth={1.6} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground/85">{a.purpose}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {a.when.toLocaleDateString("en-SG", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" · "}
                {a.time} · {a.doctor}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" strokeWidth={1.6} /> {a.location}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
