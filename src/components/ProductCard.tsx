
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { Eye, ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl shadow-lg border">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block relative group">
          <div className="w-full aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="aspect-square object-cover w-full transition-transform duration-500 group-hover:scale-105"
              data-ai-hint={product.aiHint}
            />
          </div>
          {product.salePrice && <Badge className='absolute top-3 left-3 shadow-md' variant="destructive">OFERTA</Badge>}
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className='p-2 bg-background/80 rounded-full'>
                    <Eye className='text-foreground' />
                </div>
           </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4 bg-card">
        <Link href={`/products/${product.id}`} className='group'>
          <CardTitle className="font-headline text-lg hover:text-primary transition-colors leading-tight">{product.name}</CardTitle>
        </Link>
        {product.salePrice ? (
            <div className='flex items-baseline gap-2 mt-2'>
                <p className="text-2xl font-bold text-primary">
                    ${product.salePrice.toLocaleString('es-AR')}
                </p>
                <p className="text-lg font-medium text-muted-foreground line-through">
                    ${product.price.toLocaleString('es-AR')}
                </p>
            </div>
        ) : (
            <p className="mt-2 text-2xl font-bold text-foreground">
                ${product.price.toLocaleString('es-AR')}
            </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 bg-card">
        <Button onClick={() => addToCart(product)} className="w-full shadow-md">
            <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}

    