
"use client";

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';
import { Percent, Tag, Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface TiendaPageClientProps {
  allProducts: Product[];
  allCategories: string[];
  offerProducts: Product[];
}

export function TiendaPageClient({ allProducts, allCategories, offerProducts }: TiendaPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
      let items = allProducts;

      if (searchQuery) {
          items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      if (selectedCategory !== 'All') {
          items = items.filter(p => p.category === selectedCategory);
      }

      return items;
  }, [allProducts, searchQuery, selectedCategory]);

  const productsGroupedByCategory = useMemo(() => {
    if (selectedCategory !== 'All') {
      return null;
    }
    return filteredProducts.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, selectedCategory]);

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
          {offerProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {offerProducts.slice(0, 3).map((product) => (
                      <ProductCard key={product.id} product={product} />
                  ))}
              </div>
          ) : (
              <p className="mt-8 text-muted-foreground">No hay ofertas especiales en este momento.</p>
          )}
      </section>

      <Separator />

      <section className="space-y-8">
          <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-4">
                <Tag className="w-10 h-10 text-primary" />
                <h2 className="text-4xl font-headline font-bold">Todos los Productos</h2>
              </div>
               <div className="relative w-full max-w-lg mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Buscar por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
              <CategoryFilters categories={allCategories} selected={selectedCategory} onSelect={setSelectedCategory} disabled={false}/>
          </div>
          
          {productsGroupedByCategory ? (
              <div className="space-y-12">
                {Object.entries(productsGroupedByCategory).map(([category, catProducts]) => (
                  <div key={category}>
                    <h3 className="text-2xl font-bold font-headline mb-4">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {catProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
              </div>
          ) : (
              <p className="text-center text-muted-foreground pt-8">No se encontraron productos que coincidan con tu búsqueda.</p>
          )}
      </section>
    </div>
  );
}
