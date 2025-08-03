import { Instagram, Facebook, Twitter } from "lucide-react";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container py-8 text-secondary-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm">&copy; {new Date().getFullYear()} Joya. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
                <p className="text-sm font-semibold">Síguenos:</p>
                <div className="flex gap-2">
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5"/></Link>
                    <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5"/></Link>
                    <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5"/></Link>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
