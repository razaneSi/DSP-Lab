import { useEffect, useRef, useState } from "react";
import AnalysisChart from "../analysis/AnalysisChart";
import { getSignalDerivatives } from "../../api/dspApi";

export default function SignalDerivatives() {
  const [view, setView] = useState<"first" | "second">("first");
  const [viewTransitionDir, setViewTransitionDir] = useState<"forward" | "backward">("forward");
  const [expression, setExpression] = useState("sin(2*pi*t)");
  const [time, setTime] = useState<number[]>([]);
  const [original, setOriginal] = useState<number[]>([]);
  const [firstDerivative, setFirstDerivative] = useState<number[]>([]);
  const [secondDerivative, setSecondDerivative] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastRequestId = useRef(0);

  const switchView = (nextView: "first" | "second") => {
    if (nextView === view) return;
    const currentIndex = view === "first" ? 0 : 1;
    const nextIndex = nextView === "first" ? 0 : 1;
    setViewTransitionDir(nextIndex > currentIndex ? "forward" : "backward");
    setView(nextView);
  };

  const generateDerivatives = async (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      setError(null);
      return;
    }

    const requestId = ++lastRequestId.current;

    try {
      const res = await getSignalDerivatives(normalized);
      if (requestId !== lastRequestId.current) return;

      setError(null);
      setTime(res.data.time);
      setOriginal(res.data.original);
      setFirstDerivative(res.data.first_derivative);
      setSecondDerivative(res.data.second_derivative);
    } catch (error: unknown) {
      if (requestId !== lastRequestId.current) return;
      // Keep previous valid curves while user is typing invalid/incomplete input.
      const fallback = "Unable to generate derivatives.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { error?: string } } }).response;
        const message = response?.data?.error;
        setError(typeof message === "string" && message.length > 0 ? message : fallback);
        return;
      }
      setError(fallback);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateDerivatives(expression);
    }, 350);
    return () => clearTimeout(timer);
  }, [expression]);

  return (
    <div className="main-content derivatives-page">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Signal Derivatives</h1>
            <p className="exercise-subtitle">
              Exercise 3: Analyze rate of change (Velocity &amp; Acceleration).
            </p>
          </div>
        </div>

        <div className="content-grid derivatives-grid">
          <div className="controls-panel derivatives-controls">
            <div className="control-group">
              <label className="control-label">
                <span>Input Signal x(t)</span>
              </label>
              <input
                type="text"
                className="expression-input"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., sin(2*pi*t)"
              />
            </div>

            <div className="legend-box derivatives-legend">
              <div className="legend-title">Legend:</div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#00d4ff" }}></div>
                <span>Original: x(t)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#8b3dff" }}></div>
                <span>Velocity: x'(t)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#22d37a" }}></div>
                <span>Acceleration: x''(t)</span>
              </div>
            </div>

            <p className="help-text">
              Supported: sin, cos, exp, sqrt, pi, Rect, Tri, U, sgn/sign, Dirac, R
            </p>

            {error && <p className="help-text" style={{ color: "#ff7a7a" }}>{error}</p>}
          </div>

          <div className="visualization-panel derivatives-viz">
            <div className="derivatives-view-switch">
              <button
                className={`derivatives-view-btn ${view === "first" ? "active" : ""}`}
                onClick={() => switchView("first")}
              >
                1st Derivative
              </button>
              <button
                className={`derivatives-view-btn ${view === "second" ? "active" : ""}`}
                onClick={() => switchView("second")}
              >
                2nd Derivative
              </button>
            </div>

            <div
              key={view}
              className={`mode-transition mode-transition--${viewTransitionDir} mode-transition--viz`}
            >
              <h3 className="viz-title">
                {view === "first" ? "First Derivative Analysis" : "Second Derivative Analysis"}
              </h3>

              <AnalysisChart
                time={time}
                datasets={
                  view === "first"
                    ? [
                        { label: "x(t)", data: original, color: "#00d4ff", borderWidth: 2.5 },
                        { label: "x'(t)", data: firstDerivative, color: "#8b3dff", borderDash: [7, 5], borderWidth: 2.5 },
                      ]
                    : [
                        { label: "x'(t)", data: firstDerivative, color: "#8b3dff", borderDash: [7, 5], borderWidth: 2.5 },
                        { label: "x''(t)", data: secondDerivative, color: "#22d37a", borderWidth: 3 },
                      ]
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

