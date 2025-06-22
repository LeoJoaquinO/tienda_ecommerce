import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const products = getProducts();
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-5xl font-headline font-bold text-foreground sm:text-6xl lg:text-7xl">
          Elegancia Atemporal
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Descubre piezas únicas que cuentan una historia. Joyería artesanal para el alma moderna.
        </p>
        <Button asChild size="lg" className="mt-8">
            <Link href="#featured">Ver Colección</Link>
        </Button>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="space-y-8">
        <div className="text-center">
            <h2 className="text-4xl font-headline font-bold">Productos Destacados</h2>
            <p className="mt-2 text-muted-foreground">Nuestra selección especial, elegida para ti.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-secondary p-8 md:p-12 rounded-lg">
        <div>
            <h2 className="text-4xl font-headline font-bold">Sobre Nosotros</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
                En Joya, creemos que cada pieza de joyería es una forma de arte y una expresión personal. Nacimos de la pasión por el diseño y la artesanía, creando joyas que no solo adornan, sino que también inspiran.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
                Utilizamos materiales de la más alta calidad y técnicas tradicionales para dar vida a diseños contemporáneos y atemporales. Cada creación es un tesoro destinado a ser amado por generaciones.
            </p>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
             <Image 
                src="https://placehold.co/600x600" 
                alt="Taller de Joyería" 
                fill
                className="object-cover"
                data-ai-hint="jewelry workshop"
            />
        </div>
      </section>
    </div>
  );
}
