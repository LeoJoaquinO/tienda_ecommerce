import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem, Coupon } from '@/lib/types';
import type { PreferenceItem } from 'mercadopago/dist/clients/preference/commonTypes';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

type CheckoutItem = PreferenceItem & {
    // We don't need any extra fields for now, but this is here for future extension.
};

export async function POST(req: NextRequest) {
  try {
    const checkoutItems: CheckoutItem[] = await req.json();

    if (!checkoutItems || checkoutItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    // The items are already prepared by the client, including any discounts.
    const preferenceItems: PreferenceItem[] = checkoutItems.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: item.currency_id,
      picture_url: item.picture_url,
      description: item.description,
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
