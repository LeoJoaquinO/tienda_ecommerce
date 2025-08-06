
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createOrder } from '@/lib/data';
import type { CartItem, Coupon } from '@/lib/types';
import type { PaymentCreateData, Payer } from 'mercadopago/dist/clients/payment/create/types';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const paymentClient = new Payment(client);

// This type now accurately reflects the structure from the Payment Brick's onSubmit callback
type PaymentBrickOnSubmitData = {
    paymentType: string,
    selectedPaymentMethod: string,
    formData: {
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
    }
};

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
    paymentData: PaymentBrickOnSubmitData; // Use the updated type
};

export async function POST(req: NextRequest) {
    try {
        const payload: CheckoutPayload = await req.json();
        const { cartItems, appliedCoupon, totalPrice, discount, shippingInfo, paymentData } = payload;
        
        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
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

        // Correctly construct the payment body using the nested formData
        const paymentRequestBody: PaymentCreateData = {
            body: {
                transaction_amount: paymentData.formData.transaction_amount,
                token: paymentData.formData.token,
                description: `Orden de compra #${orderId} en Joya Store`,
                installments: paymentData.formData.installments,
                payment_method_id: paymentData.formData.payment_method_id,
                issuer_id: paymentData.formData.issuer_id,
                payer: {
                    email: paymentData.formData.payer.email,
                    first_name: paymentData.formData.payer.first_name,
                    last_name: paymentData.formData.payer.last_name,
                    identification: {
                      type: paymentData.formData.payer.identification.type,
                      number: paymentData.formData.payer.identification.number
                    }
                },
                external_reference: String(orderId),
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
            }
        };

        const paymentResult = await paymentClient.create(paymentRequestBody);
        
        return NextResponse.json(paymentResult);

    } catch (error: any) {
        console.error("Error processing payment:", error.cause || error);
        
        const errorMessage = Array.isArray(error?.cause)
            ? error.cause.map((e: any) => e.description).join(', ')
            : error?.cause?.error?.message || 'No se pudo procesar el pago.';
        
        return NextResponse.json(
            { error: errorMessage, details: error.cause }, 
            { status: 500 }
        );
    }
}
