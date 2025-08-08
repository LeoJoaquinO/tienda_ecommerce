import { NextRequest, NextResponse } from 'next/server';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Processing payment:', {
      paymentId: body.payment?.id,
      status: body.payment?.status,
      paymentMethod: body.payment?.payment_method_id
    });

    // Validate the payment with MercadoPago
    if (body.payment?.id) {
      try {
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${body.payment.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('Payment validation result:', {
            id: paymentData.id,
            status: paymentData.status,
            status_detail: paymentData.status_detail
          });

          // Here you would typically:
          // 1. Save the order to your database
          // 2. Send confirmation emails
          // 3. Update inventory
          // 4. Create shipping labels, etc.

          if (paymentData.status === 'approved') {
            // Payment successful - create order in your system
            const order = {
              id: `order_${Date.now()}`,
              paymentId: paymentData.id,
              status: 'confirmed',
              items: body.cartItems,
              totalAmount: body.totalPrice,
              shippingInfo: body.shippingInfo,
              paymentMethod: paymentData.payment_method_id,
              createdAt: new Date().toISOString()
            };

            // TODO: Save order to database
            console.log('Order created:', order.id);

            return NextResponse.json({
              success: true,
              orderId: order.id,
              paymentStatus: paymentData.status,
              message: 'Pago procesado exitosamente'
            });
          } else {
            // Payment not approved
            return NextResponse.json({
              success: false,
              paymentStatus: paymentData.status,
              message: getPaymentStatusMessage(paymentData.status, paymentData.status_detail)
            }, { status: 400 });
          }
        } else {
          console.error('Error validating payment with MercadoPago');
          return NextResponse.json({
            success: false,
            message: 'Error validando el pago'
          }, { status: 500 });
        }
      } catch (validationError) {
        console.error('Payment validation error:', validationError);
        return NextResponse.json({
          success: false,
          message: 'Error validando el pago'
        }, { status: 500 });
      }
    }

    // If no payment ID provided, this might be a direct form submission
    // Handle accordingly based on your implementation
    return NextResponse.json({
      success: true,
      message: 'Información de pago recibida'
    });

  } catch (error: any) {
    console.error('❌ Error in process-payment API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo procesar el pago. Intenta nuevamente.' 
      }, 
      { status: 500 }
    );
  }
}

// Helper function to get user-friendly payment status messages
function getPaymentStatusMessage(status: string, statusDetail?: string): string {
  const statusMessages: Record<string, string> = {
    'pending': 'El pago está pendiente de confirmación',
    'approved': 'El pago fue aprobado exitosamente',
    'authorized': 'El pago fue autorizado',
    'in_process': 'El pago está siendo procesado',
    'in_mediation': 'El pago está en mediación',
    'rejected': 'El pago fue rechazado',
    'cancelled': 'El pago fue cancelado',
    'refunded': 'El pago fue reembolsado',
    'charged_back': 'Se realizó un contracargo'
  };

  const detailMessages: Record<string, string> = {
    'cc_rejected_insufficient_amount': 'Fondos insuficientes',
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
    'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
    'cc_rejected_bad_filled_other': 'Datos de tarjeta incorrectos',
    'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
    'cc_rejected_blacklist': 'No se pudo procesar el pago',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago ante tu banco',
    'cc_rejected_card_disabled': 'La tarjeta está deshabilitada',
    'cc_rejected_card_error': 'No se pudo procesar la información de la tarjeta',
    'cc_rejected_duplicated_payment': 'Ya existe un pago similar',
    'cc_rejected_high_risk': 'El pago fue rechazado por seguridad',
    'cc_rejected_invalid_installments': 'Cuotas no válidas',
    'cc_rejected_max_attempts': 'Alcanzaste el límite de intentos permitidos'
  };

  if (statusDetail && detailMessages[statusDetail]) {
    return detailMessages[statusDetail];
  }

  return statusMessages[status] || 'Estado de pago desconocido';
}
