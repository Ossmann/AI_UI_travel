import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import {
  SparklesIcon,
} from '@heroicons/react/24/solid';
import LottiePlayer from './LottiePlayer';

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8 items-center">
        <h1 className="text-lg font-semibold text-center">
          Welcome to the UI AI Tourism Planner!
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is an UI AI chatbot app prototype built to help you as an intelligent tourism planner.
        </p>
          
          <div className='w-[60%] flex justify-center'>
            <LottiePlayer />
          </div>
          

        
        <p className="leading-normal text-muted-foreground">
          It uses the <ExternalLink href="https://platform.openai.com/docs/overview">
            OpenAI API
          </ExternalLink> and React Server Components
          to combine text with generative UI as output of the LLM. The UI state
          is synced through the SDK so the model is aware of your interactions
          as they happen.
        </p>
      </div>
    </div>
  )
}
