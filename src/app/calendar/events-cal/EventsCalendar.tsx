"use client";

import { useState, useEffect, useMemo } from "react";
import BaseCalendar from "../../../components/BaseCalendar";
import EventModal from "./EventModal";
import { CalendarEvent } from "@/types/event";

export default function EventsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Helper to match how you're currently comparing dates (UTC string slice)
  const ymdUtc = (date: Date) => date.toISOString().slice(0, 10);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = ymdUtc(date);
    return events.filter((e) => e.date === dateStr);
  };

  // Fast lookup for whether a date has content (events). Add time-off later by unioning sets.
  const eventDateSet = useMemo(() => {
    const s = new Set<string>();
    for (const e of events) s.add(e.date);
    return s;
  }, [events]);

  const handleAddEvent = async (newEvent: CalendarEvent) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        const created = await res.json();
        setEvents((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Failed to add event:", err);
    }
  };

  const handleDeleteEvent = async (toDelete: CalendarEvent) => {
    try {
      const res = await fetch("/api/events/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: toDelete.title, date: toDelete.date }),
      });

      if (res.ok) {
        const updated = events.filter(
          (ev) => !(ev.title === toDelete.title && ev.date === toDelete.date)
        );
        setEvents(updated);
        const stillHas = updated.some((ev) => ev.date === toDelete.date);
        if (!stillHas) setSelectedDate(null);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <>
      <BaseCalendar
        onDayClick={(date) => setSelectedDate(date)}
        hasContentForDate={(date) => eventDateSet.has(ymdUtc(date))}
        renderDayContent={(date) => {
          const list = getEventsForDate(date);
          return list.length > 0 ? (
            <div className="  text-orange-600 font-medium text-center space-y-1 max-h-[3.5rem] overflow-y-auto">
              {list.slice(0, 2).map((ev, idx) => (
                <div key={idx}>
                  <div className="font-semibold">{ev.title}</div>
                  <div className="text-[0.65rem] font-bold text-gray-700">
                    {ev.time}
                  </div>
                </div>
              ))}
              {list.length > 2 && (
                <div className="text-xs text-blue-600">
                  +{list.length - 2} more
                </div>
              )}
            </div>
          ) : null;
        }}
      />

      {selectedDate && (
        <EventModal
          day={selectedDate.getDate()}
          month={selectedDate.getMonth()}
          year={selectedDate.getFullYear()}
          events={getEventsForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onAdd={handleAddEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </>
  );
}
