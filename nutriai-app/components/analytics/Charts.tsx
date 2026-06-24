"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WeeklyDataPoint } from "@/types";
import Card from "@/components/shared/Card";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface WeeklyChartsProps {
  data: WeeklyDataPoint[];
  dailyCalories: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

export function CaloriesLineChart({ data, dailyCalories }: WeeklyChartsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "#27272A" : "#F3F4F6";
  const tickColor = isDark ? "#71717A" : "#9CA3AF";
  const tooltipBg = isDark ? "#18181B" : "#FFFFFF";
  const tooltipBorder = isDark ? "#27272A" : "#E5E7EB";
  const labelColor = isDark ? "#FAFAFA" : "#111827";

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-4">Weekly Calories</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              color: labelColor,
              fontSize: 12,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ color: tickColor }}
            itemStyle={{ color: labelColor }}
          />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ fill: "#10B981", r: 4 }}
            activeDot={{ r: 6, fill: "#059669" }}
            name="Calories"
          />
          {dailyCalories && (
            <Line
              type="monotone"
              dataKey={() => dailyCalories}
              stroke={isDark ? "rgba(16, 185, 129, 0.3)" : "#D1FAE5"}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="Target"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function MacroBarChart({ data }: { data: WeeklyDataPoint[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "#27272A" : "#F3F4F6";
  const tickColor = isDark ? "#71717A" : "#9CA3AF";
  const tooltipBg = isDark ? "#18181B" : "#FFFFFF";
  const tooltipBorder = isDark ? "#27272A" : "#E5E7EB";
  const labelColor = isDark ? "#FAFAFA" : "#111827";

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-4">Weekly Macros</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)" }}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              color: labelColor,
              fontSize: 12,
            }}
            labelStyle={{ color: tickColor }}
            itemStyle={{ color: labelColor }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: tickColor }} />
          <Bar dataKey="protein" name="Protein (g)" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="carbs" name="Carbs (g)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="fat" name="Fat (g)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface MacroPieData {
  protein: number;
  carbs: number;
  fat: number;
}

export function MacroPieChart({ data }: { data: MacroPieData }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const tickColor = isDark ? "#71717A" : "#9CA3AF";
  const tooltipBg = isDark ? "#18181B" : "#FFFFFF";
  const tooltipBorder = isDark ? "#27272A" : "#E5E7EB";
  const labelColor = isDark ? "#FAFAFA" : "#111827";

  const pieData = [
    { name: "Protein", value: Math.round(data.protein) },
    { name: "Carbs", value: Math.round(data.carbs) },
    { name: "Fat", value: Math.round(data.fat) },
  ].filter((d) => d.value > 0);

  if (pieData.length === 0) {
    return (
      <Card className="p-5 flex items-center justify-center h-48">
        <p className="text-sm text-gray-400 dark:text-zinc-500">No data yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-4">Today&apos;s Macro Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              color: labelColor,
              fontSize: 12,
            }}
            labelStyle={{ color: tickColor }}
            itemStyle={{ color: labelColor }}
            formatter={(value) => [`${value}g`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: tickColor }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
