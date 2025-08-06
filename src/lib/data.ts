
'use server';

import { db, isDbConnected } from './db';
import {
    getProducts as getProductsFromHardcodedData,
    getProductById as getProductByIdFromHardcodedData,
    createProduct as createProductFromHardcodedData,
    updateProduct as updateProductFromHardcodedData,
    deleteProduct as deleteProductFromHardcodedData,
    getCoupons as getCouponsFromHardcodedData,
    getCouponById as getCouponByIdFromHardcodedData,
    getCouponByCode as getCouponByCodeFromHardcodedData,
    createCoupon as createCouponFromHardcodedData,
    updateCoupon as updateCouponFromHardcodedData,
    deleteCoupon as deleteCouponFromHardcodedData,
    getSalesMetrics as getSalesMetricsFromHardcodedData,
    createOrder as createOrderFromHardcodedData,
    updateOrderStatus as updateOrderStatusFromHardcodedData,
    restockItemsForOrder as restockItemsForOrderFromHardcodedData,
    getOrders as getOrdersFromHardcodedData,
} from './hardcoded-data';
import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus, Order } from './types';
import { unstable_noStore as noStore } from 'next/cache';

// ############################################################################
// Helper Functions
// ############################################################################

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

function _mapDbRowToProduct(row: any): Product {
    const product: Product = {
        id: row.id,
        name: row.name,
        description: row.description,
        shortDescription: row.short_description,
        price: parseFloat(row.price),
        images: row.images,
        category: row.category,
        stock: row.stock,
        aiHint: row.ai_hint,
        featured: row.featured,
        discountPercentage: row.discount_percentage ? parseFloat(row.discount_percentage) : null,
        offerStartDate: row.offer_start_date,
        offerEndDate: row.offer_end_date,
        salePrice: null,
    };
    product.salePrice = _calculateSalePrice(product);
    return product;
}


// ############################################################################
// Product Functions
// ############################################################################

export async function getProducts(): Promise<Product[]> {
    if (!db) return getProductsFromHardcodedData();
    noStore();
    try {
        const { rows } = await db`SELECT * FROM products ORDER BY created_at DESC`;
        return rows.map(_mapDbRowToProduct);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch products.');
    }
}

export async function getProductById(id: number): Promise<Product | undefined> {
    if (!db) return getProductByIdFromHardcodedData(id);
    noStore();
    try {
        const { rows } = await db`SELECT * FROM products WHERE id = ${id}`;
        if (rows.length === 0) return undefined;
        return _mapDbRowToProduct(rows[0]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch product.');
    }
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    if (!db) return createProductFromHardcodedData(product);
    const { name, description, shortDescription, price, images, category, stock, aiHint, featured, discountPercentage, offerStartDate, offerEndDate } = product;
    try {
       const result = await db`
            INSERT INTO products (name, description, short_description, price, images, category, stock, ai_hint, featured, discount_percentage, offer_start_date, offer_end_date)
            VALUES (${name}, ${description}, ${shortDescription}, ${price}, ${images}, ${category}, ${stock}, ${aiHint}, ${featured}, ${discountPercentage}, ${offerStartDate?.toISOString()}, ${offerEndDate?.toISOString()})
            RETURNING *;
        `;
        return _mapDbRowToProduct(result.rows[0]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create product.');
    }
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    if (!db) return updateProductFromHardcodedData(id, productData);
     const { name, description, shortDescription, price, images, category, stock, aiHint, featured, discountPercentage, offerStartDate, offerEndDate } = productData;
    try {
        const result = await db`
            UPDATE products
            SET name = ${name}, 
                description = ${description}, 
                short_description = ${shortDescription}, 
                price = ${price}, 
                images = ${images}, 
                category = ${category}, 
                stock = ${stock}, 
                ai_hint = ${aiHint}, 
                featured = ${featured}, 
                discount_percentage = ${discountPercentage}, 
                offer_start_date = ${offerStartDate?.toISOString()}, 
                offer_end_date = ${offerEndDate?.toISOString()}
            WHERE id = ${id}
            RETURNING *;
        `;
        return _mapDbRowToProduct(result.rows[0]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update product.');
    }
}

export async function deleteProduct(id: number): Promise<void> {
    if (!db) return deleteProductFromHardcodedData(id);
    try {
        await db`DELETE FROM products WHERE id = ${id}`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete product.');
    }
}


// ############################################################################
// Coupon Functions
// ############################################################################

function _mapDbRowToCoupon(row: any): Coupon {
    return {
        id: row.id,
        code: row.code,
        discountType: row.discount_type,
        discountValue: parseFloat(row.discount_value),
        expiryDate: row.expiry_date,
        isActive: row.is_active,
    };
}


export async function getCoupons(): Promise<Coupon[]> {
    if (!db) return getCouponsFromHardcodedData();
    noStore();
    try {
        const { rows } = await db`SELECT * FROM coupons ORDER BY created_at DESC`;
        return rows.map(_mapDbRowToCoupon);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch coupons.');
    }
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (!db) return getCouponByCodeFromHardcodedData(code);
    noStore();
    try {
        const { rows } = await db`
            SELECT * FROM coupons 
            WHERE code = ${code.toUpperCase()} AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > NOW())
        `;
        if (rows.length === 0) return undefined;
        return _mapDbRowToCoupon(rows[0]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch coupon.');
    }
}


export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (!db) return createCouponFromHardcodedData(coupon);
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        const result = await db`
            INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active)
            VALUES (${code.toUpperCase()}, ${discountType}, ${discountValue}, ${expiryDate?.toISOString()}, ${isActive})
            RETURNING *;
        `;
        return _mapDbRowToCoupon(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            throw new Error(`El código de cupón '${coupon.code}' ya existe.`);
        }
        console.error('Database Error:', error);
        throw new Error('Failed to create coupon.');
    }
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (!db) return updateCouponFromHardcodedData(id, couponData);
    const { code, discountType, discountValue, expiryDate, isActive } = couponData;
    try {
        const result = await db`
            UPDATE coupons
            SET code = ${code?.toUpperCase()}, 
                discount_type = ${discountType}, 
                discount_value = ${discountValue}, 
                expiry_date = ${expiryDate?.toISOString()}, 
                is_active = ${isActive}
            WHERE id = ${id}
            RETURNING *;
        `;
        return _mapDbRowToCoupon(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
        }
        console.error('Database Error:', error);
        throw new Error('Failed to update coupon.');
    }
}

export async function deleteCoupon(id: number): Promise<void> {
    if (!db) return deleteCouponFromHardcodedData(id);
    try {
        await db`DELETE FROM coupons WHERE id = ${id}`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete coupon.');
    }
}


// ############################################################################
// Order & Sales Functions
// ############################################################################

export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    if (!db) return createOrderFromHardcodedData(orderData);
    
    // This needs to be a transaction to ensure stock is updated correctly
    try {
        const result = await db.transaction(async (tx) => {
            for (const item of orderData.items) {
                const stockResult = await tx`SELECT stock FROM products WHERE id = ${item.product.id} FOR UPDATE`;
                if (stockResult.rows[0].stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ID: ${item.product.id}`);
                }
                await tx`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product.id}`;
            }

            const { customerName, customerEmail, total, status, items, couponCode, discountAmount, shippingAddress, shippingCity, shippingPostalCode } = orderData;
            
            const orderResult = await tx`
                INSERT INTO orders (customer_name, customer_email, total, status, items, coupon_code, discount_amount, shipping_address, shipping_city, shipping_postal_code)
                VALUES (${customerName}, ${customerEmail}, ${total}, ${status}, ${JSON.stringify(items)}, ${couponCode}, ${discountAmount}, ${shippingAddress}, ${shippingCity}, ${shippingPostalCode})
                RETURNING id;
            `;

            return { orderId: orderResult.rows[0].id };
        });
        return result;

    } catch (error: any) {
        console.error('Database Error:', error);
        return { error: 'Failed to create order due to a database error.' };
    }
}


export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (!db) return updateOrderStatusFromHardcodedData(orderId, status, paymentId);
    try {
        await db`UPDATE orders SET status = ${status}, payment_id = ${paymentId} WHERE id = ${orderId}`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update order status.');
    }
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (!db) return restockItemsForOrderFromHardcodedData(orderId);
     try {
        const { rows } = await db`SELECT items FROM orders WHERE id = ${orderId}`;
        if (rows.length > 0) {
            const items = rows[0].items as OrderData['items'];
            await db.transaction(async (tx) => {
                 for (const item of items) {
                    await tx`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.product.id}`;
                }
            });
        }
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to restock items.');
    }
}


export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (!db) return getSalesMetricsFromHardcodedData();
    noStore();
    try {
        const revenueResult = await db`SELECT SUM(total) as totalRevenue, COUNT(*) as totalSales FROM orders WHERE status = 'paid'`;
        const { totalrevenue, totalsales } = revenueResult.rows[0];

        const productsResult = await db`
            SELECT 
                (item->'product'->>'id')::int as productId, 
                item->'product'->>'name' as name, 
                SUM((item->>'quantity')::int) as count
            FROM orders, jsonb_array_elements(items) as item
            WHERE status = 'paid'
            GROUP BY 1, 2
            ORDER BY count DESC
            LIMIT 5;
        `;
        
        return {
            totalRevenue: parseFloat(totalrevenue) || 0,
            totalSales: parseInt(totalsales) || 0,
            topSellingProducts: productsResult.rows,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch sales metrics.');
    }
}

export async function getOrders(): Promise<Order[]> {
    if (!db) return getOrdersFromHardcodedData();
    // This is a placeholder as getting orders is not yet implemented in the UI
    return [];
}
