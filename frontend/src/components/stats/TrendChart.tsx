'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface TrendChartProps {
  data: { date: string; score: number | null; label: string }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    return (
      <div className="bg-white border border-neutral-200 rounded-md px-3 py-2 shadow-sm text-sm">
        <p className="text-neutral-400 text-xs">{label}</p>
        <p className="font-bold text-neutral-800">{score}점</p>
      </div>
    );
  }
  return null;
}

export function TrendChart({ data }: TrendChartProps) {
  const filledData = data.filter(d => d.score !== null);

  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filledData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#a3a3a3' }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#a3a3a3' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 5, 8, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={8} stroke="#d4d4d4" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '8', position: 'right', fontSize: 10, fill: '#a3a3a3' }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#007fff"
            strokeWidth={2}
            dot={{ r: 3, fill: '#007fff', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#007fff' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WeeklyBarChartProps {
  data: { week: string; avg: number }[];
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  return (
    <div className="w-full h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: '#a3a3a3' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#a3a3a3' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill="#007fff" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ItemFrequencyChartProps {
  data: { id: string; label: string; rate: number }[];
}

export function ItemFrequencyChart({ data }: ItemFrequencyChartProps) {
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ id, label, rate }) => (
        <div key={id} className="flex items-center gap-2">
          <span className="text-xs text-neutral-600 w-16 flex-shrink-0 truncate">{label}</span>
          <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${rate}%`,
                backgroundColor: '#007fff',
              }}
              role="progressbar"
              aria-valuenow={rate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label} 달성률 ${rate}%`}
            />
          </div>
          <span className="text-xs font-semibold text-neutral-600 w-8 text-right tabular-nums">
            {rate}%
          </span>
        </div>
      ))}
    </div>
  );
}
