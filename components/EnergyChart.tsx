'use client'

import {
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { EnergyDataPoint } from '@/lib/dataParser'
import { useMemo } from 'react'

interface EnergyChartProps {
  data: EnergyDataPoint[]
  chartType: 'bar' | 'area'
  activeLines: {
    pagamento: boolean
    producao: boolean
    injetado: boolean
    autoconsumo: boolean
  }
  isDark: boolean
}

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const formatKwh = (v: number) =>
  `${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kWh`

function CustomTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-4 shadow-xl min-w-[180px] border"
      style={{
        background: isDark ? 'rgba(10,15,35,0.97)' : 'rgba(255,255,255,0.98)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-3"
        style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(30,41,59,0.55)' }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-5 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(30,41,59,0.6)' }}>
              {entry.name}
            </span>
          </div>
          <span
            className="mono font-bold text-xs"
            style={{ color: isDark ? '#fff' : '#1e293b' }}
          >
            {entry.dataKey === 'pagamento'
              ? entry.value != null ? formatBRL(entry.value) : '–'
              : entry.value != null ? formatKwh(entry.value) : '–'}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({ payload }: any) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-3">
      {payload.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[10px] text-slate-400 dark:text-white/40">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyChart({ data, chartType, activeLines, isDark }: EnergyChartProps) {
  const tickInterval = useMemo(() => {
    if (data.length <= 24) return 2
    if (data.length <= 60) return 5
    return 11
  }, [data.length])

  const axisColor    = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.38)'
  const gridColor    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(30,41,59,0.06)'
  const axisLineColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(30,41,59,0.1)'
  const refLineColor = isDark ? 'rgba(245,166,35,0.55)' : 'rgba(217,119,6,0.6)'
  const refLabelColor = isDark ? 'rgba(245,166,35,0.95)' : 'rgba(180,83,9,1)'

  const seriesConfig = [
    { key: 'pagamento',  name: 'Conta Paga (R$)',  color: isDark ? '#f5a623' : '#d97706', active: activeLines.pagamento },
    { key: 'producao',   name: 'Produção (kWh)',   color: isDark ? '#10b981' : '#059669', active: activeLines.producao },
    { key: 'injetado',   name: 'Injetado (kWh)',   color: isDark ? '#3b82f6' : '#2563eb', active: activeLines.injetado },
    { key: 'autoconsumo',name: 'Autoconsumo (kWh)',color: isDark ? '#8b5cf6' : '#7c3aed', active: activeLines.autoconsumo },
  ].filter(s => s.active)

  const xAxisProps = {
    dataKey: 'dateLabel',
    tick: { fill: axisColor, fontSize: 10, fontFamily: 'JetBrains Mono' },
    axisLine: { stroke: axisLineColor },
    tickLine: false,
    interval: tickInterval,
  }
  const yAxisProps = {
    tick: { fill: axisColor, fontSize: 10, fontFamily: 'JetBrains Mono' },
    axisLine: false,
    tickLine: false,
    width: 72,
    tickFormatter: (v: number) =>
      activeLines.pagamento && !activeLines.producao && !activeLines.injetado && !activeLines.autoconsumo
        ? `R$${(v/1000).toFixed(1)}k`
        : v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v),
  }
  const gridProps = { strokeDasharray: '3 3', stroke: gridColor, vertical: false }
  const commonProps = { data, margin: { top: 10, right: 10, left: 0, bottom: 0 } }
  const activationLabel = 'Jun/22'
  const refLabel = {
    value: '⚡ Solar',
    position: 'top' as const,
    fill: refLabelColor,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 700,
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)' }} />
          <Legend content={<CustomLegend />} />
          <ReferenceLine x={activationLabel} stroke={refLineColor} strokeDasharray="4 4" strokeWidth={2} label={refLabel} />
          {seriesConfig.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color}
              radius={[2,2,0,0]} opacity={0.85} maxBarSize={12} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart {...commonProps}>
        <defs>
          {seriesConfig.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={s.color} stopOpacity={isDark ? 0.3 : 0.15} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip isDark={isDark} />} />
        <Legend content={<CustomLegend />} />
        <ReferenceLine x={activationLabel} stroke={refLineColor} strokeDasharray="4 4" strokeWidth={2} label={refLabel} />
        {seriesConfig.map(s => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
            stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`}
            dot={false} activeDot={{ r: 4, fill: s.color, strokeWidth: 0 }}
            connectNulls={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
