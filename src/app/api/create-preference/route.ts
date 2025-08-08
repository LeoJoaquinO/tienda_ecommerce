
import { NextRequest, NextResponse } from 'next/server';

// Use dynamic import to avoid server-side issues
let MercadoPagoConfig: any;
let Preference: any;

async function initializeMercadoPago() {
  if (!MercadoPagoConfig || !Preference) {
    const mercadopago = await import('mercadopago');
    MercadoPagoConfig = mercadopago.MercadoPagoConfig;
    Preference = mercadopago.Preference;
  }
  
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: {
      timeout: 10000
    }
  });
  
  return new Preference(client);
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Permissions-Policy': 'browsing-topics=(), private-state-token-redemption=(), private-state-token-issuance=(), private-aggregation=(), attribution-reporting=()'
  });

  try {
    // Validate environment variables first
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN is not configured');
      return NextResponse.json(
        { 
          error: 'Payment system configuration error',
          details: 'Missing access token'
        },
        { status: 500, headers }
      );
    }

    const body = await request.json();
    console.log('Creating payment preference for items:', body.cartItems?.length || 0);

    // Validate request data
    if (!body.cartItems || !Array.isArray(body.cartItems) || body.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400, headers }
      );
    }

    if (!body.shippingInfo?.email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400, headers }
      );
    }

    // Initialize MercadoPago dynamically
    const preference = await initializeMercadoPago();

    // Create preference body
    const preferenceBody = {
      items: body.cartItems.map((item: any, index: number) => ({
        id: `item_${index}`,
        title: item.title || item.name || `Product ${index + 1}`,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit_price: Math.max(0.01, Number(item.unit_price) || Number(item.price) || 1),
        currency_id: 'ARS'
      })),
      payer: {
        email: body.shippingInfo.email,
        name: body.shippingInfo.name || 'Cliente',
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/checkout/pending`
      },
      auto_return: 'approved' as const,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
      external_reference: `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      statement_descriptor: 'TIENDA_ONLINE',
      metadata: {
        total_amount: Number(body.totalPrice) || 0,
        discount: Number(body.discount) || 0,
        items_count: body.cartItems.length
      }
    };

    console.log('Creating preference with total:', preferenceBody.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0));

    // Create the preference
    const response = await preference.create({ body: preferenceBody });
    
    if (!response.id) {
      throw new Error('Failed to create payment preference - no ID returned');
    }

    console.log('Preference created successfully:', response.id);

    return NextResponse.json(
      { 
        preferenceId: response.id,
        initPoint: response.init_point,
        externalReference: preferenceBody.external_reference,
        status: 'created'
      },
      { status: 200, headers }
    );

  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    
    // Enhanced error handling
    let errorMessage = 'Error creating payment preference';
    let statusCode = 500;
    
    if (error?.cause) {
      console.error('MercadoPago API Error:', error.cause);
      errorMessage = error.cause.message || errorMessage;
      statusCode = error.cause.status || 500;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Handle specific MercadoPago errors
    if (errorMessage.includes('invalid_client')) {
      errorMessage = 'Invalid MercadoPago credentials';
    } else if (errorMessage.includes('unauthorized')) {
      errorMessage = 'Unauthorized - check your access token';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode, headers }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
