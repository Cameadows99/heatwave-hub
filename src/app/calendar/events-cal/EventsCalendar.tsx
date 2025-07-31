"use client";

import { useState, useEffect } from "react";
import BaseCalendar from "../../../components/BaseCalendar";
import EventModal from "./EventModal";
import AddEventModal from "./AddEventModal";
import { CalendarEvent } from "@/types/event";

export default function EventsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Filter by ISO string match
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return events.filter((e) => e.date === dateStr);
  };

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

  //  use DELETE
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
        onDayClick={(date) => {
          const dayEvents = getEventsForDate(date);
          setSelectedDate(date);
          setShowAddModal(dayEvents.length >= 0 && dayEvents.length < 2);
        }}
        renderDayContent={(date) => {
          const list = getEventsForDate(date);
          return list.length > 0 ? (
            <div className="mt-1 text-[0.75rem] text-orange-600 font-medium text-center space-y-1 max-h-[3.5rem] overflow-y-auto">
              {list.slice(0, 2).map((ev, idx) => (
                <div key={idx}>
                  {ev.title}
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
