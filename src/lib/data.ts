
'use server';

// This file has been reverted to a simple, hardcoded data implementation
// to resolve persistent build errors related to database connections.
// It now exclusively uses the hardcoded data source.

import {
    getProducts as getProductsFromHardcodedData,
    getProductById as getProductByIdFromHardcodedData,
    createProduct as createProductFromHardcodedData,
    updateProduct as updateProductFromHardcodedData,
    deleteProduct as deleteProductFromHardcodedData,
    getCoupons as getCouponsFromHardcodedData,
    getCouponById as getCouponByIdFromHardcodedData,
    getCouponByCode as getCouponByCodeFromHardcodedData,
    createCoupon as createCouponFromHardcodedData,
    updateCoupon as updateCouponFromHardcodedData,
    deleteCoupon as deleteCouponFromHardcodedData,
    getSalesMetrics as getSalesMetricsFromHardcodedData,
    createOrder as createOrderFromHardcodedData,
    updateOrderStatus as updateOrderStatusFromHardcodedData,
    restockItemsForOrder as restockItemsForOrderFromHardcodedData
} from './hardcoded-data';
import type { Product, Coupon, SalesMetrics, OrderData, OrderStatus } from './types';


export async function getProducts(): Promise<Product[]> {
    return getProductsFromHardcodedData();
}

export async function getProductById(id: number): Promise<Product | undefined> {
    return getProductByIdFromHardcodedData(id);
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    return createProductFromHardcodedData(product);
}

export async function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    return updateProductFromHardcodedData(id, productData);
}

export async function deleteProduct(id: number): Promise<void> {
    return deleteProductFromHardcodedData(id);
}

export async function getCoupons(): Promise<Coupon[]> {
    return getCouponsFromHardcodedData();
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
    return getCouponByIdFromHardcodedData(id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    return getCouponByCodeFromHardcodedData(code);
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    return createCouponFromHardcodedData(coupon);
}

export async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    return updateCouponFromHardcodedData(id, couponData);
}

export async function deleteCoupon(id: number): Promise<void> {
    return deleteCouponFromHardcodedData(id);
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
    return getSalesMetricsFromHardcodedData();
}

export async function createOrder(orderData: OrderData): Promise<{orderId?: number, error?: string}> {
    return createOrderFromHardcodedData(orderData);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Promise<void> {
    return updateOrderStatusFromHardcodedData(orderId, status, paymentId);
}

export async function restockItemsForOrder(orderId: number): Promise<void> {
    return restockItemsForOrderFromHardcodedData(orderId);
}
