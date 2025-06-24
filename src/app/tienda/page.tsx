import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';
import { Separator } from '@/components/ui/separator';
import { Percent } from 'lucide-react';

export default async function TiendaPage() {
  const products = await getProducts();
  const offerProducts = products.filter(p => p.salePrice && p.salePrice > 0);

  return (
    <div className="space-y-12">
      <section className="text-center bg-secondary/50 p-8 rounded-lg">
        <div className="flex justify-center items-center gap-4">
            <Percent className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-foreground sm:text-5xl">
                Ofertas Especiales
            </h1>
        </div>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
            ¡Aprovecha nuestros descuentos exclusivos por tiempo limitado!
        </p>
        {offerProducts.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {offerProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
             </div>
        )}
      </section>

      <Separator />

      <section className="space-y-8">
        <div className="text-center">
            <h2 className="text-4xl font-headline font-bold">Todos los Productos</h2>
            <p className="mt-2 text-muted-foreground">Explora nuestro catálogo completo.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
