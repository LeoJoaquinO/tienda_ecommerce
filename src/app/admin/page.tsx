"use client";

import { useState, useEffect } from 'react';
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
import { PlusCircle, Edit, Trash2, LogIn, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { addProductAction, updateProductAction, deleteProductAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function ProductForm({ product, onFinished }: { product?: Product, onFinished: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const action = product ? updateProductAction.bind(null, product.id) : addProductAction;

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        const result = await action(formData);
        if (result?.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Éxito',
                description: result.message,
            });
            onFinished();
        }
        setIsSubmitting(false);
    }
    
    return (
        <form action={handleAction} className="space-y-4">
            <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" defaultValue={product?.description} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
                </div>
                <div>
                    <Label htmlFor="salePrice">Precio de Oferta</Label>
                    <Input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue={product?.salePrice ?? ''} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
                </div>
                <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input id="category" name="category" defaultValue={product?.category} required />
                </div>
            </div>
             <div>
                <Label htmlFor="image">URL de la Imagen</Label>
                <Input id="image" name="image" defaultValue={product?.image} required />
            </div>
            <div>
                <Label htmlFor="aiHint">AI Hint</Label>
                <Input id="aiHint" name="aiHint" defaultValue={product?.aiHint} />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" defaultChecked={product?.featured} />
                <Label htmlFor="featured">Producto Destacado</Label>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </DialogFooter>
        </form>
    );
}

function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

    const fetchAndSetProducts = async () => {
        setIsLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchAndSetProducts();
    }, []);

    const onFormFinished = () => {
        setIsFormOpen(false);
        fetchAndSetProducts(); // Refetch products after add/edit
    }
    
    const handleDelete = async (id: number) => {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        const result = await deleteProductAction(id);
         if (result?.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Éxito',
                description: result.message,
            });
            fetchAndSetProducts(); // Refetch products after delete
        }
      }
    }

    return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Gestionar Productos</h1>
         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                </DialogHeader>
                <ProductForm onFinished={onFormFinished} />
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className='p-0'>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
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
                        <TableCell>${(product.salePrice ?? product.price).toLocaleString('es-AR')}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[625px]">
                                        <DialogHeader>
                                            <DialogTitle>Editar Producto</DialogTitle>
                                        </DialogHeader>
                                        <ProductForm product={product} onFinished={() => {
                                           const closeButton = document.querySelector('[data-radix-dialog-close]');
                                           if (closeButton instanceof HTMLElement) closeButton.click();
                                           fetchAndSetProducts();
                                        }} />
                                    </DialogContent>
                                </Dialog>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminPage() {
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

  return <AdminDashboard />;
}
