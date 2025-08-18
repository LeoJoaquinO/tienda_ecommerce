
'use server';

import type { Product, Coupon, Order, SalesMetrics, OrderData, OrderStatus, Category } from './types';

let localCategories: Category[] = [
    { id: 1, name: "Perfumes" },
    { id: 2, name: "Cuidado de Piel" },
    { id: 3, name: "Joyas" },
    { id: 4, name: "Accesorios" }
];
let nextCategoryId = 5;

let localProducts: Product[] = [
    {
        id: 1,
        name: "Lancôme La Vie Est Belle",
        description: "Una declaración universal a la belleza de la vida. Una firma olfativa única, encapsulada en el aroma de este perfume dulce que representa una declaración de felicidad.",
        shortDescription: "Eau de Parfum - Floral Frutal.",
        price: 75000,
        images: ["https://tascani.vtexassets.com/arquivos/ids/182034-800-auto?v=638635608787130000&width=800&height=auto&aspect=true"],
        categoryIds: [1],
        stock: 15,
        featured: true,
        aiHint: "luxury perfume bottle",
        discountPercentage: 10,
        offerStartDate: new Date('2024-05-01'),
        offerEndDate: new Date('2024-12-31'),
        salePrice: 67500,
    },
    {
        id: 2,
        name: "L'Occitane Karité Crema de Manos",
        description: "Enriquecida con un 20% de manteca de karité orgánica, esta crema de manos se absorbe rápidamente, dejando las manos suaves, nutridas y protegidas.",
        shortDescription: "Crema de manos ultra nutritiva.",
        price: 25000,
        images: ["https://farma365.com.ar/wp-content/uploads/2024/04/3348901486392-3.webp"],
        categoryIds: [2],
        stock: 8,
        featured: true,
        aiHint: "hand cream tube",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 3,
        name: "Dior Sauvage Elixir",
        description: "Un licor con una estela embriagadora, compuesto por ingredientes excepcionales. Un corazón de especias, una esencia de lavanda 'a medida' y una mezcla de maderas licorosas.",
        shortDescription: "Perfume masculino concentrado.",
        price: 120000,
        images: ["https://acdn-us.mitiendanube.com/stores/001/071/596/products/snapinsta-app_457143249_18272561446241493_4114811689171539800_n_1080-copia-4c107f322e0631e79017304658593813-240-0.jpg"],
        categoryIds: [1],
        stock: 12,
        featured: true,
        aiHint: "dark perfume bottle",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 4,
        name: "Pulsera de Plata con Dije de Corazón",
        description: "Una pulsera de plata de ley 925 con un diseño de cadena fina y un delicado dije de corazón, perfecta para un regalo o para el uso diario.",
        shortDescription: "Pulsera de plata 925.",
        price: 45000,
        images: ["https://holiclothing.com.ar/wp-content/uploads/2023/10/WhatsApp-Image-2022-07-13-at-7.49.03-PM-1.jpeg"],
        categoryIds: [3],
        stock: 25,
        featured: false,
        aiHint: "silver bracelet heart",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 5,
        name: "Reloj Clásico de Cuero",
        description: "Reloj analógico con movimiento de cuarzo, caja de acero inoxidable y correa de cuero genuino. Un diseño atemporal para cualquier ocasión.",
        shortDescription: "Reloj analógico de cuero.",
        price: 85000,
        images: ["https://placehold.co/600x600.png?text=Reloj+Cuero"],
        categoryIds: [4],
        stock: 5,
        featured: true,
        aiHint: "classic leather watch",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 6,
        name: "Aros de Oro 18k",
        description: "Pequeños aros de oro de 18 quilates con un diseño minimalista y elegante, ideales para el uso diario y para combinar con otras joyas.",
        shortDescription: "Aros de oro minimalistas.",
        price: 60000,
        images: ["https://placehold.co/600x600.png?text=Aros+Oro"],
        categoryIds: [3],
        stock: 20,
        featured: false,
        aiHint: "gold earrings",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 7,
        name: "Chanel Nº5",
        description: "El perfume por excelencia. Un bouquet floral aldehído, una composición intemporal y legendaria.",
        shortDescription: "El icónico perfume femenino.",
        price: 115000,
        images: ["https://placehold.co/600x600.png?text=Chanel+N5"],
        categoryIds: [1],
        stock: 10,
        featured: false,
        aiHint: "classic perfume bottle",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 8,
        name: "Sérum Hidratante con Ácido Hialurónico",
        description: "Un sérum ligero que proporciona una hidratación intensa y duradera para una piel suave y flexible.",
        shortDescription: "Sérum facial de hidratación profunda.",
        price: 35000,
        images: ["https://placehold.co/600x600.png?text=Serum"],
        categoryIds: [2],
        stock: 30,
        featured: false,
        aiHint: "skincare serum bottle",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 9,
        name: "Collar de Perlas Cultivadas",
        description: "Un collar clásico de perlas cultivadas de agua dulce, anudadas a mano con un broche de plata.",
        shortDescription: "Collar de perlas clásico.",
        price: 95000,
        images: ["https://placehold.co/600x600.png?text=Collar+Perlas"],
        categoryIds: [3],
        stock: 8,
        featured: true,
        aiHint: "pearl necklace",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 10,
        name: "Gafas de Sol Estilo Aviador",
        description: "Gafas de sol unisex con montura metálica y lentes polarizadas con protección UV400.",
        shortDescription: "Gafas de sol clásicas.",
        price: 30000,
        images: ["https://placehold.co/600x600.png?text=Gafas+Sol"],
        categoryIds: [4],
        stock: 40,
        featured: false,
        aiHint: "aviator sunglasses",
        discountPercentage: 15,
        offerStartDate: new Date('2024-06-01'),
        offerEndDate: new Date('2024-08-31'),
        salePrice: 25500,
    },
    {
        id: 11,
        name: "Anillo de Compromiso Solitario",
        description: "Anillo de oro blanco de 14k con un diamante de corte brillante de 0.5 quilates.",
        shortDescription: "Anillo de diamante solitario.",
        price: 250000,
        images: ["https://placehold.co/600x600.png?text=Anillo+Diamante"],
        categoryIds: [3],
        stock: 3,
        featured: false,
        aiHint: "diamond ring",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 12,
        name: "Gucci Bloom",
        description: "Una fragancia que captura el espíritu de la mujer contemporánea, diversa y auténtica.",
        shortDescription: "Eau de Parfum floral.",
        price: 98000,
        images: ["https://placehold.co/600x600.png?text=Gucci+Bloom"],
        categoryIds: [1],
        stock: 18,
        featured: false,
        aiHint: "pink perfume bottle",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 13,
        name: "Protector Solar FPS 50+",
        description: "Protector solar de amplio espectro con una textura ligera y no grasa, resistente al agua.",
        shortDescription: "Protector solar facial y corporal.",
        price: 22000,
        images: ["https://placehold.co/600x600.png?text=Protector+Solar"],
        categoryIds: [2],
        stock: 50,
        featured: false,
        aiHint: "sunscreen bottle",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 14,
        name: "Pañuelo de Seda Estampado",
        description: "Un pañuelo de seda 100% natural con un vibrante estampado floral, perfecto para el cuello o como accesorio para el bolso.",
        shortDescription: "Pañuelo de seda natural.",
        price: 28000,
        images: ["https://placehold.co/600x600.png?text=Panuelo+Seda"],
        categoryIds: [4],
        stock: 22,
        featured: true,
        aiHint: "silk scarf pattern",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
    {
        id: 15,
        name: "Gemelos de Plata Personalizables",
        description: "Elegantes gemelos de plata de ley que se pueden grabar con iniciales para un regalo único.",
        shortDescription: "Gemelos de plata para camisa.",
        price: 48000,
        images: ["https://placehold.co/600x600.png?text=Gemelos+Plata"],
        categoryIds: [3, 4],
        stock: 15,
        featured: false,
        aiHint: "silver cufflinks",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
     {
        id: 16,
        name: "Mascarilla Facial de Arcilla",
        description: "Mascarilla purificante con arcilla verde y aceite de árbol de té para limpiar los poros en profundidad.",
        shortDescription: "Mascarilla facial purificante.",
        price: 18000,
        images: ["https://placehold.co/600x600.png?text=Mascarilla+Arcilla"],
        categoryIds: [2],
        stock: 35,
        featured: false,
        aiHint: "clay face mask jar",
        discountPercentage: null,
        offerStartDate: null,
        offerEndDate: null,
        salePrice: null,
    },
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

export async function getProducts(): Promise<Product[]> {
    return JSON.parse(JSON.stringify(localProducts));
}

export async function getProductById(id: number): Promise<Product | undefined> {
    const product = localProducts.find((p) => p.id === id);
    return product ? JSON.parse(JSON.stringify(product)) : undefined;
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const newId = (localProducts.reduce((max, p) => Math.max(p.id, max), 0)) + 1;
    const newProduct: Product = { ...product, id: newId, salePrice: null };
    localProducts.unshift({ ...newProduct, salePrice: _calculateSalePrice(newProduct) });
    return newProduct;
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const productIndex = localProducts.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error("Product not found");
    const updatedProduct = { ...localProducts[productIndex], ...productData };
    localProducts[productIndex] = { ...updatedProduct, salePrice: _calculateSalePrice(updatedProduct) };
    return localProducts[productIndex];
}

export async function deleteProduct(id: number): Promise<void> {
    const productIndex = localProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
        console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        return;
    };
    localProducts.splice(productIndex, 1);
}

// Category Functions
export async function getCategories(): Promise<Category[]> {
    return JSON.parse(JSON.stringify(localCategories));
}

export async function createCategory(name: string): Promise<Category> {
    if (localCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        throw new Error(`La categoría '${name}' ya existe.`);
    }
    const newCategory = { id: nextCategoryId++, name };
    localCategories.push(newCategory);
    return newCategory;
}

export async function deleteCategory(id: number): Promise<{ success: boolean, message?: string }> {
    const isCategoryInUse = localProducts.some(p => p.categoryIds.includes(id));
    if (isCategoryInUse) {
        return { success: false, message: 'No se puede eliminar la categoría porque está asignada a uno o más productos.' };
    }
    const index = localCategories.findIndex(c => c.id === id);
    if (index > -1) {
        localCategories.splice(index, 1);
        return { success: true };
    }
    return { success: false, message: 'Categoría no encontrada.' };
}


export async function getCoupons(): Promise<Coupon[]> {
    return JSON.parse(JSON.stringify(localCoupons));
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    const coupon = localCoupons.find(c => c.id === id);
    return coupon ? JSON.parse(JSON.stringify(coupon)) : undefined;
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    const coupon = localCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        return JSON.parse(JSON.stringify(coupon));
    }
    return undefined;
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (localCoupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
        throw new Error(`El código de cupón '${coupon.code}' ya existe.`);
    }
    const newId = (localCoupons.reduce((max, p) => Math.max(p.id, max), 0)) + 1;
    const newCoupon = { ...coupon, id: newId };
    localCoupons.unshift(newCoupon);
    return newCoupon;
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    const couponIndex = localCoupons.findIndex(c => c.id === id);
    if (couponIndex === -1) throw new Error("Coupon not found");
    if (couponData.code && localCoupons.some(c => c.id !== id && c.code.toUpperCase() === couponData.code!.toUpperCase())) {
        throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
    }
    const updatedCoupon = { ...localCoupons[couponIndex], ...couponData };
    localCoupons[couponIndex] = updatedCoupon;
    return updatedCoupon;
}

export async function deleteCoupon(id: number): Promise<void> {
    const couponIndex = localCoupons.findIndex(c => c.id === id);
    if (couponIndex === -1) {
        console.warn(`Attempted to delete coupon with id ${id}, but it was not found.`);
        return;
    }
    localCoupons.splice(couponIndex, 1);
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
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

export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
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

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if(paymentId) order.paymentId = paymentId;
    }
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
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

export async function getOrders(): Promise<Order[]> {
    return JSON.parse(JSON.stringify(localOrders));
}
