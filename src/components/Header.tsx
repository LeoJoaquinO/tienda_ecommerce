
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, ChevronRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from './ThemeToggle';
import React from 'react';
import { cn } from '@/lib/utils';
import { getCategories } from '@/lib/data';
import type { Category } from '@/lib/types';
import { Separator } from './ui/separator';

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


export default function Header() {
  const { cartCount, setIsSidebarOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchData() {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    }
    fetchData();
  }, []);

  const { categoryTree } = useMemo(() => {
    const categoryMap = new Map<number, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        if (category.parentId) {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
                parent.children.push(categoryWithChildren);
            }
        } else {
            rootCategories.push(categoryWithChildren);
        }
    });

    return { categoryTree: rootCategories };
  }, [categories]);


  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#about', label: 'Sobre Nosotros' },
  ];
  
  const infoLinks = [
    { href: '/pages/garantia', title: 'Garantía', description: 'Conoce nuestras políticas de garantía.' },
    { href: '/pages/preguntas-frecuentes', title: 'Preguntas Frecuentes', description: 'Encuentra respuestas a tus dudas.' },
    { href: '/pages/como-comprar', title: 'Cómo Comprar', description: 'Guía paso a paso para tu compra.' },
  ];
  
  // This function generates the columns for the "Por Marca" mega menu
  const generateBrandColumns = (subcategories: Category[]) => {
      if (!subcategories || subcategories.length === 0) return [];
      const columns = subcategories.reduce((acc, category, index) => {
        const columnIndex = index % 4; // Distribute into 4 columns
        if (!acc[columnIndex]) {
          acc[columnIndex] = [];
        }
        acc[columnIndex].push(category);
        return acc;
      }, [] as Category[][]);
      return columns;
  }

  const MegaMenuContent = () => {
    const perfumesCategory = categoryTree.find(c => c.name === "Perfumes");
    const brandsParent = perfumesCategory?.children.find(c => c.name === "Por Marca");
    const brands = brandsParent?.children ?? [];
    
    const otherMainCategories = categoryTree.filter(c => c.name !== "Perfumes");

    return (
      <NavigationMenuContent>
        <div className="grid grid-cols-4 gap-x-8 p-6 w-[800px] lg:w-[1000px]">
          <div className="col-span-1 flex flex-col space-y-4">
              <h3 className="font-semibold text-lg">{perfumesCategory?.name}</h3>
              <Separator/>
              <ul className="flex flex-col space-y-2">
                {perfumesCategory?.children.map(sub => (
                    <li key={sub.id}>
                       <NavigationMenuLink asChild>
                           <Link href={`/tienda?category=${sub.id}`} className="font-medium text-sm hover:text-primary transition-colors">{sub.name}</Link>
                       </NavigationMenuLink>
                    </li>
                ))}
              </ul>
          </div>
          <div className="col-span-3">
              <h3 className="font-semibold text-lg">Explorar Marcas</h3>
              <Separator className='my-4'/>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  {brands.map(brand => (
                      <NavigationMenuLink asChild key={brand.id}>
                          <Link href={`/tienda?category=${brand.id}`} className="block rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground">
                              {brand.name}
                          </Link>
                      </NavigationMenuLink>
                  ))}
              </div>
          </div>
        </div>
        <Separator/>
        <div className="bg-muted/50 p-6 grid grid-cols-4 gap-x-8">
            {otherMainCategories.map(cat => (
                 <div key={cat.id}>
                    <h3 className="font-semibold mb-2">{cat.name}</h3>
                    <ul className="flex flex-col space-y-1">
                        {cat.children.map(sub => (
                             <li key={sub.id}>
                                <NavigationMenuLink asChild>
                                    <Link href={`/tienda?category=${sub.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{sub.name}</Link>
                                </NavigationMenuLink>
                             </li>
                        ))}
                    </ul>
                 </div>
            ))}
        </div>
      </NavigationMenuContent>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-xl">Joya</span>
          </Link>
           <NavigationMenu>
            <NavigationMenuList>
                {navLinks.map(link => (
                    <NavigationMenuItem key={link.label}>
                      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href={link.href}>
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Tienda</NavigationMenuTrigger>
                    <MegaMenuContent/>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Información</NavigationMenuTrigger>
                    <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px]">
                        {infoLinks.map((link) => (
                           <ListItem key={link.title} href={link.href} title={link.title}>
                                {link.description}
                           </ListItem>
                       ))}
                    </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Abrir menú</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className='w-full max-w-[300px]'>
                <SheetHeader>
                    <SheetTitle>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="font-bold font-headline text-2xl">Joya</span>
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 p-4 text-lg mt-4">
                    {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                    ))}
                     <Link href="/tienda" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                        Tienda
                    </Link>
                    {infoLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                        {link.title}
                    </Link>
                    ))}
                </nav>
            </SheetContent>
            </Sheet>
        </div>
        
        {/* Centered Title on Mobile */}
        <div className="flex-1 flex justify-center md:hidden">
             <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold font-headline text-xl">Joya</span>
             </Link>
        </div>

        <div className="flex items-center justify-end space-x-1 md:flex-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} aria-label="Carrito de compras">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
