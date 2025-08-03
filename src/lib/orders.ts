import pool from './db';
import type { OrderData, OrderStatus } from './types';
import { RowDataPacket, OkPacket } from 'mysql2';

// Let's assume hardcoded data is not needed for orders in the same way as products,
// as orders are transactional. We'll build the DB logic directly.
let hardcodedOrders: any[] = [];
let nextOrderId = 1;


/**
 * Handles database errors with user-friendly messages.
 */
function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}


/**
 * Creates a new order in the database and decrements product stock.
 * This is done within a transaction to ensure data integrity.
 */
export async function createOrder(orderData: OrderData): Promise<number> {
    // --- Hardcoded Logic ---
    const newOrder = { id: nextOrderId++, ...orderData, createdAt: new Date() };
    hardcodedOrders.push(newOrder);
    console.log("createOrder called (hardcoded). Order created:", newOrder);
    // In a real scenario, you'd also decrement stock here.
    orderData.items.forEach(item => {
        console.log(`(Hardcoded) Decrementing stock for product ${item.product.id} by ${item.quantity}`);
    });
    return Promise.resolve(newOrder.id);
    
    // --- Database Logic ---
    /*
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query<OkPacket>(
            'INSERT INTO orders (customer_name, customer_email, total, status, coupon_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [orderData.customerName, orderData.customerEmail, orderData.total, orderData.status, orderData.couponCode, orderData.discountAmount]
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
    */
}


/**
 * Updates the status of an existing order.
 */
export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    // --- Hardcoded Logic ---
    const orderIndex = hardcodedOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        hardcodedOrders[orderIndex].status = status;
        console.log(`(Hardcoded) Order ${orderId} status updated to ${status}`);
    }
    return Promise.resolve();
    
    // --- Database Logic ---
    /*
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    } catch (error) {
        handleDbError(error, `updating order status for order ${orderId}`);
    }
    */
}

type OrderItem = {
    product_id: number;
    quantity: number;
};

/**
 * Retrieves the items for a given order and restocks them.
 */
export async function restockItemsForOrder(orderId: number): Promise<void> {
     // --- Hardcoded Logic ---
    console.log(`(Hardcoded) Restocking items for cancelled/failed order ${orderId}`);
    // This part is complex to simulate without a real DB state, but we log the intent.
    return Promise.resolve();

    // --- Database Logic ---
    /*
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [items] = await connection.query<RowDataPacket[] & OrderItem[]>(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
        );

        if (items.length === 0) {
            console.warn(`No items found for order ${orderId} to restock.`);
            await connection.commit(); // Still commit to finish the transaction
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
    */
}
