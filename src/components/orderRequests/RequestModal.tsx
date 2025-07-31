"use client";

import { useState } from "react";

type RequestModalProps = {
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export default function RequestModal({
  onClose,
  onSubmitSuccess,
}: RequestModalProps) {
  const [items, setItems] = useState([""]);
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems((prev) => [...prev, ""]);
  };

  const handleSubmit = async () => {
    if (items.some((item) => item.trim() === "")) {
      alert("Please fill out all item fields.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/order-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, details, reason }),
    });

    if (res.ok) {
      onSubmitSuccess(); // ✅ Refresh list in parent
      onClose(); // ✅ Close modal
    } else {
      alert("Something went wrong.");
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full relative">
        <h2 className="text-xl font-semibold mb-4">New Order Request</h2>

        {items.map((item, index) => (
          <input
            key={index}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={`Item ${index + 1}`}
            className="w-full border px-3 py-2 mb-2 rounded"
          />
        ))}

        <button
          onClick={addItem}
          className="text-sm text-blue-600 underline mb-4"
        >
          + Add another item
        </button>

        <textarea
          placeholder="Additional details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full border px-3 py-2 mb-2 rounded"
          rows={2}
        />

        <textarea
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
          rows={2}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
