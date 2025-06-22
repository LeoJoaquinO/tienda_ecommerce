"use server";

import { productRecommendations } from "@/ai/flows/product-recommendations";
import { getProductById, getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

type RecommendationInput = {
    viewingHistory: string[];
    cartItems: string[];
    maxRecommendations?: number;
    excludeId?: string;
};

export async function getRecommendationsAction(input: RecommendationInput): Promise<Product[]> {
    try {
        const { recommendedProducts } = await productRecommendations({
            viewingHistory: input.viewingHistory,
            cartItems: input.cartItems,
            maxRecommendations: (input.maxRecommendations || 4) + 1, // Fetch one extra to filter out excludeId
        });
        
        const allProducts = getProducts();
        
        let filteredRecommendations = recommendedProducts
          .map(id => allProducts.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);

        if (input.excludeId) {
            filteredRecommendations = filteredRecommendations.filter(p => p.id !== input.excludeId);
        }

        return filteredRecommendations.slice(0, input.maxRecommendations || 4);

    } catch (error) {
        console.error("AI recommendation failed:", error);
        // Fallback to simple logic if AI fails
        return getProducts()
            .filter(p => p.id !== input.excludeId)
            .slice(0, input.maxRecommendations || 4);
    }
}
