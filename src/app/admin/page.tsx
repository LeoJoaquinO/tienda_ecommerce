
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
import { PlusCircle, Edit, Trash2, LogIn, LogOut, Loader2, Package, Tag, Wallet, Calendar as CalendarIcon, BarChart } from 'lucide-react';
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addProductAction, updateProductAction, deleteProductAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BarChart as RechartsBarChart, Bar as RechartsBar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


function ProductForm({ product, onFinished }: { product?: Product, onFinished: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [startDate, setStartDate] = useState<Date | undefined>(product?.offerStartDate ? new Date(product.offerStartDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(product?.offerEndDate ? new Date(product.offerEndDate) : undefined);


    const action = product ? updateProductAction.bind(null, product.id) : addProductAction;

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        // Append dates to formData if they exist
        if (startDate) formData.append('offerStartDate', startDate.toISOString());
        if (endDate) formData.append('offerEndDate', endDate.toISOString());

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
                    <Label htmlFor="discountPercentage">Descuento (%)</Label>
                    <Input id="discountPercentage" name="discountPercentage" type="number" step="1" min="0" max="100" defaultValue={product?.discountPercentage ?? ''} placeholder="Ej: 15" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label>Inicio de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Elegir fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div>
                    <Label>Fin de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Elegir fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                    </Popover>
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

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const { toast } = useToast();

    const fetchAndSetProducts = async () => {
        setIsLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            toast({
                title: 'Error al cargar productos',
                description: (error as Error).message,
                variant: 'destructive'
            });
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchAndSetProducts();
    }, []);
    
    const handleOpenDialog = (product?: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingProduct(undefined);
    };

    const onFormFinished = () => {
        handleCloseDialog();
        fetchAndSetProducts();
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
            fetchAndSetProducts();
        }
      }
    }

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const productsOnSale = products.filter(p => p.salePrice && p.salePrice > 0).length;

    const categoryData = products.reduce((acc, product) => {
        const category = product.category || 'Sin Categoría';
        if (!acc[category]) {
            acc[category] = { category, products: 0 };
        }
        acc[category].products++;
        return acc;
    }, {} as Record<string, { category: string, products: number }>);
    const categoryChartData = Object.values(categoryData);


    return (
    <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">Panel de Administración</h1>
                <p className="text-muted-foreground">Métricas y gestión de productos.</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
        </div>

        {/* Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts}</div>
                    <p className="text-xs text-muted-foreground">Productos únicos en la tienda</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventario Total</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalStock}</div>
                    <p className="text-xs text-muted-foreground">Unidades de todos los productos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos en Oferta</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : productsOnSale}</div>
                     <p className="text-xs text-muted-foreground">Productos con descuento activo</p>
                </CardContent>
            </Card>
        </div>

        {/* Analytics Chart */}
        <Card>
            <CardHeader>
                <CardTitle>Productos por Categoría</CardTitle>
                <CardDescription>Un desglose de cuántos productos tienes en cada categoría.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center h-80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : categoryChartData.length > 0 ? (
                    <ChartContainer config={{
                        products: {
                            label: "Productos",
                            color: "hsl(var(--primary))",
                        }
                    }} className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={categoryChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="category"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <RechartsBar dataKey="products" radius={8} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex justify-center items-center h-80">
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground ml-4">No hay datos de categoría para mostrar.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Products Table Section */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle>Gestionar Productos</CardTitle>
                     <CardDescription>Añade, edita o elimina productos de tu catálogo.</CardDescription>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Button>
            </CardHeader>
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
                                className="rounded-md object-cover"
                                data-ai-hint={product.aiHint}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>${(product.salePrice ?? product.price).toLocaleString('es-AR')}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(product)}>
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
                )}
            </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
                </DialogHeader>
                <ProductForm product={editingProduct} onFinished={onFormFinished} />
            </DialogContent>
        </Dialog>
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  }


  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
                    <CardDescription>
                        Ingresa a tu cuenta para gestionar la tienda.
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

  return <AdminDashboard onLogout={handleLogout} />;
}

    