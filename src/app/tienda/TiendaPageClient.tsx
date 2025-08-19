
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';
import { Percent, Tag, Search, DollarSign } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function CategoryFilters({ categories, selected, onSelect, disabled }: { categories: Category[], selected: string, onSelect: (category: string) => void, disabled: boolean }) {
    if (categories.length === 0) return null;
    return (
        <div className="flex flex-wrap justify-center items-center gap-2">
            {categories.map((category) => (
                <Button
                    key={category.id}
                    variant={selected === String(category.id) ? 'default' : 'outline'}
                    onClick={() => onSelect(String(category.id))}
                    disabled={disabled}
                    className="rounded-full"
                >
                    {category.name}
                </Button>
            ))}
        </div>
    )
}

interface TiendaPageClientProps {
  allProducts: Product[];
  allCategories: Category[];
  offerProducts: Product[];
}

export function TiendaPageClient({ allProducts, allCategories, offerProducts }: TiendaPageClientProps) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { categoryTree } = useMemo(() => {
    const tree: (Category & { children: Category[] })[] = [];
    const map = new Map<number, Category & { children: Category[] }>();

    const items = allCategories.map(category => ({ ...category, children: [] as Category[] }));
    
    items.forEach(category => {
        map.set(category.id, category);
    });

    items.forEach(category => {
        if (category.parentId) {
            const parent = map.get(category.parentId);
            if (parent) {
                parent.children.push(category);
            }
        } else {
            tree.push(category);
        }
    });

    return { categoryTree: tree };
  }, [allCategories]);

  const maxPrice = useMemo(() => {
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 100) * 100;
  }, [allProducts]);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);
  
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && allCategories.some(c => String(c.id) === categoryFromUrl)) {
        setSelectedCategory(categoryFromUrl);
    } else {
        setSelectedCategory('All');
    }
  }, [searchParams, allCategories]);

  const handleCategorySelect = (categoryId: string) => {
      setSelectedCategory(categoryId);
  };
  
  const filteredProducts = useMemo(() => {
      let items = allProducts;

      if (searchQuery) {
          items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      if (selectedCategory !== 'All') {
          const catId = Number(selectedCategory);
          const categoryMap = new Map(allCategories.map(c => [c.id, c]));
          const subCategoriesMap = allCategories.reduce((acc, cat) => {
              if (cat.parentId) {
                  if (!acc.has(cat.parentId)) acc.set(cat.parentId, []);
                  acc.get(cat.parentId)!.push(cat);
              }
              return acc;
          }, new Map<number, Category[]>());
          
          const category = categoryMap.get(catId);
          if (category) {
              const idsToFilter = [catId, ...(subCategoriesMap.get(catId) ?? []).map(c => c.id)];
              items = items.filter(p => p.categoryIds.some(id => idsToFilter.includes(id)));
          }
      }
      
      items = items.filter(p => {
          const price = p.salePrice ?? p.price;
          return price >= priceRange[0] && price <= priceRange[1];
      });

      return items;
  }, [allProducts, searchQuery, selectedCategory, priceRange, allCategories]);

  const productsGroupedByCategory = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) {
      return null;
    }
    return categoryTree.reduce((acc, category) => {
        const productsInCategory = filteredProducts.filter(p => p.categoryIds.includes(category.id) || category.children.some(child => p.categoryIds.includes(child.id)));
        if (productsInCategory.length > 0) {
            acc[category.name] = productsInCategory;
        }
        return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, selectedCategory, categoryTree, searchQuery, priceRange, maxPrice]);

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

      <section id="products-grid" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-8">
              <div className="flex justify-center items-center gap-4">
                <Tag className="w-10 h-10 text-primary" />
                <h2 className="text-4xl font-headline font-bold">Todos los Productos</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto items-center">
                  <div className="relative w-full lg:col-span-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          type="search"
                          placeholder="Buscar por nombre..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                      />
                  </div>
                  <div className="w-full lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center text-muted-foreground font-medium">
                          <label htmlFor="price-range" className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Rango de Precios:</label>
                          <span>${priceRange[0].toLocaleString('es-AR')} - ${priceRange[1].toLocaleString('es-AR')}</span>
                      </div>
                      <Slider
                        id="price-range"
                        min={0}
                        max={maxPrice}
                        step={100}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="w-full"
                      />
                  </div>
              </div>

              <div className="space-y-6">
                <Button
                    variant={selectedCategory === 'All' ? 'default' : 'outline'}
                    onClick={() => handleCategorySelect('All')}
                    className="rounded-full"
                >
                    Todos los Productos
                </Button>
                {categoryTree.map(parentCat => (
                  <div key={parentCat.id} className="space-y-3">
                      <h3 className="font-headline text-2xl font-semibold">{parentCat.name}</h3>
                      <CategoryFilters
                          categories={parentCat.children}
                          selected={selectedCategory}
                          onSelect={handleCategorySelect}
                          disabled={false}
                      />
                  </div>
                ))}
              </div>
          </div>
          
          {productsGroupedByCategory && selectedCategory === 'All' ? (
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
             <Card className="text-center py-16">
                <p className="text-xl font-semibold text-muted-foreground">No se encontraron productos</p>
                <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros de búsqueda.</p>
            </Card>
          )}
      </section>
    </div>
  );
}
