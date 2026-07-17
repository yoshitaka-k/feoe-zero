import bossJson from "../../assets/data/boss.json" with { type: "json" };

export type Boss = {
  name: string;
  hp: number;
  exp: number;
  money: number;
  special: string;
};

export type Country = {
  country: string;
  boss: Boss[];
};

export const bosses = bossJson as unknown as Country[];
