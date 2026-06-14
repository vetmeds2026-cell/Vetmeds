"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const NetworkStatusHandler = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    const handleError = (event) => {
      
      if (
        event?.message?.includes("Clerk") ||
        event?.reason?.message?.includes("Clerk") ||
        event?.filename?.includes("clerk")
      ) {
        setIsOffline(true);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 hidden md:block">
            <img
              src="/waiting.gif"
              alt="Background"
              className="h-full w-full object-cover brightness-[0.4]"
            />
          </div>
          <div className="absolute inset-0 block md:hidden">
            <img
              src="/waitingmob.gif"
              alt="Mobile Background"
              className="h-full w-full object-cover brightness-[0.4]"
            />
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <div className="mb-8 drop-shadow-2xl">
              <Image
                src="/logo1.png"
                alt="VetMeds Logo"
                width={200}
                height={60}
                className="w-48 sm:w-64 h-auto"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#fcf8ef] mb-4 tracking-tight">
              Oops! Connection Lost
            </h1>
            <p className="text-[#fcf8ef]/90 text-lg sm:text-xl max-w-md mb-8 leading-relaxed">
              Check your internet connection. We're unable to reach our servers right now. Please refresh once you're back online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="px-8 py-4 bg-[#fcf8ef] text-[#1b3a34] font-bold rounded-full shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                Refresh Page
              </button>
              <button
                disabled
                className="px-8 py-4 border-2 border-[#fcf8ef]/30 text-[#fcf8ef] font-bold rounded-full backdrop-blur-sm opacity-80"
              >
                Waiting for Signal...
              </button>
            </div>
            <p className="mt-8 text-[#fcf8ef]/60 text-sm font-medium uppercase tracking-widest">
              Connect to Internet to Continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusHandler;
