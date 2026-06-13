'use client'

import { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  subValue?: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  variant?: 'solar' | 'green' | 'blue' | 'purple' | 'default'
  animationDelay?: number
}

const variantStyles: Record<string, string> = {
  solar:   'glass-amber glow-solar',
  green:   'glass-green glow-green',
  blue:    'glass-blue',
  purple:  'glass-purple',
  default: 'bg-white dark:bg-white/[0.02] border border-black/[0.07] dark:border-white/[0.06] shadow-sm dark:shadow-none',
}

const iconWrapperStyles: Record<string, string> = {
  solar:   'bg-amber-100   dark:bg-amber-500/10  text-amber-600   dark:text-amber-400',
  green:   'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  blue:    'bg-blue-100    dark:bg-blue-500/10    text-blue-700    dark:text-blue-400',
  purple:  'bg-violet-100  dark:bg-violet-500/10  text-violet-700  dark:text-violet-400',
  default: 'bg-slate-100   dark:bg-white/5         text-slate-500   dark:text-white/60',
}

const trendStyles: Record<string, string> = {
  up:      'text-emerald-600 dark:text-emerald-400',
  down:    'text-emerald-600 dark:text-emerald-400', // down = good (lower bill)
  neutral: 'text-slate-400  dark:text-white/40',
}

const trendBadgeStyles: Record<string, string> = {
  up:      'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  down:    'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  neutral: 'bg-slate-50   dark:bg-white/5         border-slate-200   dark:border-white/10',
}

export default function KpiCard({
  label,
  value,
  subValue,
  icon,
  trend = 'neutral',
  trendLabel,
  variant = 'default',
  animationDelay = 0,
}: KpiCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl p-5 animate-slide-in
        transition-all duration-300 hover:-translate-y-1 hover:shadow-md
        dark:hover:brightness-110 cursor-default overflow-hidden
        ${variantStyles[variant]}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/10 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-white/50 uppercase tracking-widest mb-2 truncate">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white font-['Space_Grotesk'] leading-none truncate">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-slate-400 dark:text-white/40 mt-1 mono">{subValue}</p>
          )}
          {trendLabel && (
            <div className={`inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${trendStyles[trend]} ${trendBadgeStyles[trend]}`}>
              {trend === 'up'   && '↑ '}
              {trend === 'down' && '↓ '}
              {trendLabel}
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 flex-shrink-0 ${iconWrapperStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
