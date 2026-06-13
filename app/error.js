"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#1b3a34]">
      {/* Background GIF */}
      <div className="absolute inset-0 opacity-40">
        <img
          src="/waiting.gif"
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <div className="mb-8">
          <Image
            src="/logo1.png"
            alt="VetMeds Logo"
            width={200}
            height={60}
            className="w-48 sm:w-64 h-auto"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#fcf8ef] mb-4">
          Something went wrong
        </h1>
        <p className="text-[#fcf8ef]/90 text-lg mb-8 max-w-md">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        <button
          onClick={() => reset()}
          className="px-8 py-4 bg-[#fcf8ef] text-[#1b3a34] font-bold rounded-full shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
