
'use server';

import type { Product, Coupon, Order, SalesMetrics, OrderData, OrderStatus } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

const USE_DB = !!process.env.DB_HOST;

// ############################################################################
// PRODUCTS
// ############################################################################
export async function getProducts(): Promise<Product[]> {
    if (USE_DB) {
        return dbActions.getProductsFromDb();
    }
    return hardcodedData.getProducts();
}

export async function getProductById(id: number): Promise<Product | undefined> {
     if (USE_DB) {
        return dbActions.getProductByIdFromDb(id);
    }
    return hardcodedData.getProductById(id);
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    if (USE_DB) {
        return dbActions.createProductInDb(product);
    }
    return hardcodedData.createProduct(product);
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    if (USE_DB) {
        return dbActions.updateProductInDb(id, product);
    }
    return hardcodedData.updateProduct(id, product);
}

export async function deleteProduct(id: number): Promise<void> {
    if (USE_DB) {
        return dbActions.deleteProductFromDb(id);
    }
    return hardcodedData.deleteProduct(id);
}


// ############################################################################
// COUPONS
// ############################################################################
export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        return dbActions.getCouponsFromDb();
    }
    return hardcodedData.getCoupons();
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_DB) {
        return dbActions.getCouponByCodeFromDb(code);
    }
    return hardcodedData.getCouponByCode(code);
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (USE_DB) {
        return dbActions.createCouponInDb(coupon);
    }
    return hardcodedData.createCoupon(coupon);
}

export async function updateCoupon(id: number, coupon: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (USE_DB) {
        return dbActions.updateCouponInDb(id, coupon);
    }
    return hardcodedData.updateCoupon(id, coupon);
}

export async function deleteCoupon(id: number): Promise<void> {
    if (USE_DB) {
        return dbActions.deleteCouponFromDb(id);
    }
    return hardcodedData.deleteCoupon(id);
}

// ############################################################################
// ORDERS
// ############################################################################

export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (USE_DB) {
        return dbActions.getSalesMetricsFromDb();
    }
    return hardcodedData.getSalesMetrics();
}


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
