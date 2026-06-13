'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved === 'dark' || (!saved && prefersDark)
    setIsDark(dark)
    // Ensure DOM is in sync
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  // Avoid hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl glass border border-black/[0.08] dark:border-white/[0.08]" />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      className={`
        relative w-9 h-9 rounded-xl flex items-center justify-center
        transition-all duration-300 group
        border
        ${isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          : 'bg-black/[0.04] border-black/[0.08] hover:bg-amber-50 hover:border-amber-200'
        }
      `}
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <Sun
        className={`
          absolute w-4 h-4 text-amber-400
          transition-all duration-300
          ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'}
        `}
      />
      {/* Moon icon — visible in light mode (click to go dark) */}
      <Moon
        className={`
          absolute w-4 h-4 text-slate-500
          transition-all duration-300
          ${!isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}
        `}
      />
    </button>
  )
}
