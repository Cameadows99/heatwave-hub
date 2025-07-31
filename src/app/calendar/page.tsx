"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import EventsCalendar from "./events-cal/EventsCalendar";
import HoursCalendar from "./hours-cal/HoursCalendar";
import TimeOffCalendar from "./time-off/TimeOffCalendar";
import TimeOffModal from "./time-off/TimeOffModal";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as "events" | "hours" | "time-off";
  const [mode, setMode] = useState<"events" | "hours" | "time-off">("events");

  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "ULTIMATE_ADMIN";

  useEffect(() => {
    if (viewParam && viewParam !== mode) {
      setMode(viewParam);
    }
  }, [viewParam]);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-200 text-black items-center">
      <div className="flex justify-center mb-6 relative z-0">
        <div className="flex gap-3 px-2 py-1">
          {(["events", "time-off", "hours"] as const).map((value) => {
            const isActive = mode === value;
            const label =
              value === "events"
                ? "Events"
                : value === "time-off"
                ? "Time Off"
                : "Hours";

            return (
              <div key={value} className="relative">
                {isActive && (
                  <div className="absolute inset-0 -m-1 rounded-full bg-yellow-300 blur-lg opacity-50 z-0"></div>
                )}
                <button
                  onClick={() => setMode(value)}
                  className={`relative z-10 overflow-hidden px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 cursor-pointer
            ${
              isActive
                ? "bg-sky-600 text-yellow-300 shadow-md scale-105"
                : "bg-sky-500/50 text-gray-100/80 hover:bg-sky-300/70 scale-95"
            }
          `}
                  style={{
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  }}
                >
                  {label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {mode === "events" && <EventsCalendar />}
      {mode === "hours" && <HoursCalendar />}
      {mode === "time-off" && <TimeOffCalendar isAdmin={isAdmin} />}
    </div>
  );
}
