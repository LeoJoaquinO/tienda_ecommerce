"use server";

import { revalidatePath } from "next/cache";
import { createProduct, deleteProduct, updateProduct } from "@/lib/products";
import { z } from "zod";
import DOMPurify from 'isomorphic-dompurify';

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
    price: z.coerce.number().positive("El precio debe ser un número positivo."),
    discountPercentage: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100.").optional().nullable(),
    offerStartDate: z.coerce.date().optional().nullable(),
    offerEndDate: z.coerce.date().optional().nullable(),
    stock: z.coerce.number().int("El stock debe ser un número entero.").min(0, "El stock no puede ser negativo."),
    category: z.string().min(1, "La categoría es requerida."),
    image: z.string().url("La URL de la imagen no es válida.").min(1, "La URL de la imagen es requerida."),
    aiHint: z.string().optional(),
    featured: z.boolean().optional(),
});

export async function addProductAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const sanitizedData = sanitizeData(rawData);

    // Handle empty strings for optional number fields
    if (sanitizedData.discountPercentage === '') sanitizedData.discountPercentage = null;

    const validatedFields = productSchema.safeParse({
      ...sanitizedData,
      featured: sanitizedData.featured === 'on',
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

    // Handle empty strings for optional number fields
    if (sanitizedData.discountPercentage === '') sanitizedData.discountPercentage = null;

    const validatedFields = productSchema.safeParse({
        ...sanitizedData,
        featured: sanitizedData.featured === 'on',
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
