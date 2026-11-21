<template>
  <div
    class="chart-container"
    style="position: relative; height: 45vh; width: 80vw; max-width: 800px; margin: auto"
  >
    <h2>Russellville Energy Usage Dashboard</h2>

    <!-- Building Selector Dropdown -->
    <div class="selector-group" style="margin-bottom: 15px">
      <label for="building-select"><strong>Select Building: </strong></label>
      <select id="building-select" v-model="selectedBuildingId" @change="updateSelectedBuilding">
        <option v-for="bldg in buildings" :key="bldg.id" :value="bldg.id">
          {{ bldg.name }} ({{ bldg.account }})
        </option>
      </select>
    </div>

    <!-- Render the Chart.js Bar Chart -->
    <Bar v-if="currentMetrics.length > 0" :data="chartData" :options="chartOptions" />
    <p v-else>Loading energy data...</p>
  </div>
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
    // Extracts the 2-month metrics array for the active building
    currentMetrics() {
      return this.currentBuilding.metrics || []
    },
    // Formats data for Chart.js based on the selected building's metrics
    chartData() {
      return {
        labels: this.currentMetrics.map((item) => item.month),
        datasets: [
          {
            label: `Energy Usage - ${this.currentBuilding.name || ''} (kWh)`,
            backgroundColor: '#2563eb',
            data: this.currentMetrics.map((item) => item.kwh),
          },
        ],
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `2-Month Energy Tracking: ${this.currentBuilding.name || ''}`,
          },
        },
      }
    },
  },
  mounted() {
    // Fetch the external JSON file from the public folder when the component loads
    fetch('/data/energy_data.json') // <----- directory location
      .then((response) => response.json())
      .then((data) => {
        this.buildings = data.buildings
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
.chart-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}
select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}
</style>
