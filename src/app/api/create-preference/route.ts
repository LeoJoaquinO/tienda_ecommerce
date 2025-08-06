
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
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

        // 1. Create order in our database with 'pending' status
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
        
        // 2. Create Mercado Pago preference
        const preferenceData: PreferenceCreateData = {
            body: {
                items: cartItems.map(item => ({
                    id: item.product.id.toString(),
                    title: item.product.name,
                    quantity: item.quantity,
                    unit_price: item.product.salePrice ?? item.product.price,
                    currency_id: 'ARS',
                })),
                payer: {
                    name: shippingInfo.name.split(' ')[0],
                    surname: shippingInfo.name.split(' ').slice(1).join(' '),
                    email: shippingInfo.email,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                },
                auto_return: 'approved',
                external_reference: orderId.toString(),
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
            },
        };

        const result = await preference.create(preferenceData);

        return NextResponse.json({ preferenceId: result.id });

    } catch (error: any) {
        console.error("Error creating Mercado Pago preference:", error);
        return NextResponse.json(
            { error: error.message || "No se pudo crear la preferencia de pago." },
            { status: 500 }
        );
    }
}
