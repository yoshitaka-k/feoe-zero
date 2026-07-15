/** GitHub Pages などサブパス配下で公開するときのプレフィックス（末尾スラッシュなし） */
export const BASE_PATH = (Deno.env.get("BASE_PATH") ?? "").replace(/\/$/, "");

/** サイト内パスに BASE_PATH を付与する。ローカルではそのまま。 */
export function withBase(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}

/** ルート絶対パスの href / src に BASE_PATH を付与する */
export function applyBasePath(html: string): string {
  const prefix = withBase("/");
  return html
    .replaceAll('href="/', `href="${prefix}`)
    .replaceAll("href='/", `href='${prefix}`)
    .replaceAll('src="/', `src="${prefix}`)
    .replaceAll("src='/", `src='${prefix}`);
}
