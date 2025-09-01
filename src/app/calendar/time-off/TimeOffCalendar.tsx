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
  startDate: string;
  endDate: string;
  user?: { id: string; name: string | null } | null;
};
type Filter = "all" | "approved" | "pending" | "denied";

export default function TimeOffCalendar({
  isAdmin,
  headerAddon,
}: {
  isAdmin: boolean;
  headerAddon?: React.ReactNode;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/timeoff");
      const data: Item[] = await res.json();
      setItems(data);
    })();
  }, []);

  const ymd = (d: Date) => format(d, "yyyy-MM-dd");

  const coverSet = useMemo(() => {
    const out = new Set<string>();
    for (const r of items) {
      if (filter !== "all" && r.status.toLowerCase() !== filter) continue;
      let cur = new Date(r.startDate);
      const end = new Date(r.endDate);
      cur.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      while (cur <= end) {
        out.add(ymd(cur));
        cur = addDays(cur, 1);
      }
    }
    return out;
  }, [items, filter]);

  const dayList = (date: Date) => {
    const d0 = new Date(date);
    d0.setHours(0, 0, 0, 0);
    const raw = items.filter((r) => {
      const a = new Date(r.startDate);
      const b = new Date(r.endDate);
      a.setHours(0, 0, 0, 0);
      b.setHours(0, 0, 0, 0);
      return a <= d0 && d0 <= b;
    });
    return filter === "all"
      ? raw
      : raw.filter((r) => r.status.toLowerCase() === filter);
  };

  // ✅ green for approved, yellow for pending, orange for denied
  const colorFor = (status: Status) => {
    if (status === "APPROVED") return "text-green-600";
    if (status === "PENDING") return "text-yellow-600";
    return "text-orange-600";
  };

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
        const active = filter === (key as Filter);
        return (
          <button
            key={key}
            onClick={() => setFilter(key as Filter)}
            className={`px-2 py-1 text-[11px] rounded-lg transition ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
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
            // Desktop/tablet rich content
            renderDayContent={(date) => {
              const list = dayList(date);
              if (!list.length) return null;
              const show = list.slice(0, 2);
              const extra = list.length - show.length;
              return (
                <div className="text-center space-y-1 max-h-[3.5rem] overflow-y-auto">
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
            // 📱 Phone: return a NODE so we can color the name
            renderDayMobileContent={(date) => {
              const list = dayList(date);
              if (!list.length) return null;
              const first = list[0];
              const name = first.user?.name ?? "Request";
              return (
                <span className={`font-semibold ${colorFor(first.status)}`}>
                  {name}
                </span>
              );
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
            const res = await fetch("/api/timeoff");
            const data: Item[] = await res.json();
            setItems(data);
          }}
        />
      )}
    </>
  );
}
