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

function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
    return rows.map(rowToProduct);
  } catch (error) {
    handleDbError(error, 'fetching products');
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
        handleDbError(error, `fetching product with id ${id}`);
    }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { name, description, price, salePrice, image, category, stock, featured, aiHint } = product;
    try {
        const [result] = await pool.query<any>(
            'INSERT INTO products (name, description, price, salePrice, image, category, stock, featured, aiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, salePrice || null, image, category, stock, featured || false, aiHint || null]
        );
        const insertedId = result.insertId;
        const newProduct = await getProductById(insertedId);
        if (!newProduct) {
            throw new Error('Failed to retrieve product after creation.');
        }
        return newProduct;
    } catch (error) {
        handleDbError(error, 'creating a product');
    }
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const { name, description, price, salePrice, image, category, stock, featured, aiHint } = product;
    try {
        await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, salePrice = ?, image = ?, category = ?, stock = ?, featured = ?, aiHint = ? WHERE id = ?',
            [name, description, price, salePrice || null, image, category, stock, featured || false, aiHint || null, id]
        );
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
