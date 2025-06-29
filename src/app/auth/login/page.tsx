"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LogInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-red-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md border border-yellow-200 backdrop-blur"
      >
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6 bg-gradient-to-br from-yellow-400 via-orange-300 to-red-400 bg-clip-text text-transparent tracking-wide text-center">
          <span>LOGIN TO SUNSHINE</span>
          <Image
            src="/logos/heat-sun.png"
            alt="Sun Icon"
            width={40}
            height={40}
          />
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2  placeholder-gray-300 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border  placeholder-gray-300 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />

        {error && (
          <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-400 text-white py-2 rounded-lg hover:brightness-110 transition font-semibold shadow"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
