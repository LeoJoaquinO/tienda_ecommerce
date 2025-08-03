"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';
import { Separator } from '@/components/ui/separator';
import { Percent, Tag, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function CategoryFilters({ categories, selected, onSelect, disabled }: { categories: string[], selected: string, onSelect: (category: string) => void, disabled: boolean }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            <Button
                variant={selected === 'All' ? 'default' : 'outline'}
                onClick={() => onSelect('All')}
                disabled={disabled}
                className="rounded-full"
            >
                Todos
            </Button>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selected === category ? 'default' : 'outline'}
                    onClick={() => onSelect(category)}
                    disabled={disabled}
                    className="rounded-full"
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}


export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
            
            const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Optionally, set an error state here to show a message to the user
        }
        setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const offerProducts = products.filter(p => p.salePrice && p.salePrice > 0);
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

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
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : offerProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {offerProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                  ))}
              </div>
          ) : (
              <p className="mt-8 text-muted-foreground">No hay ofertas especiales en este momento.</p>
          )}
      </section>

      <Separator />

      <section className="space-y-8">
          <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-4">
                <Tag className="w-10 h-10 text-primary" />
                <h2 className="text-4xl font-headline font-bold">Todos los Productos</h2>
              </div>
              <p className="mt-2 text-muted-foreground">Explora nuestro catálogo completo.</p>
              <CategoryFilters categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} disabled={isLoading}/>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
              </div>
          ) : (
              <p className="text-center text-muted-foreground pt-8">No se encontraron productos en esta categoría.</p>
          )}
      </section>
    </div>
  );
}
