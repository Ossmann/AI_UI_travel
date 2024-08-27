'use client'

import { useActions, useUIState } from 'ai/rsc'
import { PaperPlaneIcon } from '@radix-ui/react-icons';

import type { AI } from '@/lib/chat/actions'

interface Flight {
    airportCodeDeparture: string;
    airportCodeArrival: string;
    flightNumber: string;
    airline: string;
    ticketPrice: number;
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

export function Flights({ props: flights }: { props: Flight[] }) {
    const [, setMessages] = useUIState<typeof AI>();
    const { submitUserMessage } = useActions();

    return (
        <div className="grid gap-5">
            {flights.map((flight) => (
                <button
                    key={flight.flightNumber} className="w-full max-w-md"
                        
                    onClick={async () => {
                    const response = await submitUserMessage(`View ${flight.flightNumber}`)
                    setMessages(currentMessages => [...currentMessages, response])
                    }}
                >
                
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border-2 border-indigo-800 shadow-lg bg-indigo-800 rounded-lg hover:border-indigo-400 hover:transform hover:translate-x-2 hover:translate-y-2 hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer">                        
                        <div className="flex items-center justify-center rounded-full bg-white p-2">
                            <img
                                src="/quantas_logo.png"
                                width={32}
                                height={32}
                                alt="Airline Logo"
                                className="object-contain"
                                style={{ aspectRatio: "32/32", objectFit: "cover" }}
                            />
                        </div>
                        <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                                <div className="font-medium text-zinc-300">{flight.airline}</div>
                                <div className="text-sm text-zinc-400">{flight.flightNumber}</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <div>{flight.airportCodeDeparture}</div>
                                <ArrowRightIcon className="h-4 w-4" />
                                <div>{flight.airportCodeArrival}</div>
                            </div>
                        </div>
                        <div className="font-medium text-zinc-300">
                            ${flight.ticketPrice.toFixed(2)}
                        </div>
                    </div>
                    
                 </button>
            ))}
            <div className='flex space-x-2 font-bold'>
                <div>Choose your optimal connection
                </div>
                <PaperPlaneIcon className='mt-1'/>
            </div>
            <div className="p-4 text-center text-sm text-zinc-500">
                Note: Prices and connections displayed here are simulated.
            </div>
        </div>
    );
}