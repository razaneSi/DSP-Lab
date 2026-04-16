import { useCallback, useRef, useState } from "react";
import AnalysisControls from "./AnalysisControls";
import AnalysisChart from "./AnalysisChart";
import AnalysisMetrics from "./AnalysisMetrics";
import {
  generateSignal,
  calculateEnergy,
  calculatePower,
} from "../../api/dspApi";

export default function SignalAnalysis() {
  const [time, setTime] = useState<number[]>([]);
  const [signal, setSignal] = useState<number[]>([]);
  const [energy, setEnergy] = useState<number | null>(null);
  const [power, setPower] = useState<number | null>(null);
  const lastGenerateRequestId = useRef(0);

  const handleGenerate = useCallback(async (expression: string) => {
    const normalizedExpression = expression.trim();
    if (!normalizedExpression) {
      setTime([]);
      setSignal([]);
      setEnergy(null);
      setPower(null);
      return;
    }

    const requestId = ++lastGenerateRequestId.current;
    setEnergy(null);
    setPower(null);

    const res = await generateSignal(normalizedExpression);
    if (requestId !== lastGenerateRequestId.current) return;

    setTime(res.data.time);
    setSignal(res.data.signal);
  }, []);

  const handleEnergy = async () => {
    const res = await calculateEnergy(signal);
    setEnergy(res.data.energy);
  };

  const handlePower = async () => {
    const res = await calculatePower(signal);
    setPower(res.data.power);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log("Save triggered");
  };

  return (
    <div className="main-content">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Signal Analysis</h1>
            <p className="exercise-subtitle">Generate and analyze signals in time domain</p>
          </div>
          <button className="save-btn" onClick={handleSave}>
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Results
          </button>
        </div>

        <div className="content-grid">
          <AnalysisControls
            onGenerate={handleGenerate}
            onEnergy={handleEnergy}
            onPower={handlePower}
          />

          <div className="visualization-panel">
            <h3 className="viz-title">Signal Visualization</h3>
            <AnalysisChart time={time} signal={signal} />
            <AnalysisMetrics energy={energy} power={power} />
          </div>
        </div>
      </div>
    </div>
  );
}
