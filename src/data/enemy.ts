import enemyJson from "../../assets/data/enemy.json" with { type: "json" };

export type Enemy = {
  name: string;
  hp: number;
  exp: number;
  money: number;
  special: string;
  drop: string;
};

export type Country = {
  name: string;
  enemy: Enemy[];
};

export const enemies = enemyJson as unknown as Country[];
