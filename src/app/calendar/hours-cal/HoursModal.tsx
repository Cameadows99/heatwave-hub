"use client";

import { format } from "date-fns";

interface Entry {
  id: string;
  clockIn: Date;
  clockOut: Date | null;
  hours: number;
}

interface Props {
  date: Date;
  entries: Entry[];
  onClose: () => void;
}

export default function HoursModal({ date, entries, onClose }: Props) {
  const formattedDate = format(date, "eeee, MMMM d, yyyy");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-sky-700 mb-4">{formattedDate}</h2>

        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div key={entry.id + i} className="border-b pb-2">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">In:</span>{" "}
                  {format(new Date(entry.clockIn), "h:mm a")}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Out:</span>{" "}
                  {entry.clockOut
                    ? format(new Date(entry.clockOut), "h:mm a")
                    : "Still clocked in"}
                </div>
                <div className="text-sm text-green-700 font-semibold">
                  {entry.hours.toFixed(2)} hrs
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No entries for this day.</p>
        )}
      </div>
    </div>
  );
}
