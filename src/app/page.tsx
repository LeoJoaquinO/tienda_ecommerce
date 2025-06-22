import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export default function Home() {
  const products = getProducts();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground sm:text-5xl lg:text-6xl">
          Nuestra Colección
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Descubre productos únicos, seleccionados para ti.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
