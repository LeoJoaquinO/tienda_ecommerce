'use server';

import type { OrderData, OrderStatus } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

const USE_DB = !!process.env.DB_HOST;


export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    if (USE_DB) {
        return dbActions.createOrderInDb(orderData);
    }
    const orderId = await hardcodedData.createOrder(orderData);
    return { orderId };
};

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (USE_DB) {
        return dbActions.updateOrderStatusInDb(orderId, status, paymentId);
    }
    return hardcodedData.updateOrderStatus(orderId, status);
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (USE_DB) {
        return dbActions.restockItemsForOrderInDb(orderId);
    }
    return hardcodedData.restockItemsForOrder(orderId);
}
