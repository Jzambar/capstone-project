import { createRouter, createWebHistory } from 'vue-router'
// Components
import LoginView from '../views/LoginView.vue'
import EnergyChart from '../components/EnergyChart.vue'

// Routes from main APP
const routes = [
  {
    // Login screen
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    // Energy usage chart
    path: '/energy-chart',
    name: 'EnergyChart',
    component: EnergyChart,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
