
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem, Coupon } from '@/lib/types';
import { createOrder } from '@/lib/data';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
const preference = new Preference(client);

interface PreferencePayload {
    cartItems: CartItem[];
    shippingInfo: {
        name: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
    };
    totalPrice: number;
    discount: number;
    appliedCoupon: Coupon | null;
}

export async function POST(req: NextRequest) {
    try {
        const { cartItems, shippingInfo, totalPrice, discount, appliedCoupon }: PreferencePayload = await req.json();

        if (!cartItems || cartItems.length === 0 || !shippingInfo || !totalPrice) {
            return NextResponse.json({ error: 'Datos de preferencia inválidos.' }, { status: 400 });
        }

        const { orderId, error: createOrderError } = await createOrder({
            customerName: shippingInfo.name,
            customerEmail: shippingInfo.email,
            total: totalPrice,
            status: 'pending',
            items: cartItems,
            couponCode: appliedCoupon?.code,
            discountAmount: discount,
            shippingAddress: shippingInfo.address,
            shippingCity: shippingInfo.city,
            shippingPostalCode: shippingInfo.postalCode,
        });

        if (createOrderError || !orderId) {
             return NextResponse.json(
                { error: createOrderError || "Failed to create order." }, 
                { status: 500 }
            );
        }
        
        const preferenceBody = {
            items: cartItems.map((item) => ({
                id: item.product.id.toString(),
                title: item.product.name,
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.product.salePrice ?? item.product.price) || 0,
                currency_id: 'ARS'
            })),
            payer: {
                email: shippingInfo.email,
                name: shippingInfo.name,
                address: {
                    street_name: shippingInfo.address,
                }
            },
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                failure: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                pending: `${process.env.NEXT_PUBLIC_SITE_URL}/`
            },
            auto_return: 'approved' as const,
            notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
            external_reference: orderId.toString(),
            expires: true,
            expiration_date_to: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        };

        const result = await preference.create({ body: preferenceBody });

        return NextResponse.json({ preferenceId: result.id });

    } catch (error: any) {
        console.error("Error creating Mercado Pago preference:", error);
        return NextResponse.json(
            { error: error.message || "No se pudo crear la preferencia de pago." },
            { status: 500 }
        );
    }
}
