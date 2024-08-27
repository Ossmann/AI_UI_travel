'use client'

import { useId, useState } from 'react'
import { useActions, useAIState, useUIState } from 'ai/rsc'
import { formatNumber } from '@/lib/utils'
import { TicketIcon } from '@heroicons/react/24/solid'

import type { AI } from '@/lib/chat/actions'

interface Purchase {
    airline: string
  ticketPrice: number
  flightNumber: string
  departureAirport: string
  destinationAirport: string

  status: 'requires_action' | 'completed' | 'expired'
}

export function Purchase({
  props: { airline, ticketPrice, flightNumber, departureAirport, destinationAirport, status = 'expired' }
}: {
  props: Purchase
}) {
  const [purchasingUI, setPurchasingUI] = useState<null | React.ReactNode>(null)
  const [aiState, setAIState] = useAIState<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()
  const { confirmPurchase } = useActions()


  return (
    <div className='w-3/4'>
          <div className="grid grid-cols-5 items-center gap-4 p-4 border-2 border-gray-400 shadow-lg bg-gray-400/20 rounded-lg border-dashed">
            <div className=" w-3/4 rounded-full bg-white p-2">
              <img
                src="/quantas_logo.png"
                width={32}
                height={32}
                alt="Airline Logo"
                className="object-contain"
                style={{ aspectRatio: "32/32", objectFit: "cover" }}
              />
            </div>
            <div className="font-bold text-lg text-gray-800">{airline}</div>
            <div className="text-gray-500">{flightNumber}</div>
            <div></div>
            <div className="w-14 row-span-2">
              <TicketIcon />
            </div>
            <div></div>
            <div className="col-span-2 -mt-8 text-gray-800">
              {departureAirport} - {destinationAirport}
            </div>
            <div className="text-gray-800 overflow-hidden col-start-2">${ticketPrice.toFixed(2)}</div>
            <div></div>
            </div>
      {purchasingUI ? (
        <div className="mt-4 text-gray-600">{purchasingUI}</div>
      ) : status === 'requires_action' ? (
        <>
        <div className=' w-full flex justify-center'>
          <button
            className="w-1/3 px-4 py-2 mt-6 font-bold bg-green-400 rounded-lg text-zinc-900 hover:bg-green-500 w-1/3"
            onClick={async () => {
              const response = await confirmPurchase(airline, ticketPrice, flightNumber, departureAirport, destinationAirport)
              setPurchasingUI(response.purchasingUI)

              // Insert a new system message to the UI.
              setMessages((currentMessages: any) => [
                ...currentMessages,
                response.newMessage
              ])
            }}
          >
            Purchase
          </button>
        </div>
        </>
      ) : status === 'completed' ? (
        <p className="mb-2 text-gray-700">
          You have successfully purchased your ticket for flight {flightNumber} Total cost:{ticketPrice}
        </p>
      ) : status === 'expired' ? (
        <p className="mb-2">Your checkout session has expired!</p>
      ) : null}
    </div>
  )
}
