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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-2xl shadow-lg border-none">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block relative group">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="aspect-square object-cover w-full transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={product.aiHint}
          />
          {product.salePrice && <Badge className='absolute top-3 left-3 shadow-md' variant="destructive">OFERTA</Badge>}
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-6 bg-card">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="font-headline text-xl hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        {product.salePrice ? (
            <div className='flex items-baseline gap-2 mt-2'>
                <p className="text-3xl font-bold text-primary">
                    ${product.salePrice.toLocaleString('es-AR')}
                </p>
                <p className="text-xl font-medium text-muted-foreground line-through">
                    ${product.price.toLocaleString('es-AR')}
                </p>
            </div>
        ) : (
            <p className="mt-2 text-3xl font-bold text-foreground">
                ${product.price.toLocaleString('es-AR')}
            </p>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 bg-card grid grid-cols-2 gap-4">
        <Button asChild variant="secondary" className="w-full shadow-md">
            <Link href={`/products/${product.id}`}>
                <Eye /> Ver Más
            </Link>
        </Button>
        <Button onClick={() => addToCart(product)} className="w-full shadow-md">
            <ShoppingCart /> Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}
