import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

export interface EnergyDataPoint {
  date: string          // "MM/YYYY"
  dateLabel: string     // "Jun/22" — for chart axis
  dateSort: number      // YYYYMM for sorting
  pagamento: number | null
  producao: number | null
  injetado: number | null
  autoconsumo: number | null
  hasSolar: boolean     // true if >= 06/2022
}

export interface SummaryMetrics {
  avgPaymentPreSolar: number
  avgPaymentPostSolar: number
  totalSavings: number
  totalProduction: number
  totalInjected: number
  totalAutoconsumo: number
  peakPaymentPre: number
  minPaymentPost: number
  monthsWithSolar: number
  savingsPercent: number
}

function parseFloat_BR(value: string | undefined | null): number | null {
  if (!value || value.trim() === '' || value.trim() === '-') return null
  const cleaned = value.trim().replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseCsv(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const result = Papa.parse<string[]>(content, {
    delimiter: ';',
    skipEmptyLines: true,
  })

  const map: Record<string, string> = {}
  const rows = result.data as string[][]
  const headers = rows[0]
  const valueCol = 1 // always second column

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row[0]) continue
    const dateKey = row[0].trim()
    const val = row[valueCol]?.trim() ?? ''
    map[dateKey] = val
  }
  return map
}

function dateToSort(date: string): number {
  const [mm, yyyy] = date.split('/')
  return parseInt(yyyy) * 100 + parseInt(mm)
}

function toLabel(date: string): string {
  const [mm, yyyy] = date.split('/')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthName = months[parseInt(mm) - 1] ?? mm
  return `${monthName}/${yyyy.slice(2)}`
}

export function getEnergyData(): { data: EnergyDataPoint[]; metrics: SummaryMetrics } {
  const csvDir = path.join(process.cwd(), 'data', 'raw_csv')

  const pagamento = parseCsv(path.join(csvDir, 'pagamento_vertical.csv'))
  const producao = parseCsv(path.join(csvDir, 'producao_vertical.csv'))
  const injetado = parseCsv(path.join(csvDir, 'injetado_vertical.csv'))
  const autoconsumo = parseCsv(path.join(csvDir, 'autoconsumo_vertical.csv'))

  // Collect all unique dates across all files
  const allDates = new Set<string>([
    ...Object.keys(pagamento),
    ...Object.keys(producao),
    ...Object.keys(injetado),
    ...Object.keys(autoconsumo),
  ])

  // Solar activation: June 2022
  const solarActivation = 202206

  const dataPoints: EnergyDataPoint[] = Array.from(allDates)
    .map((date) => {
      const sort = dateToSort(date)
      return {
        date,
        dateLabel: toLabel(date),
        dateSort: sort,
        pagamento: parseFloat_BR(pagamento[date]),
        producao: parseFloat_BR(producao[date]),
        injetado: parseFloat_BR(injetado[date]),
        autoconsumo: parseFloat_BR(autoconsumo[date]),
        hasSolar: sort >= solarActivation,
      }
    })
    .sort((a, b) => a.dateSort - b.dateSort)
    // filter out future projection months with no payment data for clean chart
    .filter(d => d.pagamento !== null || d.dateSort <= 202605)

  // Summary metrics
  const preSolar = dataPoints.filter(d => !d.hasSolar && d.pagamento !== null)
  const postSolar = dataPoints.filter(d => d.hasSolar && d.pagamento !== null)

  const avg = (arr: (number | null)[]): number => {
    const valid = arr.filter((v): v is number => v !== null)
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  }
  const sum = (arr: (number | null)[]): number =>
    arr.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0)

  const avgPaymentPreSolar = avg(preSolar.map(d => d.pagamento))
  const avgPaymentPostSolar = avg(postSolar.map(d => d.pagamento))
  const monthsWithSolar = postSolar.length

  const metrics: SummaryMetrics = {
    avgPaymentPreSolar,
    avgPaymentPostSolar,
    totalSavings: (avgPaymentPreSolar - avgPaymentPostSolar) * monthsWithSolar,
    totalProduction: sum(dataPoints.map(d => d.producao)),
    totalInjected: sum(dataPoints.map(d => d.injetado)),
    totalAutoconsumo: sum(dataPoints.map(d => d.autoconsumo)),
    peakPaymentPre: Math.max(...preSolar.map(d => d.pagamento ?? 0)),
    minPaymentPost: Math.min(...postSolar.map(d => d.pagamento ?? Infinity)),
    monthsWithSolar,
    savingsPercent: avgPaymentPreSolar > 0
      ? ((avgPaymentPreSolar - avgPaymentPostSolar) / avgPaymentPreSolar) * 100
      : 0,
  }

  return { data: dataPoints, metrics }
}
