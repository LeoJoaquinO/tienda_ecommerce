
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Ticket } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const shippingSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Email inválido."),
  address: z.string().min(5, "La dirección es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  postalCode: z.string().min(4, "El código postal es requerido."),
});

// Initialize Mercado Pago SDK
if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-AR' });
} else {
    console.error("Mercado Pago public key is not configured.");
}


export default function CheckoutPage() {
  const { cartItems, subtotal, appliedCoupon, discount, totalPrice, clearCart, cartCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof shippingSchema>) => {
    // The payment will be handled by the Mercado Pago Brick,
    // so this function will likely be triggered by the Brick's onSubmit.
    // The form data from `values` will be combined with the payment data.
    console.log("Shipping details:", values);
    // The processPayment function will handle the rest.
  };

  const processPayment = async (formData: any) => {
    setIsLoading(true);
    const shippingDetails = form.getValues();

    try {
        const payload = {
            cartItems,
            appliedCoupon,
            totalPrice,
            discount,
            shippingInfo: shippingDetails,
            paymentData: formData,
        };

        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error procesando el pago.');
        }

        toast({
            title: "¡Pago Exitoso!",
            description: "Tu compra ha sido realizada con éxito. Gracias."
        });

        clearCart();
        router.push('/'); // Redirect to home or a success page

    } catch (error) {
        console.error("Payment processing error:", error);
        toast({
            title: "Error en el Pago",
            description: (error as Error).message || "No se pudo completar el pago. Por favor, intenta de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  // Effect to ensure the page doesn't render until hydration is complete
  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady || cartCount === 0 && !isLoading) {
    return (
        <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mt-2">Parece que no tienes nada para comprar.</p>
            <Button asChild className="mt-6" onClick={() => router.push('/tienda')}>
                Volver a la tienda
            </Button>
        </div>
    )
  }
  
  if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    return (
        <div className="text-center py-12 text-destructive">
             <h1 className="text-2xl font-semibold">Error de Configuración</h1>
             <p className="text-muted-foreground mt-2">El sistema de pagos no está configurado. Por favor, contacta al administrador.</p>
        </div>
    )
  }


  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div className="lg:col-span-1">
        <h1 className="text-3xl font-headline font-bold mb-6">Finalizar Compra</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card>
                <CardHeader><CardTitle>1. Información de Envío</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>2. Método de Pago</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Completa los datos de tu tarjeta de forma segura.</p>
                   <Payment
                        initialization={{
                            amount: totalPrice,
                        }}
                        customization={{
                            paymentMethods: {
                                creditCard: 'all',
                                debitCard: 'all',
                                mercadoPago: 'all',
                            },
                            visual: {
                               style: {
                                   theme: 'flat',
                               }
                           }
                        }}
                        onSubmit={processPayment}
                    />
                </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
            <h2 className="text-3xl font-headline font-bold mb-6">Resumen de tu compra</h2>
            <Card className="shadow-lg">
                <CardContent className="p-6 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" data-ai-hint={item.product.aiHint}/>
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
    </div>
  );
}
