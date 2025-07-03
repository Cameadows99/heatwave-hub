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

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const newEvent: CalendarEvent = {
      ...form,
      date: dateStr,
    };

    onAdd(newEvent);
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
          />
          <input
            name="time"
            placeholder="Time (e.g., 3:00 PM)"
            value={form.time}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500"
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
