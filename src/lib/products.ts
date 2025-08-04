'use server';

import type { Product } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}

function calculateSalePrice(product: Product): Product {
    const now = new Date();
    const isOfferValid = 
        product.discountPercentage && product.discountPercentage > 0 &&
        product.offerStartDate && product.offerEndDate &&
        now >= new Date(product.offerStartDate) && now <= new Date(product.offerEndDate);

    if (isOfferValid) {
        const discount = product.price * (product.discountPercentage! / 100);
        const salePrice = parseFloat((product.price - discount).toFixed(2));
        return { ...product, salePrice };
    }
    return { ...product, salePrice: null };
}

function rowToProduct(row: RowDataPacket): Product {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        shortDescription: row.shortDescription,
        price: Number(row.price),
        salePrice: null, // Will be calculated
        images: row.images ? row.images.split(',') : [],
        aiHint: row.aiHint,
        category: row.category,
        stock: row.stock,
        featured: Boolean(row.featured),
        discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
        offerStartDate: row.offerStartDate ? new Date(row.offerStartDate) : null,
        offerEndDate: row.offerEndDate ? new Date(row.offerEndDate) : null,
    };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
    return rows.map(rowToProduct).map(calculateSalePrice);
  } catch (error) {
    handleDbError(error, 'fetching products');
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
            return calculateSalePrice(rowToProduct(rows[0]));
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching product with id ${id}`);
    }
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const { name, description, shortDescription, price, images, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    const imagesString = images.join(',');
    try {
        const [result] = await pool.query<any>(
            'INSERT INTO products (name, description, shortDescription, price, images, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, shortDescription, price, imagesString, category, stock, featured || false, aiHint || null, discountPercentage || null, offerStartDate || null, offerEndDate || null]
        );
        const insertedId = result.insertId;
        const newDbProduct = await getProductById(insertedId);
        if (!newDbProduct) {
            throw new Error('Failed to retrieve product after creation.');
        }
        return newDbProduct;
    } catch (error) {
        handleDbError(error, 'creating a product');
    }
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const { name, description, shortDescription, price, images, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    const imagesString = images?.join(',');
    
    const fieldsToUpdate: { [key: string]: any } = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (shortDescription !== undefined) fieldsToUpdate.shortDescription = shortDescription;
    if (price !== undefined) fieldsToUpdate.price = price;
    if (imagesString !== undefined) fieldsToUpdate.images = imagesString;
    if (category !== undefined) fieldsToUpdate.category = category;
    if (stock !== undefined) fieldsToUpdate.stock = stock;
    if (featured !== undefined) fieldsToUpdate.featured = featured;
    if (aiHint !== undefined) fieldsToUpdate.aiHint = aiHint || null;
    if (discountPercentage !== undefined) fieldsToUpdate.discountPercentage = discountPercentage || null;
    if (offerStartDate !== undefined) fieldsToUpdate.offerStartDate = offerStartDate || null;
    if (offerEndDate !== undefined) fieldsToUpdate.offerEndDate = offerEndDate || null;

    const fieldNames = Object.keys(fieldsToUpdate);
    if (fieldNames.length === 0) {
        const currentProduct = await getProductById(id);
        if (!currentProduct) throw new Error("Product not found");
        return currentProduct;
    }

    const setClause = fieldNames.map(field => `${field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`).join(', ');
    const values = [...fieldNames.map(field => fieldsToUpdate[field]), id];

    try {
        await pool.query(`UPDATE products SET ${setClause} WHERE id = ?`, values);
        const updatedProduct = await getProductById(id);
        if (!updatedProduct) {
            throw new Error('Failed to retrieve product after update.');
        }
        return updatedProduct;
    } catch (error) {
        handleDbError(error, `updating product with id ${id}`);
    }
}

export async function deleteProduct(id: number): Promise<void> {
    try {
        const [result] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        }
    } catch (error) {
        handleDbError(error, `deleting product with id ${id}`);
    }
}