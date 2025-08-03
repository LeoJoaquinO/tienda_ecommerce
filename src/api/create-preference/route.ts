import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem, Coupon } from '@/lib/types';
import type { PreferenceItem } from 'mercadopago/dist/clients/preference/commonTypes';
import { createOrder } from '@/lib/orders';


const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

type CheckoutPayload = {
    cartItems: CartItem[];
    appliedCoupon: Coupon | null;
    totalPrice: number;
    discount: number;
    shippingInfo: {
        name: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
    }
}

export async function POST(req: NextRequest) {
  try {
    const payload: CheckoutPayload = await req.json();
    const { cartItems, appliedCoupon, totalPrice, discount, shippingInfo } = payload;


    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    // Step 1: Create the order in our own database BEFORE creating the payment preference.
    // This gives us a record of the attempted purchase immediately.
    const orderId = await createOrder({
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        total: totalPrice,
        status: 'pending', // Status is pending until payment is confirmed (via webhook later)
        items: cartItems,
        couponCode: appliedCoupon?.code,
        discountAmount: discount
    });


    // Step 2: Prepare the items for Mercado Pago, including the discount as a line item.
    const preferenceItems: PreferenceItem[] = cartItems.map(item => ({
      id: String(item.product.id),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.salePrice ?? item.product.price,
      currency_id: 'ARS',
      picture_url: item.product.image,
      description: item.product.description,
    }));
    
    if (appliedCoupon && discount > 0) {
        preferenceItems.push({
            id: appliedCoupon.code,
            title: `Descuento: ${appliedCoupon.code}`,
            quantity: 1,
            unit_price: -discount, // The discount is a negative value
            currency_id: 'ARS',
            description: 'Cupón de descuento aplicado',
        });
    }

    // Step 3: Create the Mercado Pago preference
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: preferenceItems,
        // We can pass our internal order ID to track it back upon return
        external_reference: String(orderId), 
        // This is where Mercado Pago will send payment status updates.
        // It must be a publicly accessible HTTPS URL. You'll set this up in your MP Dashboard.
        notification_url: `${req.nextUrl.origin}/api/mercadopago-webhook`,
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
