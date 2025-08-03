"use server";

import { revalidatePath } from "next/cache";
import { createProduct, deleteProduct, updateProduct } from "@/lib/products";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido."),
    description: z.string().min(1, "La descripción es requerida."),
    price: z.coerce.number().positive("El precio debe ser un número positivo."),
    discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
    offerStartDate: z.coerce.date().optional().nullable(),
    offerEndDate: z.coerce.date().optional().nullable(),
    stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
    category: z.string().min(1, "La categoría es requerida."),
    image: z.string().url("La URL de la imagen no es válida."),
    aiHint: z.string().optional(),
    featured: z.boolean().optional(),
});

export async function addProductAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = productSchema.safeParse({
      ...rawData,
      price: parseFloat(rawData.price as string),
      discountPercentage: rawData.discountPercentage ? parseFloat(rawData.discountPercentage as string) : null,
      offerStartDate: rawData.offerStartDate ? new Date(rawData.offerStartDate as string) : null,
      offerEndDate: rawData.offerEndDate ? new Date(rawData.offerEndDate as string) : null,
      stock: parseInt(rawData.stock as string, 10),
      featured: rawData.featured === 'on',
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
        return { message: "Producto añadido exitosamente." };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "No se pudo añadir el producto." };
    }
}

export async function updateProductAction(id: number, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = productSchema.safeParse({
        ...rawData,
        price: parseFloat(rawData.price as string),
        discountPercentage: rawData.discountPercentage ? parseFloat(rawData.discountPercentage as string) : null,
        offerStartDate: rawData.offerStartDate ? new Date(rawData.offerStartDate as string) : null,
        offerEndDate: rawData.offerEndDate ? new Date(rawData.offerEndDate as string) : null,
        stock: parseInt(rawData.stock as string, 10),
        featured: rawData.featured === 'on',
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
        return { message: 'Producto eliminado exitosamente.' }
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'No se pudo eliminar el producto.' }
    }
}
