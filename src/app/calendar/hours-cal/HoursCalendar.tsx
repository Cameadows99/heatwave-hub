"use client";

import { useEffect, useMemo, useState } from "react";
import BaseCalendar from "@/components/BaseCalendar";
import HoursModal from "./HoursModal";
import type { Entry } from "./HoursModal"; // <-- use the same Entry type as the modal
import { format, isAfter, isBefore, startOfDay, subDays } from "date-fns";

// Raw API shape (adjust field names if your API differs)
type TimeEntry = {
  id: string;
  userId: string;
  clockIn: string; // ISO string from API
  clockOut?: string | null; // ISO string or null
};

// ---------- helpers ----------
const ymd = (d: Date) => format(d, "yyyy-MM-dd");

const toDate = (v?: string | null): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(+d) ? undefined : d;
};

const hoursBetween = (startISO: string, endISO?: string | null) => {
  const start = new Date(startISO).getTime();
  const end = endISO ? new Date(endISO).getTime() : Date.now();
  const ms = Math.max(0, end - start);
  return ms / 3_600_000; // -> decimal hours
};

export default function HoursCalendar({
  headerAddon,
  daysBack = 30,
  fetchUrl = "/api/time/entries?days=30", // adjust if needed
}: {
  headerAddon?: React.ReactNode;
  daysBack?: number;
  fetchUrl?: string;
}) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const earliest = subDays(startOfDay(today), daysBack - 1);
  const isInLastN = (d: Date) => !isBefore(d, earliest) && !isAfter(d, today);

  // ---- fetch ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(fetchUrl, { cache: "no-store" });
        if (!res.ok) return;
        const data: TimeEntry[] = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch time entries:", e);
      }
    })();
  }, [fetchUrl]);

  // ---- group by LOCAL day (based on clockIn) ----
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

  // ---- totals per date ----
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

  const hasContentSet = useMemo(() => {
    const s = new Set<string>();
    totalsByDate.forEach((val, key) => {
      if (val > 0) s.add(key);
    });
    return s;
  }, [totalsByDate]);

  const totalForDate = (d: Date) => totalsByDate.get(ymd(d)) ?? 0;

  // Convert TimeEntry[] for that day into the modal's Entry[] (with Date fields)
  const modalEntriesFor = (d: Date): Entry[] => {
    const list = entriesByDate.get(ymd(d)) ?? [];
    return list.map<Entry>((e) => {
      const ci = toDate(e.clockIn)!; // required by modal type
      const co = toDate(e.clockOut ?? undefined); // optional
      return {
        id: e.id,
        userId: e.userId,
        clockIn: ci, // <-- Date
        clockOut: co, // <-- Date | undefined
        hours: hoursBetween(e.clockIn, e.clockOut), // computed decimal hours
      };
    });
  };

  return (
    <>
      {/* Center so the filter aligns with the calendar below */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1000px]">
          <BaseCalendar
            // Phone: gently enlarge the toggle to match desktop feel
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
            // Desktop/tablet: show "5.25h"
            renderDayContent={(date) => {
              if (!isInLastN(date)) return null;
              const total = totalForDate(date);
              return total > 0 ? (
                <div className="text-sm font-semibold text-[#244C77] mt-1">
                  {total.toFixed(2)}h
                </div>
              ) : null;
            }}
            // Phone: plain string under day number (uniform heights)
            renderDayMobileContent={(date) => {
              if (!isInLastN(date)) return null;
              const total = totalForDate(date);
              return total > 0 ? `${total.toFixed(2)}h` : null;
            }}
          />

          {/* Match TimeOff filter bar height to prevent layout shift */}
          <div className="mt-10 h-[40px]" aria-hidden />
        </div>
      </div>

      {selectedDate && (
        <HoursModal
          date={selectedDate}
          entries={modalEntriesFor(selectedDate)} // Entry[] with Date fields + hours
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
