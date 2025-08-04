'use server';

import type { Product } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

const USE_DB = !!process.env.DB_HOST;

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
