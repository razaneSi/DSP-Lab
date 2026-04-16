import { useEffect, useState, useCallback } from "react";
import { getFourierSeries } from "../../api/dspApi";
import FourierTimeDomain from "./FourierTimeDomain";
import FourierSpectrum from "./FourierSpectrum";
import FourierCoeffTable from "./FourierCoeffTable";

interface FourierData {
  harmonics: number[];
  amplitudes: number[];
  phases: number[];
  time: number[];
  original: number[];
  reconstructed: number[];
  approx_power: number;
  exact_power: number;
  table: { n: number; amp: number; phase: number; an: number; bn: number }[];
  N: number;
}

export default function FourierSeries() {
  const [N, setN] = useState(10);
  const [showRecon, setShowRecon] = useState(true);
  const [data, setData] = useState<FourierData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (harmonics: number) => {
    setLoading(true);
    try {
      const res = await getFourierSeries(harmonics);
      setData(res.data);
    } catch (e) {
      console.error("Fourier fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(N);
  }, [N, fetchData]);

  return (
    <div className="main-content">
      <div className="exercise-container">
        {/* Header */}
        <div className="exercise-header">
          <div>
            <h1 className="exercise-title">Fourier Series — Sawtooth Wave</h1>
            <p className="exercise-subtitle">
              Exercise 5: Exponential complex Fourier representation of a sawtooth signal (T=2s).
            </p>
          </div>
        </div>

        {/* Top row: controls + time-domain */}
        <div className="fourier-top-grid">
          {/* Controls panel */}
          <div className="controls-panel fourier-controls">
            {/* Harmonics slider */}
            <div className="control-group">
              <div className="control-label">
                <span>Number of Harmonics (N)</span>
                <span className="control-value">{N}</span>
              </div>
              <input
                id="fourier-harmonics-slider"
                type="range"
                className="slider"
                min={1}
                max={50}
                value={N}
                onChange={(e) => setN(Number(e.target.value))}
              />
            </div>

            {/* Show reconstruction toggle */}
            <label className="fourier-checkbox-label">
              <input
                id="fourier-recon-toggle"
                type="checkbox"
                checked={showRecon}
                onChange={(e) => setShowRecon(e.target.checked)}
                className="fourier-checkbox"
              />
              Show Fourier reconstruction
            </label>

            {loading && <div className="fourier-loading">Computing…</div>}

            {/* Formulas */}
            <div className="fourier-formula-block fourier-formula--exp">
              <div className="fourier-formula-label">Exponential Form</div>
              <div className="fourier-formula-eq">
                c₀ = 0,&nbsp;&nbsp;c<sub>n</sub> = j/(πn)
              </div>
            </div>

            <div className="fourier-formula-block fourier-formula--trig">
              <div className="fourier-formula-label">Trigonometric Form</div>
              <div className="fourier-formula-eq">
                x(t) = Σ [-2/(πn)] sin(2πnt/T)
              </div>
            </div>

            <div className="fourier-formula-block fourier-formula--harm">
              <div className="fourier-formula-label">Harmonic Form</div>
              <div className="fourier-formula-eq">
                x(t) = Σ [2/(πn)] cos(2πnt/T + π/2)
              </div>
            </div>
          </div>

          {/* Time domain chart */}
          <div className="visualization-panel">
            <h3 className="viz-title">Sawtooth Wave — Time Domain</h3>
            {data && (
              <FourierTimeDomain
                time={data.time}
                original={data.original}
                reconstructed={data.reconstructed}
                showReconstructed={showRecon}
                N={N}
              />
            )}
          </div>
        </div>

        {/* Power metrics */}
        {data && (
          <div className="fourier-power-row">
            <div className="fourier-power-card">
              <div className="fourier-power-label">Approx Power ({N > 0 ? `${2*N}N` : ""})</div>
              <div className="fourier-power-value">{data.approx_power.toFixed(6)}</div>
            </div>
            <div className="fourier-power-card">
              <div className="fourier-power-label">Exact Power</div>
              <div className="fourier-power-value">{data.exact_power.toFixed(6)}</div>
            </div>
          </div>
        )}

        {/* Spectra row */}
        {data && (
          <div className="fourier-spectra-grid">
            <div className="visualization-panel">
              <h3 className="viz-title">Amplitude Spectrum |c<sub>n</sub>|</h3>
              <FourierSpectrum
                harmonics={data.harmonics}
                values={data.amplitudes}
                color="#00bcd4"
                label="|cₙ|"
                yLabel="Amplitude"
              />
            </div>
            <div className="visualization-panel">
              <h3 className="viz-title">Phase Spectrum ∠c<sub>n</sub> (degrees)</h3>
              <FourierSpectrum
                harmonics={data.harmonics}
                values={data.phases}
                color="#9c27b0"
                label="∠cₙ(°)"
                yLabel="Phase (°)"
              />
            </div>
          </div>
        )}

        {/* Coefficient table */}
        {data && (
          <div className="visualization-panel fourier-table-panel">
            <h3 className="viz-title">Fourier Coefficients (n ≥ 0)</h3>
            <FourierCoeffTable table={data.table} />
          </div>
        )}
      </div>
    </div>
  );
}