import React from "react";

interface SparklineProps {
  color?: string;
  points?: number[];
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  color = "text-emerald-400",
  points = [20, 18, 24, 8, 14, 6, 12],
  className = "w-24 h-7",
}) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 100;
  const height = 28;

  const formattedPoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" L");

  return (
    <svg
      className={`${className} ${color}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={`M${formattedPoints}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
