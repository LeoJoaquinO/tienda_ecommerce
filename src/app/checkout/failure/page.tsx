
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Package, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutFailureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const collectionStatus = searchParams.get('collection_status');
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  const getFailureReason = () => {
    switch (collectionStatus) {
      case 'rejected_by_bank':
        return 'Tu banco ha rechazado el pago.';
      case 'rejected_insufficient_amount':
        return 'No tienes fondos suficientes en tu cuenta.';
      case 'rejected_card_error':
        return 'Hubo un error con tu tarjeta. Por favor, verifica los datos.';
      case 'rejected_other_reason':
      default:
        return 'El pago fue rechazado. Intenta con otro método de pago.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pago Rechazado
          </CardTitle>
          <p className="text-muted-foreground">
            {getFailureReason()}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ¿Qué puedes hacer?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Verifica que los datos de tu tarjeta sean correctos.</li>
            <li>Asegúrate de tener fondos suficientes.</li>
            <li>Contacta a tu banco para más información.</li>
            <li>Intenta realizar la compra nuevamente con otro método de pago.</li>
          </ul>
        </CardContent>
      </Card>
      
      {paymentId && (
        <Card>
            <CardHeader><CardTitle>Detalles de la Transacción</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">ID de Pago: <span className="font-mono">{paymentId}</span></p>
                {externalReference && <p className="text-sm text-muted-foreground mt-1">Referencia: <span className="font-mono">{externalReference}</span></p>}
            </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => router.push('/cart')} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Volver al Carrito
        </Button>
        <Button variant="outline" onClick={() => router.push('/tienda')} className="flex items-center gap-2">
          <Package className="h-4 w-4" /> Seguir Comprando
        </Button>
      </div>
    </div>
  );
}

function FailureSkeleton() {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader className="text-center items-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-8 w-48 mt-4" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<FailureSkeleton />}>
      <CheckoutFailureClient />
    </Suspense>
  );
}
