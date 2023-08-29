import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useAccount } from '@/hooks'
import { mint } from '@tide/mock-token'

export function MintToken() {
  const [isLoading, setIsLoading] = useState(false)
  const account = useAccount()
  const { toast } = useToast()

  async function onSubmit() {
    setIsLoading(true)

    if (!account?.address) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please connect your wallet.',
      })
      return
    }

    const amount = BigInt(10000000000000)

    const mintTokenRequest = {
      to: account.address,
      amount: amount,
    }

    console.log('mintTokenRequest', mintTokenRequest)

    await mint(mintTokenRequest, {
      fee: 100,
      secondsToWait: 20,
      responseType: 'full',
    })
      .then((result: any) => {
        console.log('result', result)
        toast({
          variant: 'default',
          title: 'Success!',
          description: 'Tokens successfully minted.',
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
      })
  }

  return (
    <>
      <CardHeader className="flex items-center justify-between space-y-2">
        <CardTitle>Mint Mock Token</CardTitle>
        <CardDescription className='text-center'>
          Click the below button to mint 1,000,000 Mock Tokens to your wallet. This should cover you for approximately one week of streaming 1 token per second.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Button 
          type="submit" 
          size="lg"
          disabled={isLoading}
          onClick={onSubmit}
        >
          Mint Token
        </Button>
      </CardContent>
    </>
  )
}
