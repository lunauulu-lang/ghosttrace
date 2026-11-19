import { MAX_BYTES, MAX_DEPTH, measureTextDepth, validateBundle } from "../engine/schema";
import type { IncidentBundle, RepairConfig, ValidationError } from "../engine/types";
import { EXPORT_FORMAT, EXPORT_FORMAT_VERSION } from "./exportBundle";

export type ImportResult =
  | { ok: true; bundle: IncidentBundle; config: RepairConfig }
  | { ok: false; errors: ValidationError[] };

const CONFIG_KEYS: readonly (keyof RepairConfig)[] = [
  "normalizeV2Amount",
  "deduplicateDeliveries",
  "causalCheckoutOrder",
];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function one(path: string, code: string, message: string): ImportResult {
  return { ok: false, errors: [{ path, code, message }] };
}

/** Parse and validate an export file. Never throws, never evaluates content, never touches the network. */
export function parseImportText(text: string): ImportResult {
  if (typeof text !== "string") return one("$", "invalid_input", "Input must be text.");
  if (text.length > MAX_BYTES || new TextEncoder().encode(text).length > MAX_BYTES) {
    return one("$", "too_large", `File exceeds ${MAX_BYTES} bytes.`);
  }
  if (measureTextDepth(text) > MAX_DEPTH) {
    return one("$", "too_deep", `JSON nesting depth exceeds ${MAX_DEPTH}.`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return one("$", "malformed_json", "File is not valid JSON.");
  }
  if (!isObject(parsed)) return one("$", "invalid_export", "Export file must be a JSON object.");

  const errors: ValidationError[] = [];
  if (parsed.format !== EXPORT_FORMAT) {
    errors.push({ path: "format", code: "unknown_format", message: `format must be "${EXPORT_FORMAT}".` });
  }
  if (parsed.formatVersion !== EXPORT_FORMAT_VERSION) {
    errors.push({
      path: "formatVersion",
      code: "unknown_format_version",
      message: `formatVersion must be ${EXPORT_FORMAT_VERSION}.`,
    });
  }

  let config: RepairConfig | null = null;
  const preset = parsed.preset;
  const cfg = isObject(preset) ? preset.config : undefined;
  if (!isObject(cfg)) {
    errors.push({ path: "preset.config", code: "invalid_preset", message: "preset.config must be an object." });
  } else {
    let ok = true;
    for (const key of CONFIG_KEYS) {
      if (typeof cfg[key] !== "boolean") {
        ok = false;
        errors.push({
          path: `preset.config.${key}`,
          code: "invalid_preset",
          message: `${key} must be true or false.`,
        });
      }
    }
    for (const key of Object.keys(cfg)) {
      if (!(CONFIG_KEYS as readonly string[]).includes(key)) {
        ok = false;
        errors.push({
          path: `preset.config.${key}`,
          code: "unknown_preset_key",
          message: `Unknown preset key "${key}".`,
        });
      }
    }
    if (ok) {
      config = {
        normalizeV2Amount: cfg.normalizeV2Amount as boolean,
        deduplicateDeliveries: cfg.deduplicateDeliveries as boolean,
        causalCheckoutOrder: cfg.causalCheckoutOrder as boolean,
      };
    }
  }

  const result = validateBundle(parsed.bundle);
  let bundle: IncidentBundle | null = null;
  if (result.ok) {
    bundle = result.bundle;
  } else {
    for (const e of result.errors) {
      const path = e.path === "$" ? "bundle" : `bundle.${e.path}`;
      errors.push({ path, code: e.code, message: e.message });
    }
  }

  if (errors.length > 0 || config === null || bundle === null) {
    return { ok: false, errors };
  }
  return { ok: true, bundle, config };
}
