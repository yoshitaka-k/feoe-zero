import chayaJson from "../../assets/data/chaya.json" with { type: "json" };

export type Chaya = {
  room: string;
  name: string;
  event: string;
  note: string | null;
};

export type Location = {
  location: string;
  chaya: Chaya[];
};

export type Country = {
  country: string;
  location: Location[];
};

export const chayas = chayaJson as unknown as Country[];
