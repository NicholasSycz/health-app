import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

ChartJS.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
ChartJS.defaults.font.size = 10
ChartJS.defaults.color = '#8590a3'
ChartJS.defaults.borderColor = '#edf1f7'
ChartJS.defaults.plugins.legend.position = 'bottom'
ChartJS.defaults.plugins.legend.labels.usePointStyle = true
ChartJS.defaults.plugins.legend.labels.boxWidth = 6
ChartJS.defaults.plugins.legend.labels.boxHeight = 6
ChartJS.defaults.plugins.legend.labels.padding = 20
ChartJS.defaults.plugins.tooltip.backgroundColor = '#182743'
ChartJS.defaults.plugins.tooltip.padding = 12
ChartJS.defaults.plugins.tooltip.cornerRadius = 8
ChartJS.defaults.maintainAspectRatio = false
ChartJS.defaults.scale.grid.drawTicks = false
ChartJS.defaults.set('scale.border', { display: false })
ChartJS.defaults.scale.ticks.padding = 10

export const COLORS = {
  calories: '#3479f6',
  protein: '#7561cf',
  carbs: '#32a8b0',
  fat: '#e2a34a',
  goal: '#a5b3ca',
}
