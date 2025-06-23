"use client"

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Permanent_Marker } from 'next/font/google';

const markerFont = Permanent_Marker({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [message, setMessage] = useState('');

  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClockToggle = () => {
    const action = isClockedIn ? 'Clocked out' : 'Clocked in';
    setIsClockedIn(!isClockedIn);
    setMessage(`${action} at ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 max-w-screen-md mx-auto">
      {/* Header Logo */}
      <header className="w-full flex flex-col items-center mb-4">
        <div className="flex items-center space-x-2 mt-4">
          <Image src="/logos/heat-banner-alt.png" alt="Heatwave Pools Logo" width={400} height={40} className="rounded-full" />
        </div>

        {/* Nav Bar */}
        <nav className="mt-4 w-full bg-sky-400 text-yellow-300 font-semibold flex justify-around py-2 rounded-md shadow-md text-sm sm:text-base">
          <a href="/home" className="hover:underline">Home</a>
          <a href="/teams" className="hover:underline">Teams</a>
          <a href="/work-orders" className="hover:underline">Work Order</a>
          <a href="/schedule" className="hover:underline">Schedule</a>
          <a href="/events" className="hover:underline">Events</a>
        </nav>
      </header>

      {/* Motivational Quote */}
      <section className="text-center my-10">
        <p className={`${markerFont.className} text-xl text-black`}>"People who feel good about themselves produce good results."</p>
      </section>

      {/* Current Time Display with Rotating Sun */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="relative w-128 h-128 flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center animate-[rotateSun_4s_linear_infinite]">
            <Image
              src="/logos/basic-sun.png"
              alt="Rotating Sun"
              width={400}
              height={400}
              className="rounded-full"
            />
          </div>
          <span className="text-xl font-bold text-sky-500 z-10">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-sm font-medium text-sky-500 z-10">
            {currentTime.getHours() >= 12 ? 'p.m.' : 'a.m.'}
          </span>
        </div>
      </div>

      {/* Clock In/Out Toggle Button */}
      <button
        onClick={handleClockToggle}
        className={`${
          isClockedIn ? 'bg-yellow-400 text-sky-800' : 'bg-sky-400 text-yellow-300'
        } font-semibold px-6 py-2 rounded-lg shadow-md transition`}
      >
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>

      {/* Confirmation Message */}
      {message && <p className="mt-4 text-green-600 font-medium">{message}</p>}

      {/* Waves */}
      <footer className="mt-10 w-full">
        <Image src="/logos/home-waves.jpg" alt="Wave design" layout="responsive" width={1600} height={200} />
      </footer>

      <style jsx>{`
        @keyframes rotateSun {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
