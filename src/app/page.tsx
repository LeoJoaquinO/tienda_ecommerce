import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel";
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const products = getProducts();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
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

      <Separator />

      {/* Featured Products Section */}
      <section id="featured" className="space-y-8 py-12 bg-secondary/50 rounded-lg">
        <div className="text-center">
            <h2 className="text-4xl font-headline font-bold">Productos Destacados</h2>
            <p className="mt-2 text-muted-foreground">Nuestra selección especial, elegida para ti.</p>
        </div>
        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='hidden sm:flex' />
          <CarouselNext className='hidden sm:flex' />
        </Carousel>
      </section>

      <Separator />

      {/* About Us Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center p-8 md:p-12 rounded-lg">
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
