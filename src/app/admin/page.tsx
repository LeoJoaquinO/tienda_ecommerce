
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getProducts, getCoupons, getSalesMetrics } from '@/lib/data';
import type { Product, Coupon, SalesMetrics } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash2, LogIn, LogOut, Loader2, Package, Tag, Wallet, Calendar as CalendarIcon, BarChart, AlertTriangle, ShoppingCart, Ticket, Badge as BadgeIcon, TrendingUp, DollarSign, CheckCircle, XCircle, Download, ExternalLink, Mail, Database, HardDrive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type FieldErrors = Record<string, string[] | undefined>;

const FormError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-sm font-medium text-destructive mt-1">{message}</p>;
};

// ############################################################################
// Helper: CSV Export
// ############################################################################
function downloadCSV(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ############################################################################
// Component: ProductForm
// ############################################################################
function ProductForm({ product, formId, errors }: { product?: Product, formId: string, errors: FieldErrors }) {
    const [startDate, setStartDate] = useState<Date | undefined>(product?.offerStartDate ? new Date(product.offerStartDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(product?.offerEndDate ? new Date(product.offerEndDate) : undefined);

    // This is a hidden component to pass date values to the form handler
    const HiddenDateInputs = () => (
        <>
            <input type="hidden" name="offerStartDate" value={startDate?.toISOString() ?? ''} />
            <input type="hidden" name="offerEndDate" value={endDate?.toISOString() ?? ''} />
        </>
    );
    
    return (
        <form id={formId} className="space-y-4">
             <HiddenDateInputs />
            <div><Label htmlFor="name">Nombre</Label><Input id="name" name="name" defaultValue={product?.name} className={cn(errors.name && "border-destructive")} /><FormError message={errors.name?.[0]} /></div>
            <div><Label htmlFor="shortDescription">Descripción Corta</Label><Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription} placeholder="Un resumen breve para la tarjeta de producto." className={cn(errors.shortDescription && "border-destructive")}/><FormError message={errors.shortDescription?.[0]} /></div>
            <div><Label htmlFor="description">Descripción Completa</Label><Textarea id="description" name="description" defaultValue={product?.description} className={cn(errors.description && "border-destructive")} /><FormError message={errors.description?.[0]} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="price">Precio</Label><Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price} className={cn(errors.price && "border-destructive")}/><FormError message={errors.price?.[0]} /></div>
                <div><Label htmlFor="discountPercentage">Descuento (%)</Label><Input id="discountPercentage" name="discountPercentage" type="number" step="1" min="0" max="100" defaultValue={product?.discountPercentage ?? ''} placeholder="Ej: 15" className={cn(errors.discountPercentage && "border-destructive")} /><FormError message={errors.discountPercentage?.[0]} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Inicio de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground", errors.offerStartDate && "border-destructive")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Elegir fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus fromDate={new Date()} /></PopoverContent>
                    </Popover>
                    <FormError message={errors.offerStartDate?.[0]} />
                </div>
                <div>
                    <Label>Fin de Oferta</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                             <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground", errors.offerEndDate && "border-destructive")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Elegir fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus fromDate={startDate || new Date()} /></PopoverContent>
                    </Popover>
                    <FormError message={errors.offerEndDate?.[0]} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" min="0" step="1" defaultValue={product?.stock} className={cn(errors.stock && "border-destructive")} /><FormError message={errors.stock?.[0]} /></div>
                <div><Label htmlFor="category">Categoría</Label><Input id="category" name="category" defaultValue={product?.category} className={cn(errors.category && "border-destructive")} /><FormError message={errors.category?.[0]} /></div>
            </div>
            <div className='space-y-2'>
                <Label>Imágenes del Producto (hasta 5)</Label>
                <Input id="image1" name="image1" type="url" defaultValue={product?.images?.[0]} placeholder="URL de la Imagen Principal (requerido)" className={cn(errors.images && "border-destructive")} />
                <Input id="image2" name="image2" type="url" defaultValue={product?.images?.[1]} placeholder="URL de la Imagen 2 (opcional)" />
                <Input id="image3" name="image3" type="url" defaultValue={product?.images?.[2]} placeholder="URL de la Imagen 3 (opcional)" />
                <Input id="image4" name="image4" type="url" defaultValue={product?.images?.[3]} placeholder="URL de la Imagen 4 (opcional)" />
                <Input id="image5" name="image5" type="url" defaultValue={product?.images?.[4]} placeholder="URL de la Imagen 5 (opcional)" />
                <FormError message={errors.images?.[0]} />
            </div>
            <div><Label htmlFor="aiHint">AI Hint</Label><Input id="aiHint" name="aiHint" defaultValue={product?.aiHint} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="featured" name="featured" defaultChecked={product?.featured} /><Label htmlFor="featured">Producto Destacado</Label></div>
        </form>
    );
}

// ############################################################################
// Component: CouponForm
// ############################################################################
function CouponForm({ coupon, formId, errors }: { coupon?: Coupon, formId: string, errors: FieldErrors }) {
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(coupon?.expiryDate ? new Date(coupon.expiryDate) : undefined);
    
    const HiddenDateInputs = () => (
        <input type="hidden" name="expiryDate" value={expiryDate?.toISOString() ?? ''} />
    );

    return (
        <form id={formId} className="space-y-4">
            <HiddenDateInputs />
            <div><Label htmlFor="code">Código del Cupón</Label><Input id="code" name="code" defaultValue={coupon?.code} placeholder="VERANO20" className={cn(errors.code && "border-destructive")} /><FormError message={errors.code?.[0]} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="discountType">Tipo de Descuento</Label>
                    <Select name="discountType" defaultValue={coupon?.discountType ?? 'percentage'}>
                        <SelectTrigger className={cn(errors.discountType && "border-destructive")}><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormError message={errors.discountType?.[0]} />
                </div>
                <div>
                    <Label htmlFor="discountValue">Valor</Label>
                    <Input id="discountValue" name="discountValue" type="number" step="0.01" min="0" defaultValue={coupon?.discountValue} placeholder="Ej: 20" className={cn(errors.discountValue && "border-destructive")} />
                     <FormError message={errors.discountValue?.[0]} />
                </div>
            </div>
             <div>
                <Label>Fecha de Expiración (Opcional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground", errors.expiryDate && "border-destructive")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />{expiryDate ? format(expiryDate, "PPP") : <span>Elegir fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar 
                            mode="single" 
                            selected={expiryDate} 
                            onSelect={setExpiryDate} 
                            initialFocus 
                            fromDate={new Date()}
                        />
                    </PopoverContent>
                </Popover>
                 <FormError message={errors.expiryDate?.[0]} />
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked={coupon?.isActive ?? true} />
                <Label htmlFor="isActive">Cupón Activo</Label>
            </div>
        </form>
    );
}

// ############################################################################
// Component: MetricsTab
// ############################################################################
function MetricsTab({ products, salesMetrics, isLoading }: { products: Product[], salesMetrics: SalesMetrics | null, isLoading: boolean }) {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 3);

    const categoryData = Object.values(products.reduce((acc, product) => {
        const category = product.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = { category, products: 0 };
        acc[category].products++;
        return acc;
    }, {} as Record<string, { category: string, products: number }>));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading || !salesMetrics ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${salesMetrics.totalRevenue.toLocaleString('es-AR')}`}</div><p className="text-xs text-muted-foreground">Suma de todas las ventas</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventas Totales</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading || !salesMetrics ? <Loader2 className="h-6 w-6 animate-spin" /> : `+${salesMetrics.totalSales}`}</div><p className="text-xs text-muted-foreground">Cantidad de órdenes pagadas</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Productos</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : totalProducts}</div><p className="text-xs text-muted-foreground">Productos únicos en el catálogo</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inventario Total</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : totalStock}</div><p className="text-xs text-muted-foreground">Suma de stock de todos los productos</p></CardContent></Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="flex-1 shadow-md"><CardHeader><CardTitle>Productos por Categoría</CardTitle><CardDescription>Un desglose de cuántos productos tienes en cada categoría.</CardDescription></CardHeader><CardContent>
                    {isLoading ? <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div> : categoryData.length > 0 ? (
                        <ChartContainer config={{ products: { label: "Productos", color: "hsl(var(--primary))" } }} className="h-80">
                            <ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={categoryData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} /><YAxis allowDecimals={false} /><Tooltip cursor={false} content={<ChartTooltipContent />} /><RechartsBar dataKey="products" radius={8} /></RechartsBarChart></ResponsiveContainer>
                        </ChartContainer>
                    ) : <div className="flex justify-center items-center h-80"><BarChart className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground ml-4">No hay datos de categoría.</p></div>}
                </CardContent></Card>
                 <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-blue-500"/>Productos Más Vendidos</CardTitle><CardDescription>Tus productos más populares basados en unidades vendidas.</CardDescription></CardHeader><CardContent>
                    {isLoading || !salesMetrics ? <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div> : salesMetrics.topSellingProducts.length > 0 ? (
                        <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Unidades Vendidas</TableHead></TableRow></TableHeader><TableBody>
                            {salesMetrics.topSellingProducts.map(p => <TableRow key={p.productId}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right font-bold text-primary">{p.count}</TableCell></TableRow>)}
                        </TableBody></Table>
                    ) : <div className="flex justify-center items-center h-80"><TrendingUp className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground ml-4">Aún no hay datos de ventas.</p></div>}
                </CardContent></Card>
            </div>
             <div className="grid gap-6">
                <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500"/>Alertas de Stock Bajo</CardTitle><CardDescription>Productos con 3 unidades o menos en stock.</CardDescription></CardHeader><CardContent>
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
function ProductsTab({ products, isLoading, onEdit, onDelete, onAdd, onExport }: { products: Product[], isLoading: boolean, onEdit: (p: Product) => void, onDelete: (id: number) => void, onAdd: () => void, onExport: () => void }) {
    return (
         <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Gestionar Productos</CardTitle><CardDescription>Añade, edita o elimina productos de tu catálogo.</CardDescription></div>
                <div className="flex gap-2">
                    <Button onClick={onExport} variant="outline"><Download className="mr-2 h-4 w-4" />Exportar a CSV</Button>
                    <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" />Añadir Producto</Button>
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                {isLoading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <Table><TableHeader><TableRow><TableHead>Imagen</TableHead><TableHead>Nombre</TableHead><TableHead>Precio</TableHead><TableHead>Stock</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Image 
                                        src={product.images[0] ?? "https://placehold.co/40x40.png"} 
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
                                <TableCell><div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onEdit(product)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(product.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
function CouponsTab({ coupons, isLoading, onAdd, onEdit, onDelete, onExport }: { coupons: Coupon[], isLoading: boolean, onAdd: () => void, onEdit: (c: Coupon) => void, onDelete: (id: number) => void, onExport: () => void }) {
    const isCouponActive = (coupon: Coupon) => {
        return coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date());
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Gestionar Cupones</CardTitle><CardDescription>Crea y gestiona códigos de descuento.</CardDescription></div>
                <div className="flex gap-2">
                    <Button onClick={onExport} variant="outline"><Download className="mr-2 h-4 w-4" />Exportar a CSV</Button>
                    <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" />Crear Cupón</Button>
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                {isLoading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Valor</TableHead><TableHead>Expiración</TableHead><TableHead className="text-center">Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>
                        {coupons.map(coupon => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-medium text-primary">{coupon.code}</TableCell>
                                <TableCell>{coupon.discountType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}</TableCell>
                                <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toLocaleString('es-AR')}`}</TableCell>
                                <TableCell>{coupon.expiryDate ? format(new Date(coupon.expiryDate), 'PPP') : 'Nunca'}</TableCell>
                                <TableCell className="text-center">
                                    {isCouponActive(coupon)
                                      ? <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
                                      : <XCircle className="h-5 w-5 text-destructive inline-block" />
                                    }
                                </TableCell>
                                <TableCell><div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onEdit(coupon)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el cupón.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(coupon.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
function AdminDashboard({ onLogout, dbConnected }: { onLogout: () => void, dbConnected: boolean }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogType, setDialogType] = useState<'product' | 'coupon' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<FieldErrors>({});
    const { toast } = useToast();
    const formId = "dialog-form";
    const mailchimpConfigured = process.env.NEXT_PUBLIC_MAILCHIMP_CONFIGURED === 'true';


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fetchedProducts, fetchedCoupons, fetchedMetrics] = await Promise.all([
                getProducts(),
                getCoupons(),
                getSalesMetrics(),
            ]);
            setProducts(fetchedProducts);
            setCoupons(fetchedCoupons);
            setSalesMetrics(fetchedMetrics);
        } catch (error) {
            toast({ title: 'Error al cargar los datos del panel', description: (error as Error).message, variant: 'destructive' });
        }
        setIsLoading(false);
    }

    useEffect(() => { 
        fetchData();
    }, []);
    
    const handleOpenProductDialog = (product?: Product) => {
        setFormErrors({});
        setEditingProduct(product);
        setDialogType('product');
    };

    const handleOpenCouponDialog = (coupon?: Coupon) => {
        setFormErrors({});
        setEditingCoupon(coupon);
        setDialogType('coupon');
    };

    const handleCloseDialog = () => {
        setDialogType(null);
        setEditingProduct(undefined);
        setEditingCoupon(undefined);
        setFormErrors({});
    };
    
    const handleFormSubmit = async () => {
        const formElement = document.getElementById(formId) as HTMLFormElement;
        if (!formElement) return;

        setIsSubmitting(true);
        setFormErrors({});
        const formData = new FormData(formElement);
        
        let result;
        if (dialogType === 'product') {
            const action = editingProduct ? updateProductAction.bind(null, editingProduct.id) : addProductAction;
            result = await action(formData);
        } else if (dialogType === 'coupon') {
            const action = editingCoupon ? updateCouponAction.bind(null, editingCoupon.id) : addCouponAction;
            result = await action(formData);
        }

        if (result?.error) {
            toast({ title: 'Error al Guardar', description: result.error, variant: 'destructive' });
            if (result.fieldErrors) {
                setFormErrors(result.fieldErrors);
            }
        } else {
            toast({ title: 'Éxito', description: result.message });
            handleCloseDialog();
            fetchData();
        }
        setIsSubmitting(false);
    };

    const handleDeleteProduct = async (id: number) => {
        const result = await deleteProductAction(id);
         if (result?.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Éxito', description: result.message });
            fetchData();
        }
    }

    const handleDeleteCoupon = async (id: number) => {
        const result = await deleteCouponAction(id);
        if (result?.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Éxito', description: result.message });
            fetchData();
        }
    }

    const exportProductsToCSV = () => {
        const headers = ['ID', 'Name', 'Short Description', 'Price', 'Sale Price', 'Stock', 'Category', 'Featured', 'Image URL 1', 'Image URL 2', 'Image URL 3', 'Image URL 4', 'Image URL 5'];
        const rows = products.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.shortDescription?.replace(/"/g, '""') ?? ''}"`,
            p.price,
            p.salePrice ?? '',
            p.stock,
            p.category,
            p.featured ? 'Yes' : 'No',
            ...(p.images.slice(0, 5).map(img => `"${img}"`) ?? []),
        ].join(','));
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        downloadCSV(csvContent, 'products.csv');
        toast({ title: 'Éxito', description: 'Datos de productos exportados a CSV.' });
    };

    const exportCouponsToCSV = () => {
        const headers = ['ID', 'Code', 'Discount Type', 'Discount Value', 'Expiry Date', 'Is Active'];
        const rows = coupons.map(c => [
            c.id,
            c.code,
            c.discountType,
            c.discountValue,
            c.expiryDate ? format(new Date(c.expiryDate), 'yyyy-MM-dd') : 'Never',
            c.isActive ? 'Yes' : 'No'
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        downloadCSV(csvContent, 'coupons.csv');
        toast({ title: 'Éxito', description: 'Datos de cupones exportados a CSV.' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Panel de Administración</h1>
                    <div className='flex items-center gap-4 mt-2'>
                        <p className="text-muted-foreground">Métricas y gestión de productos, cupones y más.</p>
                         {dbConnected ? (
                            <Badge className='bg-green-100 text-green-800 border-green-300 hover:bg-green-100'>
                                <Database className="mr-2 h-4 w-4"/>
                                Data Source: Database
                            </Badge>
                         ) : (
                            <Badge className='bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100'>
                                <HardDrive className="mr-2 h-4 w-4"/>
                                Data Source: Local Fallback
                            </Badge>
                         )}
                         {mailchimpConfigured ? (
                            <Badge className='bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-100'>
                                <Mail className="mr-2 h-4 w-4"/>
                                Mailchimp: Connected
                            </Badge>
                         ) : (
                             <Badge variant='outline' className='border-dashed'>
                                <Mail className="mr-2 h-4 w-4 text-muted-foreground"/>
                                Mailchimp: Not Configured
                            </Badge>
                         )}
                    </div>
                </div>
                <Button variant="outline" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</Button>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visión General</TabsTrigger>
                    <TabsTrigger value="products">Productos</TabsTrigger>
                    <TabsTrigger value="coupons">Cupones</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <MetricsTab products={products} salesMetrics={salesMetrics} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="products" className="mt-6">
                    <ProductsTab products={products} isLoading={isLoading} onAdd={() => handleOpenProductDialog()} onEdit={handleOpenProductDialog} onDelete={handleDeleteProduct} onExport={exportProductsToCSV} />
                </TabsContent>
                <TabsContent value="coupons" className="mt-6">
                    <CouponsTab coupons={coupons} isLoading={isLoading} onAdd={() => handleOpenCouponDialog()} onEdit={handleOpenCouponDialog} onDelete={handleDeleteCoupon} onExport={exportCouponsToCSV} />
                </TabsContent>
            </Tabs>

            <Dialog open={dialogType !== null} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
                <DialogContent className="sm:max-w-[625px] grid-rows-[auto_1fr_auto] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{dialogType === 'product' ? (editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto') : (editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón')}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-4 -mr-4">
                        {dialogType === 'product' && <ProductForm product={editingProduct} formId={formId} errors={formErrors} />}
                        {dialogType === 'coupon' && <CouponForm coupon={editingCoupon} formId={formId} errors={formErrors} />}
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                        <Button type="button" onClick={handleFormSubmit} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ############################################################################
// Component: AdminPage (Login and main export)
// ############################################################################
export default function AdminPage({ dbConnected }: { dbConnected: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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

  return <AdminDashboard onLogout={handleLogout} dbConnected={dbConnected} />;
}
    