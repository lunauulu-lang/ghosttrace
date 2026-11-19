import { readFileSync, statSync } from "node:fs";
import { MAX_BYTES } from "../src/engine/schema";
import type { FileReader } from "./core";

/** The only module that touches the file system. Read-only; rejects files over 1 MiB before reading. */
export const readTextFile: FileReader = (path) => {
  try {
    const st = statSync(path);
    if (!st.isFile()) return { ok: false, error: `Not a file: ${path}` };
    if (st.size > MAX_BYTES) return { ok: false, error: `File exceeds ${MAX_BYTES} bytes: ${path}` };
    return { ok: true, text: readFileSync(path, "utf8") };
  } catch {
    return { ok: false, error: `Cannot read file: ${path}` };
  }
};
