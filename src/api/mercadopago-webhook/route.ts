
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus, restockItemsForOrder } from '@/lib/orders';
import type { OrderStatus } from '@/lib/types';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            
            console.log(`Received payment notification for ID: ${paymentId}`);

            const payment = await new Payment(client).get({ id: paymentId });

            if (!payment || !payment.external_reference) {
                console.warn(`Payment not found or external_reference missing for ID: ${paymentId}`);
                return NextResponse.json({ status: 'ok' });
            }

            const orderId = parseInt(payment.external_reference, 10);
            const paymentStatus = payment.status;

            console.log(`Processing order ${orderId} with payment status: ${paymentStatus}`);

            let newStatus: OrderStatus;
            
            if (paymentStatus === 'approved') {
                newStatus = 'paid';
                await updateOrderStatus(orderId, newStatus, String(paymentId));
                console.log(`Order ${orderId} successfully updated to 'paid'.`);
            } else if (['cancelled', 'rejected'].includes(paymentStatus!)) {
                newStatus = paymentStatus === 'cancelled' ? 'cancelled' : 'failed';
                await updateOrderStatus(orderId, newStatus, String(paymentId));
                await restockItemsForOrder(orderId);
                console.log(`Order ${orderId} updated to '${newStatus}' and items have been restocked.`);
            } else if (paymentStatus === 'in_process' || paymentStatus === 'pending') {
                newStatus = 'pending';
                await updateOrderStatus(orderId, newStatus, String(paymentId));
                 console.log(`Order ${orderId} status updated to 'pending'.`);
            }
            else {
                console.log(`Ignoring payment status '${paymentStatus}' for order ${orderId}.`);
            }
        }
    
        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Error processing Mercado Pago webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }
}
