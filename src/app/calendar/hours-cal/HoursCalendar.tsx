"use client";

import { useEffect, useState } from "react";
import BaseCalendar from "../../../components/BaseCalendar";
import HoursModal from "./HoursModal";
import { groupEntriesByDate } from "@/lib/timeUtils";
import { differenceInCalendarDays, format } from "date-fns";

export default function HoursCalendar() {
  const [entriesByDate, setEntriesByDate] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/time/user-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user-id" }), // swap for actual user logic
      });

      const data = await res.json();
      const mapped = groupEntriesByDate(data.entries);
      setEntriesByDate(mapped);
    };

    fetchData();
  }, []);

  return (
    <>
      <BaseCalendar
        onDayClick={(date) => {
          const key = format(date, "yyyy-MM-dd");
          if (entriesByDate[key]) setSelectedDate(date);
        }}
        renderDayContent={(date) => {
          const today = new Date();
          const dateKey = format(date, "yyyy-MM-dd");

          const isInLast30 =
            differenceInCalendarDays(today, date) <= 30 && date <= today;
          const entries = entriesByDate[dateKey] || [];

          const total = entries.reduce((sum, e) => sum + e.hours, 0);

          return isInLast30 && total > 0 ? (
            <div className="text-sm font-medium text-green-700 mt-1">
              {total.toFixed(2)} hrs
            </div>
          ) : null;
        }}
      />

      {selectedDate && (
        <HoursModal
          date={selectedDate}
          entries={entriesByDate[format(selectedDate, "yyyy-MM-dd")] || []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
