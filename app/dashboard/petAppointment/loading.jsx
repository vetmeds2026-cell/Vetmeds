import React from "react";
import { FaStethoscope, FaPaw } from "react-icons/fa";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcf8ef] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-4 text-gray-300 animate-pulse">
            <FaStethoscope className="text-4xl" />
            <div className="h-12 w-64 bg-gray-200 rounded" />
            <FaPaw className="text-4xl" />
          </div>
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Date/Time Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="h-16 w-full bg-gray-200 rounded-xl" />
            <div className="h-16 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>

        {/* Doctors/Table Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
