

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

function CategoryFilters({ categories, selected, onSelect, disabled, title }: { categories: Category[], selected: string, onSelect: (category: string) => void, disabled: boolean, title?: string }) {
    if (categories.length === 0) return null;
    return (
        <div className="flex flex-wrap justify-center items-center gap-2">
             {title && <p className="text-sm font-medium text-muted-foreground mr-2">{title}</p>}
            <Button
                variant={selected === 'All' || !categories.some(c => String(c.id) === selected) ? 'default' : 'outline'}
                onClick={() => onSelect('All')}
                disabled={disabled}
                className="rounded-full"
            >
                Todos
            </Button>
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
  
  const { categoryMap, parentCategories, subCategories } = useMemo(() => {
    const map = new Map<number, Category>();
    const parents: Category[] = [];
    const childrenMap = new Map<number, Category[]>();

    allCategories.forEach(c => {
        map.set(c.id, c);
        if (c.parentId === null) {
            parents.push(c);
        }
    });

    allCategories.forEach(c => {
        if (c.parentId) {
            const parentChildren = childrenMap.get(c.parentId) ?? [];
            parentChildren.push(c);
            childrenMap.set(c.parentId, parentChildren);
        }
    });
    
    return { categoryMap: map, parentCategories: parents, subCategories: childrenMap };
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

  const activeSubCategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    
    const catId = Number(selectedCategory);
    const cat = categoryMap.get(catId);
    if (!cat) return [];

    // If it's a parent category, return its direct children
    if (!cat.parentId) {
      return subCategories.get(catId) ?? [];
    }

    // If it's a child category, return its siblings (children of its parent)
    if (cat.parentId) {
      return subCategories.get(cat.parentId) ?? [];
    }

    return [];
  }, [selectedCategory, categoryMap, subCategories]);

  const activeParentId = useMemo(() => {
    if (selectedCategory === 'All') return 'All';
    const catId = Number(selectedCategory);
    const cat = categoryMap.get(catId);
    return String(cat?.parentId ?? cat?.id ?? 'All');
  }, [selectedCategory, categoryMap]);
  
  const handleParentCategorySelect = (categoryId: string) => {
      setSelectedCategory(categoryId);
  };
  
  const handleSubCategorySelect = (categoryId: string) => {
      setSelectedCategory(categoryId);
  };

  const filteredProducts = useMemo(() => {
      let items = allProducts;

      if (searchQuery) {
          items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      if (selectedCategory !== 'All') {
          const catId = Number(selectedCategory);
          const category = categoryMap.get(catId);
          if (category) {
              const idsToFilter = [catId, ...(subCategories.get(catId) ?? []).map(c => c.id)];
              items = items.filter(p => p.categoryIds.some(id => idsToFilter.includes(id)));
          }
      }
      
      items = items.filter(p => {
          const price = p.salePrice ?? p.price;
          return price >= priceRange[0] && price <= priceRange[1];
      });

      return items;
  }, [allProducts, searchQuery, selectedCategory, priceRange, categoryMap, subCategories]);

  const productsGroupedByCategory = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) {
      return null;
    }
    return parentCategories.reduce((acc, category) => {
        const productsInCategory = filteredProducts.filter(p => p.categoryIds.includes(category.id));
        if (productsInCategory.length > 0) {
            acc[category.name] = productsInCategory;
        }
        return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, selectedCategory, parentCategories, searchQuery, priceRange, maxPrice]);

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

              <div className="space-y-4">
                <CategoryFilters 
                    categories={parentCategories} 
                    selected={activeParentId} 
                    onSelect={handleParentCategorySelect} 
                    disabled={false}
                />
                 {activeSubCategories.length > 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <CategoryFilters
                            categories={activeSubCategories}
                            selected={selectedCategory}
                            onSelect={handleSubCategorySelect}
                            disabled={false}
                        />
                    </div>
                )}
              </div>
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
             <Card className="text-center py-16">
                <p className="text-xl font-semibold text-muted-foreground">No se encontraron productos</p>
                <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros de búsqueda.</p>
            </Card>
          )}
      </section>
    </div>
  );
}
