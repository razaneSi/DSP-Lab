import { useEffect, useRef, useState } from "react";
import AnalysisChart from "../analysis/AnalysisChart";
import { expressSignal, getSignalDecomposition } from "../../api/dspApi";

type DecompositionResponse = {
  time: number[];
  original: number[];
  first_derivative: number[];
  second_derivative: number[];
  freq: number[];
  amplitude: number[];
  phase: number[];
  real_part: number[];
  imag_part: number[];
  fourier_expression: string;
  decomposition_expression: string;
};

export default function SignalDecomposition() {
  const [expression, setExpression] = useState("sin(2*pi*t)");
  const [view, setView] = useState<"first" | "second">("first");
  const [viewTransitionDir, setViewTransitionDir] = useState<"forward" | "backward">("forward");
  const [error, setError] = useState<string | null>(null);

  const [time, setTime] = useState<number[]>([]);
  const [original, setOriginal] = useState<number[]>([]);
  const [firstDerivative, setFirstDerivative] = useState<number[]>([]);
  const [secondDerivative, setSecondDerivative] = useState<number[]>([]);
  const [freq, setFreq] = useState<number[]>([]);
  const [amplitude, setAmplitude] = useState<number[]>([]);
  const [phase, setPhase] = useState<number[]>([]);
  const [realPart, setRealPart] = useState<number[]>([]);
  const [imagPart, setImagPart] = useState<number[]>([]);
  const [fourierExpression, setFourierExpression] = useState("");
  const [decompositionExpression, setDecompositionExpression] = useState("");
  const [stepRepresentation, setStepRepresentation] = useState("Not available for this signal.");
  const [rampRepresentation, setRampRepresentation] = useState("Not available for this signal.");

  const lastRequestId = useRef(0);

  const switchView = (nextView: "first" | "second") => {
    if (nextView === view) return;
    const currentIndex = view === "first" ? 0 : 1;
    const nextIndex = nextView === "first" ? 0 : 1;
    setViewTransitionDir(nextIndex > currentIndex ? "forward" : "backward");
    setView(nextView);
  };

  const loadData = async (input: string) => {
    const normalized = input.trim();
    if (!normalized) {
      setError(null);
      return;
    }

    const requestId = ++lastRequestId.current;

    try {
      const [decompositionRes, stepRes, rampRes] = await Promise.allSettled([
        getSignalDecomposition(normalized),
        expressSignal(normalized, "step"),
        expressSignal(normalized, "ramp"),
      ]);

      if (requestId !== lastRequestId.current) return;

      if (decompositionRes.status !== "fulfilled") {
        throw decompositionRes.reason;
      }

      const data = decompositionRes.value.data as DecompositionResponse;
      setError(null);
      setTime(data.time);
      setOriginal(data.original);
      setFirstDerivative(data.first_derivative);
      setSecondDerivative(data.second_derivative);
      setFreq(data.freq);
      setAmplitude(data.amplitude);
      setPhase(data.phase);
      setRealPart(data.real_part);
      setImagPart(data.imag_part);
      setFourierExpression(data.fourier_expression);
      setDecompositionExpression(data.decomposition_expression);

      if (stepRes.status === "fulfilled" && stepRes.value.data?.expressed) {
        setStepRepresentation(stepRes.value.data.expressed);
      } else {
        setStepRepresentation("Not available for this signal.");
      }

      if (rampRes.status === "fulfilled" && rampRes.value.data?.expressed) {
        setRampRepresentation(rampRes.value.data.expressed);
      } else {
        setRampRepresentation("Not available for this signal.");
      }
    } catch (err: unknown) {
      if (requestId !== lastRequestId.current) return;
      const fallback = "Unable to compute decomposition.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { error?: string } } }).response;
        const message = response?.data?.error;
        setError(typeof message === "string" && message.length > 0 ? message : fallback);
        return;
      }
      setError(fallback);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(expression);
    }, 350);
    return () => clearTimeout(timer);
  }, [expression]);

  const visibleIndices = freq.reduce<number[]>((acc, value, index) => {
    if (value >= -10 && value <= 10) {
      acc.push(index);
    }
    return acc;
  }, []);

  const freqWindow = visibleIndices.map((index) => freq[index]);
  const amplitudeWindow = visibleIndices.map((index) => amplitude[index]);
  const phaseWindow = visibleIndices.map((index) => phase[index]);
  const realPartWindow = visibleIndices.map((index) => realPart[index]);
  const imagPartWindow = visibleIndices.map((index) => imagPart[index]);

  return (
    <div className="main-content">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Signal Decomposition</h1>
            <p className="exercise-subtitle">
              Exercise 7: Derivatives and Fourier decomposition from any input signal.
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
                onChange={(event) => setExpression(event.target.value)}
                placeholder="e.g., sin(2*pi*t)"
              />
            </div>

            <div className="decomposition-controls-expr">
              <div className="info-card parity-even-card">
                <h4 className="info-title even-title">Fourier Expression</h4>
                <p className="info-formula">{fourierExpression}</p>
              </div>
              <div className="info-card parity-odd-card">
                <h4 className="info-title odd-title">Mathematical Expression</h4>
                <p className="info-formula">{decompositionExpression}</p>
              </div>
            </div>

            <div className="decomposition-repr-card">
              <div className="expressed-title">Representation in Echelon (U)</div>
              <p className="expressed-equation">{stepRepresentation}</p>
            </div>

            <div className="decomposition-repr-card">
              <div className="expressed-title">Representation in Ramp (R)</div>
              <p className="expressed-equation">{rampRepresentation}</p>
            </div>

            <div className="legend-box derivatives-legend">
              <div className="legend-title">Legend:</div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#00d4ff" }}></div>
                <span>Original: x(t)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#8b3dff" }}></div>
                <span>1st derivative: x'(t)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#22d37a" }}></div>
                <span>2nd derivative: x''(t)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#4caf50" }}></div>
                <span>Amplitude: |X(f)|</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#9c27b0" }}></div>
                <span>Phase: ∠X(f)</span>
              </div>
            </div>

            <p className="help-text">
              Auto-run enabled. Supported: sin, cos, exp, sqrt, pi, Rect, Tri, U, sgn/sign, Dirac, R
            </p>
            {error && <p className="help-text" style={{ color: "#ff7a7a" }}>{error}</p>}
          </div>

          <div className="decomposition-viz-stack">
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

            <div className="decomposition-bottom-grid">
              <div className="visualization-panel decomposition-small-panel">
                <h3 className="viz-title">Amplitude Spectrum |X(f)|</h3>
                <AnalysisChart
                  time={freqWindow}
                  datasets={[{ label: "|X(f)|", data: amplitudeWindow, color: "#4caf50", borderWidth: 2.5 }]}
                  xAxisLabel="Frequency (Hz)"
                  yAxisLabel="|X(f)|"
                  compactAxes
                />
              </div>

              <div className="visualization-panel decomposition-small-panel">
                <h3 className="viz-title">Phase Spectrum ∠X(f)</h3>
                <AnalysisChart
                  time={freqWindow}
                  datasets={[{ label: "∠X(f)", data: phaseWindow, color: "#9c27b0", borderWidth: 2.5 }]}
                  xAxisLabel="Frequency (Hz)"
                  yAxisLabel="Phase (deg)"
                  compactAxes
                />
              </div>
            </div>

            <div className="visualization-panel decomposition-small-panel">
              <h3 className="viz-title">Fourier Decomposition (Re / Im)</h3>
              <AnalysisChart
                time={freqWindow}
                datasets={[
                  { label: "Re{X(f)}", data: realPartWindow, color: "#64b5f6", borderWidth: 2.3 },
                  { label: "Im{X(f)}", data: imagPartWindow, color: "#22d37a", borderWidth: 2.3, borderDash: [7, 5] },
                ]}
                xAxisLabel="Frequency (Hz)"
                yAxisLabel="Value"
                compactAxes
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
