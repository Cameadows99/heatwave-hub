"use client";

import React, { useState } from "react";
import { CalendarEvent } from "@/types/event";

interface Props {
  day: number;
  month: number;
  year: number;
  onClose: () => void;
  onAdd: (event: CalendarEvent) => void;
}

const formatDateInput = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function AddEventModal({
  day,
  month,
  year,
  onClose,
  onAdd,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    time: "",
    location: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateStr = formatDateInput(year, month, day);

    const newEvent: CalendarEvent = {
      ...form,
      date: dateStr,
      attendees: [],
    };

    onAdd(newEvent);
    setForm({ title: "", time: "", location: "", description: "" });
    onClose();
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

        <h2 className="text-xl font-bold text-yellow-500 mb-4">
          Add Event for {new Date(year, month, day).toDateString()}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
            required
          />

          {/* 🔥 This is the exact input that works in RequestTimeOffModal */}
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            required
          />

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
          >
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
}
