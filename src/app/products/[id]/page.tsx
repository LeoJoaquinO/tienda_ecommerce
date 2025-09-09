
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import { ProductPageClient } from './ProductPageClient';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
      notFound();
  }
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}
