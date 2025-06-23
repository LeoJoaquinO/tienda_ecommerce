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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block relative">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="aspect-square object-cover w-full"
            data-ai-hint={product.aiHint}
          />
          {product.salePrice && <Badge className='absolute top-2 left-2' variant="destructive">OFERTA</Badge>}
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="font-headline text-lg hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        {product.salePrice ? (
            <div className='flex items-baseline gap-2 mt-2'>
                <p className="text-2xl font-semibold text-primary">
                    ${product.salePrice.toLocaleString('es-AR')}
                </p>
                <p className="text-lg font-medium text-muted-foreground line-through">
                    ${product.price.toLocaleString('es-AR')}
                </p>
            </div>
        ) : (
            <p className="mt-2 text-2xl font-semibold text-foreground">
                ${product.price.toLocaleString('es-AR')}
            </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button asChild variant="secondary" className="w-full">
            <Link href={`/products/${product.id}`}>
                <Eye /> Ver
            </Link>
        </Button>
        <Button onClick={() => addToCart(product)} className="w-full">
            <ShoppingCart /> Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}
