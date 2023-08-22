import { useEffect, useState } from 'react'
import * as tokenContract from '@tide/mock-token'
import { getStreamsByUser, Stream } from '@tide/stream-contract'
import { useAccount } from './useAccount'

const defaultState = [] as Stream[];
export function useGetStream() {
  const [updatedAt, setUpdatedAt] = useState(Date.now())
  const [token, setToken] = useState<{
    balance: BigInt
    decimals: number
    name: string
    symbol: string
  }>()
  const [userStreams, setUserStreams] = useState<Stream[]>(defaultState)
  const account = useAccount()

  useEffect(() => {
    Promise.all([
      tokenContract.balance({ id: tokenContract.CONTRACT_ID }),
      tokenContract.decimals(),
      tokenContract.name(),
      tokenContract.symbol(),

      getStreamsByUser({ caller: account?.address || 'GDZDBDNC2HX5FTQQJE64LJBEI4PO4BXQX25ASGUOCK4H3VBW6GCR45RR' }),
    ]).then(fetched => {
      setToken({
        balance: fetched[0],
        decimals: fetched[1],
        name: fetched[2].toString(),
        symbol: fetched[3].toString(),
      })

      setUserStreams(fetched[4])
    }).catch(err => {
      console.error(err)
    })
  }, [updatedAt, account])

  return {
    token,
    userStreams,
    updatedAt,
    refresh: () => setUpdatedAt(Date.now()),
  }
}
