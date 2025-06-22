"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, LogIn } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
  } from "@/components/ui/dialog"

type ProductFormInputs = Omit<Product, 'id'>;

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm<ProductFormInputs>();

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

  const handleEditClick = (product: Product) => {
    setIsEditing(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('image', product.image);
    setValue('category', product.category);
    setValue('stock', product.stock);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (productId: string) => {
      setProducts(prev => prev.filter(p => p.id !== productId));
  }

  const onSubmit: SubmitHandler<ProductFormInputs> = (data) => {
    if (isEditing) {
      setProducts(prev =>
        prev.map(p => (p.id === isEditing.id ? { ...p, ...data } : p))
      );
    } else {
      const newProduct: Product = {
        id: (Math.random() * 10000).toString(),
        ...data,
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    reset();
    setIsEditing(null);
    setIsDialogOpen(false);
  };
  
  const openNewProductDialog = () => {
      reset();
      setIsEditing(null);
      setIsDialogOpen(true);
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
        <Button onClick={openNewProductDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input placeholder="Nombre del Producto" {...register('name', { required: true })} />
                <Textarea placeholder="Descripción" {...register('description', { required: true })} />
                <Input type="number" placeholder="Precio" {...register('price', { required: true, valueAsNumber: true })} />
                <Input placeholder="URL de la Imagen" {...register('image', { required: true })} />
                <Input placeholder="Categoría" {...register('category', { required: true })} />
                <Input type="number" placeholder="Stock" {...register('stock', { required: true, valueAsNumber: true })} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Añadir Producto'}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
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
                        <Button variant="outline" size="icon" onClick={() => handleEditClick(product)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
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
