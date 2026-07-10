/**
 * スプレッドシートデータをシートごとの JSON に変換する。
 *
 * 使い方:
 *   deno task shop-sheets:import
 *   deno task shop-sheets:import -- --file ./scripts/tsv/shop.tsv
 *
 * 出力先: assets/data/shop.json のように 1 シート = 1 ファイル
 */

import { join } from "jsr:@std/path";
import { pick, runSheetImport } from "./lib/sheets-to-json.ts";

const DEFAULT_FILE = join(import.meta.dirname!, "tsv/shop.tsv");

type ShopNode = {
  備考: string | number | null;
  商品: Array<Record<string, unknown>>;
};

type ShopJson = Record<string, Record<string, Record<string, ShopNode>>>;

function formatShopData(records: Record<string, unknown>[]): ShopJson {
  const result: ShopJson = {};
  let currentCountry = "";
  let currentCity = "";
  let currentShop = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);
    const city = pick(row, ["場所", "村", "街", "町", "city", "town"]);
    const shop = pick(row, ["店名", "店", "shop"]);
    const shopNote = pick(row, ["店備考", "shop_note", "備考"]);

    if (country) currentCountry = String(country);
    if (city) currentCity = String(city);
    if (shop) currentShop = String(shop);

    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName || !currentCountry || !currentCity || !currentShop) {
      continue;
    }

    result[currentCountry] ??= {};
    result[currentCountry][currentCity] ??= {};
    result[currentCountry][currentCity][currentShop] ??= {
      備考: (shopNote ?? "") as string | number | null,
      商品: [],
    };

    if (shopNote !== null) {
      result[currentCountry][currentCity][currentShop].備考 =
        shopNote as string | number | null;
    }

    const product: Record<string, unknown> = {
      名前: productName,
      値段: pick(row, ["値段", "price"]),
    };

    const productNote = pick(row, ["商品備考", "product_note"]);
    if (productNote !== null) {
      product.備考 = productNote;
    }

    result[currentCountry][currentCity][currentShop].商品.push(product);
  }

  return result;
}

if (import.meta.main) {
  await runSheetImport({
    defaultFile: DEFAULT_FILE,
    helpDefaultFile: "scripts/tsv/shop.tsv",
    sheetAliases: { spreadsheet: "shop" },
    formatters: {
      shop: formatShopData,
      spreadsheet: formatShopData,
    },
  }, Deno.args);
}
