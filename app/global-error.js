"use client";

import React from "react";
import Image from "next/image";

/**
 * Global Error Boundary
 * This handles errors that occur in the root layout (where ClerkProvider lives)
 * It must define its own html and body tags.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="bg-[#1b3a34] flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 overflow-hidden">
          <img
            src="/waiting.gif"
            alt="Background"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[#1b3a34]/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="mb-8">
            <img
              src="/logo1.png"
              alt="VetMeds Logo"
              className="w-48 sm:w-64 h-auto"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#fcf8ef] mb-4">
            System Connectivity Issue
          </h1>
          <p className="text-[#fcf8ef]/90 text-lg mb-8 max-w-md">
            We're having trouble reaching our core services. This is often caused by network interruptions or script blocking.
          </p>

          <button
            onClick={() => reset()}
            className="px-8 py-4 bg-[#fcf8ef] text-[#1b3a34] font-bold rounded-full shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            Reconnect & Retry
          </button>
        </div>
      </body>
    </html>
  );
}
