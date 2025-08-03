
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
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
import { getProducts } from '@/lib/products';
import { Product } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';


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
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchCategories() {
      const products: Product[] = await getProducts();
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      setCategories(uniqueCategories);
    }
    fetchCategories();
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#about', label: 'Sobre Nosotros' },
  ];
  
  const infoLinks = [
    { href: '/pages/garantia', title: 'Garantía', description: 'Conoce nuestras políticas de garantía.' },
    { href: '/pages/preguntas-frecuentes', title: 'Preguntas Frecuentes', description: 'Encuentra respuestas a tus dudas.' },
    { href: '/pages/como-comprar', title: 'Cómo Comprar', description: 'Guía paso a paso para tu compra.' },
  ];

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
                        <Link href={link.href} legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            {link.label}
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Tienda</NavigationMenuTrigger>
                    <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        <li className="row-span-3">
                            <NavigationMenuLink asChild>
                                <a
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href="/tienda"
                                >
                                <div className="mb-2 mt-4 text-lg font-medium">
                                    Todos los Productos
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                    Explora nuestro catálogo completo de fragancias y joyas.
                                </p>
                                </a>
                            </NavigationMenuLink>
                        </li>
                       {categories.map((category) => (
                           <ListItem key={category} href={`/tienda?category=${category}`} title={category}>
                           </ListItem>
                       ))}
                    </ul>
                    </NavigationMenuContent>
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
