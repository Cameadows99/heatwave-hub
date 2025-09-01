"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Status = "PENDING" | "APPROVED" | "DENIED";

type Item = {
  id: string;
  userId: string;
  reason: string;
  status: Status;
  startDate: string; // ISO
  endDate: string; // ISO
  user?: { id: string; name: string | null } | null;
};

type View = "list" | "request";

export default function TimeOffModal({
  date,
  isAdmin,
  onClose,
  onCreated, // notify parent to refresh
}: {
  date: Date;
  isAdmin: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [view, setView] = useState<View>("list");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dayStr = format(date, "yyyy-MM-dd");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/timeoff/day?date=${dayStr}`);
        if (!res.ok) throw new Error(await res.text());
        const data: Item[] = await res.json();
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [dayStr]);

  const approve = async (id: string) => {
    const res = await fetch(`/api/timeoff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
      );
    }
  };
  const deny = async (id: string) => {
    const res = await fetch(`/api/timeoff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DENIED" }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "DENIED" } : r))
      );
    }
  };
  const remove = async (id: string) => {
    const res = await fetch(`/api/timeoff/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      onCreated?.(); // reflect in parent
    }
  };

  // request form state
  const [startDate, setStartDate] = useState(dayStr);
  const [endDate, setEndDate] = useState(dayStr);
  const [reason, setReason] = useState("");

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/timeoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, reason }),
    });
    if (res.ok) {
      setView("list");
      setReason("");
      // refresh list
      const ref = await fetch(`/api/timeoff/day?date=${dayStr}`);
      const data: Item[] = await ref.json();
      setItems(data);
      onCreated?.();
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-orange-600">
            {format(date, "eeee, MMMM d, yyyy")}
          </h2>

          {view === "list" ? (
            <button
              onClick={() => setView("request")}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full"
            >
              Request Time Off
            </button>
          ) : (
            <button
              onClick={() => setView("list")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full"
            >
              Back to List
            </button>
          )}
        </div>

        {view === "list" ? (
          <>
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : items.length === 0 ? (
              <p className="text-gray-600 text-center">
                Nobody requested time off this day.
              </p>
            ) : (
              <ul className="space-y-3">
                {items.map((req) => (
                  <li
                    key={req.id}
                    className="bg-yellow-100 p-3 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {req.user?.name ?? "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(req.startDate), "MMM d")} –{" "}
                          {format(new Date(req.endDate), "MMM d")}
                        </p>
                        <p className="text-xs text-gray-700">
                          Reason: {req.reason}
                        </p>
                        <p className="text-xs mt-1">
                          {req.status === "PENDING" && (
                            <span className="text-yellow-700">Pending</span>
                          )}
                          {req.status === "APPROVED" && (
                            <span className="text-green-700">Approved</span>
                          )}
                          {req.status === "DENIED" && (
                            <span className="text-gray-700">Denied</span>
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {(isAdmin || req.userId) && (
                          <button
                            onClick={() => remove(req.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        )}
                        {isAdmin && req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => approve(req.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => deny(req.id)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Reason (visible to admins)"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-yellow-300 font-semibold px-6 py-2 rounded-full"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
