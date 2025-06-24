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
};

export type CartItem = {
  product: Product;
  quantity: number;
};
