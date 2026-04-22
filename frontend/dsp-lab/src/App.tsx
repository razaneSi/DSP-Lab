import { useState } from "react";
import SignalAnalysis from "./components/analysis/SignalAnalysis";
import SignalOperations from "./components/operations/SignalOperations";
import SignalDerivatives from "./components/derivatives/SignalDerivatives";
import SignalParity from "./components/parity/SignalParity";
import FourierSeries from "./components/fourier/FourierSeries";
import FourierTransform from "./components/transfourier/FourierTransform";
import SignalDecomposition from "./components/decomposition/SignalDecomposition";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderActiveTab = () => {
    if (activeTab === "analysis") return <SignalAnalysis />;
    if (activeTab === "operations") return <SignalOperations />;
    if (activeTab === "derivatives") return <SignalDerivatives />;
    if (activeTab === "parity") return <SignalParity />;
    if (activeTab === "fourier") return <FourierSeries />;
    if (activeTab === "transfourier") return <FourierTransform />;
    if (activeTab === "decomposition") return <SignalDecomposition />;
    return null;
  };

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar
        current={activeTab}
        setCurrent={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
      />

      {!sidebarOpen && (
        <button
          className="sidebar-fab"
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <div key={activeTab} className="tab-transition">
        {renderActiveTab()}
      </div>
    </div>
  );
}
