import { available, register } from '@tide/sns-registrar'
import { name, setName } from '@tide/sns-resolver'
import { useAccount } from './useAccount'
import { useState } from 'react'
import { createHash } from 'crypto'
import { useToast } from '@/components/ui/use-toast'

export function useDomain() {
  const [domainAvailable, setDomainAvailable] = useState<boolean>(false)
  const [domainAddress, setDomainAddress] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)
  const account = useAccount()
  const { toast } = useToast()

  async function registerDomain(username: string, address: string) {
    try {
      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      console.log('Registering domain: ', domain.toString('hex'))

      if (account == null) {
        return
      }

      await register({
        caller: account.address,
        owner: address,
        name: domain,
        duration: 31536000n,
      }).catch((error) => {
        console.error('register error', error)
      })

      await setName({
        caller: account.address,
        node: domain,
        name: address,
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function checkDomainStatus(username: string): Promise<void> {
    try {
      setChecked(false)
      if (username == null || username.length === 0) {
        return
      }
      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      const domainStatus = await available({
        name: domain,
      })
      console.log('Domain status: ', domainStatus)

      setDomainAvailable(domainStatus)
      setChecked(true)
    } catch (error) {
      console.error(error)
      setChecked(true)
    }
  }

  async function resolveDomain(request: string) {
    try {
      if (request == null || request.length === 0) {
        return
      }

      const username = request.split('.')[0]

      console.log('Resolving domain: ', username)

      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      const domainAddress = await name({
        node: domain,
      })
      console.log('Domain address: ', domainAddress)

      setDomainAddress(domainAddress)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not resolve domain.',
      })
    }
  }

  return {
    registerDomain,
    checkDomainStatus,
    resolveDomain,
    domainAvailable,
    checked,
    domainAddress,
  }
}
