
import type { Product, Coupon, Order, SalesMetrics, OrderData, Subscriber } from './types';

// ############################################################################
// Hardcoded Data Store
// ############################################################################

let products: Product[] = [
    {
        id: 1,
        name: "Collar de Perlas Finas",
        description: "Un collar clásico de perlas cultivadas de agua dulce, anudadas a mano en un hilo de seda. Cierre de plata de ley. Perfecto para cualquier ocasión.",
        shortDescription: "Collar clásico de perlas.",
        price: 150.00,
        images: ["https://placehold.co/600x600.png?text=Collar+Perlas"],
        category: "Collares",
        stock: 15,
        featured: true,
        aiHint: "pearl necklace",
        discountPercentage: 20,
        offerStartDate: new Date('2024-01-01'),
        offerEndDate: new Date('2024-12-31'),
    },
    {
        id: 2,
        name: "Anillo de Zafiro y Diamantes",
        description: "Elegante anillo de oro blanco de 18k con un zafiro central de talla ovalada, rodeado por un halo de diamantes brillantes. Una pieza que captura la luz y las miradas.",
        shortDescription: "Anillo de zafiro y diamantes.",
        price: 750.00,
        images: ["https://placehold.co/600x600.png?text=Anillo+Zafiro"],
        category: "Anillos",
        stock: 8,
        featured: true,
        aiHint: "sapphire ring",
    },
    {
        id: 3,
        name: "Pendientes de Esmeralda",
        description: "Deslumbrantes pendientes de oro amarillo con esmeraldas colombianas de talla pera. Su diseño colgante añade un toque de sofisticación y movimiento.",
        shortDescription: "Pendientes de esmeralda.",
        price: 450.00,
        images: ["https://placehold.co/600x600.png?text=Pendientes+Esmeralda"],
        category: "Pendientes",
        stock: 12,
        featured: false,
        aiHint: "emerald earrings",
    },
    {
        id: 4,
        name: "Pulsera de Plata con Charms",
        description: "Una pulsera de plata de ley 925 con un diseño de cadena de serpiente, perfecta para añadir tus charms favoritos. Incluye un charm de corazón.",
        shortDescription: "Pulsera de plata con charms.",
        price: 85.00,
        images: ["https://placehold.co/600x600.png?text=Pulsera+Plata"],
        category: "Pulseras",
        stock: 25,
        featured: true,
        aiHint: "silver bracelet",
    },
    {
        id: 5,
        name: "Reloj de Lujo para Caballero",
        description: "Reloj suizo con movimiento automático, caja de acero inoxidable y correa de cuero genuino. Esfera azul con cronógrafo y calendario. Resistente al agua hasta 100 metros.",
        shortDescription: "Reloj de lujo para caballero.",
        price: 1200.00,
        images: ["https://placehold.co/600x600.png?text=Reloj+Lujo"],
        category: "Relojes",
        stock: 5,
        featured: true,
        aiHint: "luxury watch",
    },
    {
        id: 6,
        name: "Gargantilla de Oro Minimalista",
        description: "Una sutil y elegante gargantilla de oro de 14k con una pequeña barra pulida. Ideal para usar sola o en capas con otros collares.",
        shortDescription: "Gargantilla de oro minimalista.",
        price: 120.00,
        images: ["https://placehold.co/600x600.png?text=Gargantilla+Oro"],
        category: "Collares",
        stock: 20,
        featured: false,
        aiHint: "gold choker",
    },
    {
        id: 7,
        name: "Anillo de Compromiso Solitario",
        description: "El clásico anillo de compromiso. Un espectacular diamante de talla brillante de 1 quilate montado en una banda de platino atemporal.",
        shortDescription: "Anillo de compromiso solitario.",
        price: 5500.00,
        images: ["https://placehold.co/600x600.png?text=Anillo+Compromiso"],
        category: "Anillos",
        stock: 3,
        featured: false,
        aiHint: "solitaire ring",
    },
    {
        id: 8,
        name: "Pendientes de Aro Grandes de Plata",
        description: "Pendientes de aro de plata de ley, con un acabado pulido y un cierre seguro. Un accesorio versátil y moderno para el día a día.",
        shortDescription: "Pendientes de aro de plata.",
        price: 60.00,
        images: ["https://placehold.co/600x600.png?text=Aros+Plata"],
        category: "Pendientes",
        stock: 30,
        featured: false,
        aiHint: "silver hoops",
    }
].map(p => ({ ...p, salePrice: p.discountPercentage ? p.price * (1 - p.discountPercentage/100) : null }));

let coupons: Coupon[] = [
    {
        id: 1,
        code: 'VERANO20',
        discountType: 'percentage',
        discountValue: 20,
        expiryDate: new Date('2024-12-31'),
        isActive: true,
    },
    {
        id: 2,
        code: 'ENVIOFREE',
        discountType: 'fixed',
        discountValue: 15,
        expiryDate: null,
        isActive: true,
    },
     {
        id: 3,
        code: 'EXPIRADO',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: new Date('2023-01-01'),
        isActive: true,
    },
     {
        id: 4,
        code: 'INACTIVO',
        discountType: 'fixed',
        discountValue: 50,
        expiryDate: null,
        isActive: false,
    }
];

let orders: Order[] = [];
let subscribers: Subscriber[] = [];


// ############################################################################
// Helper Functions
// ############################################################################
function findProduct(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Product with ID ${id} not found.`);
    return product;
}

// ############################################################################
// Public API
// ############################################################################

// PRODUCTS
export function getProducts(): Promise<Product[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(products)));
}

export function getProductById(id: number): Promise<Product | undefined> {
    return Promise.resolve(products.find((p) => p.id === id));
}

export function createProduct(productData: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { ...productData, id: newId, salePrice: null };
    products.push(newProduct);
    return Promise.resolve(newProduct);
}

export function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) throw new Error(`Product with ID ${id} not found.`);
    products[productIndex] = { ...products[productIndex], ...productData };
    return Promise.resolve(products[productIndex]);
}

export function deleteProduct(id: number): Promise<void> {
    products = products.filter((p) => p.id !== id);
    return Promise.resolve();
}

// COUPONS
export function getCoupons(): Promise<Coupon[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(coupons)));
}

export function getCouponById(id: number): Promise<Coupon | undefined> {
    return Promise.resolve(coupons.find((c) => c.id === id));
}

export function getCouponByCode(code: string): Promise<Coupon | undefined> {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        return Promise.resolve(coupon);
    }
    return Promise.resolve(undefined);
}

export function createCoupon(couponData: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (coupons.some(c => c.code.toUpperCase() === couponData.code.toUpperCase())) {
        throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
    }
    const newId = coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1;
    const newCoupon: Coupon = { ...couponData, id: newId };
    coupons.push(newCoupon);
    return Promise.resolve(newCoupon);
}

export function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    const couponIndex = coupons.findIndex((c) => c.id === id);
    if (couponIndex === -1) throw new Error(`Coupon with ID ${id} not found.`);
    if (couponData.code && coupons.some(c => c.code.toUpperCase() === couponData.code!.toUpperCase() && c.id !== id)) {
        throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
    }
    coupons[couponIndex] = { ...coupons[couponIndex], ...couponData };
    return Promise.resolve(coupons[couponIndex]);
}

export function deleteCoupon(id: number): Promise<void> {
    coupons = coupons.filter((c) => c.id !== id);
    return Promise.resolve();
}

// ORDERS
export function createOrder(orderData: OrderData): Promise<number> {
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const newOrder: Order = {
        ...orderData,
        id: newId,
        createdAt: new Date(),
        paymentId: orderData.paymentId || undefined,
    };
    orders.push(newOrder);
    
    // Decrease stock
    for (const item of orderData.items) {
        const product = findProduct(item.product.id);
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ID: ${item.product.id}`);
        }
        product.stock -= item.quantity;
    }

    return Promise.resolve(newId);
}

export function updateOrderStatus(orderId: number, status: OrderData['status']): Promise<void> {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
    }
    return Promise.resolve();
}

export function restockItemsForOrder(orderId: number): Promise<void> {
     const order = orders.find(o => o.id === orderId);
     if (order) {
         for (const item of order.items) {
            const product = findProduct(item.product.id);
            product.stock += item.quantity;
         }
     }
     return Promise.resolve();
}

export function getOrders(): Promise<Order[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))));
}

export function getSalesMetrics(): Promise<SalesMetrics> {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalSales = paidOrders.length;
    
    const productCounts = paidOrders
        .flatMap(o => o.items)
        .reduce((acc, item) => {
            acc[item.product.id] = (acc[item.product.id] || 0) + item.quantity;
            return acc;
        }, {} as Record<number, number>);

    const topSellingProducts = Object.entries(productCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([productId, count]) => ({
            productId: Number(productId),
            name: findProduct(Number(productId))?.name || 'Unknown Product',
            count: count,
        }));

    return Promise.resolve({ totalRevenue, totalSales, topSellingProducts });
}

// SUBSCRIBERS
export function getSubscribers(): Promise<Subscriber[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(subscribers)));
}

export function addSubscriber(email: string): Promise<Subscriber> {
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Este email ya está suscripto.");
    }
    const newId = subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1;
    const newSubscriber: Subscriber = {
        id: newId,
        email,
        created_at: new Date(),
    };
    subscribers.push(newSubscriber);
    return Promise.resolve(newSubscriber);
}
