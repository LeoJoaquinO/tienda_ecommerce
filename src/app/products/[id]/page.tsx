import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="w-full">
           <div className="aspect-square relative overflow-hidden rounded-lg shadow-lg">
             <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.aiHint}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{product.description}</p>
          <p className="mt-6 text-4xl font-bold text-primary">${product.price.toLocaleString('es-AR')}</p>
          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Stock: {product.stock} unidades</p>
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold font-headline mb-6 text-center">También te podría interesar</h2>
        <Suspense fallback={<RecommendationSkeleton />}>
          <ProductRecommendations currentProductId={product.id} />
        </Suspense>
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
            ))}
        </div>
    )
}
