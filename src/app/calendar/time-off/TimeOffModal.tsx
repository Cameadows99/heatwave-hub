"use client";

import { useEffect, useState } from "react";
import {
  getTimeOffForDate,
  approveTimeOff,
  denyTimeOff,
} from "@/utils/timeOffUtils";
import { useRouter } from "next/navigation";

interface TimeOffModalProps {
  date: Date;
  isAdmin: boolean;
  onClose: () => void;
}

export default function TimeOffModal({
  date,
  isAdmin,
  onClose,
}: TimeOffModalProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadRequests = async () => {
      const data = await getTimeOffForDate(date);
      setRequests(data);
    };
    loadRequests();
  }, [date]);

  const handleApprove = async (id: string) => {
    await approveTimeOff(id);
    router.refresh();
  };

  const handleDeny = async (id: string) => {
    await denyTimeOff(id);
    router.refresh();
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

        <h2 className="text-2xl font-bold text-orange-600 mb-4">
          Time Off Requests for {date.toDateString()}
        </h2>

        {requests.length === 0 && (
          <p className="text-gray-500 text-center">
            Nobody requested time off on this day.
          </p>
        )}

        <ul className="space-y-3">
          {requests.map((req) => (
            <li key={req.id} className="bg-yellow-100 p-3 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{req.name}</p>
                  {req.time && (
                    <p className="text-sm text-gray-600">Time: {req.time}</p>
                  )}
                  {isAdmin && (
                    <p className="text-xs text-red-600 italic">
                      Reason: {req.reason}
                    </p>
                  )}
                  {req.status === "PENDING" && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Pending Approval
                    </p>
                  )}
                </div>
                {isAdmin && req.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(req.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/calendar/time-off-form")}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full"
          >
            Request Time Off
          </button>
        </div>
      </div>
    </div>
  );
}
