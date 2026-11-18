import type { CompareResult } from "../engine/compare";
import type { ReplayResult } from "../engine/types";

type Props = {
  current: ReplayResult;
  diff: CompareResult;
  selected: number | null;
  onSelect: (deliveryIndex: number) => void;
};

export function IncidentTimeline({ current, diff, selected, onSelect }: Props) {
  const rows = [...current.deliveries].sort((a, b) => a.deliveryIndex - b.deliveryIndex);
  const firstIndex = diff.firstDivergence?.deliveryIndex ?? null;

  return (
    <ul className="timeline" aria-label="Deliveries in original order">
      {rows.map((row, position) => {
        const execPos = current.executionOrder.findIndex(
          (x) => x.eventId === row.eventId && x.deliveryIndex === row.deliveryIndex,
        );
        const showExec = execPos >= 0 && execPos !== position;
        const isFirst = firstIndex === row.deliveryIndex;
        const isSelected = selected === row.deliveryIndex;
        return (
          <li key={row.deliveryIndex}>
            <button
              type="button"
              className={"row" + (isSelected ? " selected" : "")}
              aria-pressed={isSelected}
              onClick={() => onSelect(row.deliveryIndex)}
            >
              <span className="row-head">
                <strong>{`d${row.deliveryIndex}`}</strong>
                <span>{row.type}</span>
                {isFirst ? <span className="tag">First divergence</span> : null}
              </span>
              <span className="row-id">{row.eventId}</span>
              <span className="row-meta">
                <span className={"decision decision-" + row.decision}>{row.decision}</span>
                {showExec ? <span>{`executed #${execPos + 1}`}</span> : null}
              </span>
              {row.violations.length > 0 ? (
                <span className="codes">{row.violations.map((v) => v.code).join(", ")}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
