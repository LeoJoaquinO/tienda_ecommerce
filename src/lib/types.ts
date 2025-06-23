export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
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
