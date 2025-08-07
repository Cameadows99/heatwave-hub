"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/event";
import { useSession } from "next-auth/react";
import RSVPModal from "../../../components/RSVPModal";

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

  const [userRsvps, setUserRsvps] = useState<string[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);
  const [selectedRSVPEventId, setSelectedRSVPEventId] = useState<string | null>(
    null
  );

  const { data: session, status } = useSession();
  const sessionReady = status === "authenticated" && !!session?.user?.id;
  const formattedDate = new Date(year, month, day).toDateString();

  useEffect(() => {
    const fetchRsvps = async () => {
      if (!session?.user?.id) return;

      setRsvpsLoading(true);
      try {
        const res = await fetch(`/api/rsvp/user/${session.user.id}`);
        const data = await res.json();
        setUserRsvps(data.map((r: { eventId: string }) => r.eventId));
      } catch (err) {
        console.error("RSVP fetch error:", err);
      } finally {
        setRsvpsLoading(false);
      }
    };

    fetchRsvps();
  }, [session?.user?.id, events]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRSVP = async (ev: CalendarEvent) => {
    const eventId = ev.id;
    if (!eventId) return;

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
      }
    } catch (err) {
      console.error("RSVP toggle error:", err);
    }
  };

  const handleRemoveRsvpId = (removedEventId: string) => {
    setUserRsvps((prev) => prev.filter((id) => id !== removedEventId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const newEvent: CalendarEvent = { ...form, date: dateStr, attendees: [] };

    await onAdd(newEvent);
    setForm({ title: "", time: "12:00", location: "", description: "" });
    setShowAddForm(false);
  };

  if (rsvpsLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
        <div className="bg-white p-4 rounded shadow text-center">
          Loading event data...
        </div>
      </div>
    );
  }

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

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Event Title"
              className="w-full border p-2 rounded"
            />
            <input
              name="time"
              value={form.time}
              type="time"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Location"
              className="w-full border p-2 rounded"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Description"
              className="w-full border p-2 rounded"
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
              events.map((ev, i) => {
                const isReserved = ev.id ? userRsvps.includes(ev.id) : false;

                return (
                  <div key={i}>
                    <div className="mb-4 border-b pb-2 relative group hover:bg-gray-200 cursor-pointer">
                      <div
                        onClick={() => ev.id && setSelectedRSVPEventId(ev.id)}
                        className="group cursor-pointer"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
                      {sessionReady && ev.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRSVP(ev);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          {isReserved ? "Unreserve" : "Reserve"}
                        </button>
                      )}

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
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
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

      {selectedRSVPEventId && (
        <RSVPModal
          eventId={selectedRSVPEventId}
          userId={session?.user?.id ?? ""}
          isAdmin={
            session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"
          }
          onClose={() => setSelectedRSVPEventId(null)}
          onRemoveRsvpId={handleRemoveRsvpId}
        />
      )}
    </div>
  );
}
