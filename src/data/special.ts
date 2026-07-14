import specialJson from "../../assets/data/special.json" with { type: "json" };

export type Special = {
  character: string;
  name: string;
  effect: string;
  point: string;
  note: string;
};

export type Character = {
  character: string;
  special: Special[];
};

export const specials = specialJson as unknown as Character[];
