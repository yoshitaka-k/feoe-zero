import itemJson from "../../assets/data/item.json" with { type: "json" };

export type Item = {
  name: string;
  effect: string;
  price: number;
  note: string;
};

export const items = itemJson as unknown as Item[];
