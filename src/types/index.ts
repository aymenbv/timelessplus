export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  galleryImages?: string[];
  category: 'men' | 'women' | 'smart' | 'accessories';
  movement: 'automatic' | 'quartz';
  material: 'leather' | 'metal' | 'rubber';
  description: string;
  colors?: string[];
  colorImages?: Record<string, string[]>;
  inStock: boolean;
  isFeatured?: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  reviewer_image?: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  phone: string;
  wilaya: string;
  paymentMethod: 'cod' | 'card';
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
  referralCode?: string;
}
