"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthYearLabel,
} from "@/utils/date";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const cn = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(" ");

export default function BaseCalendar({
  renderDayContent,
  renderDayMobileContent, // phone: may return string OR React node
  headerAddon, // renders under the month title on phone
  onDayClick,
  hasContentForDate,
}: {
  renderDayContent?: (date: Date) => React.ReactNode;
  renderDayMobileContent?: (date: Date) => React.ReactNode; // ⬅️ accepts node
  headerAddon?: React.ReactNode;
  onDayClick?: (date: Date) => void;
  hasContentForDate?: (date: Date) => boolean;
}) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const blankDays = Array(firstDay).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const goPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const goNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  return (
    <div className="w-full">
      {/* Full width on phone so tiles can grow */}
      <div className="mx-auto max-w-[100vw] sm:max-w-[clamp(420px,80vw,920px)] px-1 sm:px-4">
        {/* Card chrome only on ≥sm */}
        <div className="sm:rounded-2xl sm:border sm:border-white/40 sm:bg-white/70 sm:backdrop-blur-md sm:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] px-2 sm:px-5 py-3 sm:py-4">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4"></header>
          <div className="mb-2 sm:mb-5 flex items-center justify-between">
            <button
              onClick={goPrev}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ring-1 ring-zinc-300 hover:bg-zinc-50 active:scale-[.98] transition"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-600">
              {getMonthYearLabel(currentYear, currentMonth)}
            </h2>
            <button
              onClick={goNext}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ring-1 ring-zinc-300 hover:bg-zinc-50 active:scale-[.98] transition"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {/* Toggle / Header addon (phone-only) — slightly stretched on phone */}
          {headerAddon && (
            <div className="sm:hidden mb-2 flex justify-center">
              <div className="origin-top scale-[1.10] sm:scale-100">
                {headerAddon}
              </div>
            </div>
          )}

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center text-[12px] sm:text-xs font-semibold text-sky-700 mb-1.5 sm:mb-2">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-0.5 sm:py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {daysArray.map((day) => {
              const dateObj = new Date(currentYear, currentMonth, day);
              const todayFlag = isToday(day);

              const desktopContent = renderDayContent?.(dateObj);
              const mobileContent =
                renderDayMobileContent?.(dateObj) ?? desktopContent;

              const hasContent =
                hasContentForDate?.(dateObj) ??
                Boolean(desktopContent || mobileContent);

              return (
                <div key={day} className="group">
                  {/* Tile */}
                  <div
                    className="relative rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition"
                    onClick={() => onDayClick?.(dateObj)}
                  >
                    {/* Phone: slightly wider-than-tall; Desktop: square */}
                    <div className="sm:aspect-square min-h-[80px] sm:min-h-[92px]" />

                    {/* content layer */}
                    <div className="absolute inset-0 p-1.5 sm:p-2 flex flex-col items-center">
                      {todayFlag && (
                        <>
                          <div className="absolute inset-0 rounded-xl ring-2 ring-[#242C52]/50 pointer-events-none" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                              src="/logos/heat-sun.png"
                              alt="Today"
                              width={28}
                              height={28}
                              className={cn(
                                hasContent ? "opacity-40" : "opacity-70",
                                "sm:w-[34px] sm:h-[34px]"
                              )}
                            />
                          </div>
                        </>
                      )}

                      {/* Day number */}
                      <div className="relative z-10 mt-0.5 text-[14px] sm:text-lg font-semibold text-zinc-800">
                        {day}
                      </div>

                      {/* 📱 MOBILE content: render node OR fallback string with default orange */}
                      {mobileContent ? (
                        <div
                          className="
                            sm:hidden relative z-10 mt-0.5 w-full text-center
                            text-[9px] leading-tight overflow-hidden
                            [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]
                            whitespace-normal
                          "
                        >
                          {typeof mobileContent === "string" ? (
                            <span className="font-semibold text-orange-600">
                              {mobileContent}
                            </span>
                          ) : (
                            mobileContent /* allow caller to style (e.g., green/yellow/orange) */
                          )}
                        </div>
                      ) : hasContent ? (
                        <div
                          className="sm:hidden relative z-10 mt-auto mb-1 h-1.5 w-6 rounded-full bg-[#244C77]/80"
                          aria-label="Has event"
                        />
                      ) : null}

                      {/* 💻 DESKTOP/TABLET content */}
                      <div className="hidden sm:block relative z-10 mt-0.5 w-full text-center text-[10px] sm:text-xs leading-snug">
                        {desktopContent}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom ledge only on desktop */}
          <div className="hidden sm:block pointer-events-none mt-4 h-3 w-full rounded-full bg-gradient-to-b from-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
