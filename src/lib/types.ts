
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

export type Coupon = {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Date | null;
  isActive: boolean;
};

export type OrderData = {
    customerName: string;
    customerEmail: string;
    total: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    items: CartItem[];
    couponCode?: string | null;
    discountAmount?: number;
}
