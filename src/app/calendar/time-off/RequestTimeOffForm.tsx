"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TimeOffRequest {
  name: string;
  date: string;
  time?: string;
  reason: string;
}

export default function RequestTimeOffForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState<TimeOffRequest>({
    name: session?.user?.name || "",
    date: "",
    time: "",
    reason: "",
  });

  useEffect(() => {
    const username = session?.user?.name;
    if (typeof username === "string") {
      setForm((prev) => ({
        ...prev,
        name: username,
      }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.reason)
      return alert("Date and reason are required.");

    const existing = localStorage.getItem("heatwave-timeoff");
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [...parsed, form];
    localStorage.setItem("heatwave-timeoff", JSON.stringify(updated));
    alert("Time off request submitted.");
    setForm({ name: "", date: "", time: "", reason: "" });
    setTimeout(() => {
      router.push("/calendar?view=time-off");
    }, 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow max-w-md mx-auto space-y-4"
    >
      <h2 className="text-xl font-bold text-orange-700">Request Time Off</h2>

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />

      <input
        type="time"
        name="time"
        value={form.time}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />

      <textarea
        name="reason"
        value={form.reason}
        onChange={handleChange}
        placeholder="Reason (admin only)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        required
      />

      <button
        type="submit"
        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
      >
        Submit Request
      </button>
    </form>
  );
}
