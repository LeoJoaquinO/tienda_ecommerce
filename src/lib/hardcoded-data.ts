
'use server';

import type { Product, Coupon, Order, SalesMetrics, OrderData, OrderStatus } from './types';

let localProducts: Product[] = [
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
        salePrice: 120.00,
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
].map(p => ({ ...p, salePrice: _calculateSalePrice(p) }));

let localCoupons: Coupon[] = [
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

let localOrders: Order[] = [];
let nextOrderId = 1;

function _calculateSalePrice(product: Omit<Product, 'salePrice'>): number | null {
    const now = new Date();
    const isOfferValid = 
        product.discountPercentage && product.discountPercentage > 0 &&
        product.offerStartDate && product.offerEndDate &&
        now >= new Date(product.offerStartDate) && now <= new Date(product.offerEndDate);

    if (isOfferValid) {
        const discount = product.price * (product.discountPercentage! / 100);
        return parseFloat((product.price - discount).toFixed(2));
    }
    return null;
}

export async function getProductsFromHardcoded(): Promise<Product[]> {
    return JSON.parse(JSON.stringify(localProducts));
}

export async function getProductByIdFromHardcoded(id: number): Promise<Product | undefined> {
    const product = localProducts.find((p) => p.id === id);
    return product ? JSON.parse(JSON.stringify(product)) : undefined;
}

export async function createProductInHardcoded(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const newId = (localProducts.reduce((max, p) => Math.max(p.id, max), 0)) + 1;
    const newProduct: Product = { ...product, id: newId };
    localProducts.unshift({ ...newProduct, salePrice: _calculateSalePrice(newProduct) });
    return newProduct;
}

export async function updateProductInHardcoded(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const productIndex = localProducts.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error("Product not found");
    const updatedProduct = { ...localProducts[productIndex], ...productData };
    localProducts[productIndex] = { ...updatedProduct, salePrice: _calculateSalePrice(updatedProduct) };
    return localProducts[productIndex];
}

export async function deleteProductFromHardcoded(id: number): Promise<void> {
    const productIndex = localProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
        console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        return;
    };
    localProducts.splice(productIndex, 1);
}

export async function getCouponsFromHardcoded(): Promise<Coupon[]> {
    return JSON.parse(JSON.stringify(localCoupons));
}

export async function getCouponByIdFromHardcoded(id: number): Promise<Coupon | undefined> {
    return localCoupons.find(c => c.id === id);
}

export async function getCouponByCodeFromHardcoded(code: string): Promise<Coupon | undefined> {
    const coupon = localCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        return JSON.parse(JSON.stringify(coupon));
    }
    return undefined;
}

export async function createCouponInHardcoded(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (localCoupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
        throw new Error(`El código de cupón '${coupon.code}' ya existe.`);
    }
    const newId = (localCoupons.reduce((max, p) => Math.max(p.id, max), 0)) + 1;
    const newCoupon = { ...coupon, id: newId };
    localCoupons.unshift(newCoupon);
    return newCoupon;
}

export async function updateCouponInHardcoded(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    const couponIndex = localCoupons.findIndex(c => c.id === id);
    if (couponIndex === -1) throw new Error("Coupon not found");
    if (couponData.code && localCoupons.some(c => c.id !== id && c.code.toUpperCase() === couponData.code!.toUpperCase())) {
        throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
    }
    localCoupons[couponIndex] = { ...localCoupons[couponIndex], ...couponData };
    return localCoupons[couponIndex];
}

export async function deleteCouponFromHardcoded(id: number): Promise<void> {
    const couponIndex = localCoupons.findIndex(c => c.id === id);
    if (couponIndex === -1) {
        console.warn(`Attempted to delete coupon with id ${id}, but it was not found.`);
        return;
    }
    localCoupons.splice(couponIndex, 1);
}

export async function getSalesMetricsFromHardcoded(): Promise<SalesMetrics> {
    const paidOrders = localOrders.filter(o => o.status === 'paid');
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
            name: localProducts.find(p => p.id === Number(productId))?.name || 'Unknown Product',
            count: count,
        }));

    return { totalRevenue, totalSales, topSellingProducts };
}

export async function createOrderInHardcoded(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    for (const item of orderData.items) {
        const product = localProducts.find(p => p.id === item.product.id);
        if (!product || product.stock < item.quantity) {
            return { error: `Insufficient stock for product ID: ${item.product.id}` };
        }
        product.stock -= item.quantity;
    }
    
    const newOrder: Order = {
        ...orderData,
        id: nextOrderId++,
        createdAt: new Date(),
        paymentId: orderData.paymentId || undefined,
    };
    localOrders.unshift(newOrder);

    return { orderId: newOrder.id };
}

export async function updateOrderStatusInHardcoded(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if(paymentId) order.paymentId = paymentId;
    }
}

export async function restockItemsForOrderInHardcoded(orderId: number): Promise<void> {
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
        for (const item of order.items) {
            const product = localProducts.find(p => p.id === item.product.id);
            if (product) {
                product.stock += item.quantity;
            }
        }
    }
}
