"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RevenuePoint = { d: string; v: number };

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasData = data.some((d) => d.v > 0);

  if (!hasData) {
    return (
      <div className="grid h-72 w-full place-items-center text-sm text-zinc-400">
        Сүүлийн 7 хоногт захиалга алга байна.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c98ba3" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#c98ba3" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" />
          <YAxis />
          <Tooltip formatter={(v) => new Intl.NumberFormat("mn-MN").format(Number(v)) + "₮"} />
          <Area type="monotone" dataKey="v" stroke="#a76f83" fill="url(#g)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
