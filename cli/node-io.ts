import { readFileSync, realpathSync, statSync } from "node:fs";
import { MAX_BYTES } from "../src/engine/schema";
import type { FileReader } from "./core";
import { isInside } from "./paths";

/**
 * The only module that touches the file system. Read-only.
 * Only files whose real path is inside the current working directory are read
 * (absolute paths, `..` and symlinks that leave it are rejected). Files over 1 MiB are rejected before reading.
 */
export const readTextFile: FileReader = (path) => {
  try {
    const root = realpathSync(process.cwd());
    const real = realpathSync(path);
    if (!isInside(root, real)) return { ok: false, error: `Path is outside the repository: ${path}` };
    const st = statSync(real);
    if (!st.isFile()) return { ok: false, error: `Not a file: ${path}` };
    if (st.size > MAX_BYTES) return { ok: false, error: `File exceeds ${MAX_BYTES} bytes: ${path}` };
    return { ok: true, text: readFileSync(real, "utf8") };
  } catch {
    return { ok: false, error: `Cannot read file: ${path}` };
  }
};
