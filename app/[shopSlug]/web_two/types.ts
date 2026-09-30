export type Product = {
  id?: string;
  name: string;
  category: string;
  price: string;
  blurb: string;
  imageUrl: string;
  sellingPrice?: number;
  priceAfterSale?: number;
  sizes?: string[];
  colors?: string[];
  size?: string;
  color?: string;
  salePercent?: number | string;
  newArrival?: boolean;
};

export type CartItem = {
  id?: string;
  cartId?: string;
  name: string;
  category?: string;
  blurb?: string;
  sizes?: string[];
  colors?: string[];
  size?: string;
  color?: string;
  price: number;
  imageUrl: string;
  qty: number;
  salePercent?: number | string;
  newArrival?: boolean;
};
