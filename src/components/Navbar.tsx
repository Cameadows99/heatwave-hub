"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white p-3 shadow mb-4">
      {/* Logo Row */}
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-30 h-10">
          <Image
            src="/logos/heat-sun.png"
            alt="Sun Logo"
            fill
            className="object-contain scale-150"
          />
        </div>
      </Link>

      {/* Nav Links */}
      <div className="mt-4 w-full bg-sky-400 text-yellow-300 font-semibold flex justify-around py-2 rounded-md shadow-md text-sm sm:text-base">
        <Link href="/home">Home</Link>
        <Link href="/teams">Teams</Link>
        <Link href="/work-orders">Work Order</Link>
        <Link href="/schedule">Schedule</Link>
        <Link href="/calendar">Calendar</Link>
      </div>
      <div className="relative w-30 h-10">
        <Image
          src="/logos/heat-sun.png"
          alt="Sun Logo"
          fill
          className="object-contain scale-150"
        />
      </div>
    </nav>
  );
}
