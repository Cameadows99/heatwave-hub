"use client";

import { useEffect, useMemo, useState } from "react";
import BaseCalendar from "@/components/BaseCalendar";
import TimeOffModal from "./TimeOffModal";
import { format, addDays } from "date-fns";

type Status = "PENDING" | "APPROVED" | "DENIED";

type Item = {
  id: string;
  userId: string;
  reason: string;
  status: Status;
  startDate: string; // ISO
  endDate: string; // ISO
  user?: { id: string; name: string | null } | null;
};

export default function TimeOffCalendar({
  isAdmin = false,
  headerAddon,
}: {
  isAdmin?: boolean;
  headerAddon?: React.ReactNode;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // "all" | "approved" | "pending" | "denied"
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "denied"
  >("all");

  // --- helpers ---
  const ymd = (d: Date) => format(d, "yyyy-MM-dd");

  const colorFor = (status: Status) => {
    if (status === "APPROVED") return "text-green-600";
    if (status === "PENDING") return "text-yellow-600";
    return "text-orange-600";
  };

  // Expand each request into every date it covers (inclusive)
  const expandedDates = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const it of items) {
      const s = new Date(it.startDate);
      const e = new Date(it.endDate);
      // guard: if invalid order, swap
      const start = s <= e ? s : e;
      const end = s <= e ? e : s;

      let cur = new Date(start);
      while (cur <= end) {
        const key = ymd(cur);
        (map[key] ||= []).push(it);
        cur = addDays(cur, 1);
      }
    }
    return map;
  }, [items]);

  // quick set for "hasContentForDate"
  const coverSet = useMemo(
    () => new Set(Object.keys(expandedDates)),
    [expandedDates]
  );

  // Filtered per-day list
  const dayList = (date: Date) => {
    const key = ymd(date);
    const list = expandedDates[key] || [];
    if (filter === "all") return list;
    if (filter === "approved")
      return list.filter((r) => r.status === "APPROVED");
    if (filter === "pending") return list.filter((r) => r.status === "PENDING");
    return list.filter((r) => r.status === "DENIED");
  };

  // initial fetch + refetch after create/close in modal
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/timeoff");
        if (!res.ok) return;
        const data: Item[] = await res.json();
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch time off:", e);
      }
    })();
  }, []);

  // --- UI: filter buttons below the calendar ---
  const FilterButtons = (
    <div className="flex gap-1 rounded-xl ring-1 ring-zinc-300 bg-white/80 px-1 py-1">
      {(
        [
          ["all", "All"],
          ["approved", "Approved"],
          ["pending", "Pending"],
          ["denied", "Denied"],
        ] as const
      ).map(([key, label]) => {
        const active = filter === key;
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={[
              "px-3 py-1 rounded-lg text-sm font-semibold transition",
              active
                ? "bg-zinc-900 text-yellow-200"
                : "bg-white hover:bg-zinc-100 text-zinc-700",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

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
            onDayClick={(date) => setSelectedDate(date)}
            hasContentForDate={(date) => coverSet.has(ymd(date))}
            // Desktop/tablet rich content — matches Events/Hours wrapper
            renderDayContent={(date) => {
              const list = dayList(date);
              if (!list.length) return null;
              const show = list.slice(0, 2);
              const extra = list.length - show.length;

              return (
                <div className="text-orange-600 font-medium text-center space-y-1 max-h-[3.5rem] overflow-y-auto">
                  {show.map((r) => (
                    <div key={r.id} className="truncate">
                      <div
                        className={`font-semibold truncate ${colorFor(
                          r.status
                        )}`}
                      >
                        {r.user?.name ?? "Request"}
                      </div>
                      <div className="text-[0.65rem] font-bold text-gray-700 truncate">
                        {format(new Date(r.startDate), "MMM d")} –{" "}
                        {format(new Date(r.endDate), "MMM d")}
                      </div>
                    </div>
                  ))}
                  {extra > 0 && (
                    <div className="text-xs text-blue-600">+{extra} more</div>
                  )}
                </div>
              );
            }}
            // 📱 Phone: plain string (aligns with Events/Hours)
            renderDayMobileContent={(date) => {
              const list = dayList(date);
              if (!list.length) return null;
              const first = list[0];
              return first.user?.name ?? "Request";
            }}
          />

          {/* 🔻 Filter bar directly under the calendar (all breakpoints) */}
          <div className="absolute-center mt-10 flex justify-center">
            {FilterButtons}
          </div>
        </div>
      </div>

      {selectedDate && (
        <TimeOffModal
          date={selectedDate}
          isAdmin={isAdmin}
          onClose={() => setSelectedDate(null)}
          onCreated={async () => {
            try {
              const res = await fetch("/api/timeoff");
              if (!res.ok) return;
              const data: Item[] = await res.json();
              setItems(data);
            } catch (e) {
              console.error("Failed to refresh time off:", e);
            }
          }}
        />
      )}
    </>
  );
}
