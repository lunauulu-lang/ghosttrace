import type { DeliveryRecord, ReplayResult, ReplayState } from "../engine/types";

function usd(minor: number): string {
  return "$" + (minor / 100).toFixed(2);
}

function StateView({ state }: { state: ReplayState }) {
  if (state.checkouts.length === 0) return <p>No checkouts yet.</p>;
  return (
    <ul className="plain">
      {state.checkouts.map((c) => (
        <li key={c.checkoutId}>
          {`${c.checkoutId}: captured ${usd(c.capturedMinor)} of ${usd(c.totalMinor)}, fulfilled ${c.fulfilled ? "yes" : "no"}`}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  current: ReplayResult;
  selectedRecord: DeliveryRecord | null;
};

export function StateInspector({ current, selectedRecord }: Props) {
  return (
    <div className="inspector">
      <div role="status" aria-live="polite" className={"verdict " + (current.pass ? "pass" : "fail")}>
        <span className="verdict-label">Result:</span> <strong>{current.pass ? "PASS" : "FAIL"}</strong>
      </div>
      {current.halted ? (
        <p className="notice">Replay stopped: the same event ID arrived with different content.</p>
      ) : null}

      <h3>Final state</h3>
      {current.finalState.checkouts.length === 0 ? (
        <p>No checkouts.</p>
      ) : (
        <ul className="plain">
          {current.finalState.checkouts.map((c) => (
            <li key={c.checkoutId}>
              <div>{`Checkout ${c.checkoutId}`}</div>
              <div>{`Total: ${usd(c.totalMinor)}`}</div>
              <div>
                {`Captured: ${usd(c.capturedMinor)}`}
                {c.capturedMinor > c.totalMinor ? (
                  <span className="tag warn"> Simulated invalid state — no real charge</span>
                ) : null}
              </div>
              <div>{`Fulfilled: ${c.fulfilled ? "yes" : "no"}`}</div>
            </li>
          ))}
        </ul>
      )}

      <h3>Violation ledger</h3>
      {current.violations.length === 0 ? (
        <p>No violations recorded.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Delivery</th>
              <th scope="col">Message</th>
            </tr>
          </thead>
          <tbody>
            {current.violations.map((v, i) => (
              <tr key={i}>
                <td>{v.code}</td>
                <td>{`d${v.deliveryIndex}`}</td>
                <td>{v.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Selected delivery</h3>
      {selectedRecord === null ? (
        <p>Select a delivery to see its before and after state.</p>
      ) : (
        <div>
          <p>{`d${selectedRecord.deliveryIndex} ${selectedRecord.eventId}`}</p>
          <h4>Before</h4>
          <StateView state={selectedRecord.before} />
          <h4>After</h4>
          <StateView state={selectedRecord.after} />
        </div>
      )}

      <p className="fingerprint">
        {"Input fingerprint, non-cryptographic: "}
        <code>{current.inputHash}</code>
      </p>
    </div>
  );
}
