
"use client";

import Image from 'next/image';
import { AddToCartButton } from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LiveVisitorCounter } from './LiveVisitorCounter';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';

export function ProductPageClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="w-full">
            <Carousel className="w-full">
                <CarouselContent>
                    {product.images.map((img, index) => (
                         <CarouselItem key={index}>
                            <Card className='overflow-hidden'>
                                <CardContent className="p-0 flex aspect-square items-center justify-center">
                                     <Image
                                        src={img}
                                        alt={`${product.name} - image ${index + 1}`}
                                        width={600}
                                        height={600}
                                        className="object-cover w-full h-full"
                                        priority={index === 0}
                                        data-ai-hint={product.aiHint}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className='left-2' />
                <CarouselNext className='right-2'/>
            </Carousel>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{product.description}</p>
          {product.salePrice ? (
            <div className="flex items-baseline gap-4 mt-6">
              <p className="text-4xl font-bold text-primary">${product.salePrice.toLocaleString('es-AR')}</p>
              <p className="text-2xl font-semibold text-muted-foreground line-through">${product.price.toLocaleString('es-AR')}</p>
            </div>
          ) : (
            <p className="mt-6 text-4xl font-bold text-primary">${product.price.toLocaleString('es-AR')}</p>
          )}
          <div className="mt-8 space-y-4">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">En Stock</p>
                </div>
                <AddToCartButton product={product} />
                {product.stock <= 5 && (
                  <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="text-sm font-semibold">¡Quedan pocas unidades!</p>
                  </div>
                )}
                 <LiveVisitorCounter />
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <p className="font-semibold">Sin Stock</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
            <Separator />
            <div className="text-center">
                <h2 className="text-3xl font-headline font-bold">También te podrían interesar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
      )}
    </div>
  );
}
