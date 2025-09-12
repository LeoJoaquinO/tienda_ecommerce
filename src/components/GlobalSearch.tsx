
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function GlobalSearch({ allProducts }: { allProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearchTerm && isFocused) {
      const filtered = allProducts
        .filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm, allProducts, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm) return;

    const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
    currentQuery.set('q', searchTerm);
    
    const search = currentQuery.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`/tienda${query}#products-grid`);
    setIsFocused(false);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestionName: string) => {
    setSearchTerm(suggestionName);
    const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
    currentQuery.set('q', suggestionName);
    const search = currentQuery.toString();
    const query = search ? `?${search}` : '';
    router.push(`/tienda${query}#products-grid`);
    setIsFocused(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-sm" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10 w-full"
          aria-label="Buscar productos"
          autoComplete="off"
        />
      </form>
      {suggestions.length > 0 && (
        <div className={cn(
            "absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-20 overflow-hidden",
            "animate-in fade-in-0 zoom-in-95"
        )}>
          <ul className="py-1">
            {suggestions.map(product => (
              <li key={product.id}>
                <button
                  onClick={() => handleSuggestionClick(product.name)}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
