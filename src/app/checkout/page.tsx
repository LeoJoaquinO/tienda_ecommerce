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
import { Loader2, Ticket, ArrowLeft, ShoppingCart, CreditCard } from "lucide-react";
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
  const [mpInitialized, setMpInitialized] = useState(false);
  
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: "", email: "", address: "", city: "", postalCode: "" },
  });

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey && !mpInitialized) {
      try {
        initMercadoPago(publicKey, { 
          locale: 'es-AR',
          advancedFraudPrevention: true,
          trackingDisabled: true
        });
        setMpInitialized(true);
        console.log("MercadoPago initialized successfully");
      } catch (error) {
        console.error("Failed to initialize MercadoPago:", error);
      }
    } else if (!publicKey) {
      console.error("CRITICAL: NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY is not configured.");
    }
  }, [mpInitialized]);

  const handleShippingSubmit = async (values: ShippingFormData) => {
    if (!mpInitialized) {
      toast({ 
        title: "Error", 
        description: "Sistema de pagos no inicializado. Recarga la página.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("El carrito está vacío");
      }

      const requestBody = {
        cartItems: cartItems.map((item, index) => ({
          id: `item_${index}`,
          title: item.product?.name || `Product ${index + 1}`,
          quantity: Math.max(1, Number(item.quantity) || 1),
          unit_price: Math.max(0.01, Number(item.product?.salePrice ?? item.product?.price) || 1),
          name: item.product?.name || `Product ${index + 1}`,
          price: item.product?.salePrice ?? item.product?.price
        })),
        shippingInfo: {
          ...values,
          name: values.name || 'Cliente',
          email: values.email
        },
        totalPrice: Math.max(0.01, Number(totalPrice) || 1),
        discount: Number(discount) || 0,
        appliedCoupon: appliedCoupon || null
      };

      console.log("Creating payment preference for", requestBody.cartItems.length, "items");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.preferenceId) {
        throw new Error("No se recibió el ID de preferencia del servidor");
      }

      setPreferenceId(data.preferenceId);
      console.log("✅ Preference created successfully:", data.preferenceId);
      
      toast({
        title: "Preferencia creada",
        description: "Procede con el pago",
        variant: "default"
      });
      
    } catch (error: any) {
      console.error("❌ Error creating preference:", error);
      
      let errorMessage = "Error desconocido";
      
      if (error.name === 'AbortError') {
        errorMessage = "Tiempo de espera agotado. Intenta nuevamente.";
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      } else if (error.message?.includes('credentials')) {
        errorMessage = "Error de configuración del sistema de pagos.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error creando el pago", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (cartCount === 0 && !isLoading && !preferenceId) {
        const timer = setTimeout(() => {
          toast({ 
            title: 'Tu carrito está vacío', 
            description: 'Serás redirigido a la tienda.', 
            variant: 'destructive' 
          });
          router.push('/tienda');
        }, 2000);
        return () => clearTimeout(timer);
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
             <p className="text-muted-foreground mt-2">
               El sistema de pagos no está configurado. Por favor, contacta al administrador.
             </p>
             <p className="text-xs text-muted-foreground mt-4">
               Variable faltante: NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
             </p>
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
                    <Image 
                      src={item.product.images[0] ?? "https://placehold.co/100x100.png"} 
                      alt={item.product.name} 
                      fill 
                      className="object-cover" 
                      data-ai-hint={item.product.aiHint}
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-right">
                  ${((item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString('es-AR')}
                </p>
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
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Pagos seguros procesados por Mercado Pago</span>
          </div>
        </div>
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

        {isLoading && !preferenceId ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Configurando tu pago...</p>
          </div>
        ) : preferenceId ? (
          <Card>
            <CardHeader>
              <CardTitle>2. Método de Pago</CardTitle>
              <CardDescription>Completa el pago de forma segura con Mercado Pago.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
              <div className={cn(isLoading && 'hidden')}>
                <Payment
                    key={`payment-${preferenceId}`}
                    initialization={{
                      preferenceId: preferenceId,
                      amount: totalPrice,
                    }}
                    customization={{
                      paymentMethods: {
                        creditCard: "all",
                        debitCard: "all",
                        mercadoPago: "all"
                      },
                      visual: {
                        style: {
                          theme: "default"
                        }
                      }
                    }}
                    onSubmit={async (param) => {
                      console.log("Payment submitted:", param);
                      try {
                        setIsLoading(true);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        clearCart();
                        toast({ 
                          title: '¡Pago Exitoso!', 
                          description: 'Gracias por tu compra. Serás redirigido a la página de inicio.',
                          variant: "default"
                        });
                        setTimeout(() => {
                          router.push('/');
                        }, 1500);
                      } catch (error) {
                        console.error("Payment processing error:", error);
                        toast({ 
                          title: 'Error procesando pago', 
                          description: 'Hubo un problema procesando tu pago. Intenta nuevamente.', 
                          variant: 'destructive'
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    onError={(error) => {
                      console.error("Payment Brick Error:", error);
                      toast({ 
                        title: 'Error de Pago', 
                        description: 'No se pudo cargar el formulario de pago. Intenta recargando la página.', 
                        variant: 'destructive'
                      });
                    }}
                    onReady={() => {
                      console.log("Payment brick is ready");
                      setIsLoading(false);
                    }}
                />
              </div>
            </CardContent>
            <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setPreferenceId(null)} 
                  disabled={isLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/> Volver a Envío
                </Button>
            </CardFooter>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleShippingSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Información de Envío</CardTitle>
                  <CardDescription>Completa tus datos para el envío del pedido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl><Input {...field} placeholder="Juan Pérez" /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" {...field} placeholder="juan@email.com" /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl><Input {...field} placeholder="Av. Corrientes 1234" /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl><Input {...field} placeholder="Buenos Aires" /></FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl><Input {...field} placeholder="1001" /></FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Configurando pago...
                      </>
                    ) : (
                      "Continuar al Pago"
                    )}
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
