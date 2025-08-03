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
import { Instagram, MapPin } from 'lucide-react';

export default async function Home() {
    const products: Product[] = await getProducts();
    const featuredProducts = products.filter(p => p.featured);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative text-center py-24 md:py-36 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 z-0">
                    <Image
                        src="https://i.pinimg.com/originals/a0/90/a9/a090a9442a5c5a7566a9d1d1f67b844f.jpg"
                        alt="Fondo de Joyería de Lujo"
                        fill
                        className="object-cover"
                        data-ai-hint="abstract geometric"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-headline font-bold text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                        Elegancia Atemporal
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-100 drop-shadow-md">
                        Descubre piezas únicas que cuentan una historia. Joyería artesanal para el alma moderna.
                    </p>
                    <Button asChild size="lg" className="mt-8 shadow-lg">
                        <Link href="/tienda">Ver Colección</Link>
                    </Button>
                </div>
            </section>

            {/* Featured Products Section */}
            <section id="featured" className="space-y-8 py-16">
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
                        className="w-full max-w-6xl mx-auto"
                    >
                    <CarouselContent>
                        {featuredProducts.map((product) => (
                        <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-2">
                            <ProductCard product={product} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className='hidden sm:flex' />
                    <CarouselNext className='hidden sm:flex' />
                    </Carousel>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No hay productos destacados para mostrar.</p>
                    </div>
                )}
            </section>

            <Separator className="w-1/2 mx-auto"/>

            {/* About Us Section */}
            <section className="grid md:grid-cols-2 gap-12 items-center py-16">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                     <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.45344445679!2d-58.503338254488!3d-34.6158237244917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90cbd%3A0xa0b3812e88e88e87!2sBuenos%20Aires%2C%20CABA%2C%20Argentina!5e0!3m2!1sen!2sus!4v1718042456479!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de la tienda"
                        className='grayscale hover:grayscale-0 transition-all duration-500'
                    ></iframe>
                </div>
                <div className='space-y-6'>
                    <h2 className="text-4xl font-headline font-bold">Sobre Nosotros</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        En Joya, creemos que cada pieza de joyería es una forma de arte y una expresión personal. Nacimos de la pasión por el diseño y la artesanía, creando joyas que no solo adornan, sino que también inspiran.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Utilizamos materiales de la más alta calidad y técnicas tradicionales para dar vida a diseños contemporáneos y atemporales. Cada creación es un tesoro destinado a ser amado por generaciones.
                    </p>
                    <div className='flex gap-4'>
                         <Button asChild className="shadow-md">
                            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <Instagram className="mr-2" /> Síguenos en Instagram
                            </Link>
                        </Button>
                         <Button asChild variant="outline" className="shadow-md">
                            <Link href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2" /> Visítanos
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
