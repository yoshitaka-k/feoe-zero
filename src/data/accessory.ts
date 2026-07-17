import accessoryJson from "../../assets/data/accessory.json" with { type: "json" };

export type Accessory = {
  name: string;
  power: string | number;
  target: string;
  effect: string;
  price: number;
  note: string;
};

export const accessories = accessoryJson as unknown as Accessory[];
