"use client";

import { useEffect, useMemo, useState } from "react";
import BaseCalendar from "../../../components/BaseCalendar";
import HoursModal from "./HoursModal";
import { groupEntriesByDate } from "@/lib/timeUtils";
import { differenceInCalendarDays, format } from "date-fns";

// Raw entry shape from API/DB (usually ISO strings)
type CoreEntry = {
  id: string;
  clockIn: string; // ISO string
  clockOut?: string | null; // ISO string or null
};

// What HoursModal expects (Dates + hours)
type ModalEntry = {
  id: string;
  clockIn: Date;
  clockOut: Date | null;
  hours: number;
};

type EntriesByDate = Record<string, CoreEntry[]>;

export default function HoursCalendar({
  headerAddon,
}: {
  headerAddon?: React.ReactNode;
}) {
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/time/user-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user-id" }), // TODO: replace with session user
      });
      const data = await res.json();
      // Ensure this returns Record<yyyy-MM-dd, CoreEntry[]>
      const grouped = groupEntriesByDate(data.entries) as EntriesByDate;
      setEntriesByDate(grouped);
    })();
  }, []);

  const today = new Date();
  const isInLast30 = (date: Date) =>
    differenceInCalendarDays(today, date) <= 30 && date <= today;

  const hoursBetween = (startISO: string, endISO?: string | null) => {
    const s = new Date(startISO).getTime();
    const e = endISO ? new Date(endISO).getTime() : Date.now();
    const ms = Math.max(0, e - s);
    return ms / (1000 * 60 * 60);
  };

  const totalForDate = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    const list = entriesByDate[key] || [];
    return list.reduce(
      (sum, e) => sum + hoursBetween(e.clockIn, e.clockOut),
      0
    );
  };

  // Precompute which tiles have content in the last 30 days
  const hasContentSet = useMemo(() => {
    const s = new Set<string>();
    for (const [key, list] of Object.entries(entriesByDate)) {
      const [y, m, d] = key.split("-").map(Number);
      if (!y || !m || !d) continue;
      const dt = new Date(y, m - 1, d);
      if (!isInLast30(dt)) continue;
      const total = list.reduce(
        (sum, e) => sum + hoursBetween(e.clockIn, e.clockOut),
        0
      );
      if (total > 0) s.add(key);
    }
    return s;
  }, [entriesByDate]);

  // Build the modal payload in the exact shape HoursModal expects
  const modalEntriesFor = (date: Date): ModalEntry[] => {
    const key = format(date, "yyyy-MM-dd");
    const list = entriesByDate[key] || [];
    return list.map((e) => {
      const hours = hoursBetween(e.clockIn, e.clockOut);
      return {
        id: e.id,
        clockIn: new Date(e.clockIn),
        clockOut: e.clockOut ? new Date(e.clockOut) : null,
        hours,
      };
    });
  };

  return (
    <>
      <BaseCalendar
        headerAddon={headerAddon}
        onDayClick={(date) => {
          const key = format(date, "yyyy-MM-dd");
          if (entriesByDate[key]?.length) setSelectedDate(date);
        }}
        hasContentForDate={(date) =>
          hasContentSet.has(format(date, "yyyy-MM-dd"))
        }
        // Desktop/tablet: show "5.25h"
        renderDayContent={(date) => {
          if (!isInLast30(date)) return null;
          const total = totalForDate(date);
          return total > 0 ? (
            <div className="text-sm font-semibold text-[#244C77] mt-1">
              {total.toFixed(2)}h
            </div>
          ) : null;
        }}
        // Phone: plain string under day number
        renderDayMobileContent={(date) => {
          if (!isInLast30(date)) return null;
          const total = totalForDate(date);
          return total > 0 ? `${total.toFixed(2)}h` : null;
        }}
      />

      {selectedDate && (
        <HoursModal
          date={selectedDate}
          entries={modalEntriesFor(selectedDate)} // ✅ Dates + hours
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
