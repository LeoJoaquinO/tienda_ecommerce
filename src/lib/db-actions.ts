'use server';

import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus } from './types';
import { getPool } from './db';
import type { RowDataPacket, OkPacket } from 'mysql2';

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

export async function getProductsFromDb(): Promise<Product[]> {
    try {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
        return rows.map(_rowToProduct).map(p => ({...p, salePrice: _calculateSalePrice(p)}));
    } catch (error) {
        handleDbError(error, 'fetching products');
    }
}

export async function getProductByIdFromDb(id: number): Promise<Product | undefined> {
    try {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
            const product = _rowToProduct(rows[0]);
            return { ...product, salePrice: _calculateSalePrice(product) };
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching product with id ${id}`);
    }
}

export async function createProductInDb(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const { name, description, shortDescription, price, images, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    const imagesString = images.join(',');
    try {
        const pool = getPool();
        const [result] = await pool.query<any>(
            'INSERT INTO products (name, description, short_description, price, images, category, stock, featured, ai_hint, discount_percentage, offer_start_date, offer_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, shortDescription, price, imagesString, category, stock, featured || false, aiHint || null, discountPercentage || null, offerStartDate || null, offerEndDate || null]
        );
        const [rows] = await pool.query<any>('SELECT * FROM products WHERE id = ?', [result.insertId]);
        if (rows.length === 0) throw new Error('Failed to retrieve product after creation.');
        const newProduct = _rowToProduct(rows[0]);
        return { ...newProduct, salePrice: _calculateSalePrice(newProduct) };
    } catch (error) {
        handleDbError(error, 'creating a product');
    }
}

export async function updateProductInDb(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const existingProduct = await getProductByIdFromDb(id);
    if(!existingProduct) throw new Error("Product not found");

    const fieldsToUpdate = { ...existingProduct, ...productData };
    const imagesString = fieldsToUpdate.images?.join(',');
    
    const dbFields = {
        name: fieldsToUpdate.name,
        description: fieldsToUpdate.description,
        short_description: fieldsToUpdate.shortDescription,
        price: fieldsToUpdate.price,
        images: imagesString,
        category: fieldsToUpdate.category,
        stock: fieldsToUpdate.stock,
        featured: fieldsToUpdate.featured,
        ai_hint: fieldsToUpdate.aiHint,
        discount_percentage: fieldsToUpdate.discountPercentage,
        offer_start_date: fieldsToUpdate.offerStartDate,
        offer_end_date: fieldsToUpdate.offerEndDate,
    }

    const fieldNames = Object.keys(dbFields);
    const setClause = fieldNames.map(field => `${'`'}${field}${'`'} = ?`).join(', ');
    const values = [...fieldNames.map(field => (dbFields as any)[field]), id];
    
    try {
        const pool = getPool();
        await pool.query(`UPDATE products SET ${setClause} WHERE id = ?`, values);
        const updatedProduct = await getProductByIdFromDb(id);
        if (!updatedProduct) throw new Error('Failed to retrieve product after update.');
        return updatedProduct;
    } catch (error) {
        handleDbError(error, `updating product with id ${id}`);
    }
}

export async function deleteProductFromDb(id: number): Promise<void> {
    try {
        const pool = getPool();
        const [result] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        }
    } catch (error) {
        handleDbError(error, `deleting product with id ${id}`);
    }
}

export async function getCouponsFromDb(): Promise<Coupon[]> {
    try {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons ORDER BY id DESC');
        return rows.map(_rowToCoupon);
    } catch (error) {
        handleDbError(error, 'fetching coupons');
    }
}

export async function getCouponByIdFromDb(id: number): Promise<Coupon | undefined> {
    try {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE id = ?', [id]);
        return rows.length > 0 ? _rowToCoupon(rows[0]) : undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with id ${id}`);
    }
}

export async function getCouponByCodeFromDb(code: string): Promise<Coupon | undefined> {
    try {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > NOW())', [code.toUpperCase()]);
        return rows.length > 0 ? _rowToCoupon(rows[0]) : undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with code ${code}`);
    }
}

export async function createCouponInDb(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        const pool = getPool();
        const [result] = await pool.query<any>(
            'INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active) VALUES (?, ?, ?, ?, ?)',
            [code.toUpperCase(), discountType, discountValue, expiryDate, isActive]
        );
        const [rows] = await pool.query<any>('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
        if (rows.length === 0) throw new Error('Failed to retrieve coupon after creation.');
        return _rowToCoupon(rows[0]);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        handleDbError(error, 'creating a coupon');
    }
}

export async function updateCouponInDb(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    const existingCoupon = await getCouponByIdFromDb(id);
    if (!existingCoupon) throw new Error(`Coupon with ID ${id} not found.`);
    
    const fieldsToUpdate = { ...existingCoupon, ...couponData};
    const { code, discountType, discountValue, expiryDate, isActive } = fieldsToUpdate;

    try {
        const pool = getPool();
        await pool.query(
            'UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, expiry_date = ?, is_active = ? WHERE id = ?',
            [code?.toUpperCase(), discountType, discountValue, expiryDate, isActive, id]
        );
        const [rows] = await pool.query<any>('SELECT * FROM coupons WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Failed to retrieve coupon after update.');
        return _rowToCoupon(rows[0]);
    } catch (error: any) {
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        handleDbError(error, `updating coupon with id ${id}`);
    }
}

export async function deleteCouponFromDb(id: number): Promise<void> {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    } catch (error) {
        handleDbError(error, `deleting coupon with id ${id}`);
    }
}

export async function getSalesMetricsFromDb(): Promise<SalesMetrics> {
    try {
        const pool = getPool();
        const [revenueResult] = await pool.query<RowDataPacket[]>(
            "SELECT SUM(total) as totalRevenue, COUNT(*) as totalSales FROM orders WHERE status = 'paid'"
        );

        const [topProductsResult] = await pool.query<RowDataPacket[]>(`
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

export async function createOrderInDb(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    const pool = getPool();
    const connection = await pool.getConnection();
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

export async function updateOrderStatusInDb(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    try {
        const pool = getPool();
        await pool.query('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?', [status, paymentId || null, orderId]);
    } catch (error) {
        handleDbError(error, `updating order status for order ${orderId}`);
    }
    return;
}

export async function restockItemsForOrderInDb(orderId: number): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
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
