"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Tienda' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-xl">Tienda Simple</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
             <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="font-bold font-headline text-xl">Tienda Simple</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 p-4 text-lg">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here later */}
          </div>
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="Carrito de compras">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
