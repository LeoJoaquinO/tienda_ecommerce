import { NextRequest, NextResponse } from 'next/server';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📩 MercadoPago webhook received:', {
      id: body.id,
      topic: body.topic,
      type: body.type,
      action: body.action
    });

    // Validate webhook authenticity (optional but recommended)
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    
    if (!body.id || !body.topic) {
      console.error('Invalid webhook payload');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Handle different notification types
    switch (body.topic) {
      case 'payment':
        await handlePaymentNotification(body.id);
        break;
      
      case 'merchant_order':
        await handleMerchantOrderNotification(body.id);
        break;
        
      case 'plan':
      case 'subscription':
      case 'invoice':
        console.log(`Received ${body.topic} notification: ${body.id}`);
        // Handle subscription-related notifications if needed
        break;
        
      default:
        console.log(`Unhandled notification type: ${body.topic}`);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentNotification(paymentId: string) {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return;
    }

    console.log(`🔍 Fetching payment details for: ${paymentId}`);
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching payment ${paymentId}:`, response.status);
      return;
    }

    const payment = await response.json();
    
    console.log('💳 Payment details:', {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount
    });

    // Process the payment based on its status
    switch (payment.status) {
      case 'approved':
        await handleApprovedPayment(payment);
        break;
        
      case 'rejected':
        await handleRejectedPayment(payment);
        break;
        
      case 'pending':
        await handlePendingPayment(payment);
        break;
        
      case 'in_process':
        await handleInProcessPayment(payment);
        break;
        
      case 'cancelled':
        await handleCancelledPayment(payment);
        break;
        
      case 'refunded':
        await handleRefundedPayment(payment);
        break;
        
      default:
        console.log(`Unhandled payment status: ${payment.status}`);
    }

  } catch (error) {
    console.error('Error handling payment notification:', error);
  }
}

async function handleMerchantOrderNotification(merchantOrderId: string) {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return;
    }

    console.log(`🛍️ Fetching merchant order: ${merchantOrderId}`);
    
    const response = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching merchant order ${merchantOrderId}:`, response.status);
      return;
    }

    const merchantOrder = await response.json();
    
    console.log('📦 Merchant order details:', {
      id: merchantOrder.id,
      status: merchantOrder.status,
      external_reference: merchantOrder.external_reference,
      total_amount: merchantOrder.total_amount
    });

    // TODO: Update order status in your database based on merchant order status
    
  } catch (error) {
    console.error('Error handling merchant order notification:', error);
  }
}

// Payment status handlers
async function handleApprovedPayment(payment: any) {
  console.log('✅ Payment approved:', payment.id);
  
  // TODO: Implement your business logic for approved payments:
  // - Update order status to "paid"
  // - Send confirmation emails
  // - Update inventory
  // - Generate invoice
  // - Trigger fulfillment process
  
  try {
    // Example: Update order in database
    // await updateOrderStatus(payment.external_reference, 'paid', payment.id);
    
    // Example: Send confirmation email
    // await sendOrderConfirmationEmail(payment.external_reference);
    
    console.log(`Order ${payment.external_reference} marked as paid`);
  } catch (error) {
    console.error('Error processing approved payment:', error);
  }
}

async function handleRejectedPayment(payment: any) {
  console.log('❌ Payment rejected:', payment.id, payment.status_detail);
  
  // TODO: Implement logic for rejected payments:
  // - Update order status to "payment_failed"
  // - Send payment failure notification
  // - Optionally retry payment or offer alternative methods
  
  try {
    // await updateOrderStatus(payment.external_reference, 'payment_failed');
    // await sendPaymentFailedEmail(payment.external_reference, payment.status_detail);
    
    console.log(`Order ${payment.external_reference} payment failed`);
  } catch (error) {
    console.error('Error processing rejected payment:', error);
  }
}

async function handlePendingPayment(payment: any) {
  console.log('⏳ Payment pending:', payment.id);
  
  // TODO: Handle pending payments (e.g., bank transfers, cash payments)
  // - Update order status to "pending_payment"
  // - Send payment instructions if needed
  
  try {
    // await updateOrderStatus(payment.external_reference, 'pending_payment');
    console.log(`Order ${payment.external_reference} payment is pending`);
  } catch (error) {
    console.error('Error processing pending payment:', error);
  }
}

async function handleInProcessPayment(payment: any) {
  console.log('🔄 Payment in process:', payment.id);
  
  // TODO: Handle payments being processed
  // Usually no action needed, just logging
}

async function handleCancelledPayment(payment: any) {
  console.log('🚫 Payment cancelled:', payment.id);
  
  // TODO: Handle cancelled payments
  // - Update order status to "cancelled"
  // - Release reserved inventory
  
  try {
    // await updateOrderStatus(payment.external_reference, 'cancelled');
    console.log(`Order ${payment.external_reference} cancelled`);
  } catch (error) {
    console.error('Error processing cancelled payment:', error);
  }
}

async function handleRefundedPayment(payment: any) {
  console.log('💸 Payment refunded:', payment.id);
  
  // TODO: Handle refunded payments
  // - Update order status to "refunded"
  // - Update inventory
  // - Send refund confirmation
  
  try {
    // await updateOrderStatus(payment.external_reference, 'refunded');
    console.log(`Order ${payment.external_reference} refunded`);
  } catch (error) {
    console.error('Error processing refunded payment:', error);
  }
}

// GET method for webhook verification (MercadoPago sometimes sends GET requests)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');
  
  console.log('📩 MercadoPago webhook GET:', { topic, id });
  
  if (topic && id) {
    if (topic === 'payment') {
      await handlePaymentNotification(id);
    } else if (topic === 'merchant_order') {
      await handleMerchantOrderNotification(id);
    }
  }
  
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
