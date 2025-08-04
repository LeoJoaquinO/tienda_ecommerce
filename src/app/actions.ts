
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import DOMPurify from 'isomorphic-dompurify';
import { addSubscriber } from "@/lib/subscribers";
import * as data from '@/lib/data';
import type { Product, Coupon } from '@/lib/types';


const USE_DB = !!process.env.DB_HOST;


// Helper function to sanitize form data
function sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitizedData: Record<string, any> = {};
    for (const key in data) {
        if (typeof data[key] === 'string') {
            sanitizedData[key] = DOMPurify.sanitize(data[key]);
        } else {
            sanitizedData[key] = data[key];
        }
    }
    return sanitizedData;
}


const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido."),
    description: z.string().min(1, "La descripción es requerida."),
    shortDescription: z.string().optional(),
    price: z.coerce.number().positive("El precio debe ser un número positivo."),
    discountPercentage: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100.").optional().nullable(),
    offerStartDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    offerEndDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    stock: z.coerce.number().int("El stock debe ser un número entero.").min(0, "El stock no puede ser negativo."),
    category: z.string().min(1, "La categoría es requerida."),
    images: z.array(z.string().url("La URL de la imagen no es válida.")).min(1, "Se requiere al menos una imagen."),
    aiHint: z.string().optional(),
    featured: z.boolean().optional(),
});

// These are now internal functions, not exported
async function _createProductInDb(product: Omit<Product, 'id' | 'salePrice'>): Promise<Product> {
    const { name, description, shortDescription, price, images, category, stock, featured, aiHint, discountPercentage, offerStartDate, offerEndDate } = product;
    const imagesString = images.join(',');
    try {
        const [result] = await (await data.getPool()).query<any>(
            'INSERT INTO products (name, description, short_description, price, images, category, stock, featured, ai_hint, discount_percentage, offer_start_date, offer_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, shortDescription, price, imagesString, category, stock, featured || false, aiHint || null, discountPercentage || null, offerStartDate || null, offerEndDate || null]
        );
        const [rows] = await (await data.getPool()).query<any>('SELECT * FROM products WHERE id = ?', [result.insertId]);
        if (rows.length === 0) throw new Error('Failed to retrieve product after creation.');
        return data._rowToProduct(rows[0]);
    } catch (error) {
        data.handleDbError(error, 'creating a product');
    }
}

async function _updateProductInDb(id: number, productData: Partial<Omit<Product, 'id' | 'salePrice'>>): Promise<Product> {
    const existingProduct = await data.getProductById(id);
    if(!existingProduct) throw new Error("Product not found");

    const fieldsToUpdate = { ...existingProduct, ...productData };
    const imagesString = fieldsToUpdate.images?.join(',');
    
    const dbFields = {
        name: fieldsToUpdate.name,
        description: fieldsToUpdate.description,
        short_description: fieldsToUpdate.shortDescription,
        price: fieldsToUpdate.price,
        images: imagesString,
        category: fieldsToUpdate.category,
        stock: fieldsToUpdate.stock,
        featured: fieldsToUpdate.featured,
        ai_hint: fieldsToUpdate.aiHint,
        discount_percentage: fieldsToUpdate.discountPercentage,
        offer_start_date: fieldsToUpdate.offerStartDate,
        offer_end_date: fieldsToUpdate.offerEndDate,
    }

    const fieldNames = Object.keys(dbFields);
    const setClause = fieldNames.map(field => `${field} = ?`).join(', ');
    const values = [...fieldNames.map(field => (dbFields as any)[field]), id];
    
    try {
        await (await data.getPool()).query(`UPDATE products SET ${setClause} WHERE id = ?`, values);
        const updatedProduct = await data.getProductById(id);
        if (!updatedProduct) throw new Error('Failed to retrieve product after update.');
        return updatedProduct;
    } catch (error) {
        data.handleDbError(error, `updating product with id ${id}`);
    }
}

async function _deleteProductFromDb(id: number): Promise<void> {
    try {
        const [result] = await (await data.getPool()).query<any>('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            console.warn(`Attempted to delete product with id ${id}, but it was not found.`);
        }
    } catch (error) {
        data.handleDbError(error, `deleting product with id ${id}`);
    }
}

async function createProduct(product: Omit<Product, 'id' | 'salePrice'>) {
    if (USE_DB) return _createProductInDb(product);
    return data.createHardcodedProduct(product);
}

async function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'salePrice'>>) {
    if (USE_DB) return _updateProductInDb(id, product);
    return data.updateHardcodedProduct(id, product);
}

async function deleteProduct(id: number) {
    if (USE_DB) return _deleteProductFromDb(id);
    return data.deleteHardcodedProduct(id);
}


export async function addProductAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);

    if (sanitizedData.discountPercentage === '') sanitizedData.discountPercentage = null;
    if (sanitizedData.offerStartDate === '') sanitizedData.offerStartDate = null;
    if (sanitizedData.offerEndDate === '') sanitizedData.offerEndDate = null;
    
    const images = [];
    for (let i = 1; i <= 5; i++) {
        if (sanitizedData[`image${i}`]) {
            images.push(sanitizedData[`image${i}`]);
        }
    }

    const validatedFields = productSchema.safeParse({
      ...sanitizedData,
      featured: sanitizedData.featured === 'on',
      images,
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Datos inválidos. Por favor, revisa los campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await createProduct(validatedFields.data);
        revalidatePath("/admin");
        revalidatePath("/tienda");
        revalidatePath("/");
        return { message: "Producto añadido exitosamente." };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "No se pudo añadir el producto." };
    }
}

export async function updateProductAction(id: number, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);

    if (sanitizedData.discountPercentage === '') sanitizedData.discountPercentage = null;
    if (sanitizedData.offerStartDate === '') sanitizedData.offerStartDate = null;
    if (sanitizedData.offerEndDate === '') sanitizedData.offerEndDate = null;

    const images = [];
    for (let i = 1; i <= 5; i++) {
        if (sanitizedData[`image${i}`]) {
            images.push(sanitizedData[`image${i}`]);
        }
    }

    const validatedFields = productSchema.safeParse({
        ...sanitizedData,
        featured: sanitizedData.featured === 'on',
        images,
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Datos inválidos. Por favor, revisa los campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateProduct(id, validatedFields.data);
        revalidatePath("/admin");
        revalidatePath(`/products/${id}`);
        revalidatePath("/tienda");
        revalidatePath("/");
        return { message: "Producto actualizado exitosamente." };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "No se pudo actualizar el producto." };
    }
}


export async function deleteProductAction(id: number) {
    try {
        await deleteProduct(id);
        revalidatePath('/admin');
        revalidatePath("/tienda");
        revalidatePath("/");
        return { message: 'Producto eliminado exitosamente.' }
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'No se pudo eliminar el producto.' }
    }
}


const couponSchema = z.object({
    code: z.string().min(3, "El código debe tener al menos 3 caracteres.").max(50, "El código no puede tener más de 50 caracteres."),
    discountType: z.enum(['percentage', 'fixed'], { required_error: "El tipo de descuento es requerido."}),
    discountValue: z.coerce.number().positive("El valor del descuento debe ser un número positivo."),
    expiryDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    isActive: z.boolean().optional(),
}).refine(data => {
    if (data.discountType === 'percentage') {
        return data.discountValue <= 100;
    }
    return true;
}, {
    message: "El porcentaje de descuento no puede ser mayor a 100.",
    path: ["discountValue"],
});

// Internal DB functions for coupons
async function _createCouponInDb(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        const [result] = await (await data.getPool()).query<any>(
            'INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active) VALUES (?, ?, ?, ?, ?)',
            [code.toUpperCase(), discountType, discountValue, expiryDate, isActive]
        );
        const [rows] = await (await data.getPool()).query<any>('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
        if (rows.length === 0) throw new Error('Failed to retrieve coupon after creation.');
        return data._rowToCoupon(rows[0]);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        data.handleDbError(error, 'creating a coupon');
    }
}

async function _updateCouponInDb(id: number, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    const existingCoupon = await data.getCouponById(id);
    if (!existingCoupon) throw new Error(`Coupon with ID ${id} not found.`);
    
    const fieldsToUpdate = { ...existingCoupon, ...couponData};
    const { code, discountType, discountValue, expiryDate, isActive } = fieldsToUpdate;

    try {
        await (await data.getPool()).query(
            'UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, expiry_date = ?, is_active = ? WHERE id = ?',
            [code?.toUpperCase(), discountType, discountValue, expiryDate, isActive, id]
        );
        const [rows] = await (await data.getPool()).query<any>('SELECT * FROM coupons WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Failed to retrieve coupon after update.');
        return data._rowToCoupon(rows[0]);
    } catch (error: any) {
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        data.handleDbError(error, `updating coupon with id ${id}`);
    }
}

async function _deleteCouponFromDb(id: number): Promise<void> {
    try {
        await (await data.getPool()).query('DELETE FROM coupons WHERE id = ?', [id]);
    } catch (error) {
        data.handleDbError(error, `deleting coupon with id ${id}`);
    }
}


async function createCoupon(coupon: Omit<Coupon, 'id'>) {
    if (USE_DB) return _createCouponInDb(coupon);
    return data.createHardcodedCoupon(coupon);
}

async function updateCoupon(id: number, couponData: Partial<Omit<Coupon, 'id'>>) {
     if (USE_DB) return _updateCouponInDb(id, couponData);
    return data.updateHardcodedCoupon(id, couponData);
}

async function deleteCoupon(id: number) {
     if (USE_DB) return _deleteCouponFromDb(id);
    return data.deleteHardcodedCoupon(id);
}


export async function addCouponAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);

    if (sanitizedData.expiryDate === '') sanitizedData.expiryDate = null;
    
    const validatedFields = couponSchema.safeParse({
        ...sanitizedData,
        isActive: sanitizedData.isActive === 'on',
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Datos de cupón inválidos. Por favor, revisa los campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await createCoupon(validatedFields.data);
        revalidatePath("/admin");
        return { message: "Cupón creado exitosamente." };
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('UNIQUE constraint failed') || e.message.includes('ER_DUP_ENTRY') || e.message.includes('ya existe')) {
            return { error: `El código de cupón '${validatedFields.data.code}' ya existe.` };
        }
        return { error: e.message || "No se pudo crear el cupón." };
    }
}

export async function updateCouponAction(id: number, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);
    
    if (sanitizedData.expiryDate === '') sanitizedData.expiryDate = null;

    const validatedFields = couponSchema.safeParse({
        ...sanitizedData,
        isActive: sanitizedData.isActive === 'on',
    });

    if (!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Datos de cupón inválidos. Por favor, revisa los campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateCoupon(id, validatedFields.data);
        revalidatePath("/admin");
        return { message: "Cupón actualizado exitosamente." };
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('UNIQUE constraint failed') || e.message.includes('ER_DUP_ENTRY') || e.message.includes('ya existe')) {
            return { error: `El código de cupón '${validatedFields.data.code}' ya existe.` };
        }
        return { error: e.message || "No se pudo actualizar el cupón." };
    }
}

export async function deleteCouponAction(id: number) {
    try {
        await deleteCoupon(id);
        revalidatePath('/admin');
        return { message: 'Cupón eliminado exitosamente.' }
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'No se pudo eliminar el cupón.' }
    }
}


const subscriberSchema = z.object({
  email: z.string().email("El email no es válido."),
});

export async function addSubscriberAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const sanitizedData = sanitizeData(rawData);

  const validatedFields = subscriberSchema.safeParse(sanitizedData);

  if (!validatedFields.success) {
    return {
      error: "Email inválido. Por favor, ingrese un email correcto.",
    };
  }

  try {
    await addSubscriber(validatedFields.data.email);
    return { message: "¡Gracias por suscribirte!" };
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed') || e.message.includes('ER_DUP_ENTRY') || e.message.includes('ya está suscripto')) {
      return { error: "Este email ya está suscripto." };
    }
    return { error: e.message || "No se pudo procesar la suscripción." };
  }
}

    