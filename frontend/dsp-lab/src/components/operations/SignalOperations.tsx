import { useEffect, useState } from "react";
import AnalysisChart from "../analysis/AnalysisChart";
import { expressSignal, generateSignal, operateSignals } from "../../api/dspApi";

type Mode = "representation" | "operations";
type Operation = "+" | "-" | "*";
type RepresentationMode = "step" | "ramp" | "sign";

export default function SignalOperations() {
  const [mode, setMode] = useState<Mode>("representation");
  const [modeTransitionDir, setModeTransitionDir] = useState<"forward" | "backward">("forward");

  const [representationExpression, setRepresentationExpression] = useState("U(t)");
  const [representationMode, setRepresentationMode] = useState<RepresentationMode>("sign");
  const [representationTime, setRepresentationTime] = useState<number[]>([]);
  const [representationSignal, setRepresentationSignal] = useState<number[]>([]);
  const [representationEquation, setRepresentationEquation] = useState<string>("");

  const [expression1, setExpression1] = useState("sin(pi*t)");
  const [expression2, setExpression2] = useState("Rect(2*t)");
  const [operation, setOperation] = useState<Operation>("+");
  const [operationTime, setOperationTime] = useState<number[]>([]);
  const [signal1, setSignal1] = useState<number[]>([]);
  const [signal2, setSignal2] = useState<number[]>([]);
  const [resultSignal, setResultSignal] = useState<number[]>([]);
  const [equation, setEquation] = useState("y(t) = x1(t) + x2(t)");
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRepresentation = async () => {
    const expression = representationExpression.trim();
    if (!expression) return;

    try {
      setError(null);
      const expressRes = await expressSignal(expression, representationMode);
      const expressed = expressRes.data.expressed;
      setRepresentationEquation(`${expression} = ${expressed}`);

      const res = await generateSignal(expressed);
      setRepresentationTime(res.data.time);
      setRepresentationSignal(res.data.signal);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ??
          "Failed to generate representation. Try U(t), Rect(t), or Tri(t)."
      );
      setRepresentationEquation("");
      setRepresentationTime([]);
      setRepresentationSignal([]);
    }
  };

  const handleGenerateOperations = async () => {
    const x1 = expression1.trim();
    const x2 = expression2.trim();
    if (!x1 || !x2) return;

    try {
      setError(null);
      const res = await operateSignals(x1, x2, operation);
      setOperationTime(res.data.time);
      setSignal1(res.data.signal1);
      setSignal2(res.data.signal2);
      setResultSignal(res.data.result);
      setEquation(res.data.equation);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to combine signals.");
      setOperationTime([]);
      setSignal1([]);
      setSignal2([]);
      setResultSignal([]);
      setEquation(`y(t) = x1(t) ${operation} x2(t)`);
    }
  };

  const handleSave = () => {
    console.log("Save operation triggered");
  };

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    const currentIndex = mode === "representation" ? 0 : 1;
    const nextIndex = nextMode === "representation" ? 0 : 1;
    setModeTransitionDir(nextIndex > currentIndex ? "forward" : "backward");
    setMode(nextMode);
  };

  useEffect(() => {
    if (mode !== "representation") return;
    const expression = representationExpression.trim();
    if (!expression) {
      setRepresentationTime([]);
      setRepresentationSignal([]);
      setRepresentationEquation("");
      return;
    }

    const timer = setTimeout(() => {
      handleGenerateRepresentation();
    }, 350);

    return () => clearTimeout(timer);
  }, [mode, representationExpression, representationMode]);

  useEffect(() => {
    if (mode !== "operations") return;
    const x1 = expression1.trim();
    const x2 = expression2.trim();
    if (!x1 || !x2) {
      setOperationTime([]);
      setSignal1([]);
      setSignal2([]);
      setResultSignal([]);
      return;
    }

    const timer = setTimeout(() => {
      handleGenerateOperations();
    }, 350);

    return () => clearTimeout(timer);
  }, [mode, expression1, expression2, operation]);

  return (
    <div className="main-content operations-page">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Signal Operations</h1>
            <p className="exercise-subtitle">
              Exercise 2: Representation and arithmetic operations on two signals
            </p>
          </div>

          <button className="save-btn" onClick={handleSave}>
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3"
              />
            </svg>
            Save Results
          </button>
        </div>

        <div className={`content-grid operations-grid ${mode === "operations" ? "operations-active" : ""}`}>
          <div className="operations-left-col">
            <div className="controls-panel operations-controls">
              <div className="mode-tabs">
                <button
                  className={`mode-tab ${mode === "representation" ? "active" : ""}`}
                  onClick={() => switchMode("representation")}
                >
                  Representation
                </button>
                <button
                  className={`mode-tab ${mode === "operations" ? "active" : ""}`}
                  onClick={() => switchMode("operations")}
                >
                  Operations
                </button>
              </div>

              <div key={`controls-${mode}`} className={`mode-transition mode-transition--${modeTransitionDir}`}>
                {mode === "representation" && (
                  <>
                    <div className="control-group">
                      <label className="control-label">
                        <span>Signal Expression</span>
                      </label>
                      <input
                        type="text"
                        className="expression-input"
                        value={representationExpression}
                        onChange={(e) => setRepresentationExpression(e.target.value)}
                        placeholder="U(t), Rect(t), Tri(t)"
                      />
                    </div>

                    <div className="rep-mode-buttons">
                      <button
                        className={`rep-mode-btn ${representationMode === "step" ? "active" : ""}`}
                        onClick={() => setRepresentationMode("step")}
                      >
                        U
                      </button>
                      <button
                        className={`rep-mode-btn ${representationMode === "ramp" ? "active" : ""}`}
                        onClick={() => setRepresentationMode("ramp")}
                      >
                        Ramp
                      </button>
                      <button
                        className={`rep-mode-btn ${representationMode === "sign" ? "active" : ""}`}
                        onClick={() => setRepresentationMode("sign")}
                      >
                        Sign
                      </button>
                    </div>

                    <button className="generate-btn" onClick={handleGenerateRepresentation}>
                      Generate Signal
                    </button>

                    <p className="help-text">Supported in representation: U(t), Rect(t), Tri(t)</p>
                  </>
                )}

                {mode === "operations" && (
                  <>
                    <div className="control-group">
                      <label className="control-label">
                        <span className="operation-signal1-label">Signal 1: x1(t)</span>
                      </label>
                      <input
                        type="text"
                        className="expression-input"
                        value={expression1}
                        onChange={(e) => setExpression1(e.target.value)}
                        placeholder="e.g., U(t)"
                      />
                    </div>

                    <div className="operation-buttons">
                      <button
                        className={`op-btn ${operation === "+" ? "active" : ""}`}
                        onClick={() => setOperation("+")}
                      >
                        +
                      </button>
                      <button
                        className={`op-btn ${operation === "-" ? "active" : ""}`}
                        onClick={() => setOperation("-")}
                      >
                        -
                      </button>
                      <button
                        className={`op-btn ${operation === "*" ? "active" : ""}`}
                        onClick={() => setOperation("*")}
                      >
                        *
                      </button>
                    </div>

                    <div className="control-group">
                      <label className="control-label">
                        <span className="operation-signal-label">Signal 2: x2(t)</span>
                      </label>
                      <input
                        type="text"
                        className="expression-input"
                        value={expression2}
                        onChange={(e) => setExpression2(e.target.value)}
                        placeholder="e.g., Rect(2*t)"
                      />
                    </div>

                    <button className="generate-btn" onClick={handleGenerateOperations}>
                      Generate Combined Signal
                    </button>
                  </>
                )}

                {error && <p className="help-text" style={{ color: "#ff7a7a" }}>{error}</p>}
              </div>
            </div>

            <div key={`equation-${mode}`} className={`mode-transition mode-transition--${modeTransitionDir}`}>
              {mode === "representation" && representationEquation && (
                <div className="equation-display operations-equation-card">
                  <div className="equation-label">Representation Result</div>
                  <div className="equation">{representationEquation}</div>
                </div>
              )}

              {mode === "operations" && (
                <div className="equation-display operations-equation-card">
                  <div className="equation-label">Resulting Equation</div>
                  <div className="equation">{equation}</div>
                </div>
              )}
            </div>
          </div>

          <div className="visualization-panel operations-viz">
            <div key={`viz-${mode}`} className={`mode-transition mode-transition--${modeTransitionDir} mode-transition--viz`}>
              <h3 className="viz-title">
                {mode === "representation"
                  ? "Signal Representation"
                  : "Combined Signal Response"}
              </h3>

              {mode === "representation" ? (
                <AnalysisChart time={representationTime} signal={representationSignal} />
              ) : (
                <div className="operations-chart-center">
                  <AnalysisChart
                    time={operationTime}
                    datasets={[
                      { label: "x1(t)", data: signal1, color: "#00d4ff", borderWidth: 2.5 },
                      { label: "x2(t)", data: signal2, color: "#b63dff", borderDash: [7, 5], borderWidth: 2.5 },
                      { label: "Result", data: resultSignal, color: "#f8fbff", borderWidth: 3.5 },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
