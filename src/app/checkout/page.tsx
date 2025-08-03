
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
  paymentMethod: z.enum(["mercado-pago", "pago-facil", "rapipago"], {
    required_error: "Debes seleccionar un método de pago.",
  }),
});

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
      paymentMethod: "mercado-pago",
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
                <CardContent>
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:shadow-md">
                                    <FormControl><RadioGroupItem value="mercado-pago" disabled={isLoading} /></FormControl>
                                    <FormLabel className="font-normal w-full flex justify-between items-center">
                                        <span>Mercado Pago</span>
                                        {/* You can add Mercado Pago logos here */}
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:shadow-md opacity-50 cursor-not-allowed">
                                    <FormControl><RadioGroupItem value="pago-facil" disabled /></FormControl>
                                    <FormLabel className="font-normal w-full">Pago Fácil (No disponible)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:shadow-md opacity-50 cursor-not-allowed">
                                    <FormControl><RadioGroupItem value="rapipago" disabled /></FormControl>
                                    <FormLabel className="font-normal w-full">Rapipago (No disponible)</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Procesando...' : `Pagar con Mercado Pago $${totalPrice.toLocaleString('es-AR')}`}
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
    
