import type { Product } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

// --- Hardcoded Data for Initial Setup ---
// This data is used by default so the app can run without a database connection.
// The deployment guide explains how to switch to a live MySQL database.

const hardcodedProducts: Product[] = [
    { id: 1, name: "Aura de Rosas", description: "Una fragancia floral y romántica con notas de rosa de Damasco, peonía y almizcle blanco.", price: 120, salePrice: 99, image: "https://farma365.com.ar/wp-content/uploads/2024/04/3348901486392-3.webp", category: "Floral", stock: 25, featured: true, aiHint: "pink perfume" },
    { id: 2, name: "Noche en el Desierto", description: "Un aroma oriental especiado, con toques de incienso, oud y ámbar.", price: 150, salePrice: null, image: "https://www.lancome.cl/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-lancome-latam-hub-Library/es_CL/dwcab43319/seo_landings/fragancia/Imagen%20Cuerpo%201%20Fragancia.jpg?sw=1910&sh=1074&sm=cut&q=70", category: "Oriental", stock: 15, featured: true, aiHint: "dark perfume" },
    { id: 3, name: "Cítrico Vibrante", description: "Una explosión de frescura con limón siciliano, bergamota y vetiver. Ideal para el día a día.", price: 95, salePrice: 80, image: "https://es.loccitane.com/dw/image/v2/BCDQ_PRD/on/demandware.static/-/Library-Sites-OCC_SharedLibrary/default/dwed515ac4/CWE%20images/collections/630x450-applyperfume.png?sw=630&sh=450", category: "Cítrico", stock: 30, featured: true, aiHint: "citrus perfume" },
    { id: 4, name: "Madera y Cuero", description: "Un perfume masculino y sofisticado, con notas de cedro, cuero y tabaco.", price: 135, salePrice: null, image: "https://farma365.com.ar/wp-content/uploads/2024/04/3348901486392-3.webp", category: "Amaderado", stock: 18, featured: false, aiHint: "mens perfume" },
    { id: 5, name: "Vainilla Gourmand", description: "Una fragancia dulce y acogedora que evoca postres recién horneados, con vainilla de Tahití y caramelo.", price: 110, salePrice: null, image: "https://www.lancome.cl/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-lancome-latam-hub-Library/es_CL/dwcab43319/seo_landings/fragancia/Imagen%20Cuerpo%201%20Fragancia.jpg?sw=1910&sh=1074&sm=cut&q=70", category: "Dulce", stock: 22, featured: false, aiHint: "elegant perfume" },
    { id: 6, name: "Brise Marina", description: "Un aroma fresco y acuático que captura la esencia del océano, con sal marina, algas y salvia.", price: 105, salePrice: 90, image: "https://es.loccitane.com/dw/image/v2/BCDQ_PRD/on/demandware.static/-/Library-Sites-OCC_SharedLibrary/default/dwed515ac4/CWE%20images/collections/630x450-applyperfume.png?sw=630&sh=450", category: "Acuático", stock: 28, featured: true, aiHint: "blue perfume" },
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
    const newId = hardcodedProducts.length > 0 ? Math.max(...hardcodedProducts.map(p => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId };
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
