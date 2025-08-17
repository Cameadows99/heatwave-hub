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
  const [items, setItems] = useState<string[]>([""]);
  const [quantities, setQuantities] = useState<number[]>([1]);
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- helpers: keep names clean while typing; format on submit ---
  const NBSP = "\u00A0";

  // Loose, non-trimming sanitizer for typing: only strips trailing " xN"
  const stripQtyFromNameLoose = (raw: string) =>
    (raw ?? "").replace(/[\s\u00A0]*[xX]\s*\d+\s*$/, "");

  // Submit-time: trim then append "  xN" (two NBSPs) when qty > 1
  const formatItemString = (name: string, qty: number) => {
    const clean = (name ?? "").trim();
    const q = Math.max(1, Math.floor(qty || 1));
    return clean ? (q > 1 ? `${clean}${NBSP}${NBSP}x${q}` : clean) : "";
  };
  // ----------------------------------------------------------------

  const handleItemChange = (index: number, value: string) => {
    const copy = [...items];
    copy[index] = stripQtyFromNameLoose(value); // no trim while typing
    setItems(copy);
  };

  const handleQtyChange = (index: number, value: string) => {
    const q = Math.max(1, Math.floor(Number(value) || 1));
    const copy = [...quantities];
    copy[index] = q;
    setQuantities(copy);
  };

  const addItem = () => {
    setItems((prev) => [...prev, ""]);
    setQuantities((prev) => [...prev, 1]);
  };

  const handleSubmit = async () => {
    // validation (now trims at submit-time)
    if (items.some((item) => (item ?? "").trim() === "")) {
      alert("Please fill out all item fields.");
      return;
    }

    setSubmitting(true);

    const formatted = items
      .map((name, i) => formatItemString(name, quantities[i] ?? 1))
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/order-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: formatted, details, reason }),
    });

    if (res.ok) {
      onSubmitSuccess();
      onClose();
    } else {
      alert("Something went wrong.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title */}
        <h2
          className="text-xl font-bold text-orange-700 mb-4"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.15)" }}
        >
          New Order Request
        </h2>

        {/* Inputs */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onKeyDown={(e) => e.stopPropagation()} // guard against parent key handlers
                placeholder="Item Request"
                className="w-full border-black text-black border p-2 rounded"
              />

              {/* Quantity */}
              <input
                type="number"
                min={1}
                step={1}
                value={quantities[index] ?? 1}
                onChange={(e) => handleQtyChange(index, e.target.value)}
                list="qtyOptions"
                className="border border-black text-black p-2 rounded w-24"
                aria-label={`Quantity for item ${index + 1}`}
              />
            </div>
          ))}

          {/* Datalist options */}
          <datalist id="qtyOptions">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>

          <button
            onClick={addItem}
            className="text-xs text-sky-700 underline hover:text-sky-900"
            type="button"
          >
            + Add another item
          </button>

          <textarea
            placeholder="Additional details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()} // optional consistency
            className="w-full border border-black text-black p-2 rounded"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            disabled={submitting}
            type="button"
          >
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
