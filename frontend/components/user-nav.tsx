import React from 'react'
import { useAccount, useIsMounted } from '@/hooks'
import { Button } from '@/components/ui/button'
import { setAllowed } from '@stellar/freighter-api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// TODO: Eliminate flash of unconnected content on loading
export function UserNav() {
  const mounted = useIsMounted()
  const account = useAccount()

  return (
    <>
      {mounted && account ? (
        <Button variant="outline">
            {account.displayName}
        </Button>
      ) : (
        <Button onClick={setAllowed}>Connect Wallet</Button>
      )}
    </>
  )
}
