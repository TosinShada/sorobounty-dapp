import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { DateRange } from 'react-day-picker'
import { useState } from 'react'
import { useAccount } from '@/hooks'
import moment from 'moment'
import { createStream } from '@tide/stream-contract'

const tokens = [
  {
    label: 'MCKT - Mock Token',
    value: 'CB35KISMVEVOD6MAR4ZRDE26EOFLFXDFWMQHU26QNTFR4K256EGBG7DS',
  },
] as const

const accountFormSchema = z.object({
  tokenAddress: z.string({
    required_error: 'A date of birth is required.',
  }),
  flowRate: z.coerce
    .number({
      required_error: 'Please enter a flow rate.',
    })
    .lte(2, {
      message: 'Flow rate must be less than 2.',
    }),
  recipient: z.string({
    required_error: 'Please enter a wallet address.',
  }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  tokenAddress: '',
  flowRate: 0,
  recipient: '',
}

const defaultDate = {
  from: addDays(new Date(), 1),
  to: addDays(new Date(), 3),
}

export function CreateStreamForm() {
  const [date, setDate] = useState<DateRange | undefined>(defaultDate)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })
  const account = useAccount()
  const { toast } = useToast()

  async function onSubmit(data: AccountFormValues) {
    setIsLoading(true)

    if (!account?.address) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please connect your wallet.',
      })
      return
    }

    if (account?.address === data.recipient) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'You cannot send to yourself.',
      })
      return
    }

    // Get the flow rate with decimals
    const flowRate = BigInt(Number(data.flowRate) * 10 ** 7)
    const from = moment(date?.from)
    const to = moment(date?.to)
    const timeRange = moment(to).diff(from, 'seconds')
    const amount = flowRate * BigInt(timeRange)

    const createStreamRequest = {
      sender: account.address,
      recipient: data.recipient,
      amount: amount,
      token_address: data.tokenAddress,
      start_time: BigInt(from.unix()),
      stop_time: BigInt(to.unix()),
    }

    console.log('createStreamRequest', createStreamRequest)

    await createStream(createStreamRequest, {
      fee: 1000,
      secondsToWait: 20,
      responseType: 'full',
    })
      .then((result: any) => {
        console.log('result', result)
        toast({
          variant: 'default',
          title: 'Success!',
          description: 'Stream created successfully.',
        })
      })
      .catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: `${error}`,
        })
      })
      .finally(() => {
        setIsLoading(false)
        form.reset(defaultValues)
        setDate(defaultDate)
      })
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Create a new Stream</CardTitle>
        <CardDescription>
          Fill the form below to create a new stream.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid col-span-2 gap-2">
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver&apos;s Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Wallet Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="flowRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow Rate/Second</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Flow Rate"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="date"
                          variant={'outline'}
                          className={cn(
                            'w-[300px] justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, 'LLL dd, y')} -{' '}
                                {format(date.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(date.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        disabled={date => date < new Date()}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              </div>
              <div className="grid gap-2 ml-8">
                <FormField
                  control={form.control}
                  name="tokenAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Token</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-[200px] justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? tokens.find(
                                    token => token.value === field.value
                                  )?.label
                                : 'Select token'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search token..." />
                            <CommandEmpty>No token found.</CommandEmpty>
                            <CommandGroup>
                              {tokens.map(token => (
                                <CommandItem
                                  value={token.label}
                                  key={token.value}
                                  onSelect={() => {
                                    form.setValue('tokenAddress', token.value)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      token.value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {token.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              Create Stream
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
