
import { Instagram, Facebook, Twitter } from "lucide-react";
import Link from 'next/link';

export default function Footer() {
    const navLinks = [
        { href: '/', label: 'Inicio' },
        { href: '/tienda', label: 'Tienda' },
        { href: '/#about', label: 'Sobre Nosotros' },
        { href: '/admin', label: 'Admin' },
    ];

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container py-8 md:py-12 text-secondary-foreground">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 md:col-span-1">
                <h3 className="font-headline text-2xl font-semibold">Joya</h3>
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Joya. Todos los derechos reservados.</p>
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
                <h4 className="font-semibold text-lg">Síguenos</h4>
                <div className="flex gap-4">
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6"/></Link>
                    <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-6 w-6"/></Link>
                    <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-6 w-6"/></Link>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
