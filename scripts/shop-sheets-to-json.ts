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

type CountryNode = {
  国: string;
  場所: Array<Record<string, unknown>>;
};
type CityNode = {
  場所: string;
  店: Array<Record<string, unknown>>;
};

type ShopNode = {
  店: string;
  備考: string | number | null;
  商品: Array<Record<string, unknown>>;
};

type ShopJson = Array<CountryNode>;

function formatShopData(records: Record<string, unknown>[]): ShopJson {
  const result: ShopJson = [];
  const byCountry = new Map<string, CountryNode>();
  const byCity = new Map<string, CityNode>();
  let currentCountry = "";
  let currentCity = "";
  let currentShop = "";

  for (const row of records) {
    const country = pick(row, ["国", "country"]);
    const city = pick(row, ["場所", "村", "街", "町", "city", "town"]);
    const shop = pick(row, ["店名", "店", "shop"]);
    const shopNote = pick(row, ["備考", "note"]);

    if (country) currentCountry = String(country);
    if (city) currentCity = String(city);
    if (shop) currentShop = String(shop);

    const productName = pick(row, ["名前", "name", "商品名"]);
    if (!productName || !currentCountry || !currentCity || !currentShop) {
      continue;
    }

    let countryNode = byCountry.get(currentCountry);
    if (!countryNode) {
      countryNode = { 国: currentCountry, 場所: [] };
      byCountry.set(currentCountry, countryNode);
      result.push(countryNode);
    }

    let cityNode = byCity.get(currentCity);
    if (!cityNode) {
      cityNode = { 場所: currentCity, 店: [] };
      byCity.set(currentCity, cityNode);
      countryNode.場所.push(cityNode);
    }

    let shopNode = cityNode.店.find((node) => node.店 === currentShop);
    if (!shopNode) {
      shopNode = { 店: currentShop, 備考: (shopNote ?? "") as string | number | null, 商品: [] };
      cityNode.店.push(shopNode);
    }

    const product = {
      名前: productName,
      値段: pick(row, ["値段", "price"]),
    };
    (shopNode.商品 as Array<Record<string, unknown>>).push(product);
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
