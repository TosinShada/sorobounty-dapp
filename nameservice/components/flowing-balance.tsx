import { FC, Fragment, ReactElement, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { formatAmount } from '@/lib/utils'

const ANIMATION_MINIMUM_STEP_TIME = 75

export interface FlowingBalanceProps {
  remainingBalance: bigint
  decimal: number
  flowRate: bigint
  startTime: bigint
}

const FlowingBalance: FC<FlowingBalanceProps> = ({
  remainingBalance,
  decimal,
  flowRate,
  startTime,
}): ReactElement => {
  const [amount, setAmount] = useState<bigint>(remainingBalance)

  useEffect(() => setAmount(remainingBalance), [remainingBalance])

  //If balance in settings is 0, then show smart flowing balance
  useEffect(() => {
    let stopAnimation = false
    let lastAnimationTimestamp: DOMHighResTimeStamp = 0

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      if (stopAnimation) {
        return
      }

      if (
        currentAnimationTimestamp - lastAnimationTimestamp >
        ANIMATION_MINIMUM_STEP_TIME
      ) {
        const currentTimestamp = BigInt(moment().unix())

        if (currentTimestamp < startTime) {
          return
        }

        const currentAmout =
          remainingBalance - (currentTimestamp - startTime) * flowRate

        if (currentAmout <= 0) {
          setAmount(0n)
        } else {
          setAmount(currentAmout)
        }

        lastAnimationTimestamp = currentAnimationTimestamp
      }

      window.requestAnimationFrame(animationStep)
    }

    window.requestAnimationFrame(animationStep)

    return () => {
      stopAnimation = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingBalance, startTime, flowRate])

  return <Fragment>{formatAmount(amount, decimal)}</Fragment>
}

export default FlowingBalance
