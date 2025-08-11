"use client";

import { useEffect, useState } from "react";

interface RSVP {
  userId?: string;
  id: string;
  name: string;
  plusCount: number;
}

interface Props {
  eventId: string;
  isAdmin: boolean;
  userId: string;
  onClose: () => void;
  onRemoveRsvpId?: (eventId: string) => void;
}

export default function RSVPModal({
  eventId,
  isAdmin,
  userId,
  onClose,
  onRemoveRsvpId,
}: Props) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [newName, setNewName] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  const fetchRsvps = async () => {
    const res = await fetch(`/api/rsvp?eventId=${eventId}`);
    const data = await res.json();
    setRsvps((prev) => {
      // Keep original order if same IDs are present
      const prevOrder = prev.map((r) => r.id);
      const sorted = [...data].sort(
        (a, b) => prevOrder.indexOf(a.id) - prevOrder.indexOf(b.id)
      );
      return prev.length ? sorted : data;
    });
  };

  useEffect(() => {
    fetchRsvps();
  }, [eventId]);

  const isReserved = rsvps.some((r) => r.userId === userId);

  const handleReserveToggle = async () => {
    const res = await fetch("/api/rsvp", {
      method: isReserved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });

    if (res.ok) {
      if (onRemoveRsvpId) onRemoveRsvpId(eventId);
      await fetchRsvps();
    }
  };

  const handlePlusChange = async (rsvpId: string, delta: number) => {
    const res = await fetch("/api/rsvp/pluscount", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpId, delta }),
    });

    if (res.ok) {
      const updated = await res.json();
      // Update only the changed RSVP locally
      setRsvps((prev) =>
        prev.map((r) =>
          r.id === rsvpId ? { ...r, plusCount: updated.plusCount } : r
        )
      );
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch("/api/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpId: id }),
    });

    if (res.ok) {
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      if (onRemoveRsvpId) onRemoveRsvpId(eventId);
    }
  };

  const handleAddName = async () => {
    if (!newName.trim()) return;

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, name: newName }),
    });

    if (res.ok) {
      const added = await res.json();
      setRsvps((prev) => [...prev, added]); // keep added at end
      setNewName("");
      setShowAddField(false);
    }
  };

  // NEW: total count (1 per RSVP + plusCount extras)
  const totalRsvps = rsvps.reduce((sum, r) => sum + 1 + (r.plusCount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4 text-sky-700">Event RSVP List</h2>

        {rsvps.map((r) => {
          const canEdit = isAdmin || r.userId === userId;

          return (
            <div
              key={r.id}
              className="flex items-center justify-between border-b py-2 text-sm"
            >
              <span className="relative inline-block">
                <span className="font-medium">{r.name}</span>

                <span
                  className="
                    absolute
                    -top-2
                    -right-7
                    flex items-center
                    leading-none
                    w-7 justify-end
                  "
                  style={{ transform: "translateY(25%)" }}
                >
                  {canEdit ? (
                    <button
                      onClick={() => handlePlusChange(r.id, 1)}
                      aria-label="Add plus one"
                      className="text-blue-600 hover:text-blue-400 font-extrabold text-[14px]"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
                    >
                      ⁺
                    </button>
                  ) : (
                    <span className="text-[14px] opacity-0 select-none">⁺</span>
                  )}

                  <span
                    className="
                      text-[12px] text-gray-700 tabular-nums
                      inline-block text-center
                      w-6
                    "
                  >
                    {r.plusCount > 0 ? r.plusCount : "\u00A0\u00A0"}
                  </span>

                  {canEdit ? (
                    <button
                      onClick={() => handlePlusChange(r.id, -1)}
                      aria-label="Remove plus one"
                      className={`font-extrabold text-[14px] ${
                        r.plusCount > 0
                          ? "text-yellow-500 hover:text-yellow-400"
                          : "text-yellow-500 opacity-0 pointer-events-none"
                      }`}
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
                    >
                      ⁻
                    </button>
                  ) : (
                    <span className="text-[10px] opacity-0 select-none">⁻</span>
                  )}
                </span>
              </span>

              {canEdit && (
                <button
                  onClick={() => handleRemove(r.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}

        {rsvps.length === 0 && (
          <p className="text-center text-gray-400 mt-6">No RSVPs yet</p>
        )}

        {/* NEW: Total row */}
        <div className="mt-3 flex items-center font-[800] justify-between text-xs italic">
          <span>Total RSVPs</span>
          <span className="tabular-nums">{totalRsvps}</span>
        </div>

        <div className="mt-1 border-t pt-1 space-y-2">
          <div className="flex justify-between items-center">
            <button
              onClick={handleReserveToggle}
              className={`px-4 py-1 text-sm rounded ${
                isReserved
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isReserved ? "Unreserve" : "Reserve"}
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAddField((prev) => !prev)}
                className="text-xs text-sky-600 underline hover:text-sky-800"
              >
                {showAddField ? "Cancel" : "Add attendee"}
              </button>
            )}
          </div>

          {isAdmin && showAddField && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="enter name"
                className="border p-1 text-sm rounded w-full"
              />
              <button
                onClick={handleAddName}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
