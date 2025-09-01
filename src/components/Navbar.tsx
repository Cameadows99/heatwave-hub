// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
// If you saved the tray from earlier:
import ProfileTray from "@/components/ProfileTray"; // adjust path if needed

// tiny class combiner (avoid extra deps)
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Simple inline icons (no external lib)
function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", active && "opacity-100")}
      aria-hidden="true"
    >
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
        fill="currentColor"
        className="opacity-90"
      />
    </svg>
  );
}
function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M3 7l9-4 9 4-9 4-9-4zm0 4l9 4 9-4M3 7v10l9 4 9-4V7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
function HammerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M5 22l7-7M14 6l4-4 3 3-4 4M3 12l7 1 4-4-3-3-4 4-4 2z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 14c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5zM12 3a5 5 0 110 10 5 5 0 010-10z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // active state for highlighting
  const isActive = (href: string) => pathname === href;

  // Derive user display
  const userLabel = useMemo(
    () => session?.user?.name ?? session?.user?.email ?? "You",
    [session]
  );
  const isAdmin = useMemo(
    () => session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER",
    [session]
  );

  // Shared nav items
  const items = [
    { href: "/home", label: "Home", icon: HomeIcon },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/order-requests", label: "Orders", icon: BoxIcon },
    { href: "/work-orders", label: "Work", icon: HammerIcon },
  ];

  return (
    <>
      {/* Desktop / Tablet top bar */}
      <header
        className={cn(
          "hidden md:block sticky top-0 z-40",
          "bg-gradient-to-r from-[#242C32] via-[#244C77] to-[#242C32] text-white shadow-lg"
        )}
      >
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex h-16 items-center justify-between">
            {/* Left: brand */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-9 w-9">
                <Image
                  src="/logos/heat-sun.png"
                  alt="Heatwave"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-semibold tracking-wide">
                Heatwave
              </span>
            </Link>

            {/* Center: links */}
            <ul className="flex items-center gap-4">
              {items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      "transition hover:bg-white/10",
                      isActive(href) && "bg-white/15 ring-1 ring-white/20"
                    )}
                  >
                    <Icon active={isActive(href)} />
                    <span className="font-medium">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right: auth & profile */}
            <div className="flex items-center gap-2">
              {!loading && session ? (
                <>
                  <button
                    onClick={() => setProfileOpen(true)}
                    className={cn(
                      "group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      "bg-white/10 hover:bg-white/15 ring-1 ring-white/20"
                    )}
                    aria-label="Open profile"
                  >
                    <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-white/30">
                      <Image
                        src="/logos/heat-sun.png"
                        alt="Avatar"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="hidden lg:inline-block">{userLabel}</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 px-3 py-2 text-sm font-semibold text-zinc-950 shadow hover:brightness-105"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 px-3 py-2 text-sm font-semibold text-zinc-950 shadow hover:brightness-105"
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile bottom app bar (safe-area aware) */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-40 backdrop-blur-md bg-gradient-to-r from-[#242C32]/95 via-[#244C77]/95 to-[#242C32]/95 text-white border-t border-white/10 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        style={{ height: "var(--mobile-appbar-h)" }}
        role="navigation"
        aria-label="Primary"
      >
        <div className="mx-auto h-full max-w-screen-sm">
          <ul className="grid h-full grid-cols-5">
            {items.map(({ href, label, icon: Icon }) => (
              <li key={href} className="flex">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 py-2",
                    "text-xs",
                    isActive(href)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-300"
                  )}
                >
                  <Icon active={isActive(href)} />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
            {/* Profile trigger */}
            <li className="flex">
              <button
                onClick={() => setProfileOpen(true)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-2",
                  "text-xs text-zinc-600 dark:text-zinc-300"
                )}
                aria-label="Profile"
              >
                <UserIcon />
                <span className="font-medium">Profile</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Profile Tray (works on both mobile & desktop) */}
      {session && (
        <ProfileTray
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={session.user.id as string}
          userName={userLabel}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
