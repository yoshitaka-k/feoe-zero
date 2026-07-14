import shopsJson from "../../assets/data/shop.json" with { type: "json" };

export type Product = {
  name: string;
  price: number;
};

export type Shop = {
  shop: string;
  note: string;
  product: Product[];
};

export type Location = {
  location: string;
  shop: Shop[];
};

export type Country = {
  country: string;
  location: Location[];
};

export const shops = shopsJson as unknown as Country[];
