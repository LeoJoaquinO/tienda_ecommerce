
'use server';

import type { Product, Coupon, Order, SalesMetrics, OrderData, OrderStatus, CartItem } from './types';
import pool from './db';
import type { RowDataPacket, OkPacket } from 'mysql2';

// ############################################################################
// DATA MODE SWITCH
// ############################################################################
const USE_DB = !!process.env.DB_HOST;

// ############################################################################
// IN-MEMORY (HARDCODED) DATA STORE
// ############################################################################
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


// ############################################################################
// DATABASE & HELPER FUNCTIONS
// ############################################################################

// This function is the single point of entry to get the DB pool.
// It throws a clear error if the pool is not available.
function getPool() {
    if (!pool) {
        throw new Error('Database pool is not initialized. Check your .env file and ensure the application is running in an environment with database access.');
    }
    return pool;
}

function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}

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

function _rowToProduct(row: RowDataPacket): Product {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        shortDescription: row.short_description,
        price: Number(row.price),
        images: row.images ? row.images.split(',') : [],
        aiHint: row.ai_hint,
        category: row.category,
        stock: row.stock,
        featured: Boolean(row.featured),
        discountPercentage: row.discount_percentage ? Number(row.discount_percentage) : null,
        offerStartDate: row.offer_start_date ? new Date(row.offer_start_date) : null,
        offerEndDate: row.offer_end_date ? new Date(row.offer_end_date) : null,
        salePrice: null, // This will be calculated next
    };
}

function _rowToCoupon(row: RowDataPacket): Coupon {
    return {
        id: row.id,
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
        isActive: Boolean(row.is_active),
    };
}


// ############################################################################
// PRODUCTS
// ############################################################################
export async function getProducts(): Promise<Product[]> {
    if (USE_DB) {
        try {
            const [rows] = await getPool().query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
            return rows.map(_rowToProduct).map(p => ({...p, salePrice: _calculateSalePrice(p)}));
        } catch (error) {
            handleDbError(error, 'fetching products');
        }
    }
    // Return a deep copy to prevent mutation of the original data
    return JSON.parse(JSON.stringify(localProducts));
}

export async function getProductById(id: number): Promise<Product | undefined> {
     if (USE_DB) {
        try {
            const [rows] = await getPool().query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
            if (rows.length > 0) {
                const product = _rowToProduct(rows[0]);
                return { ...product, salePrice: _calculateSalePrice(product) };
            }
            return undefined;
        } catch (error) {
            handleDbError(error, `fetching product with id ${id}`);
        }
    }
    const product = localProducts.find((p) => p.id === id);
    return product ? JSON.parse(JSON.stringify(product)) : undefined;
}


// ############################################################################
// COUPONS
// ############################################################################
export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        try {
            const [rows] = await getPool().query<RowDataPacket[]>('SELECT * FROM coupons ORDER BY id DESC');
            return rows.map(_rowToCoupon);
        } catch (error) {
            handleDbError(error, 'fetching coupons');
        }
    }
    return JSON.parse(JSON.stringify(localCoupons));
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_DB) {
        try {
            const [rows] = await getPool().query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > NOW())', [code.toUpperCase()]);
            return rows.length > 0 ? _rowToCoupon(rows[0]) : undefined;
        } catch (error) {
            handleDbError(error, `fetching coupon with code ${code}`);
        }
    }
    const coupon = localCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        return JSON.parse(JSON.stringify(coupon));
    }
    return undefined;
}


// ############################################################################
// ORDERS
// ############################################################################
export async function getSalesMetrics(): Promise<SalesMetrics> {
     if (USE_DB) {
        try {
            const [revenueResult] = await getPool().query<RowDataPacket[]>(
                "SELECT SUM(total) as totalRevenue, COUNT(*) as totalSales FROM orders WHERE status = 'paid'"
            );

            const [topProductsResult] = await getPool().query<RowDataPacket[]>(`
                SELECT p.id, p.name, SUM(oi.quantity) as count
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'paid'
                GROUP BY p.id, p.name
                ORDER BY count DESC
                LIMIT 5
            `);
            
            return {
                totalRevenue: Number(revenueResult[0].totalRevenue) || 0,
                totalSales: Number(revenueResult[0].totalSales) || 0,
                topSellingProducts: topProductsResult.map(row => ({
                    productId: row.id,
                    name: row.name,
                    count: Number(row.count)
                }))
            };
        } catch(error) {
            handleDbError(error, 'fetching sales metrics');
        }
    }
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
    if (USE_DB) {
        const connection = await getPool().getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.query<OkPacket>(
                'INSERT INTO orders (customer_name, customer_email, total, status, coupon_code, discount_amount, shipping_address, shipping_city, shipping_postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [orderData.customerName, orderData.customerEmail, orderData.total, orderData.status, orderData.couponCode, orderData.discountAmount, orderData.shippingAddress, orderData.shippingCity, orderData.shippingPostalCode]
            );
            const orderId = orderResult.insertId;

            for (const item of orderData.items) {
                const [productRows] = await connection.query<RowDataPacket[]>('SELECT stock FROM products WHERE id = ? FOR UPDATE', [item.product.id]);
                if (productRows.length === 0 || productRows[0].stock < item.quantity) {
                    await connection.rollback();
                    return { error: `Insufficient stock for product ID: ${item.product.id}` };
                }

                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product.id, item.quantity, item.product.salePrice ?? item.product.price]
                );
                
                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.product.id]
                );
            }

            await connection.commit();
            return { orderId };
        } catch (error: any) {
            await connection.rollback();
            console.error("Error creating order in DB:", error);
            return { error: "Failed to create order due to a database error." };
        } finally {
            connection.release();
        }
    }
    // Hardcoded fallback
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
    if (USE_DB) {
        try {
            await getPool().query('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?', [status, paymentId || null, orderId]);
        } catch (error) {
            handleDbError(error, `updating order status for order ${orderId}`);
        }
        return;
    }
    // Hardcoded fallback
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if(paymentId) order.paymentId = paymentId;
    }
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (USE_DB) {
        const connection = await getPool().getConnection();
        try {
            await connection.beginTransaction();
            const [items] = await connection.query<RowDataPacket[] & { product_id: number; quantity: number; }[]>(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [orderId]
            );

            if (items.length === 0) {
                console.warn(`No items found for order ${orderId} to restock.`);
                await connection.commit();
                return;
            }

            for (const item of items) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
            await connection.commit();
        } catch(error) {
            await connection.rollback();
            handleDbError(error, `restocking items for order ${orderId}`);
        } finally {
            connection.release();
        }
        return;
    }
    // Hardcoded fallback
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

    