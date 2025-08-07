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
    setRsvps(data);
  };

  useEffect(() => {
    fetchRsvps();
  }, [eventId]);

  useEffect(() => {
    console.log("User ID:", userId);
    console.log("RSVPs:", rsvps);
  }, [rsvps, userId]);

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
      await fetchRsvps();
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch("/api/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpId: id }),
    });

    if (res.ok) {
      await fetchRsvps();
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
      await fetchRsvps();
      setNewName("");
      setShowAddField(false);
    }
  };

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
              className="flex justify-between items-center border-b py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span>{r.name}</span>
                {r.plusCount > 0 && (
                  <span className="text-xs text-gray-700 ">
                    (+ {r.plusCount})
                  </span>
                )}

                {canEdit && (
                  <button
                    onClick={() => handlePlusChange(r.id, 1)}
                    className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                    title="Add +1"
                  >
                    +
                  </button>
                )}
                {r.plusCount > 0 && (
                  <>
                    {canEdit && (
                      <button
                        onClick={() => handlePlusChange(r.id, -1)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                        title="Remove +1"
                      >
                        –
                      </button>
                    )}
                  </>
                )}
              </div>

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

        <div className="mt-6 border-t pt-4 space-y-2">
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
