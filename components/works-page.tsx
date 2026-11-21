import { HarnessSection } from "./harness-section";
import { ReagroundSection } from "./reaground-section";
import { RyagentSection } from "./ryagent-section";
import { RyboxSection } from "./rybox-section";

export function WorksPage() {
  return (
    <main className="works-index">
      <header className="works-intro">
        <p>SELECTED WORKS / FOUR INDEPENDENT QUESTIONS</p>
        <h1>Ideas,<br /><em>made&nbsp;&nbsp;tangible.</em></h1>
        <span>Interaction, local perception, recoverable execution,<br />and the space between edge and cloud.</span>
      </header>
      <HarnessSection />
      <ReagroundSection />
      <RyboxSection />
      <RyagentSection />
    </main>
  );
}
