'use client'

import { useState } from 'react';

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
}

const flightsData: FlightInfo[] = [
  {
    date: 'Mo., 26. Aug.',
    flightNumber: 'QF 5401',
    from: 'OOL',
    to: 'SYD',
    departureTime: '6:00 AM',
    arrivalTime: '7:25 AM',
    terminalFrom: '1',
    terminalTo: '2',
    gate: '8',
  },
  {
    date: 'Mi., 28. Aug.',
    flightNumber: 'QF 5401',
    from: 'OOL',
    to: 'SYD',
    departureTime: '6:00 AM',
    arrivalTime: '7:25 AM',
    terminalFrom: '1',
    terminalTo: '2',
    gate: '8',
  },
  // Add more flights here
];

export default function FlightDetails() {
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(1);

  const selectedFlight = flightsData[selectedFlightIndex];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex space-x-2 mb-4">
        {flightsData.map((flight, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg ${
              selectedFlightIndex === index ? 'bg-black text-white' : 'bg-gray-200'
            }`}
            onClick={() => setSelectedFlightIndex(index)}
          >
            {flight.date}
          </button>
        ))}
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
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
        <div className="text-center text-gray-500">
          <p>1 Std., 25 Min.</p>
        </div>
      </div>
    </div>
  );
}