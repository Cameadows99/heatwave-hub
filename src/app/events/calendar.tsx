"use client";

import { CalendarEvent } from "@/types/event";
import AddEventModal from "../calendar/events-cal/AddEventModal";
import EventModal from "../calendar/events-cal/EventModal";
import { useState } from "react";
import Image from "next/image";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthYearLabel,
} from "@/utils/date";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("heatwave-events");
    return stored ? JSON.parse(stored) : [];
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  const blankDays = Array(firstDay).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mock Events

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getEventForDay = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleDeleteEvent = (eventToDelete: CalendarEvent) => {
    const updated = events.filter(
      (ev) =>
        !(ev.title === eventToDelete.title && ev.date === eventToDelete.date)
    );
    setEvents(updated);
    localStorage.setItem("heatwave-events", JSON.stringify(updated));

    const stillHasEvents = updated.some((ev) => ev.date === eventToDelete.date);
    if (!stillHasEvents) {
      setSelectedDay(null);
    }
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
          const eventsForDay = getEventForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day}
              className="h-[115px] p-2 bg-white rounded-lg shadow hover:bg-yellow-100 cursor-pointer transition flex flex-col justify-start items-center relative overflow-hidden"
              onClick={() => {
                setSelectedDay(day);
                if (eventsForDay.length >= 0 && eventsForDay.length < 2) {
                  setShowAddEvent(true);
                } else {
                  setShowAddEvent(false);
                }
              }}
            >
              {/* Background sun (dimmed if event exists) */}
              {isCurrentDay && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
                  <Image
                    src="/logos/heat-sun.png"
                    alt="Today"
                    width={48}
                    height={48}
                    className={
                      eventsForDay.length > 0 ? "opacity-20" : "opacity-80"
                    }
                  />
                </div>
              )}

              {/* Foreground content */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-lg font-semibold text-gray-800">{day}</div>

                {eventsForDay.length > 0 && (
                  <div className="mt-1 text-[0.75rem] text-orange-600 font-medium text-center space-y-1  max-h-[3.5rem]">
                    {eventsForDay.slice(0, 2).map((ev, index) => (
                      <div key={index}>
                        {ev.title}
                        <div className="text-[0.65rem] font-bold text-gray-700">
                          {ev.time}
                        </div>
                      </div>
                    ))}
                    {eventsForDay.length > 2 && (
                      <div className="text-xs text-blue-600">
                        +{eventsForDay.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedDay !== null && (
        <EventModal
          day={selectedDay}
          month={currentMonth}
          year={currentYear}
          events={getEventForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
          onAdd={(newEvent) => {
            const updated = [...events, newEvent];
            setEvents(updated);
            localStorage.setItem("heatwave-events", JSON.stringify(updated));
          }}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
