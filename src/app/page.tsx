import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
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
import { Instagram } from 'lucide-react';

export default async function Home() {
    const products: Product[] = await getProducts();
    const featuredProducts = products.filter(p => p.featured);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative text-center py-20 md:py-32 rounded-lg overflow-hidden">
                 <div className="absolute inset-0 z-0">
                    <Image
                        src="https://lh3.googleusercontent.com/gg-dl/AJfQ9KQ4gG4viVsKkXup69RJNwHnI-zhtYOnFySsrBLEQQ6GrkI9Zk7OcQqiUHFqxF_qmnbq2HH-RqEN2MGztAZEC3nyP3YMBu_t4v7xkTR_Jw0gQzu4NVj7PzhOOEef8zAiNS5NcutgogsRMmZ8qGCOrzVnX5JQB5RSMxG_2nt1BzwwuAkRVw=s1024"
                        alt="Fondo de Joyería"
                        fill
                        className="object-cover"
                        data-ai-hint="jewelry background"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-headline font-bold text-white sm:text-6xl lg:text-7xl">
                        Elegancia Atemporal
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-200">
                        Descubre piezas únicas que cuentan una historia. Joyería artesanal para el alma moderna.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/tienda">Ver Colección</Link>
                    </Button>
                </div>
            </section>

            <Separator />

            {/* Featured Products Section */}
            <section id="featured" className="space-y-8 py-12 bg-secondary/50 rounded-lg">
                <div className="text-center">
                    <h2 className="text-4xl font-headline font-bold">Productos Destacados</h2>
                    <p className="mt-2 text-muted-foreground">Nuestra selección especial, elegida para ti.</p>
                </div>
                {featuredProducts.length > 0 ? (
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
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No hay productos destacados para mostrar.</p>
                    </div>
                )}
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
                     <Button asChild className="mt-6">
                        <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <Instagram className="mr-2" /> Síguenos en Instagram
                        </Link>
                    </Button>
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.45344445679!2d-58.503338254488!3d-34.6158237244917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90cbd%3A0xa0b3812e88e88e87!2sBuenos%20Aires%2C%20CABA%2C%20Argentina!5e0!3m2!1sen!2sus!4v1718042456479!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de la tienda"
                    ></iframe>
                </div>
            </section>
        </div>
    );
}
