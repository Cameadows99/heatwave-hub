// utils/timeOffUtils.ts

import { TimeOffRequest } from "@/types/timeOffRequest";

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
  return r.time ? `${r.name} (${r.time})` : r.name;
}

export function getStatusStyle(approved?: boolean): string {
  if (approved === undefined) return "text-yellow-500 italic";
  if (approved === false) return "text-red-500 line-through";
  return "text-green-600 font-bold";
}

export function approveTimeOff(id: string): void {
  const request = timeOffRequests.find((req) => req.id === id);
  if (request) request.approved = true;
}

export function denyTimeOff(id: string): void {
  timeOffRequests = timeOffRequests.filter((req) => req.id !== id);
}

export function addTimeOffRequest(request: TimeOffRequest): void {
  timeOffRequests.push(request);
}
