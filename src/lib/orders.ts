'use server';

import pool from './db';
import type { OrderData, OrderStatus, SalesMetrics, Order, CartItem } from './types';
import { RowDataPacket, OkPacket } from 'mysql2';

function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}

function rowToOrder(row: RowDataPacket): Order {
     return {
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        total: parseFloat(row.total),
        status: row.status,
        createdAt: new Date(row.created_at),
        items: [], // Items need to be fetched separately
        couponCode: row.coupon_code,
        discountAmount: row.discount_amount ? parseFloat(row.discount_amount) : undefined,
        paymentId: row.payment_id,
        shippingAddress: row.shipping_address,
        shippingCity: row.shipping_city,
        shippingPostalCode: row.shipping_postal_code,
    };
}

export async function createOrder(orderData: OrderData): Promise<number> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query<OkPacket>(
            'INSERT INTO orders (customer_name, customer_email, total, status, coupon_code, discount_amount, shipping_address, shipping_city, shipping_postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [orderData.customerName, orderData.customerEmail, orderData.total, orderData.status, orderData.couponCode, orderData.discountAmount, orderData.shippingAddress, orderData.shippingCity, orderData.shippingPostalCode]
        );
        const orderId = orderResult.insertId;

        for (const item of orderData.items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product.id, item.quantity, item.product.salePrice ?? item.product.price]
            );
            
            const [updateResult] = await connection.query<OkPacket>(
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [item.quantity, item.product.id, item.quantity]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error(`Insufficient stock for product ID: ${item.product.id}`);
            }
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        handleDbError(error, 'creating an order');
    } finally {
        connection.release();
    }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    try {
        await pool.query('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?', [status, paymentId || null, orderId]);
    } catch (error) {
        handleDbError(error, `updating order status for order ${orderId}`);
    }
}

type OrderItem = {
    product_id: number;
    quantity: number;
};

export async function restockItemsForOrder(orderId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [items] = await connection.query<RowDataPacket[] & OrderItem[]>(
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
}

export async function getOrders(): Promise<Order[]> {
    try {
        const [orderRows] = await pool.query<RowDataPacket[]>('SELECT * FROM orders ORDER BY created_at DESC');
        const orders = orderRows.map(rowToOrder);

        for (const order of orders) {
            const [itemRows] = await pool.query<RowDataPacket[]>(`
                SELECT oi.quantity, oi.price, p.id as product_id, p.name, p.images 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);

            order.items = itemRows.map(itemRow => ({
                quantity: itemRow.quantity,
                product: {
                    id: itemRow.product_id,
                    name: itemRow.name,
                    price: parseFloat(itemRow.price),
                    images: itemRow.images ? itemRow.images.split(',') : [],
                    description: '',
                    shortDescription: '',
                    category: '',
                    stock: 0,
                    featured: false,
                }
            }));
        }
        return orders;
    } catch (error) {
        handleDbError(error, 'fetching orders');
    }
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    try {
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
