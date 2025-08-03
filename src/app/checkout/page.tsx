
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Ticket } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const shippingSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Email inválido."),
  address: z.string().min(5, "La dirección es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  postalCode: z.string().min(4, "El código postal es requerido."),
});

const MercadoPagoLogo = () => (
    <svg width="48" height="30" viewBox="0 0 73 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M68.48 20.372c-1.284-1.89-2.912-3.41-4.73-4.592-1.787-1.15-3.83-1.787-6.02-1.787-2.158 0-4.14.575-5.89 1.63L51.84 5.23h5.443L61.2 0H46.447L38.21 16.148c-.543-.31-1.15-.543-1.787-.723-1.028-.248-2.056-.372-3.116-.372-3.473 0-6.49 1.09-8.892 3.23-2.433 2.158-3.71 5.005-3.71 8.368h24.18c.062-.51.093-1.02.093-1.537 0-2.025-.51-3.924-1.465-5.7zM49.23 20.28c.48.542.72 1.2.72 2.024H37.38c.06-.853.37-1.578.89-2.19.54-.645 1.26-1.135 2.16-1.47.9-.345 1.87-.517 2.9-.517 1.15 0 2.2.2 3.12.6.95.4 1.76.95 2.43 1.65h.03zM18.99 25.6h5.44L20.84 0H15.4L11.81 12.3l-1.06-1.06v-.01L6.47 0H.95l7.98 25.6h5.36l1.3-4.25h2.32l1.08 4.25zM12.98 15.3l-1.03 3.37h-1.4l-2.06-6.6-3-9.52h.02l2.3 7.37 1.48 4.7.1.33.07.25h1.52z" fill="#009EE3"></path>
    </svg>
)

const VisaLogo = () => (
    <svg width="48" height="30" viewBox="0 0 38 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M37.333 1.983c0-.825-.667-1.5-1.5-1.5H2.167c-.825 0-1.5.675-1.5 1.5v.75h36.666v-.75zM.667 9.233h36.666v4.5H.667v-4.5zM.667 21.017c0 .825.675 1.5 1.5 1.5h34.166c.825 0 1.5-.675 1.5-1.5V15.9h-36.666v5.117z" fill="#2566AF"></path><path d="M12.433 11.1c.12-.625.64-2.125 2.33-2.125.96 0 1.58.4 1.83.675l.17.225.5-2.7S16.823 6.95 16 6.95c-1.58 0-3.3 1.125-3.3 3.2 0 1.342.742 2.05 1.25 2.3.5.25.79.425.79.7 0 .425-.5.7-1.08.7-.92 0-1.25-.2-1.3-.8L11 12.8c-.833 0-2.5.333-2.5.333.34 2.333 2.33 3.375 4.33 3.375 2.42 0 4.17-1.125 4.17-2.925 0-1.033-.5-1.75-1.58-2.25-.92-.45-1.67-.7-1.67-1.125s.5-.8 1.16-.8c.75 0 1.17.3 1.42.5l.25.175.75-3.25s-.83-.425-2-.425c-2.09 0-3.59 1.25-3.59 2.875 0 .95.58 1.67 1.5 2.12.91.45 1.58.7 1.58 1.125 0 .375-.5.625-1.09.625-.66 0-1.24-.375-1.5-.625l-.25-.25L12.433 11.1zM28.02 9.05c-.5-.95-1.66-1.55-2.99-1.55-2.5 0-4.59 1.75-4.59 4.25s2.09 4.25 4.59 4.25c1.41 0 2.58-.675 3.08-1.7h.09l.58 1.45h2.5L28.6 9.8s-.33-1.083-.58-1.75h-.09l.09.975zM25.35 13.8c.41-1.333 1.41-2.25 2.33-2.25.5 0 1.25.425 1.5.925l-1.92 4.583c-.5-.25-1.91-1-1.91-3.258z" fill="#F7A600"></path>
    </svg>
)

const MastercardLogo = () => (
    <svg width="48" height="30" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.22 11.666c0-4.75 3.33-8.167 7.58-8.167s7.59 3.417 7.59 8.167c0 4.75-3.34 8.167-7.59 8.167s-7.58-3.417-7.58-8.167z" fill="#FF5F00"></path><path d="M12.167 11.666c0 4.75-3.333 8.167-7.584 8.167C.333 19.833 0 16.416 0 11.666S.333 3.5 4.583 3.5c4.25 0 7.584 3.417 7.584 8.166z" fill="#EB001B"></path><path d="M25.333 11.666c0 2.417-.916 4.584-2.333 6.167 1.166.75 2.583 1.166 4.083 1.166 4.25 0 7.583-3.417 7.583-8.166s-3.333-8.167-7.583-8.167c-1.5 0-2.917.417-4.083 1.167 1.417 1.583 2.333 3.75 2.333 6.166z" fill="#F79E1B"></path>
    </svg>
)


export default function CheckoutPage() {
  const { cartItems, subtotal, appliedCoupon, discount, totalPrice, clearCart, cartCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  async function onSubmit(values: z.infer<typeof shippingSchema>) {
    setIsLoading(true);

    try {
      const checkoutPayload = {
        cartItems: cartItems,
        appliedCoupon: appliedCoupon,
        totalPrice: totalPrice,
        discount: discount,
        shippingInfo: {
            name: values.name,
            email: values.email,
            address: values.address,
            city: values.city,
            postalCode: values.postalCode,
        }
      };

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment preference.');
      }

      // Redirect to Mercado Pago checkout
      if (data.init_point) {
        clearCart();
        router.push(data.init_point);
      } else {
        throw new Error('No init_point received from Mercado Pago.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error en el Pago",
        description: (error as Error).message || "No se pudo iniciar el proceso de pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  if (cartCount === 0 && !isLoading) {
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

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div className="lg:col-span-1">
        <h1 className="text-3xl font-headline font-bold mb-6">Finalizar Compra</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card>
                <CardHeader><CardTitle>Información de Envío</CardTitle></CardHeader>
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
                <CardHeader><CardTitle>Método de Pago</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Serás redirigido a la plataforma de Mercado Pago para completar tu compra de forma segura.</p>
                  <div className="flex items-center gap-4 p-4 border rounded-md bg-secondary/30">
                      <span className="text-sm font-medium">Paga de forma segura con:</span>
                      <div className="flex items-center gap-2">
                          <MercadoPagoLogo />
                          <VisaLogo />
                          <MastercardLogo />
                      </div>
                  </div>
                </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Procesando...' : `Pagar $${totalPrice.toLocaleString('es-AR')} con Mercado Pago`}
            </Button>
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
                            <p>Gratis</p>
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
    
