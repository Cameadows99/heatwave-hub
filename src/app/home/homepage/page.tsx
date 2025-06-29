"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Permanent_Marker } from "next/font/google";
import Link from "next/link";

const markerFont = Permanent_Marker({ subsets: ["latin"], weight: "400" });

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockToggle = () => {
    const action = isClockedIn ? "Clocked out" : "Clocked in";
    setIsClockedIn(!isClockedIn);
    setMessage(
      `${action} at ${currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-200 text-black flex flex-col items-center">
      {/* Header Logo */}
      <header className="w-full flex justify-center mt-4"></header>

      {/* Sun and Time */}
      <section className="relative mt-6 flex flex-col items-center">
        <div className="relative w-128 h-128 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center animate-[rotateSun_4s_linear_infinite]">
            <Image
              src="/logos/basic-sun.png"
              alt="Rotating Sun"
              width={350}
              height={224}
              className="opacity-90"
            />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-2xl font-extrabold text-sky-500 drop-shadow-sm">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-md text-sky-500 font-semibold">
              {currentTime.getHours() >= 12 ? "p.m." : "a.m."}
            </p>
          </div>
        </div>
      </section>

      {/* Motivational Quote */}
      <section className="mt-6 text-center px-4">
        <p
          className={`${markerFont.className} text-2xl text-orange-600 drop-shadow tracking-wide`}
        >
          "People who feel good about themselves produce good results."
        </p>
      </section>

      {/* Clock In / Out */}
      <section className="mt-4 flex flex-col items-center">
        <button
          onClick={handleClockToggle}
          className={`${
            isClockedIn ? "bg-yellow-400 text-sky-900" : "bg-sky-500 text-white"
          } font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform`}
        >
          {isClockedIn ? "Clock Out" : "Clock In"}
        </button>
        {message && (
          <p className="mt-2 text-green-700 font-medium text-sm">{message}</p>
        )}
      </section>

      {/* Nav Quick Links */}
      <section className="mt-10 grid grid-cols-2 gap-6 px-6 w-full max-w-xl">
        <Link
          href="/events"
          className="bg-white/90 hover:bg-yellow-200 border-2 border-orange-300 rounded-xl p-4 flex flex-col items-center shadow transition-all"
        >
          <Image
            src="/logos/basic-sun.png"
            alt="Events"
            width={48}
            height={48}
          />
          <p className="mt-2 font-semibold text-orange-600">Events</p>
        </Link>
        <Link
          href="/discussion"
          className="bg-white/90 hover:bg-yellow-200 border-2 border-orange-300 rounded-xl p-4 flex flex-col items-center shadow transition-all"
        >
          <Image src="/logos/heat-sun.png" alt="Talk" width={48} height={48} />
          <p className="mt-2 font-semibold text-orange-600">Discussion</p>
        </Link>
        <Link
          href="/schedule"
          className="bg-white/90 hover:bg-yellow-200 border-2 border-orange-300 rounded-xl p-4 flex flex-col items-center shadow transition-all"
        >
          <Image
            src="/logos/heat-sun.png"
            alt="Time Off"
            width={48}
            height={48}
          />
          <p className="mt-2 font-semibold text-orange-600">Time Off</p>
        </Link>
        <Link
          href="/profile"
          className="bg-white/90 hover:bg-yellow-200 border-2 border-orange-300 rounded-xl p-4 flex flex-col items-center shadow transition-all"
        >
          <Image
            src="/logos/heat-sun.png"
            alt="Profile"
            width={48}
            height={48}
          />
          <p className="mt-2 font-semibold text-orange-600">Profile</p>
        </Link>
      </section>

      {/* Footer Waves */}
      <footer className="mt-12 w-full"></footer>

      {/* Animation Keyframes */}
      <style jsx>{`
        .animate-spin-slow {
          animation: rotateSun 8s linear infinite;
        }
        @keyframes rotateSun {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
