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
  const { cartItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

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

  function onSubmit(values: z.infer<typeof shippingSchema>) {
    console.log("Order submitted:", values);
    toast({
        title: "¡Pedido Realizado!",
        description: "Gracias por tu compra. Te hemos enviado un email con los detalles."
    });
    clearCart();
    router.push('/');
  }

  if (cartItems.length === 0) {
    return (
        <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
            <Button asChild className="mt-4" onClick={() => router.push('/')}>
                Volver a la tienda
            </Button>
        </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-6">Información de Envío</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">Método de Pago</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                        {/* Mercado Pago and other payment methods here */}
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                            <FormControl><RadioGroupItem value="mercado-pago" /></FormControl>
                            <FormLabel className="font-normal w-full">Mercado Pago</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                            <FormControl><RadioGroupItem value="pago-facil" /></FormControl>
                            <FormLabel className="font-normal w-full">Pago Fácil</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                            <FormControl><RadioGroupItem value="rapipago" /></FormControl>
                            <FormLabel className="font-normal w-full">Rapipago</FormLabel>
                        </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full">Pagar ${totalPrice.toLocaleString('es-AR')}</Button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="text-3xl font-headline font-bold mb-6">Resumen de tu compra</h2>
        <Card>
            <CardContent className="p-6 space-y-4">
                {cartItems.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" data-ai-hint={item.product.aiHint}/>
                            </div>
                            <div>
                               <p className="font-semibold">{item.product.name}</p>
                               <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-medium">${(item.product.price * item.quantity).toLocaleString('es-AR')}</p>
                    </div>
                ))}
                <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>${totalPrice.toLocaleString('es-AR')}</p>
                    </div>
                     <div className="flex justify-between">
                        <p>Envío</p>
                        <p>Gratis</p>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
                        <p>Total</p>
                        <p>${totalPrice.toLocaleString('es-AR')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
