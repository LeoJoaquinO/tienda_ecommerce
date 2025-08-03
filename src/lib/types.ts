export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category: string;
  stock: number;
  aiHint?: string;
  featured?: boolean;
  discountPercentage?: number | null;
  offerStartDate?: Date | null;
  offerEndDate?: Date | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
