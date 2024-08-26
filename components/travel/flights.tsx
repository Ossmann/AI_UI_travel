'use client'

import { useActions, useUIState } from 'ai/rsc'

import type { AI } from '@/lib/chat/actions'

interface Flight {
    airportCodeDeparture: string
    airportCodeArrival: string
    flightNumber: string
     airline: string
     ticketPrice: number
}

export function Flights({ props: flights }: { props: Flight[] }) {
    const [, setMessages] = useUIState<typeof AI>()
    const { submitUserMessage } = useActions()
  
    return (
      <div>
        <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
          {flights.map(flight => (
            <button
              key={flight.flightNumber}
              className="flex cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-2 text-left hover:bg-zinc-700 sm:w-52"
              onClick={async () => {
                const response = await submitUserMessage(`View ${flight.flightNumber}`)
                setMessages(currentMessages => [...currentMessages, response])
              }}
            >
              <div
              className={`text-xl ${
                flight.ticketPrice > 0 ? 'text-green-600' : 'text-red-600'
              } flex w-11 flex-row justify-center rounded-md bg-white/10 p-2`}
            >
              {flight.ticketPrice > 0 ? '↑' : '↓'}
            </div>
              <div className="flex flex-col">
                <div className="bold uppercase text-zinc-300">{flight.ticketPrice}</div>
                <div className="text-base text-zinc-500">
                  ${flight.ticketPrice.toExponential(1)}
                </div>
              </div>
              <div className="ml-auto flex flex-col">
    
              <div> ${flight.flightNumber }</div>
        <div> ${flight.airline }</div>
        <div> ${flight.airportCodeDeparture }</div>
        <div> ${flight.airportCodeArrival }</div>


   
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 text-center text-sm text-zinc-500">
          Note: Prices and connections displayed here are simulated.
        </div>
      </div>
    )
  }