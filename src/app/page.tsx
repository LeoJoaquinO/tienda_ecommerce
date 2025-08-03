

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

    const carouselSlides = [
        {
            image: "https://images.augustman.com/wp-content/uploads/sites/2/2022/10/18172157/BURBERRY_BEAUTY_2022_FRAGRANCE_HERO_EDP_STILL_LIFE_JPG_RGB_08_16x9-min-scaled.jpg",
            title: "Elegancia Atemporal",
            description: "Descubre piezas únicas que cuentan una historia. Joyería artesanal para el alma moderna.",
            buttonText: "Ver Colección",
            buttonLink: "/tienda",
            aiHint: "luxury perfume bottle",
        },
        {
            image: "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTA5L3Jhd3BpeGVsb2ZmaWNlNl9waG90b19vZl9taW5pbWFsX21lbl9wZXJmdW1lX2JvdHRsZV9vbl9zYW5kX2hpbF8wN2FkN2UzYy03NWEyLTQzZDQtYTc1Yi00MGM5ZmU5NTgxY2UucG5n.png",
            title: "Ofertas Exclusivas",
            description: "Aprovecha descuentos de hasta 20% en fragancias seleccionadas. ¡No te lo pierdas!",
            buttonText: "Comprar Ahora",
            buttonLink: "/tienda",
            aiHint: "perfume on sand",
        },
        {
            image: "https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-taobao-perfume-promotes-fresh-blue-banner-image_175994.jpg",
            title: "Descubre tu Esencia",
            description: "Nuevas fragancias que capturan la frescura del océano y la calidez del verano.",
            buttonText: "Explorar Novedades",
            buttonLink: "/tienda",
            aiHint: "blue perfume ad",
        }
    ]

    return (
        <div className="space-y-16">
            {/* Hero Carousel Section */}
            <section>
                 <Carousel
                    opts={{ loop: true }}
                    className="w-full"
                 >
                    <CarouselContent>
                        {carouselSlides.map((slide, index) => (
                             <CarouselItem key={index}>
                                <div className="relative text-center h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-4">
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={slide.aiHint}
                                            priority={index === 0}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                                    </div>
                                    <div className="relative z-10 text-white max-w-4xl mx-auto">
                                        <h1 className="text-5xl font-headline font-bold sm:text-6xl lg:text-7xl drop-shadow-lg">
                                            {slide.title}
                                        </h1>
                                        <p className="mt-4 text-lg text-slate-100 drop-shadow-md">
                                            {slide.description}
                                        </p>
                                        <Button asChild size="lg" className="mt-8 shadow-lg">
                                            <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
                 </Carousel>
            </section>

            {/* Featured Products Section */}
            <section id="featured" className="space-y-8">
                <div className="text-center">
                    <h2 className="text-4xl font-headline font-bold">Productos Destacados</h2>
                    <p className="mt-2 text-muted-foreground">Nuestra selección especial, elegida para ti.</p>
                </div>
                {featuredProducts.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No hay productos destacados para mostrar.</p>
                    </div>
                )}
            </section>

            <Separator className="w-1/2 mx-auto"/>

            {/* About Us Section */}
            <section id="about" className="grid md:grid-cols-2 gap-12 items-center py-16">
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
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        En Joya, creemos que cada pieza de joyería es una forma de arte y una expresión personal. Nacimos de la pasión por el diseño y la artesanía, creando joyas que no solo adornan, sino que también inspiran.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        Utilizamos materiales de la más alta calidad y técnicas tradicionales para dar vida a diseños contemporáneos y atemporales. Cada creación es un tesoro destinado a ser amado por generaciones.
                    </p>
                    <div className='flex flex-wrap gap-4 pt-4'>
                         <Button asChild className="shadow-md" size="lg">
                            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <Instagram className="mr-2" /> Síguenos en Instagram
                            </Link>
                        </Button>
                         <Button asChild variant="outline" className="shadow-md" size="lg">
                            <Link href="#featured">
                                <MapPin className="mr-2" /> Nuestros Productos
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

    