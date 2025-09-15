
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';
import { Percent, Tag, Search, ListFilter, ChevronRight } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TiendaPageClientProps {
  allProducts: Product[];
  allCategories: Category[];
  offerProducts: Product[];
}

export function TiendaPageClient({ allProducts, allCategories, offerProducts }: TiendaPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for the currently applied filters
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('category') || 'All');
  const searchQuery = searchParams.get('q') || '';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';

  // State for the filters selected in the UI, before applying
  const [pendingCategory, setPendingCategory] = useState<string>(activeCategory);
  const [pendingMinPrice, setPendingMinPrice] = useState<string>(activeMinPrice);
  const [pendingMaxPrice, setPendingMaxPrice] = useState<string>(activeMaxPrice);

  useEffect(() => {
    // When URL changes, update both active and pending filters
    const category = searchParams.get('category') || 'All';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    
    setActiveCategory(category);
    setPendingCategory(category);
    setPendingMinPrice(minPrice);
    setPendingMaxPrice(maxPrice);
  }, [searchParams]);

  const { categoryTree } = useMemo(() => {
    const tree: (Category & { children: Category[] })[] = [];
    const map = new Map<number, Category & { children: Category[] }>();

    const items = allCategories.map(category => ({ ...category, children: [] as Category[] }));
    
    items.forEach(category => map.set(category.id, category));

    items.forEach(category => {
        if (category.parentId) {
            const parent = map.get(category.parentId);
            if (parent) parent.children.push(category);
        } else {
            tree.push(category);
        }
    });
    return { categoryTree: tree };
  }, [allCategories]);


  const handleApplyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (pendingCategory === 'All') current.delete('category');
    else current.set('category', pendingCategory);

    if (pendingMinPrice) current.set('minPrice', pendingMinPrice);
    else current.delete('minPrice');

    if (pendingMaxPrice) current.set('maxPrice', pendingMaxPrice);
    else current.delete('maxPrice');
    
    // q param should persist
    if (searchQuery) current.set('q', searchQuery);
    else current.delete('q');


    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/tienda${query}#products-grid`, { scroll: false });
  };
  
  const filteredProducts = useMemo(() => {
    let items = allProducts;
    const min = parseFloat(activeMinPrice);
    const max = parseFloat(activeMaxPrice);

    if (searchQuery) {
        items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (activeCategory !== 'All') {
        const catId = Number(activeCategory);
        items = items.filter(p => p.categoryIds.includes(catId));
    }
    
    if (!isNaN(min)) {
        items = items.filter(p => (p.salePrice ?? p.price) >= min);
    }
    if (!isNaN(max) && max > 0) {
        items = items.filter(p => (p.salePrice ?? p.price) <= max);
    }

    return items;
  }, [allProducts, searchQuery, activeCategory, activeMinPrice, activeMaxPrice]);

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

      <section id="products-grid" className="scroll-mt-24">
         <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-4">
              <Tag className="w-10 h-10 text-primary" />
              <h2 className="text-4xl font-headline font-bold">Todos los Productos</h2>
            </div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1 space-y-6 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><ListFilter className="w-5 h-5"/> Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Price Filter */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Rango de Precios</h3>
                            <div className='flex gap-2 items-center'>
                                <Input 
                                    type="number" 
                                    placeholder='Desde' 
                                    value={pendingMinPrice} 
                                    onChange={(e) => setPendingMinPrice(e.target.value)}
                                    aria-label="Precio mínimo"
                                />
                                <span>-</span>
                                <Input 
                                    type="number" 
                                    placeholder='Hasta' 
                                    value={pendingMaxPrice} 
                                    onChange={(e) => setPendingMaxPrice(e.target.value)}
                                    aria-label="Precio máximo"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Category Filter */}
                        <div className="space-y-2">
                           <h3 className="font-semibold">Categorías</h3>
                           <nav className="space-y-1">
                             <button
                                onClick={() => setPendingCategory('All')}
                                className={cn(
                                    "w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                    pendingCategory === 'All' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                                )}
                             >
                                Todos los Productos
                             </button>
                             {categoryTree.map(parentCat => (
                                <div key={parentCat.id}>
                                    <h4 className="px-3 pt-2 text-sm font-bold text-muted-foreground">{parentCat.name}</h4>
                                    <div className='pl-2'>
                                    {parentCat.children.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => setPendingCategory(String(category.id))}
                                            className={cn(
                                                "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2",
                                                pendingCategory === String(category.id) ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-accent/50'
                                            )}
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                            {category.name}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                             ))}
                           </nav>
                        </div>
                        <Button onClick={handleApplyFilters} className='w-full'>
                            Aplicar Filtros
                        </Button>
                    </CardContent>
                </Card>
            </aside>

            {/* Products Grid */}
            <main className="lg:col-span-3">
              {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
              ) : (
                 <Card className="text-center py-24 col-span-full">
                    <CardContent>
                        <Search className="w-16 h-16 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-xl font-semibold text-muted-foreground">No se encontraron productos</p>
                        <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros de búsqueda.</p>
                    </CardContent>
                </Card>
              )}
            </main>
         </div>
      </section>
    </div>
  );
}


    