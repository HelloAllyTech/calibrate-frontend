import React from "react";
import { LeaderboardBarChart, getColorMap } from "@/components/charts/LeaderboardBarChart";
import { DownloadableTable } from "@/components/DownloadableTable";

export type LeaderboardColumn = {
  key: string;
  header: string;
  render?: (value: any) => React.ReactNode;
};

export type ChartConfig = {
  title: string;
  dataKey: string;
  yDomain?: [number, number];
  formatTooltip?: (value: number) => string;
};

type LeaderboardTabProps = {
  columns: LeaderboardColumn[];
  data: Record<string, any>[];
  /** Array of chart rows — each row is an array of charts rendered in a grid */
  charts: ChartConfig[][];
  filename: string;
  getLabel: (key: string) => string;
  nameKey?: string;
  className?: string;
};

export function LeaderboardTab({
  columns,
  data,
  charts,
  filename,
  getLabel,
  nameKey = "run",
  className,
}: LeaderboardTabProps) {
  if (!data || data.length === 0) return null;

  const names = data.map((s) => s[nameKey]);
  const colorMap = getColorMap(names);

  return (
    <div className={`space-y-4 md:space-y-6 ${className || ""}`}>
      <DownloadableTable columns={columns} data={data} filename={filename} />

      {charts.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-1 ${row.length >= 2 ? "md:grid-cols-2" : ""} gap-4 md:gap-6`}>
          {row.map((chart) => (
            <LeaderboardBarChart
              key={chart.title}
              title={chart.title}
              data={data.map((s) => ({
                label: getLabel(s[nameKey]),
                value: s[chart.dataKey],
                colorKey: s[nameKey],
              }))}
              colorMap={colorMap}
              yDomain={chart.yDomain}
              formatTooltip={chart.formatTooltip}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
