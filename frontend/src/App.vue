<script setup>
// Root layout component
</script>

<template>
  <!-- This displays whatever page matches your current URL route -->
  <div>
    <nav style="margin-bottom: 16px">
      <router-link to="/">Login</router-link> |
      <router-link to="/energy-chart">Energy Chart</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
/* Basic global resets */
body {
  margin: 0;
  padding: 0;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  background-color: #0f172a;
}
</style>
