<script setup lang="ts">
import ImpuestosList from '@/views/catalogs/impuestos/ImpuestosList.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Impuestos</h4>
      <p class="text-body-1 mb-0">
        Administra los impuestos disponibles para asignarlos a los productos.
      </p>
    </VCol>

    <VCol cols="12">
      <ImpuestosList />
    </VCol>
  </VRow>
</template>
