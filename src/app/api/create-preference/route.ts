import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem } from '@/lib/types';
import type { PreferenceItem } from 'mercadopago/dist/clients/preference/commonTypes';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const cartItems: CartItem[] = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const preferenceItems: PreferenceItem[] = cartItems.map(item => ({
      id: String(item.product.id),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.salePrice ?? item.product.price,
      currency_id: 'ARS',
      picture_url: item.product.image,
      description: item.product.description,
    }));

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: preferenceItems,
        back_urls: {
          success: `${req.nextUrl.origin}/`,
          failure: `${req.nextUrl.origin}/cart`,
          pending: `${req.nextUrl.origin}/cart`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });

  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json({ error: 'No se pudo crear la preferencia de pago.' }, { status: 500 });
  }
}
