import { useEffect, useState } from "react";

type Props = {
  onGenerate: (expression: string) => void | Promise<void>;
  onEnergy: () => void;
  onPower: () => void;
};

export default function AnalysisControls({
  onGenerate,
  onEnergy,
  onPower,
}: Props) {
  const [expression, setExpression] = useState("Rect(t)");

  useEffect(() => {
    const value = expression.trim();
    if (!value) return;

    const timer = setTimeout(() => {
      onGenerate(value);
    }, 350);

    return () => clearTimeout(timer);
  }, [expression, onGenerate]);

  return (
    <div className="controls-panel">
      <div className="control-group">
        <label className="control-label">
          <span>Signal Expression</span>
        </label>
        <input
          type="text"
          className="expression-input"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g., exp(-t)*U(t-2)"
        />
        <button 
          className="generate-btn" 
          onClick={() => onGenerate(expression.trim())}
        >
          Generate Signal
        </button>
        <p className="help-text">
          Supported: sin, cos, exp, sqrt, pi, Rect, Tri, U
        </p>
      </div>

      <div className="tools-section">
        <div className="tools-title">
          <svg className="tools-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Analysis Tools
        </div>
        <div className="tools-buttons">
          <button className="tool-btn" onClick={onEnergy}>
            Calculate Energy
          </button>
          <button className="tool-btn" onClick={onPower}>
            Calculate Power
          </button>
        </div>
      </div>

      <div className="legend-box">
        <div className="legend-title">Signal Properties</div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#00bcd4' }}></div>
          <span>Time Domain Signal x(t)</span>
        </div>
      </div>
    </div>
  );
}
