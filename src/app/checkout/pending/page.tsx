
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hourglass, Home, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutPendingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Hourglass className="h-16 w-16 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pago Pendiente
          </CardTitle>
          <p className="text-muted-foreground">
            Tu pago está siendo procesado. Te enviaremos una confirmación por email cuando se apruebe.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Normalmente, los pagos pendientes se resuelven en unos pocos minutos, pero en algunos casos puede tardar hasta 2 días hábiles.
          </p>
          <p className="text-muted-foreground">
            No necesitas hacer nada más. Una vez que Mercado Pago nos notifique, actualizaremos el estado de tu orden automáticamente y te enviaremos un email.
          </p>
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
        <Button onClick={() => router.push('/')} className="flex items-center gap-2">
          <Home className="h-4 w-4" /> Ir al Inicio
        </Button>
        <Button variant="outline" onClick={() => router.push('/tienda')} className="flex items-center gap-2">
          <Package className="h-4 w-4" /> Seguir Comprando
        </Button>
      </div>
    </div>
  );
}


function PendingSkeleton() {
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


export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<PendingSkeleton />}>
      <CheckoutPendingClient />
    </Suspense>
  );
}
