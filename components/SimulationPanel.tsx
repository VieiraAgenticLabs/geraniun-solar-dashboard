'use client'

import { useState, useMemo } from 'react'
import { EnergyDataPoint } from '@/lib/dataParser'

interface SimulationPanelProps {
  data: EnergyDataPoint[]
  avgAutoconsumo: number
  isDark: boolean
}

function SliderInput({
  label, value, min, max, step, onChange, formatValue, color, isDark,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; formatValue: (v: number) => string
  color: string; isDark: boolean
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
          {label}
        </label>
        <span
          className="text-xs font-bold mono px-2.5 py-1 rounded-lg border"
          style={{
            color,
            background: `${color}12`,
            borderColor: `${color}30`,
          }}
        >
          {formatValue(value)}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2"
          style={{
            left: `calc(${pct}% - 7px)`,
            background: color,
            borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#fff',
            boxShadow: `0 0 8px ${color}50, 0 1px 3px rgba(0,0,0,0.15)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 dark:text-white/25 mono">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}

export default function SimulationPanel({ data, avgAutoconsumo, isDark }: SimulationPanelProps) {
  const [tarifa,   setTarifa]   = useState(0.99)
  const [consumo,  setConsumo]  = useState(1200)
  const [fioB,     setFioB]     = useState(15)
  const [custoDisp,setCustoDisp] = useState(60)

  const result = useMemo(() => {
    const consumoLiquido = Math.max(0, consumo - avgAutoconsumo)
    const custoEnergia   = consumoLiquido * tarifa
    const subTotal       = custoEnergia + custoDisp
    const encargoBio     = subTotal * (fioB / 100)
    const boletoEstimado = subTotal + encargoBio

    const preSolar = data.filter(d => !d.hasSolar && d.pagamento !== null)
    const avgPreSolar = preSolar.length
      ? preSolar.reduce((acc, d) => acc + (d.pagamento ?? 0), 0) / preSolar.length
      : 0

    const economia        = avgPreSolar - boletoEstimado
    const reducaoPercent  = avgPreSolar > 0 ? (economia / avgPreSolar) * 100 : 0
    const economiaAnual   = economia * 12

    return { consumoLiquido, custoEnergia, encargoBio, custoDisp, boletoEstimado, avgPreSolar, economia, reducaoPercent, economiaAnual }
  }, [tarifa, consumo, fioB, custoDisp, data, avgAutoconsumo])

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

  const isPositive = result.economia > 0
  const sliderColor = isDark ? undefined : undefined // passed per slider

  return (
    <div className="space-y-5">
      {/* Sliders */}
      <div className="space-y-5">
        <SliderInput label="Tarifa de Energia"    value={tarifa}    min={0.5}  max={2.0}  step={0.01} onChange={setTarifa}    formatValue={v => `R$ ${v.toFixed(2)}/kWh`}            color="#d97706" isDark={isDark} />
        <SliderInput label="Consumo da Rede"      value={consumo}   min={100}  max={2000} step={10}   onChange={setConsumo}   formatValue={v => `${v.toLocaleString('pt-BR')} kWh`}   color="#2563eb" isDark={isDark} />
        <SliderInput label="Encargo Fio B"        value={fioB}      min={0}    max={40}   step={0.5}  onChange={setFioB}      formatValue={v => `${v.toFixed(1)}%`}                   color="#7c3aed" isDark={isDark} />
        <SliderInput label="Custo Disponibilidade" value={custoDisp} min={20}  max={200}  step={5}    onChange={setCustoDisp} formatValue={v => `R$ ${v.toFixed(0)}`}                  color="#0891b2" isDark={isDark} />
      </div>

      {/* Breakdown */}
      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
        {[
          { label: 'Consumo líquido',       val: `${result.consumoLiquido.toFixed(0)} kWh` },
          { label: 'Energia da rede',        val: formatBRL(result.custoEnergia) },
          { label: 'Disponibilidade mín.',   val: formatBRL(result.custoDisp) },
          { label: `Encargo Fio B (${fioB}%)`, val: formatBRL(result.encargoBio) },
        ].map(row => (
          <div key={row.label} className="flex justify-between text-xs">
            <span className="text-slate-400 dark:text-white/35">{row.label}</span>
            <span className="mono text-slate-500 dark:text-white/40">{row.val}</span>
          </div>
        ))}
      </div>

      {/* Main result */}
      <div className="rounded-xl p-4 bg-white dark:bg-white/[0.02] border border-black/[0.07] dark:border-white/[0.08] shadow-sm dark:shadow-none">
        <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">
          Boleto Final Estimado
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white font-['Space_Grotesk']">
          {formatBRL(result.boletoEstimado)}
        </p>
        <p className="text-xs text-slate-400 dark:text-white/30 mt-1">
          vs. média pré-solar: {formatBRL(result.avgPreSolar)}
        </p>
      </div>

      {/* Savings */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${
        isPositive
          ? 'bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15'
          : 'bg-red-50   dark:bg-red-500/5     border border-red-200   dark:border-red-500/15'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1 text-slate-500 dark:text-white/40">
              {isPositive ? 'Economia Mensal' : 'Acréscimo Mensal'}
            </p>
            <p className={`text-2xl font-bold font-['Space_Grotesk'] ${
              isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? '−' : '+'}{formatBRL(Math.abs(result.economia))}
            </p>
          </div>
          <div className={`text-right ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {Math.abs(result.reducaoPercent).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/35">de redução</p>
          </div>
        </div>
        {isPositive && (
          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/10">
            <p className="text-xs text-slate-500 dark:text-white/35">
              Projeção anual:{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatBRL(result.economiaAnual)}
              </span>
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-300 dark:text-white/20 text-center">
        Autoconsumo médio histórico: {avgAutoconsumo.toFixed(0)} kWh/mês
      </p>
    </div>
  )
}
