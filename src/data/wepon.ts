import weponJson from "../../assets/data/wepon.json" with { type: "json" };

export type Wepon = {
  name: string;
  power: string | number;
  target: string;
  effect: string;
  price: number;
  note: string;
};

export const wepons = weponJson as unknown as Wepon[];
