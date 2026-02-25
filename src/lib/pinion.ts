import { PinionClient } from 'pinion-os'

const globalForPinion = globalThis as unknown as {
  pinion: PinionClient | undefined
}

export const pinion =
  globalForPinion.pinion ??
  new PinionClient({
    privateKey: process.env.PINION_PRIVATE_KEY!,
  })

if (process.env.NODE_ENV !== 'production') globalForPinion.pinion = pinion

export function getTreasuryAddress(): string {
  return pinion.address
}
