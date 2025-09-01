"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import EventsCalendar from "./events-cal/EventsCalendar";
import HoursCalendar from "./hours-cal/HoursCalendar";
import TimeOffCalendar from "./time-off/TimeOffCalendar";
import ModeToggle, { Mode } from "@/components/ModeToggle";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewParam = (searchParams.get("view") as Mode) ?? "events";
  const [mode, setMode] = useState<Mode>(viewParam);

  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "ULTIMATE_ADMIN";

  useEffect(() => {
    if (viewParam !== mode) setMode(viewParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam]);

  const handleChange = (next: Mode) => {
    setMode(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    // Phone: subtle orange background. Desktop: your original gradient.
    <div className="min-h-[100svh] sm:min-h-screen bg-orange-50 sm:bg-gradient-to-br sm:from-yellow-100 sm:via-orange-100 sm:to-red-200 text-black flex flex-col">
      {/* Desktop/tablet toggle bar (phone gets headerAddon inside calendar) */}
      <div className="hidden sm:flex justify-center pt-4 mb-6">
        <ModeToggle value={mode} onChange={handleChange} />
      </div>

      {/* Calendar area */}
      <main className="flex-1 w-full flex justify-center items-start sm:items-center px-0 sm:px-4 pb-20 sm:pb-6">
        {mode === "events" && (
          <EventsCalendar
            headerAddon={<ModeToggle value={mode} onChange={handleChange} />}
          />
        )}

        {mode === "hours" && (
          <HoursCalendar
            headerAddon={<ModeToggle value={mode} onChange={handleChange} />}
          />
        )}

        {mode === "time-off" && (
          <TimeOffCalendar
            isAdmin={isAdmin}
            headerAddon={<ModeToggle value={mode} onChange={handleChange} />}
          />
        )}
      </main>
    </div>
  );
}
