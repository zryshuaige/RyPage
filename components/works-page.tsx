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
        <span>Relationships, local perception, native computer use,<br />and orchestration across hosted agents.</span>
        <a className="works-entry" href="#ryharness">Enter selected works <span aria-hidden="true">↓</span></a>
      </header>
      <HarnessSection />
      <ReagroundSection />
      <RyboxSection />
      <RyagentSection />
    </main>
  );
}
