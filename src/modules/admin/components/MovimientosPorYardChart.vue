<template>
    <div class="relative h-96">
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
    Title,
    Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
  })
  
  const yardNames = computed(() => {
    const set = new Set()
    props.data.forEach(item => set.add(item.yard_name))
    return Array.from(set)
  })
  
  const types = computed(() => {
    const set = new Set()
    props.data.forEach(item => set.add(item.type))
    return Array.from(set)
  })
  
  const colorMap = {
    'POV IN': '#4ade80',         // verde
    'POV OUT': '#60a5fa',        // azul
    'PREGATE IN': '#fde68a',     // amarillo
    'PREGATE OUT': '#fca5a5',    // rojo claro
  }
  
  const datasetByType = computed(() => {
    return types.value.map(type => {
      const data = yardNames.value.map(yard => {
        const record = props.data.find(item => item.yard_name === yard && item.type === type)
        return record ? record.total : 0
      })
      return {
        label: type,
        data,
        backgroundColor: colorMap[type] || '#cbd5e1',
      }
    })
  })
  
  const chartData = computed(() => ({
    labels: yardNames.value,
    datasets: datasetByType.value,
  }))
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Movimientos por Yard y Tipo',
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }
  </script>
  