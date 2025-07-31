// types.ts

export type TimeOffRequest = {
  id: string;
  name: string;
  date: string; // format: yyyy-mm-dd
  time?: string;
  reason: string;
  status: "pending" | "approved";
};

export type TimeOffFormInput = Omit<TimeOffRequest, "id">;
