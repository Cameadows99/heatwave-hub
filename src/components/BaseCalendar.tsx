"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthYearLabel,
} from "@/utils/date";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BaseCalendar({
  renderDayContent,
  onDayClick,
  hasContentForDate, // NEW: tell the calendar if a day has events/time-off
}: {
  renderDayContent?: (date: Date) => React.ReactNode;
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

  const isToday = (day: number): boolean =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-orange-50 shadow-xl rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPrevMonth}
          className="text-2xl px-3 py-1 rounded-full hover:bg-orange-200"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold text-orange-600 tracking-wide">
          {getMonthYearLabel(currentYear, currentMonth)}
        </h2>
        <button
          onClick={goToNextMonth}
          className="text-2xl px-3 py-1 rounded-full hover:bg-orange-200"
        >
          →
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center text-sm text-sky-700 font-semibold mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {blankDays.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {daysArray.map((day) => {
          const dateObj = new Date(currentYear, currentMonth, day);
          const isCurrentDay = isToday(day);
          const hasContent = hasContentForDate?.(dateObj) ?? false;

          return (
            <div
              key={day}
              className="h-[115px] p-2 bg-white rounded-lg shadow hover:bg-yellow-100 cursor-pointer transition flex flex-col justify-start items-center relative overflow-hidden"
              onClick={() => onDayClick?.(dateObj)}
            >
              {isCurrentDay && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
                  <Image
                    src="/logos/heat-sun.png"
                    alt="Today"
                    width={54}
                    height={54}
                    className={`transition-opacity duration-200 ${
                      hasContent ? "opacity-30" : "opacity-90"
                    }`}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="text-lg font-semibold text-gray-800">{day}</div>
                {renderDayContent?.(dateObj)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
