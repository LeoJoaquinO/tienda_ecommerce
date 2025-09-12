
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // This effect ensures that if the user types something and then clears it,
    // the URL query parameter is also cleared.
    // It also handles the initial search from the navbar.
    const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));

    if (debouncedSearchTerm) {
      currentQuery.set('q', debouncedSearchTerm);
    } else {
      currentQuery.delete('q');
    }
    
    // We only want to push to the router if we are already on the /tienda page.
    // Otherwise, the form's onSubmit will handle the initial navigation.
    if(window.location.pathname === '/tienda') {
        const search = currentQuery.toString();
        const query = search ? `?${search}` : '';
        // Append the hash to scroll to the products grid
        router.push(`/tienda${query}#products-grid`);
    }

  }, [debouncedSearchTerm, router, searchParams]);
  
  useEffect(() => {
    // When URL query `q` changes (e.g. back/forward navigation), update the input.
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);


  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (searchTerm) {
        currentQuery.set('q', searchTerm);
    } else {
        currentQuery.delete('q');
    }

    const search = currentQuery.toString();
    const query = search ? `?${search}` : '';
    
    // Append the hash to scroll to the products grid
    router.push(`/tienda${query}#products-grid`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-full"
        aria-label="Buscar productos"
      />
    </form>
  );
}

    