"use client";

import { useEffect, useState } from "react";
import RequestModal from "@/components/orderRequests/RequestModal";

type OrderRequest = {
  id: string;
  requester: { name: string };
  createdAt: string;
  items: string[];
  details?: string;
  reason?: string;
  ordered: boolean;
};

export default function OrderRequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    const res = await fetch("/api/order-requests");
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const markAsOrdered = async (id: string) => {
    await fetch(`/api/order-requests/${id}`, { method: "PATCH" });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ordered: true } : r))
    );
  };

  const deleteRequest = async (id: string) => {
    await fetch(`/api/order-requests/${id}`, { method: "DELETE" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order Requests</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Request
        </button>
      </div>

      {requests.length === 0 && (
        <p className="text-center text-gray-500">No requests yet.</p>
      )}

      {[...requests]
        .sort((a, b) => Number(a.ordered) - Number(b.ordered))
        .map((req) => (
          <div
            key={req.id}
            className={`border rounded p-4 mb-4 ${
              req.ordered ? "bg-green-100 border-green-400" : "bg-white"
            }`}
          >
            <div className="flex justify-between">
              <span className="font-semibold">
                {req.requester?.name ?? "Unknown"}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
            <ul className="mt-2 list-disc list-inside">
              {req.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {req.details && <p className="mt-2 text-sm">💬 {req.details}</p>}
            {req.reason && <p className="text-sm italic">📌 {req.reason}</p>}
            <div className="flex gap-2 mt-3">
              {!req.ordered && (
                <button
                  onClick={() => markAsOrdered(req.id)}
                  className="text-sm bg-green-500 text-white px-2 py-1 rounded"
                >
                  Mark as Ordered
                </button>
              )}
              <button
                onClick={() => deleteRequest(req.id)}
                className="text-sm bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      {showModal && (
        <RequestModal
          onClose={() => setShowModal(false)}
          onSubmitSuccess={fetchRequests}
        />
      )}
    </main>
  );
}
