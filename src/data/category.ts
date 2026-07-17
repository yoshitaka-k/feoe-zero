// 商品種類の値からキーへの変換
export const CATEGORY_KVALUE_TO_KEY = {
  "その他": "other",
  "武器": "weapon",
  "防具": "armor",
  "飾り": "accessory",
  "道具": "item",
} as const;

// 商品種類のキーから値への変換
export const CATEGORY_KEY_TO_VALUE = Object.fromEntries(
  Object.entries(CATEGORY_KVALUE_TO_KEY).map(([key, value]) => [value, key]),
) as Record<
  (typeof CATEGORY_KVALUE_TO_KEY)[keyof typeof CATEGORY_KVALUE_TO_KEY],
  keyof typeof CATEGORY_KVALUE_TO_KEY
>;
