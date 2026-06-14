import React from "react";
import { FaPaw } from "react-icons/fa";

export default function Loading() {
  return (
    <div className="p-4 max-w-7xl mx-auto h-[80vh] w-full flex flex-col items-center justify-center">
      <div className="flex items-center gap-5 text-3xl md:text-4xl font-bold justify-center mb-10">
        <h1 className="text-[#1b3a34] animate-pulse"><FaPaw /></h1>
        <h1 className="text-4xl font-bold text-gray-300 animate-pulse">
          LOADING<span className="text-[#1b3a34]">...</span>
        </h1>
      </div>
      <div className="w-full max-w-4xl space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
