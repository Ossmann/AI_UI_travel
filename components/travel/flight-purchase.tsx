'use client'

import { useId, useState } from 'react'
import { useActions, useAIState, useUIState } from 'ai/rsc'
import { formatNumber } from '@/lib/utils'

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
    <div className="">
        <div className="" style={{ width: '60px', height: '60px' }}>
            <img
                src="/quantas_logo.png"
                alt="Airline Logo"
                className=""
            />
        </div>
        <div className="">
            <div className="">
                <div className="">{airline}</div>
                <div className="">{flightNumber}</div>
            </div>
            <div className="">
                <div>{departureAirport}</div>
                <div>{destinationAirport}</div>
            </div>
        </div>
        <div className="">
            ${ticketPrice.toFixed(2)}
        </div>

      {purchasingUI ? (
        <div className="mt-4 text-zinc-200">{purchasingUI}</div>
      ) : status === 'requires_action' ? (
        <>
          <button
            className="w-full px-4 py-2 mt-6 font-bold bg-green-400 rounded-lg text-zinc-900 hover:bg-green-500"
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
        </>
      ) : status === 'completed' ? (
        <p className="mb-2 text-white">
          You have successfully purchased your ticket for flight {flightNumber} Total cost:{ticketPrice}
        </p>
      ) : status === 'expired' ? (
        <p className="mb-2 text-white">Your checkout session has expired!</p>
      ) : null}
    </div>
  )
}
