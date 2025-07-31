"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Permanent_Marker, Share_Tech_Mono } from "next/font/google";
import { useSession } from "next-auth/react";

const markerFont = Permanent_Marker({ subsets: ["latin"], weight: "400" });
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockToggle = async () => {
    if (!session?.user?.email) return;

    const action = isClockedIn ? "clock-out" : "clock-in";
    const res = await fetch(`/api/time/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.email }),
    });

    if (res.ok) {
      const displayAction = isClockedIn ? "Clocked out" : "Clocked in";
      setIsClockedIn(!isClockedIn);
      setMessage(
        `${displayAction} at ${currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
      setTimeout(() => setMessage(""), 4000);
    } else {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* Background transition layer */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
            isClockedIn ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to bottom right, #FEF3C7, #FDE68A, #FCA5A5)",
          }}
        />
        <div
          className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
            isClockedIn ? "opacity-0" : "opacity-100"
          }`}
          style={{ background: "#0B1A33" }}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        {/* Clock Time */}
        <section className="relative mt-10 flex flex-col items-center w-full max-w-[500px] h-[80px]">
          <p
            className={`${
              shareTechMono.className
            } text-4xl sm:text-5xl md:text-6xl tracking-wide drop-shadow absolute transition-opacity duration-[3000ms] ease-in-out text-orange-600 ${
              isClockedIn ? "opacity-100" : "opacity-0"
            }`}
          >
            {formattedTime}
          </p>
          <p
            className={`${
              shareTechMono.className
            } text-4xl sm:text-5xl md:text-6xl tracking-wide drop-shadow absolute transition-opacity duration-[3000ms] ease-in-out text-white ${
              isClockedIn ? "opacity-0" : "opacity-100"
            }`}
          >
            {formattedTime}
          </p>
        </section>

        {/* Sun & Moon */}
        <div className="relative mt-12 mb-28 w-[60vw] max-w-[230px] h-[160px] flex items-center justify-center">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity ease-in-out duration-[2000ms] ${
              isClockedIn
                ? "opacity-0 delay-[100ms] pointer-events-none"
                : "opacity-80 delay-[2000ms]"
            }`}
          >
            <Image
              src="/logos/heat-moon.png"
              alt="Moon"
              fill
              className="object-contain opacity-90"
            />
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[3000ms] ease-in-out transform ${
              isClockedIn
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src="/logos/heat-sun-alt.png"
              alt="Rotating Sun"
              fill
              className="object-contain opacity-90 animate-[rotateSun_4s_linear_infinite]"
            />
          </div>
        </div>

        {/* Logo */}
        <section className="relative flex justify-center items-center -mt-2 w-full h-[100px] max-w-[600px]">
          <div
            className={`absolute transition-opacity duration-[3000ms] ease-in-out pointer-events-none mt-4 ${
              isClockedIn ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src="/logos/heat-text-white.png"
              alt="Heatwave Text (White)"
              width={600}
              height={100}
              className="w-full max-w-[600px] block"
              priority
            />
          </div>
          <div
            className={`absolute transition-opacity duration-[3000ms] ease-in-out pointer-events-none ${
              isClockedIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src="/logos/heat-text.png"
              alt="Heatwave Text (Color)"
              width={600}
              height={100}
              className="w-full max-w-[600px] block"
              priority
            />
          </div>
          <div className="w-full max-w-[600px] h-[100px] opacity-0 pointer-events-none" />
        </section>

        {/* Quote */}
        <section className="mt-8 mb-16 text-center px-4 w-full max-w-[600px]">
          <p
            className={`${markerFont.className} text-xl sm:text-2xl md:text-3xl text-orange-600 drop-shadow tracking-wide`}
          >
            "People who feel good about themselves produce good results."
          </p>
        </section>

        {/* Clock In/Out Button */}
        <section className="mt-4 flex flex-col items-center w-full">
          <div className="relative h-[60px] w-[180vw] max-w-[220px] flex items-center justify-center">
            <div
              className={`absolute transition-opacity duration-[3000ms] ease-in-out ${
                isClockedIn ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <button
                onClick={handleClockToggle}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-white bg-orange-500 hover:bg-orange-700"
              >
                Clock Out
              </button>
            </div>
            <div
              className={`absolute transition-opacity duration-[3000ms] ease-in-out ${
                isClockedIn ? "opacity-0 z-0" : "opacity-100 z-10"
              }`}
            >
              <button
                onClick={handleClockToggle}
                className="w-full font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-white bg-sky-500 hover:bg-sky-700"
              >
                Clock In
              </button>
            </div>
          </div>
          {message && (
            <p className="mt-2 text-green-700 font-medium text-sm">{message}</p>
          )}
        </section>

        <footer className="mt-10 w-full" />
      </div>
    </main>
  );
}
