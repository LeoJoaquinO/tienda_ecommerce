
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Ticket, ArrowLeft, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { cn } from "@/lib/utils";

const shippingSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Email inválido."),
  address: z.string().min(5, "La dirección es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  postalCode: z.string().min(4, "El código postal es requerido."),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function CheckoutPage() {
  const { cartItems, subtotal, appliedCoupon, discount, totalPrice, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: "", email: "", address: "", city: "", postalCode: "" },
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-AR' });
    } else {
      console.error("CRITICAL: Mercado Pago public key is not configured.");
    }
  }, []);

  const handleShippingSubmit = async (values: ShippingFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, shippingInfo: values, totalPrice, discount, appliedCoupon }),
      });
      const data = await response.json();
      if (!response.ok || !data.preferenceId) {
        throw new Error(data.error || "No se pudo crear la preferencia de pago.");
      }
      setPreferenceId(data.preferenceId);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (cartCount === 0 && !isLoading && !preferenceId) {
        toast({ title: 'Tu carrito está vacío', description: 'Serás redirigido a la tienda.', variant: 'destructive' });
        router.push('/tienda');
    }
  }, [cartCount, router, isLoading, preferenceId, toast]);


  if (cartCount === 0 && !preferenceId) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
            <p className="text-muted-foreground">Serás redirigido a la tienda...</p>
        </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    return (
        <div className="text-center py-12 text-destructive">
             <h1 className="text-2xl font-semibold">Error de Configuración</h1>
             <p className="text-muted-foreground mt-2">El sistema de pagos no está configurado. Por favor, contacta al administrador.</p>
        </div>
    )
  }

  const renderOrderSummary = () => (
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <h2 className="text-3xl font-headline font-bold mb-6">Resumen de tu compra</h2>
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            {cartItems.map(item => (
              <div key={item.product.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <Image src={item.product.images[0] ?? "https://placehold.co/100x100.png"} alt={item.product.name} fill className="object-cover" data-ai-hint={item.product.aiHint}/>
                  </div>
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-right">${((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString('es-AR')}</p>
              </div>
            ))}
            <Separator className="my-4"/>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>${subtotal.toLocaleString('es-AR')}</p>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4"/>
                    <span>Cupón: {appliedCoupon.code}</span>
                  </div>
                  <span>-${discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-muted-foreground">Envío</p>
                <p>A coordinar</p>
              </div>
              <Separator className="my-4"/>
              <div className="flex justify-between font-bold text-xl">
                <p>Total</p>
                <p>${totalPrice.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div className="lg:col-span-1">
        <h1 className="text-3xl font-headline font-bold mb-6">Finalizar Compra</h1>
        
        <div className="flex items-center gap-4 mb-8">
            <div className={cn("flex items-center gap-2", !preferenceId ? 'text-primary font-bold' : 'text-muted-foreground')}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-sm", !preferenceId ? 'bg-primary text-primary-foreground' : 'bg-muted')}>1</div>
                <span>Envío</span>
            </div>
            <Separator className="flex-1" />
            <div className={cn("flex items-center gap-2", preferenceId ? 'text-primary font-bold' : 'text-muted-foreground')}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-sm", preferenceId ? 'bg-primary text-primary-foreground' : 'bg-muted')}>2</div>
                <span>Pago</span>
            </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : preferenceId ? (
          <Card>
            <CardHeader>
              <CardTitle>2. Método de Pago</CardTitle>
              <CardDescription>Completa el pago de forma segura con Mercado Pago.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              <Payment
                key={preferenceId}
                initialization={{
                  preferenceId: preferenceId,
                }}
                onSubmit={async () => {
                  clearCart();
                  toast({ title: '¡Pago Exitoso!', description: 'Gracias por tu compra. Serás redirigido a la página de inicio.' });
                  router.push('/');
                }}
                onError={(err) => {
                  console.error("Payment Brick Error:", err);
                  toast({ title: 'Error de Pago', description: 'No se pudo procesar el pago. Por favor, intenta de nuevo.', variant: 'destructive'});
                  setPreferenceId(null);
                }}
              />
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={() => setPreferenceId(null)} disabled={isLoading}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Volver a Envío
                </Button>
            </CardFooter>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleShippingSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle>1. Información de Envío</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    Continuar al Pago
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
      </div>

      {renderOrderSummary()}
    </div>
  );
}

    