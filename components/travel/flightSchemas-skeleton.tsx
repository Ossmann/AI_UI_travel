'use client';

import { useState } from 'react';
import { FaPlane } from 'react-icons/fa';

export default function FlightsSchemaSkeleton() {
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(0);

  return (
    <div className="p-4 max-w-lg mx-auto text-sm">
      <div className="flex space-x-4 mb-4">
        {Array(3).fill(null).map((_, index) => (
          <button
            key={index}
            className={`px-4 py-2 text ${
              selectedFlightIndex === index ? 'border-b-2 border-gray-800' : ''
            } hover:border-b-2 hover:border-gray`}
            onClick={() => setSelectedFlightIndex(index)}
          >
            Loading...
          </button>
        ))}
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="relative h-1.5 bg-gray-300 rounded-full mb-4">
          <div
            className="absolute h-full bg-green-500 rounded-full"
            style={{ width: '25%' }} // Placeholder width
          />
          <FaPlane
            className="absolute text-green-700"
            style={{ left: '25%', transform: 'translateX(-50%)' }} // Placeholder position
          />
        </div>
        <h2 className="text-xl font-bold mb-4">Loading...</h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg font-semibold">Loading...</p>
            <p className="text-gray-500">Loading...</p>
            <p className="text-gray-500">Terminal Loading..., Gate Loading...</p>
          </div>
          <div>
            <p className="text-lg font-semibold">Loading...</p>
            <p className="text-gray-500">Loading...</p>
            <p className="text-gray-500">Terminal Loading...</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mb-4">
          <p>Loading...</p>
        </div>
        <div className="text-center">
          <span className="px-3 py-1 rounded-full text-white bg-gray-400">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}