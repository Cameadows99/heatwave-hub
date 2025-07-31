"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BaseCalendar from "@/components/BaseCalendar";
import { TimeOffRequest } from "@/types/timeOff";
import { getStatusStyle, formatRequestLabel } from "@/utils/timeOffUtils";
import TimeOffModal from "./TimeOffModal";
import RequestTimeOffModal from "./RequestTimeOffModal";

type TimeOffCalendarProps = {
  isAdmin: boolean;
  onDayClick?: (date: Date) => void;
};

export default function TimeOffCalendar({ isAdmin }: TimeOffCalendarProps) {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { data: session } = useSession();

  // Load time off requests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("heatwave-timeoff");
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  // Add new request and persist
  const addRequest = (newRequest: TimeOffRequest) => {
    const updated = [...requests, newRequest];
    setRequests(updated);
    localStorage.setItem("heatwave-timeoff", JSON.stringify(updated));
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    localStorage.setItem("heatwave-timeoff", JSON.stringify(updated));
  };

  // Safer local date comparison
  const getDayRequests = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time, just compare date

    return requests.filter((r) => {
      const [year, month, day] = r.date.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);

      const isSameDay =
        localDate.getFullYear() === date.getFullYear() &&
        localDate.getMonth() === date.getMonth() &&
        localDate.getDate() === date.getDate();

      const isTodayOrFuture = localDate >= today;

      return isSameDay && isTodayOrFuture;
    });
  };

  // Display name(s) on calendar
  const renderDayContent = (date: Date) => {
    const dayRequests = getDayRequests(date);
    if (dayRequests.length === 0) return null;

    const visible = dayRequests.slice(0, 2);
    const extra = dayRequests.length - visible.length;

    return (
      <div className="mt-1 space-y-1 text-xs">
        {visible.map((r, idx) => (
          <div key={idx} className={`truncate ${getStatusStyle(r.status)}`}>
            {formatRequestLabel(r)}
          </div>
        ))}
        {extra > 0 && (
          <div className="text-[10px] text-gray-500">+{extra} more</div>
        )}
      </div>
    );
  };

  return (
    <>
      <BaseCalendar
        renderDayContent={renderDayContent}
        onDayClick={(date) => {
          setSelectedDate(date);
        }}
      />

      {selectedDate && !showRequestModal && (
        <TimeOffModal
          date={selectedDate}
          isAdmin={isAdmin}
          onClose={() => setSelectedDate(null)}
          onRequest={() => setShowRequestModal(true)}
        />
      )}

      {selectedDate && showRequestModal && (
        <RequestTimeOffModal
          date={selectedDate}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedDate(null);
          }}
          onSubmit={addRequest}
        />
      )}
    </>
  );
}
