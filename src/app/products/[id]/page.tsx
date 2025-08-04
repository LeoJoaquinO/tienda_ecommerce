
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { AddToCartButton } from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';
import { AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LiveVisitorCounter } from './LiveVisitorCounter';
import { ProductPageClient } from './ProductPageClient';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
      notFound();
  }
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}
