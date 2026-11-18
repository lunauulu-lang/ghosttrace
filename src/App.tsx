import fixtureJson from "../fixtures/haunted-checkout.json";
import { ReplayWorkbench } from "./components/ReplayWorkbench";
import { validateBundle } from "./engine/schema";

const parsed = validateBundle(fixtureJson);

export default function App() {
  if (!parsed.ok) {
    return (
      <main className="error-state" role="alert">
        <h1>GhostTrace</h1>
        <p>The synthetic incident could not be loaded.</p>
        <ul>
          {parsed.errors.map((e, i) => (
            <li key={i}>{`${e.path}: ${e.message}`}</li>
          ))}
        </ul>
      </main>
    );
  }
  return <ReplayWorkbench bundle={parsed.bundle} />;
}
