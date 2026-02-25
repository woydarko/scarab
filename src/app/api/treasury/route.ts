import { NextResponse } from 'next/server'
import { pinion, getTreasuryAddress } from '@/lib/pinion'

export async function GET() {
  try {
    const address = getTreasuryAddress()
    const result = await pinion.skills.balance(address)
    return NextResponse.json({
      address,
      eth: result.data?.balances?.ETH || '0',
      usdc: result.data?.balances?.USDC || '0',
    })
  } catch (error) {
    console.error('Treasury balance error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
