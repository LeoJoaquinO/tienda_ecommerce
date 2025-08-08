import { NextRequest, NextResponse } from 'next/server';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Payment system not configured' }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    const { paymentId, status, merchantOrderId, preferenceId } = body;

    console.log('Fetching payment status for:', { paymentId, status, merchantOrderId });

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' }, 
        { status: 400 }
      );
    }

    // Fetch payment details from MercadoPago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching payment ${paymentId}:`, response.status);
      return NextResponse.json(
        { error: 'Error fetching payment details' }, 
        { status: response.status }
      );
    }

    const paymentData = await response.json();
    
    console.log('Payment details retrieved:', {
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      transaction_amount: paymentData.transaction_amount
    });

    // Return relevant payment information
    return NextResponse.json({
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      transaction_amount: paymentData.transaction_amount,
      payment_method_id: paymentData.payment_method_id,
      payment_type_id: paymentData.payment_type_id,
      currency_id: paymentData.currency_id,
      date_created: paymentData.date_created,
      date_approved: paymentData.date_approved,
      external_reference: paymentData.external_reference,
      description: paymentData.description,
      payer: {
        email: paymentData.payer?.email,
        identification: paymentData.payer?.identification
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching payment status:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
