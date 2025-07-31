// utils/timeOffUtils.ts

import { TimeOffRequest } from "@/types/timeOff";

// Simulated data source (to be replaced with DB logic later)
let timeOffRequests: TimeOffRequest[] = [];

export function getTimeOffForDate(date: string): TimeOffRequest[] {
  return timeOffRequests.filter((req) => req.date === date);
}

export function getRequestsForDate(date: Date): TimeOffRequest[] {
  return timeOffRequests.filter(
    (req) => new Date(req.date).toDateString() === date.toDateString()
  );
}

export function formatRequestLabel(r: TimeOffRequest): string {
  const nameWithTime = r.time ? `${r.name} (${r.time})` : r.name;
  return r.status === "pending" ? `${nameWithTime} ?` : nameWithTime;
}

export function getStatusStyle(status: TimeOffRequest["status"]): string {
  if (status === "pending") return "text-yellow-500 font-medium italic";
  if (status === "approved") return "text-sky-600 font-semibold";
  return "text-gray-500";
}

export function approveTimeOff(id: string): void {
  const request = timeOffRequests.find((req) => req.id === id);
  if (request) request.status = "approved";
}

export function denyTimeOff(id: string): void {
  timeOffRequests = timeOffRequests.filter((req) => req.id !== id);
}

export function addTimeOffRequest(request: TimeOffRequest): void {
  timeOffRequests.push(request);
}
