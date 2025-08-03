
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Package, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function GarantiaPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Política de Garantía y Devoluciones</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tu satisfacción es nuestra prioridad. Conoce nuestras políticas.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <CardTitle>Nuestra Garantía de Calidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              En <strong>Joya</strong>, nos enorgullecemos de la calidad y artesanía de nuestros productos. Todas nuestras piezas están garantizadas contra defectos de fabricación por un período de <strong>30 días</strong> a partir de la fecha de compra.
            </p>
            <p>
              Esta garantía cubre fallos en los materiales y en la mano de obra. No cubre el desgaste normal, daños accidentales, mal uso o la pérdida de piezas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <RotateCw className="w-8 h-8 text-primary" />
            <CardTitle>Política de Cambios y Devoluciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Si no estás completamente satisfecho con tu compra, aceptamos cambios y devoluciones dentro de los <strong>10 días</strong> posteriores a la recepción del producto, siempre y cuando el artículo se encuentre en su estado original, sin usar y con su empaque completo.
            </p>
            <p>
              Para iniciar un proceso de cambio o devolución, por favor contáctanos a través de nuestro WhatsApp con tu número de orden. Los costos de envío asociados a la devolución correrán por cuenta del cliente, a menos que el motivo sea un defecto de fábrica.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Package className="w-8 h-8 text-primary" />
            <CardTitle>¿Cómo Iniciar el Proceso?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
             <p>
                1. <strong>Contáctanos:</strong> Escríbenos a nuestro <Link href="https://wa.me/5491122334455" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">WhatsApp</Link> con tu nombre y número de orden.
            </p>
            <p>
                2. <strong>Describe el problema:</strong> Explícanos el motivo de tu solicitud (cambio, devolución o garantía) y, si es posible, adjunta una foto del producto.
            </p>
             <p>
                3. <strong>Coordinación:</strong> Nuestro equipo te guiará en los siguientes pasos para coordinar la logística del envío y la resolución de tu caso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
