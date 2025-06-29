"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/event";

interface Props {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  onClose: () => void;
  onAdd: (event: CalendarEvent) => void;
  onDelete: (eventToDelete: CalendarEvent) => void;
}

export default function EventModal({
  day,
  month,
  year,
  events,
  onClose,
  onAdd,
  onDelete,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    time: "",
    location: "",
    description: "",
  });

  const formattedDate = new Date(year, month, day).toDateString();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const newEvent: CalendarEvent = {
      ...form,
      date: dateStr,
    };

    onAdd(newEvent);
    setShowAddForm(false);
    setForm({ title: "", time: "", location: "", description: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-orange-600 mb-4">
          {formattedDate}
        </h2>

        {/* Add Event Form */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="title"
              placeholder="Event Title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded placeholder-gray-400 
              focus:outline-none text-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
            />
            <input
              name="time"
              placeholder="Time (e.g., 3:00 PM)"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded placeholder-gray-400 
              focus:outline-none text-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded placeholder-gray-400 
              focus:outline-none text-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full text-gray-800 border border-gray-300 p-2 rounded placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
            >
              Save Event
            </button>
          </form>
        ) : (
          <>
            {events.length > 0 ? (
              <>
                {events.map((event, i) => (
                  <div key={i} className="mb-4 border-b pb-2">
                    <h3 className="text-lg font-semibold text-sky-700">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {event.time} @ {event.location}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {event.description}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        onClick={() => alert(`Reserved for: ${event.title}`)}
                      >
                        Reserve
                      </button>
                      <button
                        onClick={() => onDelete(event)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full mt-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded"
                >
                  Add Another Event
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-lg font-semibold text-gray-700 mb-4">
                  The possibilities are endless 🌟
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded"
                >
                  Add Event
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
