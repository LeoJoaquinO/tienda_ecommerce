
import { Instagram, Facebook, Twitter, Send } from "lucide-react";
import Link from 'next/link';
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Footer() {
    const navLinks = [
        { href: '/', label: 'Inicio' },
        { href: '/tienda', label: 'Tienda' },
        { href: '/#about', label: 'Sobre Nosotros' },
    ];

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container py-8 md:py-12 text-secondary-foreground">
        <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-1">
                <h3 className="font-headline text-2xl font-semibold">Joya</h3>
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Joya. Todos los derechos reservados.</p>
                 <div className="flex gap-4">
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6"/></Link>
                    <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-6 w-6"/></Link>
                    <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-6 w-6"/></Link>
                </div>
            </div>
            
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Navegación</h4>
                <nav className="flex flex-col gap-2">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors w-fit">
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="space-y-4">
                 <h4 className="font-semibold text-lg">Información</h4>
                 <nav className="flex flex-col gap-2">
                    <Link href="/pages/garantia" className="text-muted-foreground hover:text-primary transition-colors w-fit">Garantía</Link>
                    <Link href="/pages/preguntas-frecuentes" className="text-muted-foreground hover:text-primary transition-colors w-fit">Preguntas Frecuentes</Link>
                    <Link href="/pages/como-comprar" className="text-muted-foreground hover:text-primary transition-colors w-fit">Cómo Comprar</Link>
                 </nav>
            </div>
            
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Newsletter</h4>
                <p className="text-sm text-muted-foreground">Suscríbete para recibir ofertas y novedades.</p>
                <form className="flex gap-2">
                    <Input type="email" placeholder="tu@email.com" className="bg-background" />
                    <Button type="submit" size="icon"><Send/></Button>
                </form>
            </div>
        </div>
      </div>
    </footer>
  );
}
