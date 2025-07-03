import BaseCalendar from "@/components/BaseCalendar";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface TimeOffRequest {
  id: string;
  name: string;
  date: string;
  time?: string;
  reason: string;
  status: "pending" | "approved";
}

type TimeOffCalendarProps = {
  isAdmin: boolean;
  onDayClick: (date: Date) => void;
};

export default function TimeOffCalendar({
  isAdmin,
  onDayClick,
}: TimeOffCalendarProps) {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const stored = localStorage.getItem("timeOffRequests");
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  const getDayRequests = (date: Date) => {
    return requests.filter((r) => {
      const reqDate = new Date(r.date);
      return (
        reqDate.getFullYear() === date.getFullYear() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getDate() === date.getDate()
      );
    });
  };

  const renderDayContent = (date: Date) => {
    const dayRequests = getDayRequests(date);
    if (dayRequests.length === 0) return null;

    const visible = dayRequests.slice(0, 2);
    const extra = dayRequests.length - visible.length;

    return (
      <div className="mt-1 space-y-1 text-xs">
        {visible.map((r, idx) => (
          <div
            key={idx}
            className={`truncate font-semibold ${
              r.status === "pending" ? "text-yellow-500" : "text-gray-700"
            }`}
          >
            {r.name}
            {r.time ? ` (${r.time})` : ""}
          </div>
        ))}
        {extra > 0 && (
          <div className="text-[10px] text-gray-500">+{extra} more</div>
        )}
      </div>
    );
  };

  return <BaseCalendar renderDayContent={renderDayContent} />;
}
