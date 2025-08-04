
'use server';

import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus, Order } from './types';

const USE_DB = !!process.env.DB_HOST;

export async function getProducts(): Promise<Product[]> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getProductsFromDb();
    }
    const data = await import('./hardcoded-data');
    return data.getProductsFromHardcoded();
}

export async function getProductById(id: number): Promise<Product | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getProductByIdFromDb(id);
    }
    const data = await import('./hardcoded-data');
    return data.getProductByIdFromHardcoded(id);
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createProductInDb(product);
    }
    const data = await import('./hardcoded-data');
    return data.createProductInHardcoded(product);
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateProductInDb(id, productData);
    }
    const data = await import('./hardcoded-data');
    return data.updateProductInHardcoded(id, productData);
}

export async function deleteProduct(id: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.deleteProductFromDb(id);
    }
    const data = await import('./hardcoded-data');
    return data.deleteProductFromHardcoded(id);
}

export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponsFromDb();
    }
    const data = await import('./hardcoded-data');
    return data.getCouponsFromHardcoded();
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponByIdFromDb(id);
    }
    const data = await import('./hardcoded-data');
    return data.getCouponByIdFromHardcoded(id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getCouponByCodeFromDb(code);
    }
    const data = await import('./hardcoded-data');
    return data.getCouponByCodeFromHardcoded(code);
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createCouponInDb(coupon);
    }
    const data = await import('./hardcoded-data');
    return data.createCouponInHardcoded(coupon);
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateCouponInDb(id, couponData);
    }
    const data = await import('./hardcoded-data');
    return data.updateCouponInHardcoded(id, couponData);
}

export async function deleteCoupon(id: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.deleteCouponFromDb(id);
    }
    const data = await import('./hardcoded-data');
    return data.deleteCouponFromHardcoded(id);
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.getSalesMetricsFromDb();
    }
    const data = await import('./hardcoded-data');
    return data.getSalesMetricsFromHardcoded();
}

export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.createOrderInDb(orderData);
    }
    const data = await import('./hardcoded-data');
    return data.createOrderInHardcoded(orderData);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.updateOrderStatusInDb(orderId, status, paymentId);
    }
    const data = await import('./hardcoded-data');
    return data.updateOrderStatusInHardcoded(orderId, status, paymentId);
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    if (USE_DB) {
        const db = await import('./db-actions');
        return db.restockItemsForOrderInDb(orderId);
    }
    const data = await import('./hardcoded-data');
    return data.restockItemsForOrderInHardcoded(orderId);
}
