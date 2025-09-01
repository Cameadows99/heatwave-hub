"use client";

import { KeyboardEvent } from "react";
import Image from "next/image";

export type Mode = "events" | "time-off" | "hours";

const LABELS: Record<Mode, string> = {
  events: "Events",
  "time-off": "Time Off",
  hours: "Hours",
};

// tiny helper
const cn = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(" ");

export default function ModeToggle({
  value,
  onChange,
  className = "",
}: {
  value: Mode;
  onChange: (next: Mode) => void;
  className?: string;
}) {
  const options: Mode[] = ["events", "time-off", "hours"];
  const idx = Math.max(0, options.indexOf(value));

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = options[(idx + dir + options.length) % options.length];
      onChange(next);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Calendar view"
      tabIndex={0}
      onKeyDown={onKey}
      className={cn("relative w-full max-w-[340px] select-none", className)}
    >
      {/* TRACK — your inactive button gradient */}
      <div
        className={cn(
          "relative grid grid-cols-3 rounded-full p-1 text-yellow-600",
          "bg-gradient-to-r from-yellow-300/70 via-orange-300/70 to-red-700/40",
          "shadow-inner"
        )}
      >
        {/* SLIDING THUMB — your active button gradient */}
        <div
          className={cn(
            "absolute inset-y-1 left-1 rounded-full",
            "bg-gradient-to-r from-[#24CCAA] via-[#24CCFF] to-[#24CCAA]",
            "shadow-lg transition-transform duration-300 ease-out",
            "ring-2 ring-yellow-300/60"
          )}
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            transform: `translateX(${idx * 100}%)`,
          }}
          aria-hidden="true"
        >
          {/* circular knob with the Heatwave sun */}
          <div className="absolute right-0 top- h-7 w-7 ">
            <Image
              src="/logos/heat-sun.png"
              alt=""
              fill
              className="object-contain p-1"
              priority
              draggable={false}
            />
          </div>
        </div>

        {/* LABELS */}
        {options.map((opt, i) => {
          const active = i === idx;
          return (
            <button
              key={opt}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt)}
              className={cn(
                "relative z-10 h-10 rounded-full text-sm font-semibold transition-colors",
                active ? "text-yellow-200" : "text-white"
              )}
            >
              {LABELS[opt]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
