"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/**
 * ProfileTray: a slide-over “sandwich bar” that replaces a dedicated profile page.
 *
 * Usage:
 *  - Drop <ProfileTray open={open} onClose={() => setOpen(false)} /> near your root layout
 *  - Trigger from navbar avatar/menu
 *  - Fill the data loaders where marked // TODO: load ...
 */
export default function ProfileTray({
  open,
  onClose,
  userId,
  userName,
  isAdmin = false,
  defaultTab = "hours",
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  isAdmin?: boolean;
  defaultTab?: "hours" | "timeoff" | "recs" | "settings";
}) {
  const [tab, setTab] = useState(defaultTab);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // click outside to close
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      aria-hidden={!open}
      className={clsx(
        "fixed inset-0 z-50 transition pointer-events-none",
        open ? "" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onMouseDown={onBackdropClick}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          "pointer-events-auto absolute right-0 top-0 h-full w-full max-w-[720px]",
          "bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 ring-2 ring-white dark:ring-zinc-900" />
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-500">Signed in as</p>
              <h2 className="truncate text-lg font-semibold">
                {userName ?? "You"}
              </h2>
            </div>
          </div>
          <button
            aria-label="Close profile tray"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <nav className="px-2 sm:px-4 mt-2">
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1">
            {(
              [
                { id: "hours", label: "My hours" },
                { id: "timeoff", label: "My days off" },
                { id: "recs", label: "My recommendations" },
                { id: "settings", label: "Settings" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200 dark:ring-zinc-700"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <section className="h-[calc(100%-132px)] overflow-y-auto px-4 sm:px-6 py-4">
          {tab === "hours" && <HoursPanel userId={userId} />}
          {tab === "timeoff" && <TimeOffPanel userId={userId} />}
          {tab === "recs" && <RecsPanel userId={userId} isAdmin={isAdmin} />}
          {tab === "settings" && <SettingsPanel />}
        </section>
      </aside>
    </div>
  );
}

// -------------------- Panels --------------------

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}

function HoursPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState<
    { weekStart: string; weekEnd: string; totalHours: number }[]
  >([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // TODO: replace with your real endpoint
        // Example: const res = await fetch(`/api/time/summary?userId=${userId}&weeks=8`)
        // const data = await res.json()
        // setWeekly(data)
        await new Promise((r) => setTimeout(r, 250));
        if (!alive) return;
        setWeekly([
          { weekStart: "2025-08-11", weekEnd: "2025-08-17", totalHours: 38.75 },
          { weekStart: "2025-08-18", weekEnd: "2025-08-24", totalHours: 42.25 },
        ]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <>
      <Section title="Recent weeks">
        {loading ? (
          <SkeletonRows rows={3} />
        ) : weekly.length === 0 ? (
          <EmptyState message="No hours yet. Clock in from Home to start tracking." />
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {weekly.map((w) => (
              <li
                key={w.weekStart}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatRange(w.weekStart, w.weekEnd)}
                  </p>
                  <p className="text-xs text-zinc-500">Week total</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {w.totalHours.toFixed(2)} hrs
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Open timesheet"
        action={
          <a
            href="/calendar?mode=hours"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View 30-day calendar
          </a>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Jump to your Hours view to see daily breakdowns and edit requests.
        </p>
      </Section>
    </>
  );
}

function TimeOffPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<
    {
      id: string;
      date: string;
      time?: string;
      status: "APPROVED" | "PENDING" | "DENIED";
    }[]
  >([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // TODO: replace with your real endpoint
        // const res = await fetch(`/api/timeoff?userId=${userId}&upcoming=1`)
        // setRequests(await res.json())
        await new Promise((r) => setTimeout(r, 250));
        if (!alive) return;
        setRequests([
          { id: "1", date: "2025-08-25", time: "AM", status: "APPROVED" },
          { id: "2", date: "2025-09-03", status: "PENDING" },
        ]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <>
      <Section
        title="Upcoming requests"
        action={
          <a
            href="/calendar?mode=timeoff"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Open Time Off
          </a>
        }
      >
        {loading ? (
          <SkeletonRows rows={3} />
        ) : requests.length === 0 ? (
          <EmptyState message="No upcoming requests. Submit one from the calendar." />
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(r.date)} {r.time ? `• ${r.time}` : ""}
                  </p>
                  <p
                    className={clsx(
                      "text-xs font-medium",
                      r.status === "APPROVED" && "text-green-600",
                      r.status === "PENDING" && "text-amber-600",
                      r.status === "DENIED" && "text-red-600"
                    )}
                  >
                    {r.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Users + Admins can cancel (your business rule) */}
                  <button className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Request time off">
        <a
          href="/calendar?mode=timeoff&request=1"
          className="inline-flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Open request form
        </a>
      </Section>
    </>
  );
}

function RecsPanel({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<
    {
      id: string;
      title: string;
      createdAt: string;
      status: "OPEN" | "IN_PROGRESS" | "DONE";
    }[]
  >([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // TODO: replace with your real endpoint
        // const res = await fetch(`/api/recommendations?userId=${userId}`)
        // setRecs(await res.json())
        await new Promise((r) => setTimeout(r, 250));
        if (!alive) return;
        setRecs([
          {
            id: "a",
            title: "Add dark mode toggle to calendar",
            createdAt: "2025-08-12",
            status: "IN_PROGRESS",
          },
          {
            id: "b",
            title: "Order new skimmer nets",
            createdAt: "2025-08-18",
            status: "OPEN",
          },
        ]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <>
      <Section
        title="My recommendations"
        action={
          <a
            href="/discussion?mode=suggestions"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Open Suggestion Box
          </a>
        }
      >
        {loading ? (
          <SkeletonRows rows={3} />
        ) : recs.length === 0 ? (
          <EmptyState message="No suggestions yet. Share an idea in the Suggestion Box!" />
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recs.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(r.createdAt)} • {r.status.replace("_", " ")}
                  </p>
                </div>
                <button className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {isAdmin && (
        <Section title="Admin quick links">
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/users"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Manage users
            </a>
            <a
              href="/admin/time"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Time entries
            </a>
          </div>
        </Section>
      )}
    </>
  );
}

function SettingsPanel() {
  return (
    <>
      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-zinc-500">Follows system by default</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs">
            <button className="rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              System
            </button>
            <button className="rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Light
            </button>
            <button className="rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Dark
            </button>
          </div>
        </div>
      </Section>

      <Section title="Account">
        <div className="flex items-center justify-between">
          <p className="text-sm">Sign out</p>
          <button className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
            Log out
          </button>
        </div>
      </Section>
    </>
  );
}

// -------------------- helpers --------------------

function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-sm text-zinc-500">{message}</div>;
}

function formatDate(iso: string) {
  const d = new Date(iso + (iso.endsWith("Z") ? "" : "T00:00:00Z"));
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRange(startISO: string, endISO: string) {
  const s = new Date(startISO + (startISO.endsWith("Z") ? "" : "T00:00:00Z"));
  const e = new Date(endISO + (endISO.endsWith("Z") ? "" : "T00:00:00Z"));
  const sameYear = s.getFullYear() === e.getFullYear();
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const sStr = s.toLocaleDateString(
    undefined,
    sameYear ? opts : { ...opts, year: "numeric" }
  );
  const eStr = e.toLocaleDateString(undefined, { ...opts, year: "numeric" });
  return `${sStr} — ${eStr}`;
}
