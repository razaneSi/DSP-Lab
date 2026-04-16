import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type Props = {
  time: number[];
  signal?: number[];
  datasets?: Array<{
    label: string;
    data: number[];
    color: string;
    borderWidth?: number;
    tension?: number;
    borderDash?: number[];
  }>;
};

export default function AnalysisChart({ time, signal = [], datasets = [] }: Props) {
  const chartDatasets =
    datasets.length > 0
      ? datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color,
          backgroundColor: `${dataset.color}22`,
          borderWidth: dataset.borderWidth ?? 2,
          pointRadius: 0,
          tension: dataset.tension ?? 0.1,
          borderDash: dataset.borderDash,
        }))
      : [
          {
            label: "x(t)",
            data: signal,
            borderColor: "#00bcd4",
            backgroundColor: "rgba(0, 188, 212, 0.1)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
          },
        ];

  const hasData = chartDatasets.some((dataset) => dataset.data && dataset.data.length > 0);

  if (!hasData) {
    return (
      <div
        className="chart-container flex items-center justify-center text-muted-foreground text-sm"
        style={{ height: 360, width: "100%" }}
      >
        Generate a signal to see the visualization
      </div>
    );
  }

  const data = {
    labels: time,
    datasets: chartDatasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 420,
      easing: "easeOutQuart" as const,
    },
    transitions: {
      active: {
        animation: {
          duration: 220,
        },
      },
    },
    plugins: {
      legend: {/*Controls top legend (x(t) label).*/
        display: true,
        position: "top" as const,
        labels: {
          color: "#b0c4de",
          font: {
            family: "'IBM Plex Sans', sans-serif",
            size: 12,
            weight: 500, // numeric
          },
          padding: 10,
          usePointStyle: true,
          pointStyle: "line" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(13, 31, 45, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#b0c4de",
        borderColor: "#00bcd4",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function (items: any[]) {
            return Number(items[0].label).toFixed(2);
          },
          label: function (context: any) {
            const datasetLabel = context.dataset?.label ?? "x(t)";
            return `${datasetLabel}: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (this: any, value: any) {
            return Number(this.getLabelForValue(value)).toFixed(2);
          },
          color: "#b0c4de",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
            weight: 400,
          },
        },
        grid: {
          color: "#1e3a5f",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "Time (s)",
          color: "#b0c4de",
          font: { size: 11, weight: 600 },
        },
      },
      y: {
        ticks: {
          callback: function (value: any) {
            return Number(value).toFixed(2);
          },
          color: "#b0c4de",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
            weight: 400,
          },
        },
        grid: {
          color: "#1e3a5f",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "Y",
          color: "#b0c4de",
          font: { size: 11, weight: 600 },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="chart-container" style={{ height: 360, width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}
