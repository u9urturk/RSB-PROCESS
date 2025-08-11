// Shared types for OrderPanel subcomponents (Stage 3)
export interface Category { id: string; name: string; }

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  status: string;
}

export interface CartItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  note: string[];
}
