'use server';

import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus } from './types';

const USE_DB = !!process.env.DB_HOST;

export async function getProducts(): Promise<Product[]> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getProductsFromDb();
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getProductsFromHardcoded();
}

export async function getProductById(id: number): Promise<Product | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getProductByIdFromDb(id);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getProductByIdFromHardcoded(id);
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createProductInDb(product);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.createProductInHardcoded(product);
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateProductInDb(id, productData);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.updateProductInHardcoded(id, productData);
}

export async function deleteProduct(id: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.deleteProductFromDb(id);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.deleteProductFromHardcoded(id);
}

export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponsFromDb();
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getCouponsFromHardcoded();
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponByIdFromDb(id);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getCouponByIdFromHardcoded(id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponByCodeFromDb(code);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getCouponByCodeFromHardcoded(code);
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createCouponInDb(coupon);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.createCouponInHardcoded(coupon);
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateCouponInDb(id, couponData);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.updateCouponInHardcoded(id, couponData);
}

export async function deleteCoupon(id: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.deleteCouponFromDb(id);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.deleteCouponFromHardcoded(id);
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getSalesMetricsFromDb();
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.getSalesMetricsFromHardcoded();
}

export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createOrderInDb(orderData);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.createOrderInHardcoded(orderData);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateOrderStatusInDb(orderId, status, paymentId);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.updateOrderStatusInHardcoded(orderId, status, paymentId);
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.restockItemsForOrderInDb(orderId);
    }
    const hardcoded = await import('./hardcoded-data');
    return hardcoded.restockItemsForOrderInHardcoded(orderId);
}
