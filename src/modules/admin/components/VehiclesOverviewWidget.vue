<!-- src/modules/admin/components/VehiclesOverviewWidget.vue -->
<template>
  <VCard elevation="2" class="pa-4">
    <VCardItem title="Vehicles Overview">
      <template #append>
        <MoreBtn />
      </template>
    </VCardItem>

    <VCardText class="pa-0">
      <!-- BARRAS DE PROGRESO -->
      <div class="d-flex mb-6">
        <div
          v-for="(s, i) in progressStatuses"
          :key="i"
          :style="`inline-size: ${s.percentage}%;`"
        >
          <div class="vehicle-progress-label position-relative mb-2 text-body-1 d-none d-sm-block">
            {{ s.label }}
          </div>
          <VProgressLinear
            :color="s.color"
            :model-value="100"
            height="46"
            :class="s.classes"
          >
            <div :class="s.textClass">
              {{ s.percentage.toFixed(1) }}%
            </div>
          </VProgressLinear>
        </div>
      </div>

      <!-- TABLA DE DETALLE -->
      <VTable class="text-no-wrap">
        <tbody>
          <tr v-for="(v, idx) in vehicleData" :key="idx">
            <td width="70%" style="padding-inline-start:0 !important;">
              <div class="d-flex align-center gap-x-2">
                <VIcon :icon="v.icon" size="24" class="text-high-emphasis" />
                <div class="text-body-1 text-high-emphasis">{{ v.title }}</div>
              </div>
            </td>
            <td><h6 class="text-h6">{{ v.time }}</h6></td>
            <td><div class="text-body-1">{{ v.percentage }}%</div></td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import MoreBtn from '@/@core/components/MoreBtn.vue';

const progressStatuses = [
  {
    label: 'On the way',
    percentage: 39.7,
    color: 'rgba(var(--v-theme-on-surface), var(--v-hover-opacity))',
    classes: 'rounded-e-0 rounded-lg',
    textClass: 'text-start text-sm font-weight-medium',
  },
  {
    label: 'Unloading',
    percentage: 28.3,
    color: 'rgb(var(--v-theme-primary))',
    classes: 'rounded-0',
    textClass: 'text-white text-sm font-weight-medium text-start',
  },
  {
    label: 'Loading',
    percentage: 17.4,
    color: 'rgb(var(--v-theme-info))',
    classes: 'rounded-0',
    textClass: 'text-white text-sm font-weight-medium text-start',
  },
  {
    label: 'Waiting',
    percentage: 14.6,
    color: 'rgb(var(--v-tooltip-background))',
    classes: 'rounded-s-0 rounded-lg',
    textClass: 'text-sm text-surface font-weight-medium text-start',
  },
]

const vehicleData = [
  { icon: 'tabler-truck', title: 'Unit A', time: '10:20', percentage: 39.7 },
  { icon: 'tabler-truck-loading', title: 'Unit B', time: '11:05', percentage: 28.3 },
  { icon: 'tabler-truck-return', title: 'Unit C', time: '12:40', percentage: 17.4 },
  { icon: 'tabler-truck-off', title: 'Unit D', time: '14:15', percentage: 14.6 },
]
</script>
