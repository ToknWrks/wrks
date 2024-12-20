"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { date: "Jan", rewards: 400 },
  { date: "Feb", rewards: 600 },
  { date: "Mar", rewards: 550 },
  { date: "Apr", rewards: 800 },
  { date: "May", rewards: 950 },
  { date: "Jun", rewards: 1100 },
  { date: "Jul", rewards: 950 },
];

const CustomXAxis = (props: any) => (
  <XAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
);

const CustomYAxis = (props: any) => (
  <YAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
    tickFormatter={(value) => `$${value}`}
  />
);

export function RewardsChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Rewards History</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CustomXAxis dataKey="date" />
            <CustomYAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="rewards"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}