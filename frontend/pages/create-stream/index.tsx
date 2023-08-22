import { Metadata, NextPage } from 'next'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CalendarDateRangePicker } from '@/components/date-range-picker'
import { cn } from '@/lib/utils'
import { CreateStreamForm } from './form'
import { useSubscription } from '@/hooks'
import * as streamdappContract from '@tide/stream-contract'
import { useMemo } from 'react'
import * as SorobanClient from 'soroban-client'
let xdr = SorobanClient.xdr

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Example dashboard app built using the components.',
}

const Dashboard: NextPage = () => {
  useSubscription(
    streamdappContract,
    'create_stream',
    useMemo(
      () => event => {
        let response = xdr.ScVal.fromXDR(event.value.xdr, 'base64')
        console.log('event response', response)
      },
      []
    )
  )

  return (
    <div className="mx-auto max-w-7xl hidden flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Payment Stream</h2>
        </div>

        <div className="grid gap-4 grid-cols-2">
          <Card>
            <CreateStreamForm />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
