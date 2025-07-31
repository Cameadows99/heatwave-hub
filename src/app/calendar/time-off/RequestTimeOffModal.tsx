"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TimeOffRequest, TimeOffFormInput } from "@/types/timeOff"; // ✅ Import both types

interface Props {
  date: Date;
  onClose: () => void;
  onSubmit: (newRequest: TimeOffRequest) => void;
}

const formatLocalDate = (d: Date) => {
  return d.toLocaleDateString("sv-SE");
};

export default function RequestTimeOffModal({
  date,
  onClose,
  onSubmit,
}: Props) {
  const { data: session } = useSession();

  const [form, setForm] = useState<TimeOffFormInput>({
    name: "",
    date: formatLocalDate(date),
    time: "",
    reason: "",
    status: "pending",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name ?? "",
        date: formatLocalDate(date),
      }));
    }
  }, [session, date]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.reason) return;

    const newRequest: TimeOffRequest = {
      ...form,
      id: crypto.randomUUID(),
      status: "pending", // already typed correctly in form state
    };

    onSubmit(newRequest);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
      <div className="max-w-md w-[90%] p-6 bg-white shadow-xl rounded-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-orange-600 mb-4 text-center">
          Request Time Off for {date.toDateString()}
        </h2>

        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm text-center mb-4">
            Request submitted!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
          />

          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason (admin only)"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500"
          />

          <div className="text-center">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-yellow-300 font-semibold px-6 py-2 rounded-full transition-all shadow"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
