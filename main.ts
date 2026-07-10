import { handler } from "./src/handler.ts";

if (import.meta.main) {
  Deno.serve(handler);
}
