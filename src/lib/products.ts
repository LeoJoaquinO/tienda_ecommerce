'use server';

import type { Product, Coupon } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

// This is a Server Action file. It acts as a router to decide
// whether to use the database or the hardcoded fallback.
// This layer is what components should call, not db-actions directly.

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

// These two functions were previously in data.ts but are product-related
// and need to be here to be properly exposed as Server Actions.
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
