import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/services/paymentService'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams
    const provider = searchParams.get('provider') as 'wave' | 'orange_money' || 'wave'

    const paymentUrl = await PaymentService.generatePaymentLink(params.id, provider)
    
    return NextResponse.json({ url: paymentUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 400 }
    )
  }
}
