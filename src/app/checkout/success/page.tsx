'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail, Home, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get payment details from URL parameters
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const merchantOrderId = searchParams.get('merchant_order_id');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // If we have payment parameters, fetch the payment details
    if (paymentId && status) {
      fetchPaymentDetails();
    } else {
      // If no payment params, just show success (came from direct payment flow)
      setLoading(false);
    }
  }, [paymentId, status]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch('/api/payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          status,
          merchantOrderId,
          preferenceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
      } else {
        console.error('Error fetching payment details');
        toast({
          title: "Advertencia",
          description: "No se pudieron obtener los detalles del pago, pero tu compra fue exitosa.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Advertencia", 
        description: "No se pudieron obtener los detalles del pago, pero tu compra fue exitosa.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (status === 'approved' || !status) {
      return {
        title: '¡Pago Exitoso!',
        message: 'Tu compra ha sido procesada correctamente.',
        color: 'text-green-600'
      };
    } else if (status === 'pending') {
      return {
        title: 'Pago Pendiente',
        message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
        color: 'text-yellow-600'
      };
    } else {
      return {
        title: 'Estado del Pago',
        message: 'Tu pago ha sido registrado.',
        color: 'text-blue-600'
      };
    }
  };

  const statusInfo = getStatusMessage();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando el estado de tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className={`h-16 w-16 ${statusInfo.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold">
            {statusInfo.title}
          </CardTitle>
          <p className="text-muted-foreground">
            {statusInfo.message}
          </p>
        </CardHeader>
      </Card>

      {/* Payment Details */}
      {paymentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalles del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID del Pago</p>
                  <p className="font-mono text-sm">{paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-semibold capitalize">{status}</p>
                </div>
              </div>
            )}
            
            {paymentData.transaction_amount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                  <p className="font-semibold text-lg">
                    ${paymentData.transaction_amount.toLocaleString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-semibold">
                    {paymentData.payment_method_id || 'Mercado Pago'}
                  </p>
                </div>
              </div>
            )}

            {merchantOrderId && (
              <div>
                <p className="text-sm text-muted-foreground">Número de Orden</p>
                <p className="font-mono text-sm">{merchantOrderId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold mt-1">
                1
              </div>
              <div>
                <p className="font-semibold">Confirmación por email</p>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un email con los detalles de tu compra y la información de seguimiento.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold mt-1">
                2
              </div>
              <div>
                <p className="font-semibold">Preparación del pedido</p>
                <p className="text-sm text-muted-foreground">
                  Comenzaremos a preparar tu pedido. Este proceso puede tomar 1-2 días hábiles.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold mt-1">
                3
              </div>
              <div>
                <p className="font-semibold">Coordinación del envío</p>
                <p className="text-sm text-muted-foreground">
                  Nos pondremos en contacto contigo para coordinar la entrega de tu pedido.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Ir al Inicio
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => router.push('/tienda')}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Seguir Comprando
        </Button>
      </div>

      {/* Support Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Tienes alguna pregunta sobre tu pedido? 
            <br />
            Contáctanos en <strong>soporte@tutienda.com</strong> o al teléfono <strong>(011) 1234-5678</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
