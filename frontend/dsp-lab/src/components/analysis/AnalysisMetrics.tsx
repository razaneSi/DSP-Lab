type Props = {
  energy: number | null;
  power: number | null;
};

export default function AnalysisMetrics({ energy, power }: Props) {
  return (
    <div className="analysis-metrics">
      <div className="metric-card">
        <svg className="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div className="metric-content">
          <div className="metric-label">Signal Energy</div>
          <div className="metric-value">
            {energy !== null ? energy.toFixed(4) : "—"}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <svg className="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <div className="metric-content">
          <div className="metric-label">Signal Power</div>
          <div className="metric-value">
            {power !== null ? power.toFixed(4) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}