import type { Product, OrderData } from './types';
import pool from './db';
import { RowDataPacket, OkPacket } from 'mysql2';

// --- Helper Functions ---
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
    // Ensure salePrice is null if the offer is not valid
    return { ...product, salePrice: null };
}

// --- Hardcoded Data for Initial Setup ---
let hardcodedProducts: Product[] = [
    { id: 1, name: "Aura de Rosas", description: "Una fragancia floral y romántica con notas de rosa de Damasco, peonía y almizcle blanco.", price: 120, discountPercentage: 15, offerStartDate: new Date('2024-01-01'), offerEndDate: new Date('2025-12-31'), image: "https://farma365.com.ar/wp-content/uploads/2024/04/3348901486392-3.webp", category: "Floral", stock: 25, featured: true, aiHint: "pink perfume" },
    { id: 2, name: "Noche en el Desierto", description: "Un aroma oriental especiado, con toques de incienso, oud y ámbar.", price: 150, discountPercentage: null, offerStartDate: null, offerEndDate: null, image: "https://www.lancome.cl/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-lancome-latam-hub-Library/es_CL/dwcab43319/seo_landings/fragancia/Imagen%20Cuerpo%201%20Fragancia.jpg?sw=1910&sh=1074&sm=cut&q=70", category: "Oriental", stock: 15, featured: true, aiHint: "dark perfume" },
    { id: 3, name: "Cítrico Vibrante", description: "Una explosión de frescura con limón siciliano, bergamota y vetiver. Ideal para el día a día.", price: 95, discountPercentage: 10, offerStartDate: new Date('2024-01-01'), offerEndDate: new Date('2025-12-31'), image: "https://es.loccitane.com/dw/image/v2/BCDQ_PRD/on/demandware.static/-/Library-Sites-OCC_SharedLibrary/default/dwed515ac4/CWE%20images/collections/630x450-applyperfume.png?sw=630&sh=450", category: "Cítrico", stock: 3, featured: true, aiHint: "citrus perfume" },
    { id: 4, name: "Madera y Cuero", description: "Un perfume masculino y sofisticado, con notas de cedro, cuero y tabaco.", price: 135, discountPercentage: null, offerStartDate: null, offerEndDate: null, image: "https://farma365.com.ar/wp-content/uploads/2024/04/3348901486392-3.webp", category: "Amaderado", stock: 18, featured: false, aiHint: "mens perfume" },
    { id: 5, name: "Vainilla Gourmand", description: "Una fragancia dulce y acogedora que evoca postres recién horneados, con vainilla de Tahití y caramelo.", price: 110, discountPercentage: null, offerStartDate: null, offerEndDate: null, image: "https://www.lancome.cl/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-lancome-latam-hub-Library/es_CL/dwcab43319/seo_landings/fragancia/Imagen%20Cuerpo%201%20Fragancia.jpg?sw=1910&sh=1074&sm=cut&q=70", category: "Dulce", stock: 22, featured: false, aiHint: "elegant perfume" },
    { id: 6, name: "Brise Marina", description: "Un aroma fresco y acuático que captura la esencia del océano, con sal marina, algas y salvia.", price: 105, discountPercentage: 20, offerStartDate: new Date('2024-01-01'), offerEndDate: new Date('2025-12-31'), image: "https://es.loccitane.com/dw/image/v2/BCDQ_PRD/on/demandware.static/-/Library-Sites-OCC_SharedLibrary/default/dwed515ac4/CWE%20images/collections/630x450-applyperfume.png?sw=630&sh=450", category: "Acuático", stock: 0, featured: true, aiHint: "blue perfume" },
].map(calculateSalePrice);

let hardcodedOrders: any[] = [];
let nextOrderId = 1;


export async function getProducts(): Promise<Product[]> {
  // Return hardcoded data. To use a database, comment this line out.
  const processedProducts = hardcodedProducts.map(calculateSalePrice);
  return Promise.resolve(processedProducts);
  
  // --- Database Logic (Commented out by default) ---
  /*
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');
    return rows.map(rowToProduct).map(calculateSalePrice);
  } catch (error) {
    handleDbError(error, 'fetching products');
  }
  */
}

export async function getProductById(id: number): Promise<Product | undefined> {
    // Return hardcoded data. To use a database, comment this block out.
    const product = hardcodedProducts.find(p => p.id === id);
    if (product) {
        return Promise.resolve(calculateSalePrice(product));
    }
    return Promise.resolve(undefined);

    // --- Database Logic (Commented out by default) ---
    /*
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
            return calculateSalePrice(rowToProduct(rows[0]));
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching product with id ${id}`);
    }
    */
}

export async function createProduct(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    console.log("createProduct called (hardcoded). In a real deployment, this would write to the database.", product);
    const newId = hardcodedProducts.length > 0 ? Math.max(...hardcodedProducts.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { ...product, id: newId };
    hardcodedProducts.push(newProduct);
    return Promise.resolve(calculateSalePrice(newProduct));
    
    // --- Database Logic (Commented out by default) ---
    /*
    const { name, description, price, image, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    try {
        const [result] = await pool.query<any>(
            'INSERT INTO products (name, description, price, image, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, image, category, stock, featured || false, aiHint || null, discountPercentage || null, offerStartDate || null, offerEndDate || null]
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
    */
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    console.log(`updateProduct called for id ${id} (hardcoded). In a real deployment, this would write to the database.`, product);
    const index = hardcodedProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        hardcodedProducts[index] = { ...hardcodedProducts[index], ...product };
        return Promise.resolve(calculateSalePrice(hardcodedProducts[index]));
    }
    throw new Error("Product not found");
    
    // --- Database Logic (Commented out by default) ---
    /*
    const { name, description, price, image, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    try {
        await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?, featured = ?, aiHint = ?, discountPercentage = ?, offerStartDate = ?, offerEndDate = ? WHERE id = ?',
            [name, description, price, image, category, stock, featured || false, aiHint || null, discountPercentage || null, offerStartDate || null, offerEndDate || null, id]
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

// --- Order Management ---

export async function createOrder(orderData: OrderData): Promise<number> {
    // Hardcoded logic
    console.log("createOrder called (hardcoded).", orderData);
    const newOrder = { id: nextOrderId++, ...orderData, createdAt: new Date() };
    hardcodedOrders.push(newOrder);
    // In a real scenario, you'd also decrement stock here, but that requires a transaction.
    // For now, we just record the order.
    return Promise.resolve(newOrder.id);

    // --- Database Logic ---
    /*
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query<OkPacket>(
            'INSERT INTO orders (customer_name, customer_email, total, status, coupon_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [orderData.customerName, orderData.customerEmail, orderData.total, orderData.status, orderData.couponCode, orderData.discountAmount]
        );
        const orderId = orderResult.insertId;

        for (const item of orderData.items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product.id, item.quantity, item.product.salePrice ?? item.product.price]
            );
            // Decrement stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [item.quantity, item.product.id, item.quantity]
            );
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        handleDbError(error, 'creating an order');
    } finally {
        connection.release();
    }
    */
}



// --- Database Helper Functions (Commented out by default) ---
/*
function rowToProduct(row: RowDataPacket): Product {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        salePrice: null, // Will be calculated
        image: row.image,
        aiHint: row.aiHint,
        category: row.category,
        stock: row.stock,
        featured: Boolean(row.featured),
        discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
        offerStartDate: row.offerStartDate ? new Date(row.offerStartDate) : null,
        offerEndDate: row.offerEndDate ? new Date(row.offerEndDate) : null,
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
