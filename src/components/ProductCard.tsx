
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { Eye, ShoppingCart, Ban } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasStock = product.stock > 0;

  return (
    <Card className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl shadow-lg border",
        !hasStock && "opacity-50"
    )}>
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className={cn("block relative group", !hasStock && "pointer-events-none")}>
          <div className={cn("w-full aspect-square overflow-hidden", !hasStock && "filter grayscale")}>
            <Image
              src={product.images[0] ?? 'https://placehold.co/600x600.png'}
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
        <Link href={`/products/${product.id}`} className={cn('group', !hasStock && "pointer-events-none")}>
          <CardTitle className="font-headline text-lg hover:text-primary transition-colors leading-tight">{product.name}</CardTitle>
        </Link>
        {product.shortDescription && <CardDescription className="mt-1 text-sm">{product.shortDescription}</CardDescription>}
        
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
        <Button onClick={() => addToCart(product)} className="w-full shadow-md" disabled={!hasStock}>
            {hasStock ? <><ShoppingCart className="mr-2 h-4 w-4" /> Añadir al Carrito</> : <><Ban className="mr-2 h-4 w-4" />Sin Stock</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
