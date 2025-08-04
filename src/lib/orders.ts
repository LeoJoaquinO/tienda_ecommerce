
import pool from './db';
import type { OrderData, OrderStatus, SalesMetrics, Product, Order } from './types';
import { RowDataPacket, OkPacket } from 'mysql2';
import { getProducts } from './products';


// --- Hardcoded Data for Demonstration ---
// NOTE: This should be empty in a real production environment.
// It is pre-filled here to demonstrate the metrics panel without a database connection.
let hardcodedOrders: any[] = [
    { id: 101, customerName: 'Juan Perez', customerEmail: 'juan@example.com', total: 255, status: 'paid', createdAt: new Date('2024-07-20T10:30:00Z'), items: [{ product: {id: 1, salePrice: 102, price: 120}, quantity: 1 }, { product: {id: 2, salePrice: 150, price: 150}, quantity: 1 }], shippingAddress: 'Av. Falsa 123', shippingCity: 'Springfield', shippingPostalCode: 'B6500' },
    { id: 102, customerName: 'Ana Gomez', customerEmail: 'ana@example.com', total: 95, status: 'paid', createdAt: new Date('2024-07-21T14:00:00Z'), items: [{ product: {id: 3, salePrice: 85.5, price: 95}, quantity: 1 }], shippingAddress: 'Calle Siempreviva 742', shippingCity: 'Springfield', shippingPostalCode: 'B6500' },
    { id: 103, customerName: 'Carlos Ruiz', customerEmail: 'carlos@example.com', total: 245, status: 'paid', createdAt: new Date('2024-07-22T11:00:00Z'), items: [{ product: {id: 4, price: 135}, quantity: 1 }, { product: {id: 5, price: 110}, quantity: 1 }], shippingAddress: 'Boulevard del Ocaso 45', shippingCity: 'Shelbyville', shippingPostalCode: 'B6501' },
    { id: 104, customerName: 'Lucia Fernandez', customerEmail: 'lucia@example.com', total: 85.5, status: 'paid', createdAt: new Date(), items: [{ product: {id: 3, salePrice: 85.5, price: 95}, quantity: 1 }], shippingAddress: 'Avenida de los Chicos 100', shippingCity: 'Capital City', shippingPostalCode: 'C1000' },
    { id: 105, customerName: 'Test Pending', customerEmail: 'pending@test.com', total: 100, status: 'pending', createdAt: new Date(), items: [{ product: {id: 1, salePrice: 102, price: 120}, quantity: 1 }], shippingAddress: 'Laboratorio de Pruebas 1', shippingCity: 'Testville', shippingPostalCode: 'T357' },
];
let nextOrderId = 106;

// A flag to determine if we are in a database-connected environment.
// This is a simple check; a more robust solution might check the connection pool status.
const USE_DATABASE = !!process.env.DB_HOST;

/**
 * Handles database errors with user-friendly messages.
 */
function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
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
    if (!USE_DATABASE) {
        // --- Hardcoded Logic ---
        console.log("createOrder called (hardcoded).");
        const newOrder = { 
            id: nextOrderId++, 
            ...orderData, 
            createdAt: new Date(),
        };
        hardcodedOrders.push(newOrder);
        orderData.items.forEach(item => {
            console.log(`(Hardcoded) Decrementing stock for product ${item.product.id} by ${item.quantity}`);
        });
        return Promise.resolve(newOrder.id);
    }
    
    // --- Database Logic ---
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


/**
 * Updates the status of an existing order.
 */
export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (!USE_DATABASE) {
        // --- Hardcoded Logic ---
        const orderIndex = hardcodedOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            hardcodedOrders[orderIndex].status = status;
            if(paymentId) hardcodedOrders[orderIndex].paymentId = paymentId;
            console.log(`(Hardcoded) Order ${orderId} status updated to ${status}`);
        }
        return Promise.resolve();
    }
    
    // --- Database Logic ---
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

/**
 * Retrieves the items for a given order and restocks them.
 * This is used when a payment is cancelled or fails.
 */
export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (!USE_DATABASE) {
        // --- Hardcoded Logic ---
        console.log(`(Hardcoded) Restocking items for cancelled/failed order ${orderId}`);
        return Promise.resolve();
    }

    // --- Database Logic ---
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


/**
 * Fetches all orders from the database.
 */
export async function getOrders(): Promise<Order[]> {
    if (!USE_DATABASE) {
        // --- Hardcoded Logic ---
        return Promise.resolve(hardcodedOrders as Order[]);
    }

    // --- Database Logic ---
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
                    // Fill in other product fields as needed or leave them partial
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


/**
 * Retrieves sales metrics for the admin dashboard.
 */
export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (!USE_DATABASE) {
        // --- Hardcoded Logic ---
        const paidOrders = hardcodedOrders.filter(o => o.status === 'paid');
        const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
        const totalSales = paidOrders.length;
        
        const salesByProduct: { [key: number]: { name: string; count: number } } = {};
        const allProducts = await getProducts(); // Need product names

        for (const order of paidOrders) {
            for (const item of order.items) {
                const productId = item.product.id;
                const productDetails = allProducts.find(p => p.id === productId);
                const productName = productDetails ? productDetails.name : `Producto #${productId}`;

                if (salesByProduct[productId]) {
                    salesByProduct[productId].count += item.quantity;
                } else {
                    salesByProduct[productId] = { name: productName, count: item.quantity };
                }
            }
        }

        const topSellingProducts = Object.entries(salesByProduct)
            .map(([id, data]) => ({ productId: Number(id), name: data.name, count: data.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5

        return Promise.resolve({
            totalRevenue,
            totalSales,
            topSellingProducts
        });
    }

    // --- Database Logic ---
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
