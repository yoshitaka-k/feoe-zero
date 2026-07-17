import foundItemJson from "../../assets/data/found_item.json" with { type: "json" };

export type FoundItem = {
  location: string;
  item: string;
  note: string;
};

export type Country = {
  country: string;
  foundItem: FoundItem[];
};

export const foundItems = foundItemJson as unknown as Country[];
