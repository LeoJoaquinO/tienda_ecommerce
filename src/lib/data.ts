'use server';

import type { Product, Coupon, Order, SalesMetrics } from './types';
import { getProducts as getProductsAction } from './products';
import { getCoupons as getCouponsAction } from './coupons';
import { getOrders as getOrdersAction, getSalesMetrics as getSalesMetricsAction } from './orders';
import { getProductById as getProductByIdAction, getCouponById as getCouponByIdAction, getCouponByCode as getCouponByCodeAction } from './products';

// This file serves as the primary data-fetching layer for components.
// It safely calls Server Actions, which in turn decide whether to use
// the database or hardcoded data. This completely decouples pages
// from the database logic, fixing the build errors.

export async function getProducts(): Promise<Product[]> {
    return getProductsAction();
}

export async function getProductById(id: number): Promise<Product | undefined> {
    return getProductByIdAction(id);
}

export async function getCoupons(): Promise<Coupon[]> {
    return getCouponsAction();
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    return getCouponByIdAction(id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    return getCouponByCodeAction(code);
}

export async function getOrders(): Promise<Order[]> {
    return getOrdersAction();
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    return getSalesMetricsAction();
}
