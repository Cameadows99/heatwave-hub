"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/event";
import { useSession } from "next-auth/react";

interface Props {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  onClose: () => void;
  onAdd: (ev: CalendarEvent) => void;
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
    time: "12:00",
    location: "",
    description: "",
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    time: "",
    location: "",
    description: "",
  });

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [userRsvps, setUserRsvps] = useState<string[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchRsvps = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/rsvp/user/${session.user.id}`);
      const data = await res.json();
      setUserRsvps(data.map((r: { eventId: string }) => r.eventId));
    };

    fetchRsvps();
  }, [session]);

  const formattedDate = new Date(year, month, day).toDateString();

  useEffect(() => {
    setLocalEvents(events);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [events]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRSVP = async (ev: CalendarEvent) => {
    const eventId = ev.id;

    if (typeof eventId !== "string") {
      console.error("Event is missing a valid ID");
      return;
    }

    try {
      const isReserved = userRsvps.includes(eventId);

      const res = await fetch("/api/rsvp", {
        method: isReserved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        setUserRsvps((prev) =>
          isReserved ? prev.filter((id) => id !== eventId) : [...prev, eventId]
        );
      } else {
        console.error("Failed to toggle RSVP:", await res.json());
      }
    } catch (err) {
      console.error("RSVP toggle error:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const newEvent: CalendarEvent = {
      ...form,
      date: dateStr,
      attendees: [],
    };

    onAdd(newEvent);
    setShowAddForm(false);
    setForm({ title: "", time: "12:00", location: "", description: "" });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
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

        {/* Add ev Form */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="title"
              placeholder="event Title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-gray-800"
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-gray-800"
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-gray-800"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-gray-800"
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
            >
              Save event
            </button>
          </form>
        ) : (
          <>
            {localEvents.length > 0 ? (
              <>
                {localEvents.map((ev, i) => {
                  const isEditing = editIndex === i;

                  return (
                    <div key={i}>
                      {isEditing ? (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();

                            const res = await fetch("/api/events/update", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                originalTitle: ev.title,
                                originalDate: ev.date,
                                ...editForm,
                              }),
                            });
                            if (res.ok) {
                              const updated = [...localEvents];
                              updated[i] = { ...editForm, date: ev.date };
                              setLocalEvents(updated);
                              setEditIndex(null);
                            }
                          }}
                          className="space-y-2"
                        >
                          <input
                            name="title"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="w-full border p-1 rounded text-sm"
                          />
                          <input
                            name="time"
                            type="time"
                            value={editForm.time}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }))
                            }
                            className="w-full border p-1 rounded text-sm"
                          />
                          <input
                            name="location"
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            className="w-full border p-1 rounded text-sm"
                          />
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full border p-1 rounded text-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="submit"
                              className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditIndex(null)}
                              className="px-2 py-1 text-sm bg-gray-400 text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="mb-4 border-b pb-2 relative group hover:bg-gray-200 cursor-pointer">
                            <div
                              onClick={() =>
                                alert(`View RSVPs for: ${ev.title}`)
                              }
                              className="group cursor-pointer"
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                Click to see reservations
                              </div>

                              <h3 className="text-lg font-semibold text-sky-700">
                                {ev.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {ev.time} @ {ev.location}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {ev.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRSVP(ev);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Reserve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditIndex(i);
                                setEditForm({
                                  title: ev.title,
                                  time: ev.time,
                                  location: ev.location,
                                  description: ev.description,
                                });
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(ev);
                                setLocalEvents((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                );
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full mt-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded"
                >
                  Add Another event
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
                  Add event
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
