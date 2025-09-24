// src/app/calendar/hours-cal/HoursCalendar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import BaseCalendar from "@/components/BaseCalendar";
import HoursModal from "./HoursModal";
import type { Entry } from "./HoursModal";
import { format, isAfter, isBefore, startOfDay, subDays } from "date-fns";

type TimeEntry = {
  id: string;
  userId: string;
  clockIn: string;
  clockOut?: string | null;
};

// util helpers already in your file...
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const hoursBetween = (startISO: string, endISO?: string | null) => {
  const start = new Date(startISO).getTime();
  const end = endISO ? new Date(endISO).getTime() : Date.now();
  const ms = Math.max(0, end - start);
  return ms / 3_600_000;
};

export default function HoursCalendar({
  headerAddon,
  daysBack = 30,
  fetchUrl, // optional override
}: {
  headerAddon?: React.ReactNode;
  daysBack?: number;
  fetchUrl?: string;
}) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const from = subDays(startOfDay(today), daysBack - 1);

  // ✅ Use the real endpoint (your app implements /api/time/user-entries)
  const resolvedUrl =
    fetchUrl ?? `/api/time/user-entries?days=${encodeURIComponent(daysBack)}`;

  // ---- fetch ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(resolvedUrl, { cache: "no-store" });
        if (!res.ok) {
          // Helpful console for auth issues (e.g., not signed in)
          console.warn("Fetch entries failed", res.status, res.statusText);
          setEntries([]);
          return;
        }
        const data: TimeEntry[] = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch time entries:", e);
        setEntries([]);
      }
    })();
  }, [resolvedUrl]);

  // ---- group / totals (same as you had) ----
  const entriesByDate = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const e of entries) {
      const key = ymd(new Date(e.clockIn));
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [entries]);

  const totalsByDate = useMemo(() => {
    const t = new Map<string, number>();
    entriesByDate.forEach((list, key) => {
      const sum = list.reduce(
        (acc, e) => acc + hoursBetween(e.clockIn, e.clockOut),
        0
      );
      t.set(key, sum);
    });
    return t;
  }, [entriesByDate]);

  const hasContentSet = useMemo(
    () => new Set(totalsByDate.keys()),
    [totalsByDate]
  );

  const isInLastN = (date: Date) =>
    isAfter(date, subDays(startOfDay(today), daysBack)) ||
    ymd(date) === ymd(from);

  const totalForDate = (date: Date) => totalsByDate.get(ymd(date)) ?? 0;

  const modalEntriesFor = (date: Date): Entry[] => {
    const list = entriesByDate.get(ymd(date)) ?? [];
    return list.map((e) => {
      const clockIn = new Date(e.clockIn);
      const clockOut = e.clockOut ? new Date(e.clockOut) : undefined;
      return {
        id: e.id,
        userId: e.userId,
        clockIn,
        clockOut,
        hours: hoursBetween(e.clockIn, e.clockOut),
      };
    });
  };

  return (
    <>
      {/* ...keep the rest of your render exactly as-is... */}
      <div className="w-full max-w-[1000px]">
        <BaseCalendar
          headerAddon={
            <div className="flex flex-col items-center gap-2">
              <div className="origin-top w-70 scale-[1] sm:scale-100">
                {headerAddon}
              </div>
            </div>
          }
          onDayClick={(date) => {
            if (hasContentSet.has(ymd(date))) setSelectedDate(date);
          }}
          hasContentForDate={(date) => hasContentSet.has(ymd(date))}
          renderDayContent={(date) => {
            if (!isInLastN(date)) return null;
            const total = totalForDate(date);
            return total > 0 ? (
              <div className="text-sm font-semibold text-[#244C77] mt-1">
                {total.toFixed(2)}h
              </div>
            ) : null;
          }}
          renderDayMobileContent={(date) => {
            if (!isInLastN(date)) return null;
            const total = totalForDate(date);
            return total > 0 ? `${total.toFixed(2)}h` : null;
          }}
        />
      </div>

      {selectedDate && (
        <HoursModal
          date={selectedDate}
          entries={modalEntriesFor(selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
