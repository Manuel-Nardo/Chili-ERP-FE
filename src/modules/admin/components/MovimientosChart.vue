<template>
    <div>
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
  
  ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)
  
  const props = defineProps({
    data: {
      type: Object,
      required: true,
    },
  })
  
  const colorPorTipo = {
    'PREGATE IN': '#facc15',
    'POV IN': '#4ade80',
    'POV OUT': '#60a5fa',
    'PREGATE OUT': '#60af',
    'DEFAULT': '#cbd5e1',
  }
  
  const chartData = computed(() => {
    const labels = Object.keys(props.data)
    const values = Object.values(props.data)
    const backgroundColors = labels.map((label) => colorPorTipo[label] || colorPorTipo.DEFAULT)
  
    return {
      labels,
      datasets: [
        {
          label: 'Movimientos',
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    }
  })
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }
  </script>
  
  <style scoped>
  div {
    height: 300px;
  }
  </style>
  