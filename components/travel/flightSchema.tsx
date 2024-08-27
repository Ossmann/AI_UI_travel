'use client'

import { useState } from 'react';
import { FaPlane } from 'react-icons/fa';

interface FlightInfo {
    date: string;
    flightNumber: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    terminalFrom: string;
    terminalTo: string;
    gate: string;
    progress: number; // Value from 0 to 1 indicating flight progress
    duration: string; // Duration of the flight
    status: 'On time' | 'Delayed' | 'Cancelled'; // Status of the flight
  }


export function FlightSchema({ props: flightSchemas }: { props: FlightInfo[] }) {

  const [selectedFlightIndex, setSelectedFlightIndex] = useState(1);

  const selectedFlight = flightSchemas[selectedFlightIndex];
  const progressPercentage = selectedFlight?.progress ? selectedFlight.progress * 100 : 0;

  return (
    <div className="p-4 max-w-lg mx-auto text-sm">
        <div className="flex space-x-4 mb-4">
            {flightSchemas.map((flight, index) => (
            <button
                key={index}
                className={`px-4 py-2 text ${
                selectedFlightIndex === index ? 'border-b-2 border-gray-800' : ''
                } hover:border-b-2 hover:border-gray`}
                onClick={() => setSelectedFlightIndex(index)}
            >
                {flight.date}
            </button>
            ))}
        </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="relative h-1.5 bg-gray-300 rounded-full mb-4">
          <div
            className="absolute h-full bg-green-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
          <FaPlane
            className="absolute text-green-700"
            style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <h2 className="text-xl font-bold mb-4">{selectedFlight.flightNumber}</h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg font-semibold">{selectedFlight.from}</p>
            <p className="text-gray-500">{selectedFlight.departureTime}</p>
            <p className="text-gray-500">Terminal {selectedFlight.terminalFrom}, Gate {selectedFlight.gate}</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{selectedFlight.to}</p>
            <p className="text-gray-500">{selectedFlight.arrivalTime}</p>
            <p className="text-gray-500">Terminal {selectedFlight.terminalTo}</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mb-4">
          <p>{selectedFlight.duration}</p>
        </div>
        <div className="text-center">
          <span
            className={`px-3 py-1 rounded-full text-white ${
              selectedFlight.status === 'On time' ? 'bg-green-500' :
              selectedFlight.status === 'Delayed' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          >
            {selectedFlight.status}
          </span>
        </div>
      </div>
    </div>
  );
}