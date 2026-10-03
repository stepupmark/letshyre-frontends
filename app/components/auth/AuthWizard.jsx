import { useState } from "react";
import { AuthShell } from "./AuthShell";

// Generic multi-step auth wizard: owns the step index + the accumulated `data`
// bag and renders the current step in AuthShell. Register and Forgot are just
// step configs over this. Steps flagged `terminal` (e.g. success) show no chrome
// and aren't counted. Each step's render gets { data, goNext, goBack, goTo,
// stepIndex, stepCount }.
export function AuthWizard({ steps, initialData = {} }) {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState(initialData);

  const step = steps[index];

  const goNext = (patch) => {
    if (patch) setData((d) => ({ ...d, ...patch }));
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const goTo = (key) => {
    const i = steps.findIndex((s) => s.key === key);
    if (i >= 0) setIndex(i);
  };

  // Meaningful steps only — the terminal/success screen isn't counted or numbered.
  const stepCount = steps.filter((s) => !s.terminal).length;
  const showChrome = !step.terminal;
  const canGoBack = showChrome && index > 0;

  return (
    <AuthShell
      image={step.image}
      imageFit={step.imageFit}
      onBack={canGoBack ? goBack : null}
      progress={
        showChrome ? { current: index + 1, total: stepCount } : null
      }
    >
      {/* keyed so the step content replays the enter animation on change */}
      <div
        className="animate-au-step-in motion-reduce:animate-none"
        key={step.key}
      >
        {step.render({
          data,
          goNext,
          goBack,
          goTo,
          stepIndex: index,
          stepCount,
        })}
      </div>
    </AuthShell>
  );
}
