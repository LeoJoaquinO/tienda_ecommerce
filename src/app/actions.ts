
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import DOMPurify from 'isomorphic-dompurify';
import { addSubscriber } from "@/lib/subscribers";
import { createProduct, updateProduct, deleteProduct, createCoupon, updateCoupon, deleteCoupon, createCategory, deleteCategory } from '@/lib/data';
import type { Product, Coupon } from '@/lib/types';

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
    price: z.coerce.number({ required_error: "El precio es requerido."}).positive("El precio debe ser un número positivo."),
    discountPercentage: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100.").optional().nullable(),
    offerStartDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    offerEndDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    stock: z.coerce.number({ required_error: "El stock es requerido."}).int("El stock debe ser un número entero.").min(0, "El stock no puede ser negativo."),
    categoryIds: z.array(z.coerce.number()).min(1, "Se requiere al menos una categoría."),
    images: z.array(z.string().url("La URL de la imagen no es válida.")).min(1, "Se requiere al menos una imagen."),
    aiHint: z.string().optional(),
    featured: z.boolean().optional(),
});


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
    const categoryIds = formData.getAll('categoryIds').map(id => Number(id));

    const validatedFields = productSchema.safeParse({
      ...sanitizedData,
      featured: sanitizedData.featured === 'on',
      images,
      categoryIds,
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
    console.log(`[Action] Starting update for product ID: ${id}`);
    const rawData = Object.fromEntries(formData.entries());
    console.log(`[Action] Raw form data:`, rawData);
    
    // Handle the "1_" prefixed form fields
    const processedData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(rawData)) {
        // Remove the "1_" prefix if it exists
        const cleanKey = key.startsWith('1_') ? key.substring(2) : key;
        processedData[cleanKey] = value;
    }
    
    console.log(`[Action] Processed data:`, processedData);
    
    const sanitizedData = sanitizeData(processedData);

    if (sanitizedData.discountPercentage === '') sanitizedData.discountPercentage = null;
    if (sanitizedData.offerStartDate === '') sanitizedData.offerStartDate = null;
    if (sanitizedData.offerEndDate === '') sanitizedData.offerEndDate = null;

    const images = [];
    for (let i = 1; i <= 5; i++) {
        if (sanitizedData[`image${i}`]) {
            images.push(sanitizedData[`image${i}`]);
        }
    }
    
    // Handle categoryIds - they might come as "1_categoryIds" multiple times
    const categoryIds = formData.getAll('1_categoryIds').length > 0 
        ? formData.getAll('1_categoryIds').map(id => Number(id))
        : formData.getAll('categoryIds').map(id => Number(id));

    console.log(`[Action] Extracted categoryIds:`, categoryIds);
    console.log(`[Action] Extracted images:`, images);

    const validatedFields = productSchema.safeParse({
        ...sanitizedData,
        featured: sanitizedData.featured === 'on',
        images,
        categoryIds,
    });

    if (!validatedFields.success) {
        console.error("[Action] Validation failed for updateProductAction:", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Datos inválidos. Por favor, revisa los campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    console.log("[Action] Data validated successfully. Attempting to update product in DB.");
    console.log("[Action] Payload:", JSON.stringify(validatedFields.data, null, 2));

    try {
        await updateProduct(id, validatedFields.data);
        console.log(`[Action] Successfully updated product ID: ${id}. Revalidating paths.`);
        revalidatePath("/admin");
        revalidatePath(`/products/${id}`);
        revalidatePath("/tienda");
        revalidatePath("/");
        return { message: "Producto actualizado exitosamente." };
    } catch (e: any) {
        console.error(`[Action] CRITICAL: Failed to update product ID ${id}. Error:`, e.message);
        return { error: e.message || "No se pudo actualizar el producto." };
    }
}


export async function deleteProductAction(id: number) {
    console.log(`[Action] Starting delete for product ID: ${id}`);
    try {
        await deleteProduct(id);
        console.log(`[Action] Successfully deleted product ID: ${id}. Revalidating paths.`);
        revalidatePath('/admin');
        revalidatePath("/tienda");
        revalidatePath("/");
        return { message: 'Producto eliminado exitosamente.' }
    } catch (e: any) {
        console.error(`[Action] CRITICAL: Failed to delete product ID ${id}. Error:`, e.message);
        return { error: e.message || 'No se pudo eliminar el producto.' }
    }
}


const couponSchema = z.object({
    code: z.string().min(3, "El código debe tener al menos 3 caracteres.").max(50, "El código no puede tener más de 50 caracteres."),
    discountType: z.enum(['percentage', 'fixed'], { required_error: "El tipo de descuento es requerido."}),
    discountValue: z.coerce.number({ required_error: "El valor es requerido." }).positive("El valor del descuento debe ser un número positivo."),
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

// Category Actions

const categorySchema = z.object({
    name: z.string().min(2, "El nombre de la categoría es requerido."),
});

export async function addCategoryAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);
    
    const validatedFields = categorySchema.safeParse(sanitizedData);

    if (!validatedFields.success) {
        return {
            error: "Nombre de categoría inválido.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        await createCategory(validatedFields.data.name);
        revalidatePath("/admin");
        return { message: "Categoría creada exitosamente." };
    } catch (e: any) {
        return { error: e.message || "No se pudo crear la categoría." };
    }
}

export async function deleteCategoryAction(id: number) {
    try {
        const result = await deleteCategory(id);
        if (!result.success) {
            return { error: result.message };
        }
        revalidatePath('/admin');
        return { message: 'Categoría eliminada exitosamente.' }
    } catch (e: any) {
        return { error: e.message || 'No se pudo eliminar la categoría.' }
    }
}

    

    