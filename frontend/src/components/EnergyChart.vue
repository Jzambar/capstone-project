<template>
  <section class="dashboard-card">
    <header class="card-header">
      <h2 class="card-title">Russellville Energy Usage Dashboard</h2>

      <div class="selector-group">
        <label for="building-select" class="selector-label">Select Building</label>
        <select id="building-select" v-model="selectedBuildingId" class="selector-input">
          <option v-for="bldg in buildings" :key="bldg.id" :value="bldg.id">
            {{ bldg.service_location }} ({{ bldg.account }})
          </option>
        </select>
      </div>
    </header>

    <div class="chart-grid">
      <div class="chart-stage" v-if="formattedMetrics.length > 0">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
      <p v-else class="status-text">Loading energy data...</p>
    </div>
  </section>
</template>

<script>
import {
  Chart as EnergyChart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

EnergyChart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Adding javascript functions to help with date formatting and Monthrange
function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatMonthRange(startStr, endStr, style = 'short') {
  const start = parseLocalDate(startStr)
  const end = parseLocalDate(endStr)
  if (!start || !end) return ''

  const options = { month: style } // 'short' -> "Jan", 'long' -> "January"
  const startMonth = start.toLocaleDateString('en-US', options)
  const endMonth = end.toLocaleDateString('en-US', options)

  return `${startMonth} – ${endMonth}`
}

export default {
  name: 'EnergyChart',
  components: { Bar },
  data() {
    return {
      buildings: [], // Holds all buildings loaded from JSON
      selectedBuildingId: null, // Tracks which building is currently selected
    }
  },

  // COMPUTATIONS FOR GRAPH
  computed: {
    // Finds the full object of the currently selected building
    currentBuilding() {
      return this.buildings.find((b) => b.id === this.selectedBuildingId) || {}
    },
    // Raw metrics array for the active building
    currentMetrics() {
      const metrics = this.currentBuilding?.metrics
      return Array.isArray(metrics) ? metrics : []
    },
    // formatting with functions for the dates and range for the chart label below
    formattedMetrics() {
      return this.currentMetrics.map((item) => {
        const monthRange = formatMonthRange(item.prev_read_date, item.curr_read_date, 'short')
        const exactDates = `${item.prev_read_date} – ${item.curr_read_date}`
        const startDate = parseLocalDate(item.prev_read_date)
        const endDate = parseLocalDate(item.curr_read_date)
        const days =
          item.days ||
          (startDate && endDate
            ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)))
            : 1)

        return {
          ...item,
          days,
          monthRange,
          exactDates,
          // Two-line x-axis label: "Jan – Jan" on line 1, exact dates on line 2
          axisLabel: [monthRange, exactDates],
        }
      })
    },
    // Formats data for Chart.js based on the selected building's metrics
    chartData() {
      const locationLabel = this.currentBuilding.service_location || ''
      return {
        labels: this.formattedMetrics.map((m) => m.axisLabel),
        datasets: [
          {
            label: `Energy Usage - ${locationLabel} (kWh)`,
            backgroundColor: '#2563eb',
            data: this.formattedMetrics.map((m) => m.kwh),
          },
        ],
      }
    },
    chartOptions() {
      const locationLabel = this.currentBuilding.service_location || ''
      const metricsRef = this.formattedMetrics

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Energy Usage: ${locationLabel}`,
          },
          tooltip: {
            callbacks: {
              title(items) {
                const idx = items[0]?.dataIndex ?? 0
                const entry = metricsRef[idx]
                return entry ? `${entry.monthRange} (${entry.exactDates})` : ''
              },
              afterLabel(item) {
                const entry = metricsRef[item.dataIndex]
                return entry ? `Billing Days: ${entry.days} days` : ''
              },
            },
          },
        },
      }
    },
  },
  mounted() {
    // Fetch the external JSON file from the public folder when the component loads
    fetch(`${import.meta.env.BASE_URL}energy-data.json`) // <----- directory location
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading energy-data.json`)
        }
        return response.json()
      })
      .then((data) => {
        this.buildings = Array.isArray(data) ? data : data.buildings || []
        if (this.buildings.length > 0) {
          // Default to the first building in the list
          this.selectedBuildingId = this.buildings[0].id
        }
      })
      .catch((error) => console.error('Error loading energy data:', error))
  },
}
</script>

<style scoped>
/* Mobile-first chart-card using clamp */
.dashboard-card {
  box-sizing: border-box;
  width: min(100%, 56rem);
  margin: clamp(0.75rem, 3vw, 2rem) auto;
  padding: clamp(1rem, 4vw, 1.75rem);
  background: #ffffff;
  color: #0f172a;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
}

/* Flexbox stacks title and selector on small screens */
.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.card-title {
  margin: 0;
  font-size: clamp(1.15rem, 4.2vw, 1.6rem);
  line-height: 1.25;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.selector-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.selector-input {
  width: 100%;
  min-height: 2.5rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #0f172a;
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

/* Relative container  */
.chart-stage {
  position: relative;
  width: 100%;
  height: clamp(16rem, 48vh, 26rem);
}

.status-text {
  margin: 0;
  padding: 2rem 0;
  text-align: center;
  color: #475569;
}

/* Tablet and desktop enhancement via min-width */
@media (min-width: 48rem) {
  .card-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .selector-group {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
  }

  .selector-input {
    width: auto;
    min-width: 14rem;
  }
}
</style>
