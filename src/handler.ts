import { serveAsset } from "./common/assets.ts";
import { notFound } from "./common/not_found.ts";
import { handleIndex } from "./pages/index.ts";
import { handleShop } from "./pages/shop.ts";
import { handleItem } from "./pages/item.ts";
import { handleScroll } from "./pages/scroll.ts";
import { handleSpecial } from "./pages/special.ts";
import { handleHermit } from "./pages/hermit.ts";
import { handleWepon } from "./pages/wepon.ts";
import { handleArmor } from "./pages/armor.ts";
import { handleAccessory } from "./pages/accessory.ts";
import { handleEnemy } from "./pages/enemy.ts";
import { handleBoss } from "./pages/boss.ts";

// ハンドラー — パスを見て振り分けるだけ
export async function handler(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (pathname.startsWith("/assets/")) {
    return serveAsset(pathname);
  }

  if (pathname === "/") return handleIndex();
  if (pathname === "/shop") return handleShop();
  if (pathname === "/item") return handleItem();
  if (pathname === "/scroll") return handleScroll();
  if (pathname === "/special") return handleSpecial();
  if (pathname === "/hermit") return handleHermit();
  if (pathname === "/wepon") return handleWepon();
  if (pathname === "/armor") return handleArmor();
  if (pathname === "/accessory") return handleAccessory();
  if (pathname === "/enemy") return handleEnemy();
  if (pathname === "/boss") return handleBoss();

  return notFound();
}
