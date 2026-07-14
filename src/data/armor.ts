import armorJson from "../../assets/data/armor.json" with { type: "json" };

export type Armor = {
  name: string;
  power: string | number;
  target: string;
  effect: string;
  price: number;
};

export const armors = armorJson as unknown as Armor[];
