
'use server';

import type { Product, Coupon, Order, SalesMetrics, OrderData } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

// This file acts as a broker. It checks if a database is configured and
// routes the request to either the database actions or the hardcoded data fallback.
// This ensures server-only database code is never bundled on the client.

const USE_DB = !!process.env.DB_HOST;

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

export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        return dbActions.getCouponsFromDb();
    }
    return hardcodedData.getCoupons();
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    if (USE_DB) {
        return dbActions.getCouponByIdFromDb(id);
    }
    return hardcodedData.getCouponById(id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_DB) {
        return dbActions.getCouponByCodeFromDb(code);
    }
    return hardcodedData.getCouponByCode(code);
}

export async function getOrders(): Promise<Order[]> {
    if (USE_DB) {
        return dbActions.getOrdersFromDb();
    }
    return hardcodedData.getOrders();
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    if (USE_DB) {
        return dbActions.getSalesMetricsFromDb();
    }
    return hardcodedData.getSalesMetrics();
}
