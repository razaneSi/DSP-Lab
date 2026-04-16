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

type Props = {
  time: number[];
  original: number[];
  reconstructed: number[];
  showReconstructed: boolean;
  N: number;
};

export default function FourierTimeDomain({ time, original, reconstructed, showReconstructed, N }: Props) {
  const datasets: any[] = [
    {
      label: "Original x(t)",
      data: original,
      borderColor: "#00bcd4",
      backgroundColor: "rgba(0,188,212,0.07)",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0,
      borderDash: [5, 4],
    },
  ];

  if (showReconstructed) {
    datasets.push({
      label: `Reconstructed (N=${N})`,
      data: reconstructed,
      borderColor: "#9c27b0",
      backgroundColor: "rgba(156,39,176,0.07)",
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.25,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#b0c4de",
          font: { family: "'IBM Plex Sans', sans-serif", size: 11, weight: 500 },
          usePointStyle: true,
          pointStyle: "line" as const,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(13,31,45,0.95)",
        titleColor: "#fff",
        bodyColor: "#b0c4de",
        borderColor: "#00bcd4",
        borderWidth: 1,
        callbacks: {
          title: (items: any[]) => `t = ${Number(items[0].label).toFixed(2)}s`,
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (_: any, index: number) => {
            const val = time[index];
            return val !== undefined ? Number(val).toFixed(2) : "";
          },
          color: "#b0c4de",
          maxTicksLimit: 10,
          font: { family: "'JetBrains Mono', monospace", size: 9 },
        },
        grid: { color: "#1e3a5f" },
        title: { display: true, text: "Time (s)", color: "#b0c4de", font: { size: 11, weight: 600 } },
      },
      y: {
        ticks: {
          color: "#b0c4de",
          font: { family: "'JetBrains Mono', monospace", size: 9 },
          callback: (v: any) => Number(v).toFixed(1),
        },
        grid: { color: "#1e3a5f" },
        title: { display: true, text: "Amplitude", color: "#b0c4de", font: { size: 11, weight: 600 } },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  return (
    <div style={{ height: 220, width: "100%" }}>
      <Line
        data={{ labels: time, datasets }}
        options={options}
      />
    </div>
  );
}
