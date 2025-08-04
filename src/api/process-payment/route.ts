
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createOrder } from '@/lib/orders';
import type { CartItem, Coupon } from '@/lib/types';
import type { PaymentCreateData } from 'mercadopago/dist/clients/payment/create/types';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const paymentClient = new Payment(client);

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
    };
    paymentData: {
        token: string;
        issuer_id: string;
        payment_method_id: string;
        transaction_amount: number;
        installments: number;
        payer: {
            email: string;
            first_name: string;
            last_name: string;
            identification: {
                type: string;
                number: string;
            };
        };
    };
};

export async function POST(req: NextRequest) {
    try {
        const payload: CheckoutPayload = await req.json();
        const { cartItems, appliedCoupon, totalPrice, discount, shippingInfo, paymentData } = payload;

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
        }

        // 1. Create the order in our database *before* processing payment.
        // This gives us a record of the purchase attempt.
        const orderId = await createOrder({
            customerName: shippingInfo.name,
            customerEmail: shippingInfo.email,
            total: totalPrice,
            status: 'pending', // Initial status
            items: cartItems,
            couponCode: appliedCoupon?.code,
            discountAmount: discount,
            shippingAddress: shippingInfo.address,
            shippingCity: shippingInfo.city,
            shippingPostalCode: shippingInfo.postalCode,
        });

        // 2. Prepare the payment object for Mercado Pago
        const paymentRequestBody: PaymentCreateData = {
            body: {
                transaction_amount: paymentData.transaction_amount,
                token: paymentData.token,
                description: `Orden de compra #${orderId} en Joya Store`,
                installments: paymentData.installments,
                payment_method_id: paymentData.payment_method_id,
                issuer_id: paymentData.issuer_id,
                payer: {
                    email: paymentData.payer.email,
                    first_name: shippingInfo.name.split(' ')[0],
                    last_name: shippingInfo.name.split(' ').slice(1).join(' ') || shippingInfo.name.split(' ')[0],
                    identification: paymentData.payer.identification,
                    entity_type: 'individual', // This is the required field that was missing
                },
                // Pass our internal order ID to track it via webhooks
                external_reference: String(orderId),
                // The webhook URL is configured in your Mercado Pago dashboard
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
            }
        };

        // 3. Create the payment
        const paymentResult = await paymentClient.create(paymentRequestBody);
        
        // 4. Return the payment result to the frontend
        return NextResponse.json(paymentResult);

    } catch (error: any) {
        console.error("Error processing payment:", error.cause || error);
        // Provide a more specific error message if available from Mercado Pago
        const errorMessage = error?.cause?.error?.message || 'No se pudo procesar el pago.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
