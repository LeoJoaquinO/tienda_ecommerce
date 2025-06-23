"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, LogIn, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function AdminPage() {
  const [products] = useState<Product[]>(getProducts());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demonstration
    if (email === 'admin@joya.com' && password === 'password123') {
        setIsAuthenticated(true);
        setError('');
    } else {
        setError('Credenciales inválidas. Inténtalo de nuevo.');
    }
  }

  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
                    <CardDescription>
                        Ingresa a tu cuenta para gestionar productos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                           <Input id="email" type="email" placeholder="email@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Input id="password" type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <p className="text-xs text-muted-foreground">Hint: admin@joya.com / password123</p>
                        <Button type="submit" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            Iniciar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Gestionar Productos</h1>
        <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Base de Datos No Conectada</AlertTitle>
        <AlertDescription>
          La gestión de productos (crear, editar, eliminar) está desactivada. Para habilitar estas funciones, la aplicación necesita ser conectada a una base de datos.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint={product.aiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toLocaleString('es-AR')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
