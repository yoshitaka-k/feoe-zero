import hermitJson from "../../assets/data/hermit.json" with { type: "json" };

export type Hermit = {
  name: string;
  location: string;
  scroll: string | null;
  special: string | null;
  note: string | null;
};

export type Country = {
  country: string;
  hermit: Hermit[];
};

export const hermits = hermitJson as unknown as Country[];
