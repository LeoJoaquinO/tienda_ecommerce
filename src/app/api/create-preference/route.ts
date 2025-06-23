import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem } from '@/lib/types';
import type { PreferenceItem } from 'mercadopago/dist/clients/preference/commonTypes';

export async function POST(req: NextRequest) {
  const cartItems = (await req.json()) as CartItem[];

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Mercado Pago access token is not configured.' }, { status: 500 });
  }

  const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
  });
  const preference = new Preference(client);

  const items: PreferenceItem[] = cartItems.map(item => ({
    id: item.product.id,
    title: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.salePrice || item.product.price,
    currency_id: 'ARS',
  }));

  try {
    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${req.nextUrl.origin}`,
          failure: `${req.nextUrl.origin}/cart`,
          pending: `${req.nextUrl.origin}/cart`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json({ error: 'Failed to create payment preference.' }, { status: 500 });
  }
}
