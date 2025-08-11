"use client";

import { useEffect, useMemo, useState } from "react";
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

  // Helper: local YYYY-MM-DD
  const ymdLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Requests for a given day (and only today/future)
  const getDayRequests = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return requests.filter((r) => {
      const [year, month, day] = r.date.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      localDate.setHours(0, 0, 0, 0);

      const isSameDay =
        localDate.getFullYear() === date.getFullYear() &&
        localDate.getMonth() === date.getMonth() &&
        localDate.getDate() === date.getDate();

      const isTodayOrFuture = localDate >= today;
      return isSameDay && isTodayOrFuture;
    });
  };

  // Build a fast lookup of days that have requests (today or future)
  const timeOffDateSet = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const s = new Set<string>();
    for (const r of requests) {
      const [y, m, d] = r.date.split("-").map(Number);
      const localDate = new Date(y, m - 1, d);
      localDate.setHours(0, 0, 0, 0);
      if (localDate >= today) s.add(ymdLocal(localDate));
    }
    return s;
  }, [requests]);

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
        hasContentForDate={(date) => timeOffDateSet.has(ymdLocal(date))}
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
