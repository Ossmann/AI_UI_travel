import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock
} from '@/components/stocks'

import { Purchase } from '@/components/travel/flight-purchase'

import { StockPurchase } from '@/components/stocks/stock-purchase'

import { z } from 'zod';
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import { FlightsSkeleton } from '@/components/travel/flights-skeleton'
import { Flights } from '@/components/travel/flights'
import FlightsSchemaSkeleton from '@/components/travel/flightSchemas-skeleton'
import { FlightSchema } from '@/components/travel/flightSchema'

import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

async function confirmPurchase(airline: string, ticketPrice: number, flightNumber: string, departureAirport: string, destinationAirport: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing ticket {airline} for ${flightNumber}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
        Purchasing ticket {airline} for ${flightNumber}...
        working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased your ticket with {airline}.
          <div className='flex'>
            <div>
              Total cost:
            </div>
            <div className='font-bold'>
              ${ticketPrice.toFixed(2)}
            </div>
          </div>
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
          You have successfully purchased your ticket with {airline}. Total cost:{' $'}{ticketPrice.toFixed(2)}
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased a ticket from ${departureAirport} to ${destinationAirport} for a price of ${ticketPrice} ]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    initial: <SpinnerMessage />,
    system: `\
    You are a travel planning and flight booking assistant.
    You and the user can discuss international flights and travel. The user can look for flights, get destination information, purchase a plane ticket in the UI or list flights for flight numbers.
    
    Messages inside [] means that it's a UI element or a user event. For example:
    - "[Date of flight = 01.12.2024 ]" means that an interface of the flight data of the users flight is shown.
    - "[User has changed the date to 12.02.2025]" means that the user has changed the date of his flight to 12.02.2025 in the UI.


    
    If the user requests to list available flights, call \`list_flights\`. 
    If the user selected a specific flight, show that flight information and call \`purchase_flight\`.
    If the user requests to see detailed flight information for a flight number call \`list_flight_schemas\`.
    If the user wants you to perform an impossible task that is not covered by the tools respond that you are a demo and cannot do that.
    
    Besides that, you can also chat with users and do some calculations if needed.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      listFlights: {
        description: 'List three imaginary flights from the city that that the user is interested to a destination airport city around the world.',
        parameters: z.object({
          flights: z.array(
            z.object({
              airportCodeDeparture: z.string().describe('The airport where the flight departs, for example OOL'),
              airportCodeArrival: z.string().describe('The airport where the flight departs, for example OOL'),
              price: z.number().describe('The price of the flight'),
              flightNumber: z.string().describe('The flight number of the flight.'),
              airline: z.string().describe('The airline that operates the flight.'),
              ticketPrice: z.number().describe('Price of the flight ticket.')
            })
          )
        }),
        generate: async function* ({ flights }) {
          yield (
            <BotCard>
              <FlightsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listFlights',
                    toolCallId,
                    args: { flights }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listFlights',
                    toolCallId,
                    result: flights
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Flights props={flights} />
            </BotCard>
          )
        }
      },
      showFlightPurchase: {
        description:
          'Show price and the UI to purchase the ticket for the previously selected flight. Also show the purchase button. Use this if the user wants to purchase a flight ticket.',
        parameters: z.object({
          airline: z
            .string()
            .describe(
              'The name of the airline that was selected prior.'
            ),
          ticketPrice: z.number().describe('The price of the flight ticket as selected prior.'),
          flightNumber: z.string().describe('The flight number for the selected ticket.'),
          departureAirport: z.string().describe('The airport where the selcted flights departs.'),
          destinationAirport: z.string().describe('The airport where the selected flight lands.'),
          
        }),
        generate: async function* ({ airline, ticketPrice, flightNumber, departureAirport, destinationAirport }) {
          const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showFlightPurchase',
                      toolCallId,
                      args: { airline, ticketPrice, flightNumber, departureAirport, destinationAirport }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showFlightPurchase',
                      toolCallId,
                      result: {
                        airline, ticketPrice, flightNumber, departureAirport, destinationAirport
                      }
                    }
                  ]
                }
              ]
            })

            return (
              <BotCard>
                <Purchase
                  props={{
                    airline,
                    ticketPrice,
                    flightNumber,
                    departureAirport,
                    destinationAirport,
                    status: 'requires_action'
                  }}
                />
              </BotCard>
            )
        }
      },
      listFlightSchemas: {
        description:
          'Make up details for 5 imaginary flightSchemas on 5 different dates for a flight number that the user provides you to get details. Make up these values for those variables defined in the flightSchemas object. Make one flight status Cancelled',
        parameters: z.object({
          flightSchema: z.array(
            z.object({
              date: z.string().describe('The made up date for the fictional flight number, for example Mo., 26. Aug.'),
              terminalFrom: z.string().describe('The airport terminal where the flight departs from, e.g., Terminal 1'),
              terminalTo: z.string().describe('The airport terminal where the flight arrives, e.g., Terminal 2'),
              flightNumber: z.string().describe('The flight number, e.g., QF 5401'),
              from: z.string().describe('The IATA code of the departure airport, e.g., OOL for Gold Coast Airport'),
              to: z.string().describe('The IATA code of the arrival airport, e.g., SYD for Sydney Airport'),
              departureTime: z.string().describe('The scheduled departure time of the flight, e.g., 6:00 AM'),
              arrivalTime: z.string().describe('The scheduled arrival time of the flight, e.g., 7:25 AM'),
              gate: z.string().describe('The gate number from which the flight departs, e.g., Gate 8'),
              progress: z.number().min(0).max(1).describe('The progress of the flight as a number between 0 and 1, where 0 means the flight has not started and 1 means the flight has completed'),
              duration: z.string().describe('The total duration of the flight, e.g., 1 Std., 25 Min.'),
              status: z.enum(['On time', 'Delayed', 'Cancelled']).describe('The current status of the flight, which can be "On time", "Delayed", or "Cancelled"'),
            })
          )
        }),
        generate: async function* ({ flightSchema }) {
          yield (
            <BotCard>
              <FlightsSchemaSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listFlightSchemas',
                    toolCallId,
                    args: { flightSchema }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listFlightSchemas',
                    toolCallId,
                    result: flightSchema
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <FlightSchema props={flightSchema} />
            </BotCard>
          )
        }
      },
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        generate: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listStocks',
                    toolCallId,
                    args: { stocks }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listStocks',
                    toolCallId,
                    result: stocks
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        generate: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showStockPrice',
                    toolCallId,
                    args: { symbol, price, delta }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showStockPrice',
                    toolCallId,
                    result: { symbol, price, delta }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .optional()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        generate: async function* ({ symbol, price, numberOfShares = 100 }) {
          const toolCallId = nanoid()

          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares,
                        status: 'expired'
                      }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          } else {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares
                      }
                    }
                  ]
                }
              ]
            })

            return (
              <BotCard>
                <StockPurchase
                  props={{
                    numberOfShares,
                    symbol,
                    price: +price,
                    status: 'requires_action'
                  }}
                />
              </BotCard>
            )
          }
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        generate: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getEvents',
                    toolCallId,
                    args: { events }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getEvents',
                    toolCallId,
                    result: events
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
