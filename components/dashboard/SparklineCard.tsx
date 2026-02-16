"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  XAxis,
} from "recharts";

interface SparklineCardProps {
  title: string;
  value: string | number;
  subLabel?: string;
  data: { name: string; value: number }[];
  valueClassName?: string;
}

export function SparklineCard({
  title,
  value,
  subLabel,
  data,
  valueClassName = "text-white",
}: SparklineCardProps) {
  const hasGrowth =
    data.length >= 2 && data[data.length - 1].value >= (data[0]?.value ?? 0);
  const strokeColor = hasGrowth ? "#22c55e" : "#ef4444";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        {subLabel && (
          <p className="text-xs text-slate-500 mt-0.5">{subLabel}</p>
        )}
        {data.length > 0 && (
          <div className="h-12 mt-3 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <YAxis hide domain={["auto", "auto"]} />
                <XAxis hide dataKey="name" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(15 23 42)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(val) => [val ?? 0, "Count"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
