"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetsChartProps {
  data: Array<{
    name: string;
    value: number;
    symbol: string;
  }>;
  totalValue: string;
  isLoading?: boolean;
}

export function AssetsChart({ data, totalValue, isLoading }: AssetsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Distribution</CardTitle>
            <Skeleton className="h-8 w-[200px]" />
          </div>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Asset Distribution</CardTitle>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${totalValue}</span>
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={sortedData}
            margin={{ left: 20, right: 20, top: 20, bottom: 40 }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [
                `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`,
                "Value"
              ]}
              labelStyle={{ color: 'var(--foreground)' }}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '8px'
              }}
              cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              minPointSize={2}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}