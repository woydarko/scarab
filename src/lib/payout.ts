import { PinionClient } from 'pinion-os'
import type { SendResult } from 'pinion-os'

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY!,
})

export async function payBounty(walletAddress: string, amount: number) {
  try {
    const sendResult = await pinion.skills.send(walletAddress, String(amount), 'USDC')
    const sendData = sendResult.data as SendResult

    if (!sendData?.tx) {
      throw new Error('No tx returned from send skill')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const broadcastResult = await pinion.skills.broadcast(sendData.tx) as any

    console.log('Broadcast result:', broadcastResult?.data)

    return {
      success: true,
      txHash: broadcastResult?.data?.txHash || 'unknown',
    }
  } catch (error) {
    console.error('Payout failed:', error)
    return {
      success: false,
      txHash: null,
    }
  }
}
