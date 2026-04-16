import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  harmonics: number[];
  values: number[];
  color: string;
  label: string;
  yLabel: string;
};

export default function FourierSpectrum({ harmonics, values, color, label, yLabel }: Props) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#b0c4de",
          font: { family: "'IBM Plex Sans', sans-serif", size: 11, weight: 500 },
          usePointStyle: true,
          pointStyle: "rect" as const,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "rgba(13,31,45,0.95)",
        titleColor: "#fff",
        bodyColor: "#b0c4de",
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          title: (items: any[]) => `n = ${items[0].label}`,
          label: (ctx: any) => `${label}: ${Number(ctx.parsed.y).toFixed(5)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#b0c4de",
          font: { family: "'JetBrains Mono', monospace", size: 9 },
          maxTicksLimit: 21,
        },
        grid: { color: "#1e3a5f" },
        title: {
          display: true,
          text: "n (harmonic index)",
          color: "#b0c4de",
          font: { size: 11, weight: 600 },
        },
        reverse: true,
      },
      y: {
        ticks: {
          color: "#b0c4de",
          font: { family: "'JetBrains Mono', monospace", size: 9 },
          callback: (v: any) => Number(v).toFixed(1),
        },
        grid: { color: "#1e3a5f" },
        title: {
          display: true,
          text: yLabel,
          color: "#b0c4de",
          font: { size: 11, weight: 600 },
        },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  const data = {
    labels: harmonics,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: `${color}cc`,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.35,
        categoryPercentage: 0.9,
      },
    ],
  };

  return (
    <div style={{ height: 210, width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
}