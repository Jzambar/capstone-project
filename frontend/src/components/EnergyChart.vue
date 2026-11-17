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

<script></script>

<style></style>
