/** Pure path check, no I/O. Both arguments must already be real (canonical) absolute paths. */
export function isInside(root: string, target: string): boolean {
  const norm = (p: string): string => {
    let s = p.replace(/\\/g, "/");
    if (s.length > 1) s = s.replace(/\/+$/, "");
    return s;
  };
  let r = norm(root);
  let t = norm(target);
  // Windows drive paths are case-insensitive.
  if (/^[a-zA-Z]:/.test(r) || /^[a-zA-Z]:/.test(t)) {
    r = r.toLowerCase();
    t = t.toLowerCase();
  }
  if (t === r) return true;
  const prefix = r.endsWith("/") ? r : r + "/";
  return t.startsWith(prefix);
}
