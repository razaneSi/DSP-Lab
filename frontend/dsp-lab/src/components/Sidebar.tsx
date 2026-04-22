import { useEffect, useState } from "react";

type Props = {
  current: string;
  setCurrent: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export default function Sidebar({ current, setCurrent, isOpen, onToggle }: Props) {
  const tp1Items = ["analysis", "operations", "derivatives", "parity"];
  const tp2Items = ["fourier", "transfourier", "decomposition"];
  const [openSection, setOpenSection] = useState<"tp1" | "tp2">(
    tp1Items.includes(current) ? "tp1" : "tp2"
  );

  useEffect(() => {
    if (tp1Items.includes(current)) {
      setOpenSection("tp1");
      return;
    }

    if (tp2Items.includes(current)) {
      setOpenSection("tp2");
    }
  }, [current]);

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div>
          <div className="logo">DSP Lab</div>
          <div className="version">v1.0.0 // Scientific Mode</div>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="nav-menu">
        <div className="nav-group">
          <button
            className={`nav-section-toggle ${openSection === "tp1" ? "open" : ""}`}
            type="button"
            onClick={() => setOpenSection((section) => (section === "tp1" ? "tp2" : "tp1"))}
          >
            <span>TP 1</span>
            <svg className="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {openSection === "tp1" && (
            <div className="nav-section-items">
              <button
                className={`nav-item ${current === "analysis" ? "active" : ""}`}
                onClick={() => setCurrent("analysis")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ex 1: Analysis
              </button>

              <button
                className={`nav-item ${current === "operations" ? "active" : ""}`}
                onClick={() => setCurrent("operations")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Ex 2: Operations
              </button>

              <button
                className={`nav-item ${current === "derivatives" ? "active" : ""}`}
                onClick={() => setCurrent("derivatives")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Ex 3: Derivatives
              </button>

              <button
                className={`nav-item ${current === "parity" ? "active" : ""}`}
                onClick={() => setCurrent("parity")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Ex 4: Parity
              </button>
            </div>
          )}
        </div>

        <div className="nav-group">
          <button
            className={`nav-section-toggle ${openSection === "tp2" ? "open" : ""}`}
            type="button"
            onClick={() => setOpenSection((section) => (section === "tp2" ? "tp1" : "tp2"))}
          >
            <span>TP 2</span>
            <svg className="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {openSection === "tp2" && (
            <div className="nav-section-items">
              <button
                className={`nav-item ${current === "fourier" ? "active" : ""}`}
                onClick={() => setCurrent("fourier")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ex 5: Fourier Series
              </button>

              <button
                className={`nav-item ${current === "transfourier" ? "active" : ""}`}
                onClick={() => setCurrent("transfourier")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Ex 6: Fourier Transform
              </button>

              <button
                className={`nav-item ${current === "decomposition" ? "active" : ""}`}
                onClick={() => setCurrent("decomposition")}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Ex 7: Decomposition
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="system-status">
        <div className="status-label">System Status</div>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Processing Core Online</span>
        </div>
      </div>
    </aside>
  );
}
