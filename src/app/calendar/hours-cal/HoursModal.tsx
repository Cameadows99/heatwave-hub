"use client";

import { format } from "date-fns";

// ✅ Exported Entry type so HoursCalendar can import it
export type Entry = {
  id: string;
  userId: string;
  clockIn: Date;
  clockOut?: Date;
  hours: number; // decimal hours
};

export default function HoursModal({
  date,
  entries,
  onClose,
}: {
  date: Date;
  entries: Entry[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 px-2 py-1 rounded-md text-gray-600 hover:bg-zinc-100"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          Hours for {format(date, "MMM d, yyyy")}
        </h2>

        {/* Entries list */}
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No hours recorded.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {entries.map((e) => (
              <li key={e.id} className="py-2 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(e.clockIn, "h:mm a")} –{" "}
                    {e.clockOut ? format(e.clockOut, "h:mm a") : "In progress"}
                  </div>
                  <div className="text-xs text-gray-500">User: {e.userId}</div>
                </div>
                <div className="text-sm font-semibold text-[#244C77]">
                  {e.hours.toFixed(2)}h
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer total */}
        {entries.length > 0 && (
          <div className="mt-4 text-right font-bold text-[#244C77]">
            Total: {entries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)}h
          </div>
        )}
      </div>
    </div>
  );
}
