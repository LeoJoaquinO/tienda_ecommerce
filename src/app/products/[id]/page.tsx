
"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { AddToCartButton } from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';
import { AlertTriangle, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

function LiveVisitorCounter() {
    const [viewers, setViewers] = useState(0);

    useEffect(() => {
        const randomViewers = Math.floor(Math.random() * (45 - 8 + 1)) + 8;
        setViewers(randomViewers);

        const interval = setInterval(() => {
            setViewers(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const newViewers = prev + change;
                return Math.max(5, newViewers);
            });
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    if (viewers === 0) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 animate-pulse">
            <Eye className="h-5 w-5" />
            <p className="font-semibold">{viewers} personas están viendo este artículo</p>
        </div>
    );
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
        const productId = parseInt(params.id, 10);
        if (isNaN(productId)) {
            notFound();
            return;
        }
        try {
            const fetchedProduct = await getProductById(productId);
            if (!fetchedProduct) {
                notFound();
            } else {
                setProduct(fetchedProduct);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
            // Optionally, handle error state
        } finally {
            setIsLoading(false);
        }
    };
    fetchProduct();
  }, [params.id]);
  
  if (isLoading) {
    return <div>Cargando...</div>; // Or a skeleton loader
  }

  if (!product) {
    notFound();
  }

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
    </div>
  );
}
