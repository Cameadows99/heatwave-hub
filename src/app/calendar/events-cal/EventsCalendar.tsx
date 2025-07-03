"use client";

import { useState, useEffect } from "react";
import BaseCalendar from "../../../components/BaseCalendar";
import EventModal from "./event-modal";
import AddEventModal from "./add-event-modal";
import { CalendarEvent } from "@/types/event";

export default function EventsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("heatwave-events");
    if (stored) setEvents(JSON.parse(stored));
  }, []);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return events.filter((e) => e.date === dateStr);
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem("heatwave-events", JSON.stringify(updated));
  };

  const handleDeleteEvent = (toDelete: CalendarEvent) => {
    const updated = events.filter(
      (ev) => !(ev.title === toDelete.title && ev.date === toDelete.date)
    );
    setEvents(updated);
    localStorage.setItem("heatwave-events", JSON.stringify(updated));

    const stillHas = updated.some((ev) => ev.date === toDelete.date);
    if (!stillHas) setSelectedDate(null);
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
