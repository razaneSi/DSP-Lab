import { useEffect, useRef, useState } from "react";
import AnalysisChart from "../analysis/AnalysisChart";
import { getSignalParity } from "../../api/dspApi";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    const message = response?.data?.error;
    if (typeof message === "string" && message.length > 0) return message;
  }

  return "Unable to generate parity decomposition.";
};

export default function SignalParity() {
  const [expression, setExpression] = useState("exp(-t) * cos(2*pi*t)");
  const [time, setTime] = useState<number[]>([]);
  const [original, setOriginal] = useState<number[]>([]);
  const [evenPart, setEvenPart] = useState<number[]>([]);
  const [oddPart, setOddPart] = useState<number[]>([]);
  const [evenExpression, setEvenExpression] = useState("");
  const [oddExpression, setOddExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastRequestId = useRef(0);

  const generateParity = async (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      setError(null);
      return;
    }

    const requestId = ++lastRequestId.current;

    try {
      const res = await getSignalParity(normalized);
      if (requestId !== lastRequestId.current) return;

      setError(null);
      setTime(res.data.time);
      setOriginal(res.data.original);
      setEvenPart(res.data.even);
      setOddPart(res.data.odd);
      setEvenExpression(res.data.even_expression ?? "");
      setOddExpression(res.data.odd_expression ?? "");
    } catch (error: unknown) {
      if (requestId !== lastRequestId.current) return;
      // Keep previous valid signal while user is typing an incomplete/invalid expression.
      setError(getErrorMessage(error));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateParity(expression);
    }, 350);

    return () => clearTimeout(timer);
  }, [expression]);

  return (
    <div className="main-content parity-page">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Signal Parity</h1>
            <p className="exercise-subtitle">
              Exercise 4: Decompose signals into Even and Odd components.
            </p>
          </div>
        </div>

        <div className="content-grid parity-grid">
          <div className="controls-panel parity-controls">
            <div className="control-group">
              <label className="control-label">
                <span>Input Signal x(t)</span>
              </label>
              <input
                type="text"
                className="expression-input"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., exp(-t) * cos(2*pi*t)"
              />
            </div>

            <div className="parity-info">
              <div className="info-card parity-even-card">
                <div className="info-title even-title">Even Part xe(t)</div>
                <div className="info-formula">1/2 [x(t) + x(-t)]</div>
                <div className="info-formula">{evenExpression}</div>
                <div className="info-desc">Symmetric around Y-axis</div>
              </div>

              <div className="info-card parity-odd-card">
                <div className="info-title odd-title">Odd Part xo(t)</div>
                <div className="info-formula">1/2 [x(t) - x(-t)]</div>

                <div className="info-formula">{oddExpression}</div>
                <div className="info-desc">Antisymmetric around origin</div>
              </div>
            </div>

            <p className="help-text">
              Supported: sin, cos, exp, sqrt, pi, Rect, Tri, U, sgn/sign, Dirac, R
            </p>
            {error && (
              <p className="help-text" style={{ color: "#ff7a7a" }}>
                {error}
              </p>
            )}
          </div>

          <div className="visualization-panel parity-viz">
            <h3 className="viz-title">Parity Decomposition</h3>
            <AnalysisChart
              time={time}
              datasets={[
                { label: "Original x(t)", data: original, color: "#f8fbff", borderWidth: 3, tension: 0.2 },
                { label: "Even xe(t)", data: evenPart, color: "#00d4ff", borderDash: [7, 5], borderWidth: 2.5, tension: 0.22 },
                { label: "Odd xo(t)", data: oddPart, color: "#8b3dff", borderDash: [4, 6], borderWidth: 2.5, tension: 0.22 },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
