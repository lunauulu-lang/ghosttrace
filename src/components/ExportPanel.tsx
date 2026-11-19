import { useMemo, useState } from "react";
import { MAX_BYTES } from "../engine/schema";
import type { IncidentBundle, RepairConfig, ValidationError } from "../engine/types";
import { buildExportFile, buildRepairSpec, serializeExport } from "../lib/exportBundle";
import { parseImportText } from "../lib/importBundle";

type Props = {
  bundle: IncidentBundle;
  config: RepairConfig;
  onImport: (bundle: IncidentBundle, config: RepairConfig) => void;
};

function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsText(file);
  });
}

export function ExportPanel({ bundle, config, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [status, setStatus] = useState("");

  const texts = useMemo(() => {
    if (!open) return null;
    return {
      json: serializeExport(buildExportFile(bundle, config)),
      spec: buildRepairSpec(bundle, config),
    };
  }, [open, bundle, config]);

  async function onFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setStatus("");
    if (file.size > MAX_BYTES) {
      setErrors([{ path: "$", code: "too_large", message: `File exceeds ${MAX_BYTES} bytes.` }]);
      return;
    }
    let text: string;
    try {
      text = await readText(file);
    } catch {
      setErrors([{ path: "$", code: "read_failed", message: "The file could not be read." }]);
      return;
    }
    const result = parseImportText(text);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onImport(result.bundle, result.config);
    setStatus(`Imported ${result.bundle.title}`);
  }

  return (
    <div className="export-panel">
      <h3>Export and import</h3>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview export
      </button>
      {texts ? (
        <div className="export-preview">
          <h4>Export JSON</h4>
          <pre tabIndex={0} aria-label="Export JSON preview">
            {texts.json}
          </pre>
          <h4>Kiro repair spec</h4>
          <pre tabIndex={0} aria-label="Repair spec preview">
            {texts.spec}
          </pre>
          <div className="presets">
            <button type="button" onClick={() => download("ghosttrace-export.json", texts.json, "application/json")}>
              Download export JSON
            </button>
            <button type="button" onClick={() => download("ghosttrace-repair-spec.md", texts.spec, "text/markdown")}>
              Download Kiro repair spec
            </button>
          </div>
        </div>
      ) : null}
      <label className="file-label">
        Import export file
        <input type="file" accept="application/json,.json" onChange={(e) => void onFile(e.currentTarget)} />
      </label>
      <p data-testid="import-status" aria-live="polite">
        {status}
      </p>
      {errors.length > 0 ? (
        <div role="alert" className="import-errors">
          <p>Import rejected. Nothing was changed.</p>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{`${e.path}: ${e.message}`}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
