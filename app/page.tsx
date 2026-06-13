import { getEnergyData } from '@/lib/dataParser'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { data, metrics } = getEnergyData()

  return (
    <main className="min-h-screen">
      <Dashboard data={data} metrics={metrics} />
    </main>
  )
}
