<script setup lang="ts">
import SeriesSucursalList from '@/views/catalogs/series-sucursal/SeriesSucursalList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Series por sucursal</h4>
      <p class="text-body-1 mb-0">
        Administra la serie y folio actual por sucursal y tipo de serie.
      </p>
    </VCol>

    <VCol cols="12">
      <SeriesSucursalList />
    </VCol>
  </VRow>
</template>
