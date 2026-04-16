import { useEffect, useState, useCallback } from "react";
import { getFourierTransform } from "../../api/dspApi";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface TransformData {
  time: number[];
  freq: number[];
  time_sig: number[];
  amp_sig: number[];
  phase_sig: number[];
  formula_tf: string;
  prop_used: string;
  time_label: string;
}

const SIGNALS = [
  { id: "sig1", label: "x(t) = cos(6πt)" },
  { id: "sig2", label: "x₁(t) = Tri(2t)" },
  { id: "sig3", label: "x₂(t) = Rect((t-1)/2) - Rect((t+1)/2)" },
  { id: "sig4", label: "x₃(t) = Tri(t-1) - Tri(t+1)" },
  { id: "sig5", label: "x₄(t) = Rect(t/2) - Tri(t)" },
];

const getChartOptions = (xAxisLabel: string, yAxisLabel: string = "") => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(13,31,45,0.95)",
      titleColor: "#fff",
      bodyColor: "#b0c4de",
      borderColor: "#00bcd4",
      borderWidth: 1,
      callbacks: {
        title: (items: any[]) => `${xAxisLabel.split(" ")[0]} = ${Number(items[0].label).toFixed(2)}`,
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#b0c4de",
        maxTicksLimit: 10,
        font: { family: "'JetBrains Mono', monospace", size: 9 },
      },
      grid: { color: "#1e3a5f" },
      title: { display: true, text: xAxisLabel, color: "#b0c4de", font: { size: 11, weight: 600 } },
    },
    y: {
      ticks: {
        color: "#b0c4de",
        font: { family: "'JetBrains Mono', monospace", size: 9 },
      },
      grid: { color: "#1e3a5f" },
      title: yAxisLabel ? { display: true, text: yAxisLabel, color: "#b0c4de", font: { size: 11, weight: 600 } } : { display: false },
    },
  },
  interaction: { intersect: false, mode: "index" as const },
});

export default function FourierTransform() {
  const [signalId, setSignalId] = useState("sig1");
  const [data, setData] = useState<TransformData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getFourierTransform(id);
      setData(res.data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(signalId);
  }, [signalId, fetchData]);

  return (
    <div className="main-content">
      <div className="exercise-container">
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Fourier Transform</h1>
            <p className="exercise-subtitle">
              Exercise 6: Compute Fourier Transform using TF properties.
            </p>
          </div>
        </div>

        {/* TOP SECTION: Controls & Time Domain */}
        <div className="fourier-top-grid" style={{ gridTemplateColumns: "1fr 2fr", gap: "2rem", display: "grid", marginBottom: "2rem" }}>
          
          {/* Left Column Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="controls-panel">
              <h3 className="viz-title" style={{ marginBottom: "1rem" }}>Select Signal</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {SIGNALS.map((sig) => (
                  <button
                    key={sig.id}
                    onClick={() => setSignalId(sig.id)}
                    style={{
                      background: signalId === sig.id ? "rgba(0, 188, 212, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${signalId === sig.id ? "#00bcd4" : "rgba(255, 255, 255, 0.1)"}`,
                      color: signalId === sig.id ? "#00bcd4" : "#ccc",
                      padding: "1rem",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      transition: "all 0.2s"
                    }}
                  >
                    {sig.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="fourier-loading">Computing…</div>
            ) : data ? (
              <>
                <div className="controls-panel" style={{ borderLeft: "4px solid #00bcd4" }}>
                  <div style={{ fontSize: "0.85rem", color: "#00bcd4", fontWeight: "bold", marginBottom: "0.5rem" }}>Fourier Transform</div>
                  <div style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>{data.formula_tf}</div>
                </div>
                
                <div className="controls-panel" style={{ borderLeft: "4px solid #4caf50" }}>
                  <div style={{ fontSize: "0.85rem", color: "#4caf50", fontWeight: "bold", marginBottom: "0.5rem" }}>Property Used</div>
                  <div style={{ fontFamily: "monospace", color: "#e0e0e0" }}>{data.prop_used}</div>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Column Time Domain */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data && (
              <div className="visualization-panel" style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <h3 className="viz-title">Time Domain — {data.time_label}</h3>
                <div style={{ height: "280px", width: "95%", margin: "1rem auto 0" }}>
                  <Line
                    data={{
                      labels: data.time.map(t => Number(t.toFixed(2))),
                      datasets: [{
                        label: "x(t)",
                        data: data.time_sig,
                        borderColor: "#00bcd4",
                        backgroundColor: "rgba(0,188,212,0.07)",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0,
                      }]
                    }}
                    options={getChartOptions("Time (s)")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: TF Properties Table */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <div className="controls-panel" style={{ width: "85%", maxWidth: "1000px" }}>
            <h3 className="viz-title" style={{ marginBottom: "1rem", fontSize: "1.1rem", textAlign: "center" }}>TF Properties Reference</h3>
            <table style={{ width: "100%", fontSize: "0.95rem", textAlign: "left", borderCollapse: "collapse", margin: "0 auto" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
                  <th style={{ paddingBottom: "0.5rem", paddingLeft: "1rem" }}>Property</th>
                  <th style={{ paddingBottom: "0.5rem" }}>Time</th>
                  <th style={{ paddingBottom: "0.5rem" }}>Freq</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "monospace", color: "#ccc" }}>
                {[
                  ["Linearity", "ax+by", "aX+bY"],
                  ["Time shift", "x(t±t₀)", "X(f)e^{±j2πft₀}"],
                  ["Scale", "x(at)", "(1/|a|)X(f/a)"],
                  ["Modulation", "x·cos(2πf₀t)", "½[X(f-f₀)+X(f+f₀)]"],
                  ["Derivative", "dⁿx/dtⁿ", "(j2πf)ⁿX(f)"]
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#fff" }}>{row[0]}</td>
                    <td style={{ padding: "0.75rem 0" }}>{row[1]}</td>
                    <td style={{ padding: "0.75rem 0" }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM SECTION: Spectra (Side by Side) */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div className="visualization-panel">
              <h3 className="viz-title">Amplitude Spectrum |X(f)|</h3>
              <div style={{ height: "280px", width: "95%", margin: "1rem auto 0" }}>
                <Line
                  data={{
                    labels: data.freq.map(f => Number(f.toFixed(2))),
                    datasets: [{
                      label: "|X(f)|",
                      data: data.amp_sig,
                      borderColor: "#4caf50",
                      backgroundColor: "rgba(76,175,80,0.07)",
                      borderWidth: 2,
                      pointRadius: 0,
                      tension: 0,
                    }]
                  }}
                  options={getChartOptions("Frequency (Hz)")}
                />
              </div>
            </div>

            <div className="visualization-panel">
              <h3 className="viz-title">Phase Spectrum ∠X(f) (°)</h3>
              <div style={{ height: "280px", width: "95%", margin: "1rem auto 0" }}>
                <Line
                  data={{
                    labels: data.freq.map(f => Number(f.toFixed(2))),
                    datasets: [{
                      label: "∠X(f)",
                      data: data.phase_sig,
                      borderColor: "#9c27b0",
                      backgroundColor: "rgba(156,39,176,0.07)",
                      borderWidth: 2,
                      pointRadius: 0,
                      tension: 0,
                    }]
                  }}
                  options={getChartOptions("Frequency (Hz)", "Phase (°)")}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
