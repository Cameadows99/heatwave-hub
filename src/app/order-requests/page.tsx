"use client";

import { useEffect, useMemo, useState } from "react";
import RequestModal from "@/components/orderRequests/RequestModal";

type OrderRequest = {
  id: string;
  requester: { name: string };
  createdAt: string;
  items: string[]; // stored as "ItemName  x3" (two NBSPs)
  details?: string;
  reason?: string;
  ordered: boolean;
};

// ---------- helpers for qty parsing/formatting ----------
// ---------- helpers for qty parsing/formatting ----------
const NBSP = "\u00A0";

// Same pattern your modal uses: trailing (spaces or NBSP) + x + optional spaces + digits
const NAME_QTY_RE = /^(.*?)(?:[\s\u00A0]*[xX]\s*(\d+))\s*$/;

// Parse using the modal’s rule
function parseItemString(raw: string): { name: string; qty: number } {
  const s = String(raw ?? "").trim();

  // Try multiple end-of-string patterns, in order of likelihood
  const patterns: RegExp[] = [
    /^(.*?)(?:[\s\u00A0]*[xX×]\s*(\d+))\s*$/, // "Item  x3", "Item × 3"
    /^(.*?)[\s\u00A0]*qty[\s:]*([0-9]+)\s*$/i, // "Item qty:3" or "Item qty 3"
    /^(.*?)[\s\u00A0]*\((\d+)\)\s*$/, // "Item (3)"
    /^(.*?)[\s\u00A0]*-\s*(\d+)\s*$/, // "Item - 3"
  ];

  for (const re of patterns) {
    const m = re.exec(s);
    if (m) {
      const name = (m[1] ?? "").trim();
      const qty = Math.max(1, parseInt(m[2] ?? "1", 10) || 1);
      return { name, qty };
    }
  }
  return { name: s, qty: 1 };
}

// Loose, non-trimming sanitizer during typing (same spirit as modal)
const stripQtyFromNameLoose = (raw: string) =>
  (raw ?? "").replace(/[\s\u00A0]*[xX]\s*\d+\s*$/, "");

// Submit-time formatter (your existing modal format)
function formatItemString(name: string, qty: number): string {
  const clean = (name ?? "").trim();
  if (!clean) return "";
  const q = Math.max(1, Math.floor(qty || 1));
  return q > 1 ? `${clean}${NBSP}${NBSP}x${q}` : clean;
}

// --------------------------------------------------------

type StatusFilter = "all" | "pending" | "ordered";

export default function OrderRequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Toolbar state
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItemNames, setEditItemNames] = useState<string[]>([]);
  const [editQuantities, setEditQuantities] = useState<number[]>([]);
  const [editDetails, setEditDetails] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");

  const fetchRequests = async () => {
    const res = await fetch("/api/order-requests");
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const markAsOrdered = async (id: string) => {
    await fetch(`/api/order-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordered: true }),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ordered: true } : r))
    );
  };

  const unorder = async (id: string) => {
    await fetch(`/api/order-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordered: false }),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ordered: false } : r))
    );
  };

  const deleteRequest = async (id: string) => {
    await fetch(`/api/order-requests/${id}`, { method: "DELETE" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const startEdit = (req: OrderRequest) => {
    if (req.ordered) return;
    setEditingId(req.id);

    const parsed = req.items.map(parseItemString);
    setEditItemNames(parsed.map((p) => p.name));
    setEditQuantities(parsed.map((p) => p.qty));
    setEditDetails(req.details ?? "");
    setEditReason(req.reason ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItemNames([]);
    setEditQuantities([]);
    setEditDetails("");
    setEditReason("");
  };

  const saveEdit = async (id: string) => {
    const items = editItemNames
      .map((name, i) => formatItemString(name, editQuantities[i] ?? 1))
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      items,
      details: editDetails?.trim() || null,
      reason: editReason?.trim() || null,
    };

    await fetch(`/api/order-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              items: payload.items,
              details: payload.details ?? undefined,
              reason: payload.reason ?? undefined,
            }
          : r
      )
    );
    cancelEdit();
  };

  const addEditItem = (index?: number) => {
    if (typeof index === "number") {
      const nextNames = [...editItemNames];
      const nextQtys = [...editQuantities];
      nextNames.splice(index + 1, 0, "");
      nextQtys.splice(index + 1, 0, 1);
      setEditItemNames(nextNames);
      setEditQuantities(nextQtys);
    } else {
      setEditItemNames((prev) => [...prev, ""]);
      setEditQuantities((prev) => [...prev, 1]);
    }
  };

  const removeEditItem = (index: number) => {
    const nextNames = [...editItemNames];
    const nextQtys = [...editQuantities];
    nextNames.splice(index, 1);
    nextQtys.splice(index, 1);
    setEditItemNames(nextNames.length ? nextNames : [""]);
    setEditQuantities(nextQtys.length ? nextQtys : [1]);
  };

  // --- toolbar derived counts/filters ---
  const countPending = requests.filter((r) => !r.ordered).length;
  const countOrdered = requests.filter((r) => r.ordered).length;

  const filtered = useMemo(() => {
    let list = [...requests];

    if (status === "pending") list = list.filter((r) => !r.ordered);
    if (status === "ordered") list = list.filter((r) => r.ordered);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => {
        const inRequester = r.requester?.name?.toLowerCase().includes(q);
        const inDetails = r.details?.toLowerCase().includes(q);
        const inItems = r.items.some((it) =>
          parseItemString(it).name.toLowerCase().includes(q)
        );
        return inRequester || inDetails || inItems;
      });
    }

    return list.sort((a, b) => Number(a.ordered) - Number(b.ordered));
  }, [requests, status, query]);
  // --------------------------------------

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom right, #FEF3C7, #FDE68A, #FCA5A5)",
      }}
    >
      <div className="max-w-5xl mx-auto p-6">
        {/* Page header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold text-orange-700"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.12)" }}
            >
              Order Requests
            </h1>
            <p className="text-sm text-gray-700">Submit, Update, and Track</p>
          </div>

          <button
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            onClick={() => setShowModal(true)}
          >
            Request
          </button>
        </header>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="inline-flex rounded-lg border border-amber-300 bg-yellow-50/80 overflow-hidden">
            <TabBtn active={status === "all"} onClick={() => setStatus("all")}>
              All{" "}
              <span className="ml-2 rounded-full bg-white/70 px-2 text-xs">
                {requests.length}
              </span>
            </TabBtn>
            <TabBtn
              active={status === "pending"}
              onClick={() => setStatus("pending")}
            >
              Pending{" "}
              <span className="ml-2 rounded-full bg-white/70 px-2 text-xs">
                {countPending}
              </span>
            </TabBtn>
            <TabBtn
              active={status === "ordered"}
              onClick={() => setStatus("ordered")}
            >
              Ordered{" "}
              <span className="ml-2 rounded-full bg-white/70 px-2 text-xs">
                {countOrdered}
              </span>
            </TabBtn>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search requester, item, details…"
              className="w-full md:w-80 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-700 py-12">No matching orders.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const ordered = req.ordered;
              const isEditing = editingId === req.id;
              const accent = ordered
                ? "border-l-4 border-l-green-500"
                : "border-l-4 border-l-amber-400";

              return (
                <div
                  key={req.id}
                  role={!ordered && !isEditing ? "button" : undefined}
                  tabIndex={!ordered && !isEditing ? 0 : -1}
                  onClick={() => !ordered && !isEditing && startEdit(req)}
                  onKeyDown={
                    !isEditing
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            if (e.currentTarget === document.activeElement) {
                              e.preventDefault();
                              startEdit(req);
                            }
                          }
                        }
                      : undefined
                  }
                  className={`rounded-xl px-5 py-4 shadow-sm border transition outline-none
    ${
      ordered
        ? "bg-green-100 border-amber-200 hover:bg-green-200/70"
        : "bg-yellow-50 border-amber-200 hover:bg-amber-100/70"
    }
    ${accent}`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {req.requester?.name ?? "Unknown"}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            ordered
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}
                        >
                          {ordered ? "Ordered" : "Pending"}
                        </span>
                      </div>
                      <span className="block text-xs text-gray-600 mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {ordered ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unorder(req.id);
                          }}
                          className="text-xs text-amber-600 underline hover:text-amber-800"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsOrdered(req.id);
                          }}
                          className="text-xs text-green-600 underline hover:text-green-900"
                        >
                          Mark as Ordered
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRequest(req.id);
                        }}
                        title="Delete"
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {!isEditing ? (
                    <>
                      {/* ITEMS */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                            Items
                          </h3>
                          <span className="text-[11px] text-gray-500">
                            {req.items.length} total
                          </span>
                        </div>

                        <ol className="mt-2 space-y-1.5">
                          {req.items.map((raw, i) => {
                            const { name, qty } = parseItemString(raw);
                            return (
                              <li
                                key={i}
                                className="flex items-center justify-between rounded-lg border border-amber-200 bg-white/70 px-2.5 py-1.5"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-200 text-amber-800 text-[11px] font-bold">
                                    {i + 1}
                                  </span>
                                  <span className="truncate text-gray-900 text-sm">
                                    {name}
                                  </span>
                                </div>
                                <span className="text-xs px-2 py-0.5 text-black rounded-full border border-amber-300 bg-amber-100">
                                  x{qty}
                                </span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>

                      {/* DIVIDER */}
                      {(req.details || req.reason) && (
                        <div className="my-3 h-px bg-amber-200/80" />
                      )}

                      {/* DETAILS / REASON */}
                      {req.details && (
                        <div className="rounded-md border border-amber-200 bg-white/80 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                            Details
                          </div>
                          <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                            {req.details}
                          </p>
                        </div>
                      )}

                      {req.reason && (
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Reason:</span>{" "}
                          {req.reason}
                        </p>
                      )}

                      {!ordered && (
                        <p className="mt-3 text-[11px] text-gray-500">
                          Tip: click anywhere on this card to edit.
                        </p>
                      )}
                    </>
                  ) : (
                    // Inline editor
                    <div
                      className="mt-3 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Items
                        </label>
                        <div className="space-y-2">
                          {editItemNames.map((val, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                value={val}
                                onChange={(e) => {
                                  const next = [...editItemNames];
                                  next[idx] = stripQtyFromNameLoose(
                                    e.target.value
                                  ); // keep name clean, no trim while typing
                                  setEditItemNames(next);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full rounded border text-gray-700 border-amber-300 bg-white px-3 py-1.5 text-sm"
                                placeholder={`Item ${idx + 1}`}
                              />
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={editQuantities[idx] ?? 1}
                                onChange={(e) => {
                                  const q = Math.max(
                                    1,
                                    Math.floor(Number(e.target.value) || 1)
                                  );
                                  const next = [...editQuantities];
                                  next[idx] = q;
                                  setEditQuantities(next);
                                }}
                                className="w-20 rounded text-gray-700 border border-amber-300 bg-white px-2 py-1.5 text-sm"
                                aria-label={`Quantity for item ${idx + 1}`}
                              />
                              <button
                                onClick={() => removeEditItem(idx)}
                                className="px-2 text-red-700 bg-red-100 rounded border text-sm hover:bg-red-200"
                                title="Remove item"
                              >
                                −
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addEditItem()}
                            className="text-xs text-sky-700 underline hover:text-sky-900"
                          >
                            + Add another item
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Details
                        </label>
                        <textarea
                          value={editDetails}
                          onChange={(e) => setEditDetails(e.target.value)}
                          className="w-full rounded text-gray-700 border border-amber-300 bg-white px-3 py-1.5 text-sm"
                          rows={3}
                          placeholder="Optional notes"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(req.id)}
                          className="text-sm px-3 py-1.5 rounded bg-sky-600 text-white hover:bg-sky-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <RequestModal
          onClose={() => setShowModal(false)}
          onSubmitSuccess={fetchRequests}
        />
      )}
    </main>
  );
}

/** Tiny tab button component for the toolbar */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm transition ${
        active
          ? "bg-white text-orange-700 font-semibold"
          : "text-amber-800 hover:bg-white/60"
      }`}
    >
      {children}
    </button>
  );
}
