"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { getRecommendationsAction } from '@/app/actions';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

const VIEWING_HISTORY_KEY = 'viewingHistory';
const MAX_HISTORY_LENGTH = 10;

export function ProductRecommendations({ currentProductId }: { currentProductId: string }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartItems } = useCart();
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load viewing history from local storage
    const storedHistory = localStorage.getItem(VIEWING_HISTORY_KEY);
    const history = storedHistory ? JSON.parse(storedHistory) : [];

    // Add current product to history if it's not already the last one
    if (history[history.length - 1] !== currentProductId) {
      const updatedHistory = [...history, currentProductId].slice(-MAX_HISTORY_LENGTH);
      localStorage.setItem(VIEWING_HISTORY_KEY, JSON.stringify(updatedHistory));
      setViewingHistory(updatedHistory);
    } else {
      setViewingHistory(history);
    }
  }, [currentProductId]);


  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const cartProductIds = cartItems.map(item => item.product.id);
        const recommendedProducts = await getRecommendationsAction({
          viewingHistory,
          cartItems: cartProductIds,
          maxRecommendations: 4,
          excludeId: currentProductId,
        });
        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (viewingHistory.length > 0 || cartItems.length > 0) {
      fetchRecommendations();
    } else {
      setLoading(false);
      setRecommendations([]);
    }
  }, [viewingHistory, cartItems, currentProductId]);
  
  if (loading) {
    return <p>Buscando recomendaciones...</p>;
  }

  if (recommendations.length === 0) {
    return null; // Don't show the section if there are no recommendations
  }
  
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {recommendations.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
