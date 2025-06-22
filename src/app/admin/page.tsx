"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
  } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

type ProductFormInputs = Omit<Product, 'id'>;

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<ProductFormInputs>();

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
      // Update existing product
      setProducts(prev =>
        prev.map(p => (p.id === isEditing.id ? { ...p, ...data } : p))
      );
    } else {
      // Add new product
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

  return (
    <div className="space-y-8">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Modo de Demostración</AlertTitle>
        <AlertDescription>
          Los cambios realizados en esta página (agregar, editar, eliminar productos) son solo para fines de demostración y no se guardarán permanentemente.
        </AlertDescription>
      </Alert>

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
