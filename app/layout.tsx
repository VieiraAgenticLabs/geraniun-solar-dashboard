import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geraniun Solar — FinTech Energy Asset Dashboard',
  description:
    'Dashboard financeiro de energia solar fotovoltaica. Histórico de economia, produção e simulações de tarifa em tempo real. Powered by Geraniun.',
  keywords: ['energia solar', 'dashboard financeiro', 'fotovoltaico', 'economia energia', 'fintech energy'],
  openGraph: {
    title: 'Geraniun Solar Dashboard',
    description: 'Visualização pública do impacto financeiro de energia solar fotovoltaica',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // No dark class here — ThemeToggle manages it client-side via localStorage
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent FOUC: apply saved theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
