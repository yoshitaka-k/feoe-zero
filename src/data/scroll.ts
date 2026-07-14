import scrollJson from "../../assets/data/scroll.json" with { type: "json" };

export type Scroll = {
  name: string;
  effect: string;
  magic_point: number;
  target: string;
  location: string;
};

export const scrolls = scrollJson as unknown as Scroll[];
