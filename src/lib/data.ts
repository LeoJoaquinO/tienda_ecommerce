

'use server';

import { db, isDbConnected } from './db';
import {
    getProducts as getProductsFromHardcodedData,
    getProductById as getProductByIdFromHardcodedData,
    createProduct as createProductFromHardcodedData,
    updateProduct as updateProductFromHardcodedData,
    deleteProduct as deleteProductFromHardcodedData,
    getCategories as getCategoriesFromHardcodedData,
    createCategory as createCategoryFromHardcodedData,
    deleteCategory as deleteCategoryFromHardcodedData,
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
    getOrderById as getOrderByIdFromHardcodedData,
    createOrderFromWebhook as createOrderFromWebhookFromHardcodedData,
} from './hardcoded-data';
import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus, Order, Category } from './types';
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
        categoryIds: row.category_ids || [],
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
    if (!isDbConnected) return getProductsFromHardcodedData();
    noStore();
    try {
        const rows = await db`
            SELECT p.*, COALESCE(array_agg(pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), '{}') as category_ids
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC;
        `;
        return rows.map(_mapDbRowToProduct);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch products.');
    }
}

export async function getProductById(id: number): Promise<Product | undefined> {
    if (!isDbConnected) return getProductByIdFromHardcodedData(id);
    noStore();
    try {
         const rows = await db`
            SELECT p.*, COALESCE(array_agg(pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), '{}') as category_ids
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            WHERE p.id = ${id}
            GROUP BY p.id;
        `;
        if (rows.length === 0) return undefined;
        return _mapDbRowToProduct(rows[0]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch product.');
    }
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    if (!isDbConnected) return createProductFromHardcodedData(product);
    const { name, description, shortDescription, price, images, categoryIds, stock, aiHint, featured, discountPercentage, offerStartDate, offerEndDate } = product;
    try {
        const productResult = await db`
            INSERT INTO products (name, description, short_description, price, images, stock, ai_hint, featured, discount_percentage, offer_start_date, offer_end_date, created_at)
            VALUES (${name}, ${description}, ${shortDescription}, ${price}, ${images}, ${stock}, ${aiHint}, ${featured}, ${discountPercentage}, ${offerStartDate?.toISOString()}, ${offerEndDate?.toISOString()}, ${new Date().toISOString()})
            RETURNING *;
        `;
        const newProduct = productResult[0];

        if (categoryIds && categoryIds.length > 0) {
            const values = categoryIds.map(catId => db`(${newProduct.id}, ${catId})`).reduce((prev, curr) => db`${prev}, ${curr}`);
            await db`INSERT INTO product_categories (product_id, category_id) VALUES ${values}`;
        }

        const finalProduct = await getProductById(newProduct.id);
        if (!finalProduct) {
            throw new Error('Failed to fetch product after creation.');
        }
        return finalProduct;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create product.');
    }
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    if (!isDbConnected) return updateProductFromHardcodedData(id, productData);
    
    const { name, description, shortDescription, price, images, categoryIds, stock, aiHint, featured, discountPercentage, offerStartDate, offerEndDate } = productData;
    
    try {
        // Update the product
        await db`
            UPDATE products
            SET name = ${name}, 
                description = ${description}, 
                short_description = ${shortDescription}, 
                price = ${price}, 
                images = ${images}, 
                stock = ${stock}, 
                ai_hint = ${aiHint}, 
                featured = ${featured}, 
                discount_percentage = ${discountPercentage}, 
                offer_start_date = ${offerStartDate?.toISOString() || null}, 
                offer_end_date = ${offerEndDate?.toISOString() || null}
            WHERE id = ${id}
        `;
        
        // Delete existing categories
        await db`DELETE FROM product_categories WHERE product_id = ${id}`;

        // Insert new categories
        if (categoryIds && categoryIds.length > 0) {
            const values = categoryIds.map(catId => db`(${id}, ${catId})`).reduce((prev, curr) => db`${prev}, ${curr}`);
            await db`INSERT INTO product_categories (product_id, category_id) VALUES ${values}`;
        }

        // Get the updated product
        const finalProduct = await getProductById(id);
        if (!finalProduct) {
            throw new Error('Product not found after update');
        }
        
        return finalProduct;

    } catch (error) {
        console.error('Database Error:', error);
        console.error('Error details:', (error as Error).message, (error as Error).stack);
        throw new Error('Failed to update product.');
    }
}


export async function deleteProduct(id: number): Promise<void> {
    if (!isDbConnected) return deleteProductFromHardcodedData(id);
    try {
        await db`DELETE FROM product_categories WHERE product_id = ${id}`;
        await db`DELETE FROM products WHERE id = ${id}`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete product.');
    }
}

// ############################################################################
// Category Functions
// ############################################################################

function _mapDbRowToCategory(row: any): Category {
    return {
        id: row.id,
        name: row.name,
        parentId: row.parent_id
    };
}

export async function getCategories(): Promise<Category[]> {
    if (!isDbConnected) return getCategoriesFromHardcodedData();
    noStore();
    try {
        const rows = await db`SELECT * FROM categories ORDER BY parent_id, name ASC`;
        return rows.map(_mapDbRowToCategory);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch categories.');
    }
}

export async function createCategory(name: string): Promise<Category> {
    if (!isDbConnected) return createCategoryFromHardcodedData(name);
    try {
        const result = await db`
            INSERT INTO categories (name) VALUES (${name}) RETURNING *;
        `;
        return _mapDbRowToCategory(result[0]);
    } catch (error: any) {
         if (error.message.includes('duplicate key value violates unique constraint')) {
            throw new Error(`La categoría '${name}' ya existe.`);
        }
        console.error('Database Error:', error);
        throw new Error('Failed to create category.');
    }
}

export async function deleteCategory(id: number): Promise<{ success: boolean; message?: string }> {
    if (!isDbConnected) return deleteCategoryFromHardcodedData(id);
    try {
        const products = await db`SELECT 1 FROM product_categories WHERE category_id = ${id} LIMIT 1`;
        if (products.length > 0) {
            return { success: false, message: 'No se puede eliminar la categoría porque está asignada a uno o más productos.' };
        }
        await db`DELETE FROM categories WHERE id = ${id}`;
        return { success: true };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete category.');
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
    if (!isDbConnected) return getCouponsFromHardcodedData();
    noStore();
    try {
        const rows = await db`SELECT * FROM coupons ORDER BY created_at DESC`;
        return rows.map(_mapDbRowToCoupon);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch coupons.');
    }
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (!isDbConnected) return getCouponByCodeFromHardcodedData(code);
    noStore();
    try {
        const rows = await db`
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
    if (!isDbConnected) return createCouponFromHardcodedData(coupon);
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        const result = await db`
            INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active)
            VALUES (${code.toUpperCase()}, ${discountType}, ${discountValue}, ${expiryDate?.toISOString()}, ${isActive})
            RETURNING *;
        `;
        return _mapDbRowToCoupon(result[0]);
    } catch (error: any) {
        if (error.message.includes('duplicate key value violates unique constraint')) { // Specific to Postgres
            throw new Error(`El código de cupón '${coupon.code}' ya existe.`);
        }
        console.error('Database Error:', error);
        throw new Error('Failed to create coupon.');
    }
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (!isDbConnected) return updateCouponFromHardcodedData(id, couponData);
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
        return _mapDbRowToCoupon(result[0]);
    } catch (error: any) {
        if (error.message.includes('duplicate key value violates unique constraint')) { // Specific to Postgres
             throw new Error(`El código de cupón '${couponData.code}' ya existe.`);
        }
        console.error('Database Error:', error);
        throw new Error('Failed to update coupon.');
    }
}

export async function deleteCoupon(id: number): Promise<void> {
    if (!isDbConnected) return deleteCouponFromHardcodedData(id);
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
    if (!isDbConnected) return createOrderFromHardcodedData(orderData);
    
    try {
        // Decrease stock for all items
        // This is not a true transaction, but it's the best we can do without a working `begin`
        for (const item of orderData.items) {
            const productResult = await db`SELECT stock FROM products WHERE id = ${item.product.id}`;
            if (productResult.length === 0 || productResult[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID: ${item.product.id}`);
            }
            await db`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product.id}`;
        }
        
        const { customerName, customerEmail, total, status, items, couponCode, discountAmount, shippingAddress, shippingCity, shippingPostalCode } = orderData;
        
        const orderResult = await db`
            INSERT INTO orders (customer_name, customer_email, total, status, items, coupon_code, discount_amount, shipping_address, shipping_city, shipping_postal_code)
            VALUES (${customerName}, ${customerEmail}, ${total}, ${status}, ${JSON.stringify(items)}::jsonb, ${couponCode}, ${discountAmount}, ${shippingAddress}, ${shippingCity}, ${shippingPostalCode})
            RETURNING id;
        `;

        return { orderId: orderResult[0].id };

    } catch (error: any) {
        console.error('Database Error during order creation:', error);
        // Attempt to restock items on failure
        console.log('Attempting to restock items due to order creation failure...');
        for (const item of orderData.items) {
            try {
                await db`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.product.id}`;
            } catch (restockError) {
                console.error(`CRITICAL: Failed to restock product ID ${item.product.id} after order failure. Manual intervention required.`);
            }
        }
        return { error: error.message || 'Failed to create order due to a database error.' };
    }
}


export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (!isDbConnected) return updateOrderStatusFromHardcodedData(orderId, status, paymentId);
    try {
        await db`UPDATE orders SET status = ${status}, payment_id = ${paymentId} WHERE id = ${orderId}`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update order status.');
    }
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (!isDbConnected) return restockItemsForOrderFromHardcodedData(orderId);
     try {
        const rows = await db`SELECT items, status FROM orders WHERE id = ${orderId}`;
        if (rows.length > 0) {
            const order = rows[0];
            // Only restock if the order is not already paid or shipped
            if (order.status !== 'paid' && order.status !== 'shipped') {
                const items = order.items as OrderData['items'];
                for (const item of items) {
                    await db`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.product.id}`;
                }
                console.log(`Restocked items for cancelled/failed order ${orderId}`);
            } else {
                 console.log(`Skipped restocking for order ${orderId} with status ${order.status}`);
            }
        }
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to restock items.');
    }
}

export async function getOrderById(id: number): Promise<Order | undefined> {
    if (!isDbConnected) return getOrderByIdFromHardcodedData(id);
    noStore();
    try {
        const result = await db`SELECT * FROM orders WHERE id = ${id}`;
        if (result.length === 0) return undefined;
        const row = result[0];
        return {
            id: row.id,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            total: parseFloat(row.total),
            status: row.status as OrderStatus,
            createdAt: new Date(row.created_at),
            items: row.items,
            couponCode: row.coupon_code,
            discountAmount: row.discount_amount ? parseFloat(row.discount_amount) : undefined,
            paymentId: row.payment_id,
            shippingAddress: row.shipping_address,
            shippingCity: row.shipping_city,
            shippingPostalCode: row.shipping_postal_code,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch order.');
    }
}

export async function createOrderFromWebhook(paymentData: any): Promise<{newOrder?: Order, error?: string}> {
    if (!isDbConnected) return createOrderFromWebhookFromHardcodedData(paymentData);

    const {
        payer,
        additional_info,
        transaction_amount,
        external_reference,
        id: paymentId,
        status: paymentStatus
    } = paymentData;

    if (!external_reference || !additional_info?.items || additional_info.items.length === 0) {
        return { error: 'Webhook data is missing required fields to create an order.' };
    }

    // This is a simplified creation and assumes a lot. A real implementation might need more info.
    const orderData: OrderData = {
        customerName: payer.first_name ? `${payer.first_name} ${payer.last_name}` : 'N/A',
        customerEmail: payer.email,
        total: transaction_amount,
        status: 'pending', // Will be updated immediately after by the webhook logic
        items: additional_info.items.map((item: any) => ({
            product: {
                id: parseInt(item.id),
                name: item.title,
                price: parseFloat(item.unit_price),
                // Other product details would be missing here
            },
            quantity: parseInt(item.quantity)
        })),
        shippingAddress: 'N/A',
        shippingCity: 'N/A',
        shippingPostalCode: 'N/A',
        paymentId: String(paymentId)
    };
    
    try {
        const orderResult = await db`
            INSERT INTO orders (id, customer_name, customer_email, total, status, items, payment_id, shipping_address, shipping_city, shipping_postal_code)
            VALUES (${external_reference}, ${orderData.customerName}, ${orderData.customerEmail}, ${orderData.total}, ${orderData.status}, ${JSON.stringify(orderData.items)}::jsonb, ${orderData.paymentId}, ${orderData.shippingAddress}, ${orderData.shippingCity}, ${orderData.shippingPostalCode})
            ON CONFLICT (id) DO NOTHING
            RETURNING *;
        `;
         if (orderResult.length === 0) {
             console.log(`Order ${external_reference} already existed. Skipped creation.`);
             return { newOrder: await getOrderById(parseInt(external_reference, 10)) };
        }
        const newOrder = await getOrderById(orderResult[0].id);
        return { newOrder };

    } catch (error: any) {
        return { error: error.message || 'Failed to create order from webhook.' };
    }
}


export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (!isDbConnected) return getSalesMetricsFromHardcodedData();
    noStore();
    try {
        const revenueResult = await db`SELECT SUM(total) as totalRevenue, COUNT(*) as totalSales FROM orders WHERE status = 'paid'`;
        const { totalrevenue, totalsales } = revenueResult[0];

        const productsResult = await db`
            SELECT 
                (item->'product'->>'id')::int as "productId", 
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
            topSellingProducts: productsResult.map(r => ({ ...r, count: Number(r.count) })),
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch sales metrics.');
    }
}

export async function getOrders(): Promise<Order[]> {
    if (!isDbConnected) return getOrdersFromHardcodedData();
    // This is a placeholder as getting orders is not yet implemented in the UI
    return [];
}
