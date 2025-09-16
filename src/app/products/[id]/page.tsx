
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import { ProductPageClient } from './ProductPageClient';
import type { Product } from '@/lib/types';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
      notFound();
  }
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // Fetch all products and find related ones
  const allProducts = await getProducts();
  const relatedProducts = allProducts.filter(p => 
    p.id !== product.id && // Exclude the current product
    p.categoryIds.some(catId => product.categoryIds.includes(catId)) // Check for shared categories
  ).slice(0, 4); // Limit to 4 recommendations

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
