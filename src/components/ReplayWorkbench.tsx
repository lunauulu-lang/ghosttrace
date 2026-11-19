import { useMemo, useState } from "react";
import { compareReplays } from "../engine/compare";
import { replay } from "../engine/replay";
import type { IncidentBundle, RepairConfig } from "../engine/types";
import { ExportPanel } from "./ExportPanel";
import { IncidentTimeline } from "./IncidentTimeline";
import { StateInspector } from "./StateInspector";

const ALL_OFF: RepairConfig = { normalizeV2Amount: false, causalCheckoutOrder: false, deduplicateDeliveries: false };

const PRESETS: { label: string; config: RepairConfig }[] = [
  { label: "G000 Broken", config: ALL_OFF },
  {
    label: "G110 Over-capture",
    config: { normalizeV2Amount: true, causalCheckoutOrder: true, deduplicateDeliveries: false },
  },
  {
    label: "G111 Repaired",
    config: { normalizeV2Amount: true, causalCheckoutOrder: true, deduplicateDeliveries: true },
  },
];

const TOGGLES: { key: keyof RepairConfig; label: string }[] = [
  { key: "normalizeV2Amount", label: "Schema mapping (v2 amount)" },
  { key: "causalCheckoutOrder", label: "Causal ordering" },
  { key: "deduplicateDeliveries", label: "Deduplicate applied deliveries" },
];

export function ReplayWorkbench({ bundle: initialBundle }: { bundle: IncidentBundle }) {
  const [bundle, setBundle] = useState<IncidentBundle>(initialBundle);
  const [config, setConfig] = useState<RepairConfig>(ALL_OFF);
  const [selected, setSelected] = useState<number | null>(null);

  const baseline = useMemo(() => replay(bundle, ALL_OFF), [bundle]);
  const current = useMemo(() => replay(bundle, config), [bundle, config]);
  const diff = useMemo(() => compareReplays(baseline, current), [baseline, current]);
  const selectedRecord = current.deliveries.find((d) => d.deliveryIndex === selected) ?? null;

  return (
    <div className="workbench">
      <header className="top">
        <h1>GhostTrace</h1>
        <span className="badge">Synthetic data — no real payments</span>
      </header>
      <main className="columns">
        <section aria-labelledby="h-incident" className="panel">
          <h2 id="h-incident">Incident</h2>
          <p>{bundle.title}</p>
          <fieldset>
            <legend>Repairs</legend>
            {TOGGLES.map((t) => (
              <label key={t.key} className="toggle">
                <input
                  type="checkbox"
                  checked={config[t.key]}
                  onChange={(e) => setConfig({ ...config, [t.key]: e.target.checked })}
                />
                {t.label}
              </label>
            ))}
          </fieldset>
          <div className="presets" role="group" aria-label="Story presets">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => setConfig({ ...p.config })}>
                {p.label}
              </button>
            ))}
          </div>
          <ExportPanel
            bundle={bundle}
            config={config}
            onImport={(b, c) => {
              setBundle(b);
              setConfig(c);
              setSelected(null);
            }}
          />
        </section>
        <section aria-labelledby="h-timeline" className="panel">
          <h2 id="h-timeline">Timeline</h2>
          <IncidentTimeline current={current} diff={diff} selected={selected} onSelect={setSelected} />
        </section>
        <section aria-labelledby="h-state" className="panel">
          <h2 id="h-state">State</h2>
          <StateInspector current={current} selectedRecord={selectedRecord} />
        </section>
      </main>
    </div>
  );
}
