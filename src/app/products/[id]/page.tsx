import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { AddToCartButton } from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    notFound();
  }
  
  const product: Product | undefined = await getProductById(productId);

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
