"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, cartCount } = useCart();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline font-bold mb-8">Tu Carrito de Compras</h1>
      {cartCount === 0 ? (
        <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Tu carrito está vacío</h2>
                <p className="text-muted-foreground">Parece que todavía no has añadido nada.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Empezar a comprar</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <Card key={product.id} className="flex items-center p-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      data-ai-hint={product.aiHint}
                    />
                </div>
                <div className="flex-1 ml-4">
                  <Link href={`/products/${product.id}`} className="font-semibold hover:text-primary">{product.name}</Link>
                  <p className="text-sm text-muted-foreground">${product.price.toLocaleString('es-AR')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                    className="w-16 h-9 text-center"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString('es-AR')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceder al Pago</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
