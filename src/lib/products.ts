import type { Product } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

// --- Hardcoded Data for Initial Setup ---
// This data is used by default so the app can run without a database connection.
// The deployment guide explains how to switch to a live MySQL database.

const hardcodedProducts: Product[] = [
    { id: 1, name: "Anillo de Bodas Clásico", description: "Un elegante y atemporal anillo de bodas de oro, perfecto para simbolizar vuestro amor eterno.", price: 750, salePrice: 699, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 15, featured: true, aiHint: "gold rings" },
    { id: 2, name: "Alianza de Compromiso", description: "Una hermosa alianza de oro blanco para un compromiso inolvidable.", price: 980, salePrice: null, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 10, featured: true, aiHint: "gold rings" },
    { id: 3, name: "Anillos Gemelos de Plata", description: "Un par de anillos gemelos de plata, ideales para parejas que valoran la elegancia y la simplicidad.", price: 450, salePrice: 400, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 20, featured: true, aiHint: "silver rings" },
    { id: 4, name: "Sortija de Oro Rosa", description: "Una delicada sortija de oro rosa con un diseño moderno y femenino.", price: 620, salePrice: null, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 8, featured: false, aiHint: "rose gold ring" },
    { id: 5, name: "Anillo de Boda con Textura", description: "Un anillo de boda único con una textura martillada que le da un carácter distintivo.", price: 810, salePrice: 750, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 12, featured: false, aiHint: "textured ring" },
    { id: 6, name: "Set de Anillos de Boda", description: "Un juego completo de anillos de boda de oro a juego para él y para ella.", price: 1500, salePrice: null, image: "https://cdn.pixabay.com/photo/2018/08/16/19/56/wedding-rings-3611277_640.jpg", category: "Anillos", stock: 5, featured: true, aiHint: "wedding rings set" },
];

export async function getProducts(): Promise<Product[]> {
  // Return hardcoded data. To use a database, comment this line out.
  return Promise.resolve(hardcodedProducts);
  
  // --- Database Logic (Commented out by default) ---
  /*
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
    return rows.map(rowToProduct);
  } catch (error) {
    handleDbError(error, 'fetching products');
  }
  */
}

export async function getProductById(id: number): Promise<Product | undefined> {
    // Return hardcoded data. To use a database, comment this block out.
    const product = hardcodedProducts.find(p => p.id === id);
    return Promise.resolve(product);

    // --- Database Logic (Commented out by default) ---
    /*
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
            return rowToProduct(rows[0]);
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching product with id ${id}`);
    }
    */
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    console.log("createProduct called (hardcoded). In a real deployment, this would write to the database.", product);
    const newProduct = { ...product, id: Math.max(...hardcodedProducts.map(p => p.id)) + 1 };
    hardcodedProducts.push(newProduct);
    return Promise.resolve(newProduct);
    
    // --- Database Logic (Commented out by default) ---
    /*
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
    */
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    console.log(`updateProduct called for id ${id} (hardcoded). In a real deployment, this would write to the database.`, product);
    const index = hardcodedProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        hardcodedProducts[index] = { ...hardcodedProducts[index], ...product };
        return Promise.resolve(hardcodedProducts[index]);
    }
    throw new Error("Product not found");
    
    // --- Database Logic (Commented out by default) ---
    /*
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
    */
}

export async function deleteProduct(id: number): Promise<void> {
    console.log(`deleteProduct called for id ${id} (hardcoded). In a real deployment, this would write to the database.`);
    const index = hardcodedProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        hardcodedProducts.splice(index, 1);
        return Promise.resolve();
    }
    return Promise.resolve();

    // --- Database Logic (Commented out by default) ---
    /*
    try {
        const [result] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        }
    } catch (error) {
        handleDbError(error, `deleting product with id ${id}`);
    }
    */
}


// --- Helper Functions for Database (Commented out by default) ---
/*
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
*/
