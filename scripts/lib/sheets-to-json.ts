import { basename, join } from "jsr:@std/path";
import * as XLSX from "npm:xlsx@0.18.5";
import { ASSETS_DATA_DIR } from "../../src/paths.ts";

/** コマンドライン引数のオプション
 * @property file 入力ファイル
 * @property out 出力ディレクトリ
 */
export interface CliOptions {
  file: string;
  out: string;
}

/** シートのメタデータ
 * @property name シート名
 * @property file 出力ファイル名
 * @property rows 行数
 */
export interface SheetMeta {
  name: string;
  file: string;
  rows: number;
}

/** シートのデータをフォーマットする関数
 * @param records レコード
 * @returns フォーマットされたデータ
 */
export type SheetFormatter = (
  records: Record<string, unknown>[],
) => unknown;

/** シートのインポート設定
 * @property defaultFile 既定の入力ファイル
 * @property defaultOutDir 既定の出力ディレクトリ
 * @property helpDefaultFile ヘルプの既定の入力ファイル
 * @property sheetAliases シート名の別名
 * @property formatters シートのデータをフォーマットする関数
 */
export interface SheetImportConfig {
  defaultFile: string;
  defaultOutDir?: string;
  helpDefaultFile: string;
  sheetAliases?: Record<string, string>;
  formatters: Record<string, SheetFormatter>;
}

/** コマンドライン引数をパースする関数
 * @param args コマンドライン引数
 * @param config シートのインポート設定
 * @returns コマンドライン引数のオプション
 */
export function parseArgs(
  args: string[],
  config: SheetImportConfig,
): CliOptions {
  const options: CliOptions = {
    file: config.defaultFile,
    out: config.defaultOutDir ?? ASSETS_DATA_DIR,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--file" && args[i + 1]) {
      options.file = args[++i];
    } else if (arg === "--out" && args[i + 1]) {
      options.out = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      printHelp(config.helpDefaultFile);
      Deno.exit(0);
    }
  }

  return options;
}

/** ヘルプを表示する関数
 * @param defaultFile ヘルプの既定の入力ファイル
 */
function printHelp(defaultFile: string): void {
  console.log(`スプレッドシート → JSON 変換

  deno task sheets:import
  deno task sheets:import -- --file <path.tsv|path.xlsx> [--out assets/data]

オプション:
  --file   入力ファイル（既定: ${defaultFile}）
  --out    出力ディレクトリ（既定: assets/data）
`);
}

/** シート名をファイル名に変換する関数
 * @param sheetName シート名
 * @returns ファイル名
 */
export function toFilename(sheetName: string): string {
  return sheetName
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "sheet";
}

/** シート名をベース名に変換する関数
 * @param sheetName シート名
 * @param aliases シート名の別名
 * @returns ベース名
 */
function outputBaseName(
  sheetName: string,
  aliases: Record<string, string>,
): string {
  const normalized = toFilename(sheetName);
  return aliases[normalized] ?? normalized;
}

/** 行のデータを取得する関数
 * @param row 行
 * @param keys キー
 * @returns データ
 */
export function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in row && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return null;
}

/** セルの値を取得する関数
 * @param value セルの値
 * @returns セルの値
 */
function cellToValue(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" || typeof value === "boolean") return value;

  const text = String(value).trim();
  if (text === "") return null;

  const lower = text.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;

  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const num = Number(text);
    if (!Number.isNaN(num)) return num;
  }

  return text;
}

/** ヘッダーを一意にする関数
 * @param headers ヘッダー
 * @returns 一意のヘッダー
 */
function uniqueHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((header, index) => {
    const base = header.trim() || `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

/** 行が空かどうかを判定する関数
 * @param row 行
 * @returns 行が空かどうか
 */
function isEmptyRow(row: unknown[]): boolean {
  return row.every((cell) => {
    if (cell === undefined || cell === null) return true;
    return String(cell).trim() === "";
  });
}

/** 行がコメントかどうかを判定する関数
 * @param row 行
 * @returns 行がコメントかどうか
 */
function isCommentRow(row: unknown[]): boolean {
  const first = row[0];
  if (first === undefined || first === null) return false;
  const text = String(first).trim();
  return text.startsWith("#") || text.startsWith("//");
}

/** シートのデータをレコードに変換する関数
 * @param sheet シート
 * @returns レコード
 */
export function sheetToRecords(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  });

  const headerIndex = rows.findIndex(
    (row) => !isEmptyRow(row) && !isCommentRow(row),
  );
  if (headerIndex === -1) return [];

  const headers = uniqueHeaders(
    rows[headerIndex].map((cell) => String(cell ?? "").trim()),
  );

  const records: Record<string, unknown>[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (isEmptyRow(row) || isCommentRow(row)) continue;

    const record: Record<string, unknown> = {};
    let hasValue = false;

    for (let col = 0; col < headers.length; col++) {
      const value = cellToValue(row[col]);
      record[headers[col]] = value;
      if (value !== null) hasValue = true;
    }

    if (hasValue) records.push(record);
  }

  return records;
}

/** シートのデータをフォーマットする関数
 * @param sheetName シート名
 * @param records レコード
 * @param formatters シートのデータをフォーマットする関数
 * @returns フォーマットされたデータ
 */
function formatSheetData(
  sheetName: string,
  records: Record<string, unknown>[],
  formatters: Record<string, SheetFormatter>,
): unknown {
  const formatter = formatters[toFilename(sheetName)];
  return formatter ? formatter(records) : records;
}

/** デリミタ付きファイルを読み込む関数
 * @param path パス
 * @param text テキスト
 * @returns ワークブック
 */
function readDelimitedFile(
  path: string,
  text: string,
): XLSX.WorkBook {
  const ext = path.toLowerCase().split(".").pop();
  const delimiter = ext === "csv" ? "," : "\t";
  const sheetName = basename(path).replace(/\.[^.]+$/, "");
  const workbook = XLSX.read(text, { type: "string", FS: delimiter });
  const firstSheet = workbook.SheetNames[0];

  if (firstSheet && firstSheet !== sheetName) {
    workbook.Sheets[sheetName] = workbook.Sheets[firstSheet];
    delete workbook.Sheets[firstSheet];
    workbook.SheetNames = [sheetName];
  }

  return workbook;
}

/** ワークブックを読み込む関数
 * @param file ファイル
 * @returns ワークブック
 */
async function loadWorkbook(file: string): Promise<XLSX.WorkBook> {
  const ext = file.toLowerCase().split(".").pop();

  if (ext === "tsv" || ext === "csv") {
    const text = await Deno.readTextFile(file);
    return readDelimitedFile(file, text);
  }

  const data = await Deno.readFile(file);
  return XLSX.read(data, { type: "buffer" });
}

/** シートを出力する関数
 * @param workbook ワークブック
 * @param outDir 出力ディレクトリ
 * @param config シートのインポート設定
 * @returns シートのメタデータ
 */
async function exportSheets(
  workbook: XLSX.WorkBook,
  outDir: string,
  config: SheetImportConfig,
): Promise<SheetMeta[]> {
  await Deno.mkdir(outDir, { recursive: true });

  const aliases = config.sheetAliases ?? {};
  const usedNames = new Map<string, number>();
  const meta: SheetMeta[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const records = sheetToRecords(sheet);
    const data = formatSheetData(sheetName, records, config.formatters);

    let baseName = outputBaseName(sheetName, aliases);
    const count = usedNames.get(baseName) ?? 0;
    usedNames.set(baseName, count + 1);
    if (count > 0) baseName = `${baseName}-${count + 1}`;

    const fileName = `${baseName}.json`;
    const filePath = join(outDir, fileName);

    await Deno.writeTextFile(
      filePath,
      `${JSON.stringify(data, null, 4)}\n`,
    );

    const rows = Array.isArray(data)
      ? data.length
      : records.length;
    meta.push({ name: sheetName, file: fileName, rows });
    console.log(`  ${sheetName} → ${filePath} (${rows} 件)`);
  }

  return meta;
}

/** シートをインポートする関数
 * @param config シートのインポート設定
 * @param args コマンドライン引数
 * @returns シートのメタデータ
 */
export async function runSheetImport(
  config: SheetImportConfig,
  args: string[],
): Promise<void> {
  const options = parseArgs(args, config);

  try {
    console.log(`読み込み中: ${options.file}`);
    const workbook = await loadWorkbook(options.file);
    console.log(`シート数: ${workbook.SheetNames.length}\n`);

    const meta = await exportSheets(workbook, options.out, config);
    console.log(`\n完了: ${meta.length} シートを ${options.out}/ に出力しました。`);
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}
