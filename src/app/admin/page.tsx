
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import { getCoupons } from '@/lib/coupons';
import type { Product, Coupon } from '@/lib/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash2, LogIn, LogOut, Loader2, Package, Tag, Wallet, Calendar as CalendarIcon, BarChart, AlertTriangle, ShoppingCart, Ticket, Badge } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addProductAction, updateProductAction, deleteProductAction, addCouponAction, updateCouponAction, deleteCouponAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BarChart as RechartsBarChart, Bar as RechartsBar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ############################################################################
// Component: ProductForm
// ############################################################################
function ProductForm({ product, onFinished }: { product?: Product, onFinished: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [startDate, setStartDate] = useState<Date | undefined>(product?.offerStartDate ? new Date(product.offerStartDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(product?.offerEndDate ? new Date(product.offerEndDate) : undefined);

    const action = product ? updateProductAction.bind(null, product.id) : addProductAction;

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        if (startDate) formData.set('offerStartDate', startDate.toISOString());
        if (endDate) formData.set('offerEndDate', endDate.toISOString());

        const result = await action(formData);
        if (result?.error) {
            toast({ title: 'Error de Validación', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Éxito', description: result.message });
            onFinished();
        }
        setIsSubmitting(false);
    }
    
    return (
        <form action={handleAction} className="space-y-4">
            <div><Label htmlFor="name">Nombre</Label><Input id="name" name="name" defaultValue={product?.name} required /></div>
            <div><Label htmlFor="description">Descripción</Label><Textarea id="description" name="description" defaultValue={product?.description} required /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="price">Precio</Label><Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price} required /></div>
                <div><Label htmlFor="discountPercentage">Descuento (%)</Label><Input id="discountPercentage" name="discountPercentage" type="number" step="1" min="0" max="100" defaultValue={product?.discountPercentage ?? ''} placeholder="Ej: 15" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Inicio de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Elegir fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label>Fin de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                             <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Elegir fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" min="0" step="1" defaultValue={product?.stock} required /></div>
                <div><Label htmlFor="category">Categoría</Label><Input id="category" name="category" defaultValue={product?.category} required /></div>
            </div>
            <div><Label htmlFor="image">URL de la Imagen</Label><Input id="image" name="image" type="url" defaultValue={product?.image} required /></div>
            <div><Label htmlFor="aiHint">AI Hint</Label><Input id="aiHint" name="aiHint" defaultValue={product?.aiHint} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="featured" name="featured" defaultChecked={product?.featured} /><Label htmlFor="featured">Producto Destacado</Label></div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button>
            </DialogFooter>
        </form>
    );
}

// ############################################################################
// Component: CouponForm
// ############################################################################
function CouponForm({ coupon, onFinished }: { coupon?: Coupon, onFinished: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(coupon?.expiryDate ? new Date(coupon.expiryDate) : undefined);

    const action = coupon ? updateCouponAction.bind(null, coupon.id) : addCouponAction;

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        if (expiryDate) formData.set('expiryDate', expiryDate.toISOString());
        else formData.delete('expiryDate');

        const result = await action(formData);
        if (result?.error) {
            toast({ title: 'Error de Validación', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Éxito', description: result.message });
            onFinished();
        }
        setIsSubmitting(false);
    }
    
    return (
        <form action={handleAction} className="space-y-4">
            <div><Label htmlFor="code">Código del Cupón</Label><Input id="code" name="code" defaultValue={coupon?.code} placeholder="VERANO20" required /></div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="discountType">Tipo de Descuento</Label>
                    <Select name="discountType" required defaultValue={coupon?.discountType ?? 'percentage'}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="discountValue">Valor</Label>
                    <Input id="discountValue" name="discountValue" type="number" step="0.01" min="0" defaultValue={coupon?.discountValue} placeholder="Ej: 20" required />
                </div>
            </div>
             <div>
                <Label>Fecha de Expiración (Opcional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />{expiryDate ? format(expiryDate, "PPP") : <span>Elegir fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked={coupon?.isActive ?? true} />
                <Label htmlFor="isActive">Cupón Activo</Label>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button>
            </DialogFooter>
        </form>
    );
}

// ############################################################################
// Component: MetricsTab
// ############################################################################
function MetricsTab({ products, isLoading }: { products: Product[], isLoading: boolean }) {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const productsOnSale = products.filter(p => p.salePrice && p.salePrice > 0).length;
    const lowStockProducts = products.filter(p => p.stock <= 3);

    const categoryData = Object.values(products.reduce((acc, product) => {
        const category = product.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = { category, products: 0 };
        acc[category].products++;
        return acc;
    }, {} as Record<string, { category: string, products: number }>));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Productos</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts}</div><p className="text-xs text-muted-foreground">Productos únicos</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inventario Total</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalStock}</div><p className="text-xs text-muted-foreground">Unidades de todos los productos</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${totalInventoryValue.toLocaleString('es-AR')}`}</div><p className="text-xs text-muted-foreground">Valor de costo del stock</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Productos en Oferta</CardTitle><Tag className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : productsOnSale}</div><p className="text-xs text-muted-foreground">Productos con descuento activo</p></CardContent></Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="flex-1 shadow-md"><CardHeader><CardTitle>Productos por Categoría</CardTitle><CardDescription>Un desglose de cuántos productos tienes en cada categoría.</CardDescription></CardHeader><CardContent>
                    {isLoading ? <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div> : categoryData.length > 0 ? (
                        <ChartContainer config={{ products: { label: "Productos", color: "hsl(var(--primary))" } }} className="h-80">
                            <ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={categoryData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} /><YAxis allowDecimals={false} /><Tooltip cursor={false} content={<ChartTooltipContent />} /><RechartsBar dataKey="products" radius={8} /></RechartsBarChart></ResponsiveContainer>
                        </ChartContainer>
                    ) : <div className="flex justify-center items-center h-80"><BarChart className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground ml-4">No hay datos de categoría.</p></div>}
                </CardContent></Card>
                <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500"/>Alertas de Inventario</CardTitle><CardDescription>Productos con bajo stock (3 unidades o menos).</CardDescription></CardHeader><CardContent>
                    {isLoading ? <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div> : lowStockProducts.length > 0 ? (
                        <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Stock Restante</TableHead></TableRow></TableHeader><TableBody>
                            {lowStockProducts.map(p => <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right font-bold text-destructive">{p.stock}</TableCell></TableRow>)}
                        </TableBody></Table>
                    ) : <div className="flex justify-center items-center h-80"><Package className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground ml-4">¡Todo bien! No hay productos con bajo stock.</p></div>}
                </CardContent></Card>
            </div>
        </div>
    );
}

// ############################################################################
// Component: ProductsTab
// ############################################################################
function ProductsTab({ products, isLoading, onEdit, onDelete, onAdd }: { products: Product[], isLoading: boolean, onEdit: (p: Product) => void, onDelete: (id: number) => void, onAdd: () => void }) {
    return (
         <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Gestionar Productos</CardTitle><CardDescription>Añade, edita o elimina productos de tu catálogo.</CardDescription></div>
                <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" />Añadir Producto</Button>
            </CardHeader>
            <CardContent className='p-0'>
                {isLoading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <Table><TableHeader><TableRow><TableHead>Imagen</TableHead><TableHead>Nombre</TableHead><TableHead>Precio</TableHead><TableHead>Stock</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell><Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.aiHint} /></TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>${(product.salePrice ?? product.price).toLocaleString('es-AR')}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell><div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onEdit(product)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody></Table>
                )}
            </CardContent>
        </Card>
    );
}

// ############################################################################
// Component: CouponsTab
// ############################################################################
function CouponsTab({ coupons, isLoading, onAdd, onEdit, onDelete }: { coupons: Coupon[], isLoading: boolean, onAdd: () => void, onEdit: (c: Coupon) => void, onDelete: (id: number) => void }) {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Gestionar Cupones</CardTitle><CardDescription>Crea y gestiona códigos de descuento.</CardDescription></div>
                <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" />Crear Cupón</Button>
            </CardHeader>
            <CardContent className='p-0'>
                {isLoading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Valor</TableHead><TableHead>Expiración</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>
                        {coupons.map(coupon => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-medium text-primary">{coupon.code}</TableCell>
                                <TableCell>{coupon.discountType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}</TableCell>
                                <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toLocaleString('es-AR')}`}</TableCell>
                                <TableCell>{coupon.expiryDate ? format(new Date(coupon.expiryDate), 'PPP') : 'Nunca'}</TableCell>
                                <TableCell>
                                    {coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())
                                      ? <Badge variant="default" className='bg-green-500 hover:bg-green-600'>Activo</Badge>
                                      : <Badge variant="destructive">Inactivo</Badge>
                                    }
                                </TableCell>
                                <TableCell><div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onEdit(coupon)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDelete(coupon.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody></Table>
                )}
            </CardContent>
        </Card>
    );
}

// ############################################################################
// Component: AdminDashboard
// ############################################################################
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const [isCouponsLoading, setIsCouponsLoading] = useState(true);
    const [dialogType, setDialogType] = useState<'product' | 'coupon' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const { toast } = useToast();

    const fetchAndSetProducts = async () => {
        setIsProductsLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            toast({ title: 'Error al cargar productos', description: (error as Error).message, variant: 'destructive' });
        }
        setIsProductsLoading(false);
    }
    
    const fetchAndSetCoupons = async () => {
        setIsCouponsLoading(true);
        try {
            const fetchedCoupons = await getCoupons();
            setCoupons(fetchedCoupons);
        } catch (error) {
            toast({ title: 'Error al cargar cupones', description: (error as Error).message, variant: 'destructive' });
        }
        setIsCouponsLoading(false);
    }

    useEffect(() => { 
        fetchAndSetProducts();
        fetchAndSetCoupons();
    }, []);
    
    const handleOpenProductDialog = (product?: Product) => {
        setEditingProduct(product);
        setDialogType('product');
    };

    const handleOpenCouponDialog = (coupon?: Coupon) => {
        setEditingCoupon(coupon);
        setDialogType('coupon');
    };

    const handleCloseDialog = () => {
        setDialogType(null);
        setEditingProduct(undefined);
        setEditingCoupon(undefined);
    };

    const onFormFinished = () => {
        const currentDialog = dialogType;
        handleCloseDialog();
        if (currentDialog === 'product') fetchAndSetProducts();
        if (currentDialog === 'coupon') fetchAndSetCoupons();
    }
    
    const handleDeleteProduct = async (id: number) => {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        const result = await deleteProductAction(id);
         if (result?.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Éxito', description: result.message });
            fetchAndSetProducts();
        }
      }
    }

    const handleDeleteCoupon = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
            const result = await deleteCouponAction(id);
            if (result?.error) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'Éxito', description: result.message });
                fetchAndSetCoupons();
            }
        }
    }

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div><h1 className="text-3xl font-bold font-headline">Panel de Administración</h1><p className="text-muted-foreground">Métricas, gestión de productos y cupones.</p></div>
            <Button variant="outline" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</Button>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visión General</TabsTrigger>
                <TabsTrigger value="products">Productos</TabsTrigger>
                <TabsTrigger value="coupons">Cupones</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <MetricsTab products={products} isLoading={isProductsLoading} />
            </TabsContent>
            <TabsContent value="products" className="mt-6">
                <ProductsTab products={products} isLoading={isProductsLoading} onAdd={() => handleOpenProductDialog()} onEdit={handleOpenProductDialog} onDelete={handleDeleteProduct} />
            </TabsContent>
            <TabsContent value="coupons" className="mt-6">
                <CouponsTab coupons={coupons} isLoading={isCouponsLoading} onAdd={() => handleOpenCouponDialog()} onEdit={handleOpenCouponDialog} onDelete={handleDeleteCoupon} />
            </TabsContent>
        </Tabs>

        <Dialog open={dialogType !== null} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader><DialogTitle>{dialogType === 'product' ? (editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto') : (editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón')}</DialogTitle></DialogHeader>
                {dialogType === 'product' && <ProductForm product={editingProduct} onFinished={onFormFinished} />}
                {dialogType === 'coupon' && <CouponForm coupon={editingCoupon} onFinished={onFormFinished} />}
            </DialogContent>
        </Dialog>
    </div>
  );
}

// ############################################################################
// Component: AdminPage (Login and main export)
// ############################################################################
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
            <Card className="w-full max-w-sm shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
                    <CardDescription>Ingresa a tu cuenta para gestionar la tienda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor='email'>Email</Label><Input id="email" type="email" placeholder="email@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor='password'>Contraseña</Label><Input id="password" type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <p className="text-xs text-muted-foreground text-center pt-2">Hint: admin@joya.com / password123</p>
                        <Button type="submit" className="w-full"><LogIn className="mr-2 h-4 w-4" />Iniciar Sesión</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
