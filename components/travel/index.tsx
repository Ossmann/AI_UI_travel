'use client'

import dynamic from 'next/dynamic'


const Purchase = dynamic(
    () => import('./flight-purchase').then(mod => mod.Purchase),
    {
      ssr: false,
      loading: () => (
        <div className="h-[375px] rounded-xl border bg-zinc-950 p-4 text-green-400 sm:h-[314px]" />
      )
    }
  )