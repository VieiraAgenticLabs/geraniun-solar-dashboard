'use client'

import { useState, useMemo, useEffect } from 'react'
import { EnergyDataPoint, SummaryMetrics } from '@/lib/dataParser'
import KpiCard from '@/components/KpiCard'
import EnergyChart from '@/components/EnergyChart'
import SimulationPanel from '@/components/SimulationPanel'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Zap, TrendingDown, Sun, BarChart3,
  Activity, Leaf, DollarSign, Wifi,
} from 'lucide-react'

interface DashboardProps {
  data: EnergyDataPoint[]
  metrics: SummaryMetrics
}

type ChartType = 'bar' | 'area'

const SERIES_LABELS = {
  pagamento:   'Conta Paga',
  producao:    'Produção',
  injetado:    'Injetado',
  autoconsumo: 'Autoconsumo',
} as const

// Colors shift slightly between light/dark for optimal contrast
const SERIES_COLORS_DARK  = { pagamento: '#f5a623', producao: '#10b981', injetado: '#3b82f6', autoconsumo: '#8b5cf6' }
const SERIES_COLORS_LIGHT = { pagamento: '#d97706', producao: '#059669', injetado: '#2563eb', autoconsumo: '#7c3aed' }

export default function Dashboard({ data, metrics }: DashboardProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [activeLines, setActiveLines] = useState({
    pagamento: true, producao: true, injetado: false, autoconsumo: false,
  })
  const [isDark, setIsDark] = useState(false)

  // Sync isDark with the DOM class (set by ThemeToggle + FOUC script)
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const SERIES_COLORS = isDark ? SERIES_COLORS_DARK : SERIES_COLORS_LIGHT

  const avgAutoconsumo = useMemo(() => {
    const vals = data.filter(d => d.autoconsumo != null && d.autoconsumo > 0).map(d => d.autoconsumo!)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 400
  }, [data])

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  const toggleLine = (key: keyof typeof activeLines) =>
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }))

  const totalMonths = data.length
  const solarMonths = data.filter(d => d.hasSolar).length
  const co2Saved    = (metrics.totalAutoconsumo * 0.0817).toFixed(0)

  // ─── Shared class atoms ───────────────────────────────────────────
  const divider = 'border-black/[0.06] dark:border-white/[0.05]'
  const panel   = 'bg-white dark:bg-white/[0.02] border border-black/[0.07] dark:border-white/[0.06] shadow-sm dark:shadow-none rounded-2xl'
  const muted   = 'text-slate-500 dark:text-white/40'
  const heading = 'font-bold text-slate-800 dark:text-white font-[\'Space_Grotesk\']'

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(42,30%,97%)] dark:bg-[hsl(224,71%,4%)] transition-colors duration-300">

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 border-b ${divider} px-5 py-3.5 bg-white/80 dark:bg-black/30 backdrop-blur-md`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md animate-glow">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-slow border-2 border-white dark:border-slate-900" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white font-['Space_Grotesk'] leading-none">
                Geraniun <span className="text-gradient-solar">Solar</span>
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-white/35 tracking-widest uppercase mt-0.5">
                FinTech Energy Asset
              </p>
            </div>
          </div>

          {/* Right pills + toggle */}
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] ${muted} border ${divider} bg-black/[0.02] dark:bg-white/[0.03]`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
              {totalMonths} meses · {solarMonths} com solar
            </div>
            <div className={`px-3 py-1.5 rounded-full border ${divider} bg-amber-50 dark:bg-amber-500/10`}>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mono">YC Ready</span>
            </div>
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-5">

        {/* ── KPI PRIMARY ROW ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <KpiCard
            label="Conta Média Pré-Solar"
            value={formatBRL(metrics.avgPaymentPreSolar)}
            subValue="2018 – 2022"
            icon={<DollarSign className="w-5 h-5" />}
            variant="default" trend="neutral" animationDelay={0}
          />
          <KpiCard
            label="Conta Média Pós-Solar"
            value={formatBRL(metrics.avgPaymentPostSolar)}
            subValue={`${metrics.monthsWithSolar} meses`}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="green" trend="down"
            trendLabel={`${metrics.savingsPercent.toFixed(1)}% de redução`}
            animationDelay={80}
          />
          <KpiCard
            label="Economia Acumulada"
            value={formatBRL(metrics.totalSavings)}
            subValue="vs. sem solar"
            icon={<Zap className="w-5 h-5" />}
            variant="solar" trend="up"
            trendLabel="Retorno sobre investimento"
            animationDelay={160}
          />
          <KpiCard
            label="Produção Total"
            value={`${(metrics.totalProduction / 1000).toFixed(1)} MWh`}
            subValue={`CO₂ evitado: ~${co2Saved} ton`}
            icon={<Leaf className="w-5 h-5" />}
            variant="blue" trend="up"
            trendLabel="Geração acumulada solar"
            animationDelay={240}
          />
        </section>

        {/* ── KPI SECONDARY ROW ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pico Pré-Solar',     value: formatBRL(metrics.peakPaymentPre),                       icon: '📈', color: 'text-red-500 dark:text-red-400' },
            { label: 'Mínimo Pós-Solar',   value: formatBRL(metrics.minPaymentPost),                       icon: '📉', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Total Injetado',     value: `${(metrics.totalInjected / 1000).toFixed(1)} MWh`,     icon: '⚡', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Total Autoconsumo',  value: `${(metrics.totalAutoconsumo / 1000).toFixed(1)} MWh`,  icon: '🔋', color: 'text-violet-600 dark:text-violet-400' },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`${panel} p-4 flex items-center gap-3 animate-slide-in`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${muted}`}>{item.label}</p>
                <p className={`text-sm font-bold font-['Space_Grotesk'] mono ${item.color}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── CHART + SIMULATION ── */}
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">

          {/* Chart panel */}
          <div className={`${panel} border-gradient overflow-hidden`}>

            {/* Chart header */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b ${divider}`}>
              <div>
                <h2 className={`text-base ${heading}`}>Histórico Financeiro Energético</h2>
                <p className={`text-xs mt-0.5 ${muted}`}>
                  Janeiro 2018 → {data[data.length - 1]?.dateLabel ?? '2026'} · {data.length} pontos
                </p>
              </div>

              {/* Bar / Area toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${divider} bg-black/[0.02] dark:bg-white/[0.02]`}>
                {(['area', 'bar'] as ChartType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5
                      transition-all duration-200
                      ${chartType === type
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                        : `${muted} hover:text-slate-700 dark:hover:text-white/70`
                      }
                    `}
                  >
                    {type === 'area' ? <Activity className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                    {type === 'area' ? 'Área' : 'Barras'}
                  </button>
                ))}
              </div>
            </div>

            {/* Series toggles */}
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {(Object.keys(activeLines) as Array<keyof typeof activeLines>).map(key => (
                <button
                  key={key}
                  onClick={() => toggleLine(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    activeLines[key] ? 'opacity-100' : 'opacity-35 hover:opacity-60'
                  }`}
                  style={activeLines[key] ? {
                    background: `${SERIES_COLORS[key]}14`,
                    borderColor: `${SERIES_COLORS[key]}35`,
                    color: SERIES_COLORS[key],
                  } : {
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(30,41,59,0.45)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: SERIES_COLORS[key] }} />
                  {SERIES_LABELS[key]}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-[370px] px-2 py-4">
              <EnergyChart data={data} chartType={chartType} activeLines={activeLines} isDark={isDark} />
            </div>

            {/* Solar milestone banner */}
            <div className={`mx-5 mb-5 rounded-xl p-3 flex items-center gap-3 glass-amber`}>
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Marco: Ativação Solar — Jun/2022
                </p>
                <p className={`text-xs mt-0.5 ${muted}`}>
                  Conta caiu de{' '}
                  <span className="font-semibold text-slate-600 dark:text-white/70 mono">R$ 1.191,00</span>
                  {' '}para{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 mono">R$ 376,36</span>
                  {' '}—{' '}
                  <span className="font-bold text-amber-700 dark:text-amber-400">queda de 68,4%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Simulation panel */}
          <div className={`${panel} flex flex-col overflow-hidden`}>
            <div className={`p-5 border-b ${divider}`}>
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h2 className={`text-base ${heading}`}>Motor de Simulação</h2>
              </div>
              <p className={`text-xs ${muted}`}>
                Recalcula o boleto estimado em tempo real
              </p>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              <SimulationPanel data={data} avgAutoconsumo={avgAutoconsumo} isDark={isDark} />
            </div>
          </div>
        </section>

        {/* ── DATA TABLE ── */}
        <section className={`${panel} overflow-hidden`}>
          <div className={`p-5 border-b ${divider}`}>
            <h2 className={`text-base ${heading}`}>Dados Brutos Consolidados</h2>
            <p className={`text-xs mt-0.5 ${muted}`}>
              Merge de 4 fontes CSV · {data.length} registros · ordenado cronologicamente
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${divider}`}>
                  {['Mês/Ano','Boleto (R$)','Produção (kWh)','Injetado (kWh)','Autoconsumo (kWh)','Solar?'].map(col => (
                    <th key={col}
                      className={`px-4 py-3 text-left text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap ${muted}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(-24).map((row, i) => (
                  <tr key={row.date}
                    className={`border-b border-black/[0.03] dark:border-white/[0.03] transition-colors
                      hover:bg-black/[0.015] dark:hover:bg-white/[0.02]
                      ${i % 2 !== 0 ? 'bg-black/[0.01] dark:bg-white/[0.01]' : ''}`}
                  >
                    <td className="px-4 py-2.5 mono font-semibold text-slate-600 dark:text-white/65">{row.dateLabel}</td>
                    <td className="px-4 py-2.5 mono text-amber-600 dark:text-amber-400">
                      {row.pagamento != null ? `R$ ${row.pagamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '–'}
                    </td>
                    <td className="px-4 py-2.5 mono text-emerald-600 dark:text-emerald-400">
                      {row.producao != null ? row.producao.toLocaleString('pt-BR') : '–'}
                    </td>
                    <td className="px-4 py-2.5 mono text-blue-600 dark:text-blue-400">
                      {row.injetado != null ? row.injetado.toLocaleString('pt-BR') : '–'}
                    </td>
                    <td className="px-4 py-2.5 mono text-violet-600 dark:text-violet-400">
                      {row.autoconsumo != null ? row.autoconsumo.toLocaleString('pt-BR') : '–'}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.hasSolar ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-semibold">
                          ✓ Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/30 text-[10px]">
                          Pré-solar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={`text-center text-[10px] py-3 ${muted}`}>
              Exibindo últimos 24 registros de {data.length} total
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`text-center py-4 border-t ${divider}`}>
          <p className="text-[10px] text-slate-400 dark:text-white/25">
            Geraniun Solar Dashboard · Dados históricos 2018–2026 · Next.js + Cloudflare Pages
            <span className="mx-2">·</span>
            <span className="text-amber-500/70 dark:text-amber-500/50">YC Application Demo</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
