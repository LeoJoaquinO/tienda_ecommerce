import type { Product } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

// Helper function to convert database row to Product type
function rowToProduct(row: RowDataPacket): Product {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        salePrice: row.salePrice ? Number(row.salePrice) : null,
        image: row.image,
        aiHint: row.aiHint,
        category: row.category,
        stock: row.stock,
        featured: Boolean(row.featured),
    };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
    return rows.map(rowToProduct);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
            return rowToProduct(rows[0]);
        }
        return undefined;
    } catch (error) {
        console.error(`Failed to fetch product with id ${id}:`, error);
        return undefined;
    }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const { name, description, price, salePrice, image, category, stock, featured, aiHint } = product;
    try {
        const [result] = await pool.query<any>(
            'INSERT INTO products (name, description, price, salePrice, image, category, stock, featured, aiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, salePrice || null, image, category, stock, featured || false, aiHint || null]
        );
        const insertedId = result.insertId;
        return await getProductById(insertedId);
    } catch (error) {
        console.error('Failed to create product:', error);
        return null;
    }
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product | null> {
    const { name, description, price, salePrice, image, category, stock, featured, aiHint } = product;
    try {
        await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, salePrice = ?, image = ?, category = ?, stock = ?, featured = ?, aiHint = ? WHERE id = ?',
            [name, description, price, salePrice || null, image, category, stock, featured || false, aiHint || null, id]
        );
        return await getProductById(id);
    } catch (error) {
        console.error(`Failed to update product with id ${id}:`, error);
        return null;
    }
}

export async function deleteProduct(id: number): Promise<boolean> {
    try {
        const [result] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error(`Failed to delete product with id ${id}:`, error);
        return false;
    }
}
